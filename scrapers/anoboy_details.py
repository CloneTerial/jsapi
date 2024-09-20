import requests
from bs4 import BeautifulSoup
import sys
import json

def fetch_anime_details(anime_url):
    try:
        response = requests.get(anime_url)

        if response.status_code != 200:
            return json.dumps({"error": f"Error: {response.status_code} Client Error"})

        soup = BeautifulSoup(response.text, 'html.parser')

        # Ekstrak detail anime
        title_element = soup.select_one('h1.ptitle')
        if title_element:
            title = title_element.text.strip()
        else:
            return json.dumps({"error": "Title not found"})

        image_element = soup.select_one('.container img')
        image = image_element['src'] if image_element else ""

        info_list = soup.select('.infopost li')
        details = {}
        for item in info_list:
            key_element = item.find('b')
            value_element = item.find('span')

            if key_element and value_element:
                key = key_element.text.strip().replace(' :', '')
                value = value_element.text.strip()
                details[key] = value

        synopsis_element = soup.select_one('.sinops')
        synopsis = synopsis_element.text.strip() if synopsis_element else ""

        # Extract episode list
        episode_list_container = soup.find('div', id='ctlist')
        episodes = []
        if episode_list_container:
            episode_links = episode_list_container.find_all('a')
            for link in episode_links:
                episodes.append({
                    'title': link.text,
                    'url': link['href']
                })

        # Add episodes to the result
        result = {
            "title": title,
            "image": image,
            "synopsis": synopsis,
            **details,
            "episodes": episodes  # Include the episode list
        }

        return json.dumps(result)

    except requests.exceptions.RequestException as e:
        sys.stderr.write(f"Network error: {e}\n")  # Log error ke stderr dengan newline
        return json.dumps({"error": f"Network error: {e}"})

if __name__ == "__main__":
    anime_url = sys.argv[1] if len(sys.argv) > 1 else ''
    data = fetch_anime_details(anime_url)
    print(data) 
