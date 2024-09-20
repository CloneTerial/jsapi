import requests
from bs4 import BeautifulSoup
import sys
import json
import base64

def fetch_anime_details(anime_url):
    try:
        response = requests.get(anime_url)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        info_div = soup.find('div', class_='info2')
        if not info_div:
            return json.dumps({"error": "Informasi anime tidak ditemukan."})

        table_rows = info_div.find('table').find_all('tr')
        details = {}
        for row in table_rows:
            key_element = row.find('td', class_='tablex')
            value_element = row.find_all('td')[1]

            if key_element and value_element:
                key = key_element.text.strip().replace(':', '')

                if key == 'Kategori':
                    value = [a.text.strip() for a in value_element.find_all('a')]
                elif key in ['Musim / Rilis', 'Type', 'Series']:
                    value = value_element.find('a').text.strip()
                else:
                    value = value_element.text.strip()

                details[key] = value

        synopsis_div = soup.find('div', itemprop='text', id='Sinopsis')
        if not synopsis_div:
            return json.dumps({"error": "Sinopsis tidak ditemukan."})

        synopsis_paragraph = synopsis_div.find('p', recursive=False)
        synopsis = synopsis_paragraph.text.strip() if synopsis_paragraph else ""
        details['sinopsis'] = synopsis

        image_element = soup.select_one('.thumbnail img')
        image = image_element['src'] if image_element else ""
        details['img'] = image

        episode_list = soup.select('.list_eps_stream li')
        episodes = []
        for episode_item in episode_list:
            episode_title = episode_item.get('title', '') 
            episode_id = episode_item.get('id')

            if episode_id:
                if episode_id == "play_eps_1":
                    episode_title = "Episode 1"
                elif episode_id == "play_eps_2": 
                    episode_title = "Episode 2"
                elif episode_id == "play_eps_3":
                    episode_title = "Episode 3"
                elif episode_id == "play_eps_4":
                    episode_title = "Episode 4"
                elif episode_id == "play_eps_5":
                    episode_title = "Episode 5"
                elif episode_id == "play_eps_6":
                    episode_title = "Episode 6"
                elif episode_id == "play_eps_7":
                    episode_title = "Episode 7"
                elif episode_id == "play_eps_8":
                    episode_title = "Episode 8"
                elif episode_id == "play_eps_9":
                    episode_title = "Episode 9"
                elif episode_id == "play_eps_10":
                    episode_title = "Episode 10"
                elif episode_id == "play_eps_11":
                    episode_title = "Episode 11"
                elif episode_id == "play_eps_12":
                    episode_title = "Episode 12"
                elif episode_id == "play_eps_13":
                    episode_title = "Episode 13"
                elif episode_id == "play_eps_14":
                    episode_title = "Episode 14"
                elif episode_id == "play_eps_15":
                    episode_title = "Episode 15"
                elif episode_id == "play_eps_16":
                    episode_title = "Episode 16"
                elif episode_id == "play_eps_17":
                    episode_title = "Episode 17"
                elif episode_id == "play_eps_18":
                    episode_title = "Episode 18"
                elif episode_id == "play_eps_19":
                    episode_title = "Episode 19"
                elif episode_id == "play_eps_20":
                    episode_title = "Episode 20"
                elif episode_id == "play_eps_21":
                    episode_title = "Episode 21"
                elif episode_id == "play_eps_22":
                    episode_title = "Episode 22"
                elif episode_id == "play_eps_23":
                    episode_title = "Episode 23"
                elif episode_id == "play_eps_24":
                    episode_title = "Episode 24"
                else:
                    episode_num = episode_id.replace("play_eps_", "")
                    if episode_num.isdigit():
                        episode_title = f"Episode {episode_num}"

            episode_data = json.loads(base64.b64decode(episode_item['data']).decode('utf-8'))

            streaming_urls = {}
            for data_dict in episode_data:
                if 'format' in data_dict:
                    format_key = data_dict['format']
                    if 'url' in data_dict and data_dict['url']:
                        streaming_urls[format_key] = data_dict['url'][0]

            episodes.append({
                'title': episode_title,
                'streaming_urls': streaming_urls, 
                'id': episode_id
            })

        details['episodes'] = episodes

        download_box = soup.find('div', class_='download_box')
        batch_downloads = {}
        if download_box:
            batch_list = download_box.find('ul')
            if batch_list:
                for li in batch_list.find_all('li'):
                    resolution, links = li.text.split(' ', 1)
                    batch_downloads[resolution] = [a['href'] for a in li.find_all('a')]

        details['batch_downloads'] = batch_downloads

        episode_downloads = {}
        for h4 in soup.find_all('h4'):
            episode_title = h4.text.strip()
            download_list = h4.find_next_sibling('ul')
            if download_list:
                episode_downloads[episode_title] = {}
                for li in download_list.find_all('li'):
                    resolution, links = li.text.split(' ', 1)
                    episode_downloads[episode_title][resolution] = [a['href'] for a in li.find_all('a')]

        details['episode_downloads'] = episode_downloads

        return json.dumps(details)

    except requests.exceptions.RequestException as e:
        print(f"Error jaringan: {e}", file=sys.stderr)
        return json.dumps({"error": f"Network error: {e}"})

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python nimegami_details.py <anime_url>", file=sys.stderr)
        sys.exit(1)

    anime_url = sys.argv[1]
    data = fetch_anime_details(anime_url)
    print(data)

