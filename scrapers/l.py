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

        details = {
            'info': extract_info(soup),
            'sinopsis': extract_synopsis(soup),
            'episodes': extract_episodes(soup),
            'batch_downloads': extract_batch_downloads(soup),
            'episode_downloads': extract_episode_downloads(soup)
        }

        return json.dumps(details)

    except requests.exceptions.RequestException as e:
        return json.dumps({"error": f"Network error: {e}"})

def extract_info(soup):
    info_div = soup.find('div', class_='info2')
    if not info_div:
        return {} 

    table_rows = info_div.find('table').find_all('tr')
    details = {}
    for row in table_rows:
        key_element = row.find('td', class_='tablex')
        value_element = row.find_all('td')[1] if len(row.find_all('td')) > 1 else None

        if key_element and value_element:
            key = key_element.text.strip().replace(':', '')

            if key == 'Kategori':
                value = [a.text.strip() for a in value_element.find_all('a')]
            elif key in ['Musim / Rilis', 'Type', 'Series']:
                value = value_element.find('a').text.strip() if value_element.find('a') else ""
            else:
                value = value_element.text.strip()

            details[key] = value

    return details

def extract_synopsis(soup):
    synopsis_div = soup.find('div', itemprop='text', id='Sinopsis')
    if not synopsis_div:
        return "" 

    synopsis_paragraph = synopsis_div.find('p', recursive=False)
    return synopsis_paragraph.text.strip() if synopsis_paragraph else ""

def extract_episodes(soup):
    episode_list = soup.select('.list_eps_stream li')
    episodes = []
    for episode_item in episode_list:
        episode_title = episode_item.get('title', '') 
        try:
            episode_data = json.loads(base64.b64decode(episode_item['data']).decode('utf-8'))

            # Check if episode_data is a dictionary
            if isinstance(episode_data, dict):
                streaming_urls = {
                    format: urls[0]
                    for format, urls in episode_data.items() if format != 'format' and urls 
                }
            else: 
                # Handle the case where episode_data is not a dictionary
                streaming_urls = {} 

        except (KeyError, json.JSONDecodeError, base64.binascii.Error):
            streaming_urls = {} 

        episodes.append({
            'title': episode_title,
            'streaming_urls': streaming_urls
        })

    return episodes

def extract_batch_downloads(soup):
    download_box = soup.find('div', class_='download_box')
    batch_downloads = {}
    if download_box:
        batch_list = download_box.find('ul')
        if batch_list:
            for li in batch_list.find_all('li'):
                try:
                    resolution, links = li.text.split(' ', 1)
                    batch_downloads[resolution] = [a['href'] for a in li.find_all('a')]
                except ValueError:
                    pass 

    return batch_downloads

def extract_episode_downloads(soup):
    episode_downloads = {}
    for h4 in soup.find_all('h4'):
        episode_title = h4.text.strip()
        download_list = h4.find_next_sibling('ul')
        if download_list:
            episode_downloads[episode_title] = {}
            for li in download_list.find_all('li'):
                try:
                    resolution, links = li.text.split(' ', 1)
                    episode_downloads[episode_title][resolution] = [a['href'] for a in li.find_all('a')]
                except ValueError:
                    pass 

    return episode_downloads

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python l.py <anime_url>", file=sys.stderr)
        sys.exit(1)

    anime_url = sys.argv[1]
    data = fetch_anime_details(anime_url)
    print(data)

