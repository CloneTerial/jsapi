import requests
from bs4 import BeautifulSoup
import sys
import json

def fetch_anime_data(query):
    url = f"https://anoboy.pro/search/?q={query}"
    response = requests.get(url)

    if response.status_code != 200:
        # Mengembalikan pesan error dalam format JSON
        return json.dumps({"error": f"Error: {response.status_code} Client Error"})

    soup = BeautifulSoup(response.text, 'html.parser')
    results = []

    for item in soup.select('.bg-white.shadow.xrelated.relative'):
        title = item.select_one('.titlelist.tublok').text.strip()
        episode = item.select_one('.eplist').text.strip()
        image = item.select_one('img')['src']
        rating = item.select_one('.starlist').text.strip()
        anime_url = item.select_one('a')['href'] 

        results.append({
            "title": title,
            "episode": episode,
            "image": image,
            "rating": rating,
            "anime_url": anime_url  # Menambahkan URL anime
        })

    return json.dumps(results)  # Mengembalikan hasil dalam format JSON

if __name__ == "__main__":
    query = sys.argv[1] if len(sys.argv) > 1 else ''
    data = fetch_anime_data(query)
    print(data)  # Mencetak hasil dalam format JSON
