const axios = require('axios');
const cheerio = require('cheerio');

async function fetchAnimeData(query) {
  const url = `https://nimegami.id/?s=${query}&post_type=post`;

  try {
    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    const results = [];
    $('article').each((_, article) => {
      const titleElement = $(article).find('h2[itemprop="name"] a');
      const title = titleElement.text().trim();
      const animeUrl = titleElement.attr('href');

      const imageElement = $(article).find('.thumbnail img');
      const image = imageElement.attr('src') || '';

      const statusElement = $(article).find('.term_tag-a a');
      const status = statusElement.text().trim() || '';

      const typeElement = $(article).find('.terms_tag a');
      const type = typeElement.text().trim() || '';

      const ratingElement = $(article).find('.rating-archive i');
      const rating = ratingElement.next().text().trim() || '';

      const episodesElement = $(article).find('.eps-archive');
      const episodes = episodesElement.text().trim() || '';

      results.push({
        title,
        image,
        status,
        type,
        rating,
        episodes,
        anime_url: animeUrl
      });
    });

    return JSON.stringify(results);
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error; // Allow handling the error further up if needed
  }
}

// If running as a script
if (require.main === module) {
  if (process.argv.length < 3) {
    console.error('Usage: node nimegami_search.js <query>');
    process.exit(1);
  }

  const query = process.argv[2];
  fetchAnimeData(query)
    .then(data => console.log(data))
    .catch(error => {
      // Handle potential errors here, e.g., log to a file or display a user-friendly message
      console.error('An error occurred:', error);
    });
}

module.exports = { fetchAnimeData }; 
