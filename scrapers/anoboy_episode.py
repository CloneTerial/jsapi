import requests
from bs4 import BeautifulSoup
import sys
import json

BASE_URL = "https://anoboy.pro"

def fetch_episode_stream_url(episode_path):
    # Pastikan episode_path dimulai dengan '/'
    if not episode_path.startswith('/'):
        episode_path = '/' + episode_path

    full_url = BASE_URL + episode_path

    try:
        response = requests.get(full_url)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        # Mencari elemen iframe di dalam div dengan id "lightsVideo"
        iframe_element = soup.select_one('#lightsVideo iframe')

        if iframe_element:
            stream_url = iframe_element.get('data-src')  # Ambil URL dari data-src
            if stream_url:
                return {'stream_url': stream_url}

        return {'error': 'URL streaming tidak ditemukan'}

    except requests.exceptions.RequestException as e:
        print(f"Error jaringan: {e}", file=sys.stderr)
        return {'error': 'Terjadi kesalahan jaringan'}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python anoboy_episode.py <episode_url>", file=sys.stderr)
        sys.exit(1)

    episode_url = sys.argv[1]
    result = fetch_episode_stream_url(episode_url)
    print(json.dumps(result))
