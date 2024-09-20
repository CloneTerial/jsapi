const axios = require('axios');
const cheerio = require('cheerio');

async function fetchAnimeDetails(animeUrl) {
  try {
    const response = await axios.get(animeUrl);

    const $ = cheerio.load(response.data);

    // Extract anime details
    const infoDiv = $('.info2');
    if (!infoDiv.length) {
      return JSON.stringify({ error: 'Anime information not found.' });
    }

    const tableRows = infoDiv.find('table tr');
    const details = {};
    tableRows.each((_, row) => {
      const keyElement = $(row).find('td.tablex');
      const valueElement = $(row).find('td').eq(1);

      if (keyElement.length && valueElement.length) {
        let key = keyElement.text().trim().replace(':', '');

        let value;
        if (key === 'Kategori') {
          value = valueElement.find('a').map((_, a) => $(a).text().trim()).get();
        } else if (['Musim / Rilis', 'Type', 'Series'].includes(key)) {
          value = valueElement.find('a').text().trim();
        } else {
          value = valueElement.text().trim();
        }

        details[key] = value;
      }
    });

    // Extract synopsis
    const synopsisDiv = $('div[itemprop="text"]#Sinopsis');
    if (!synopsisDiv.length) {
      return JSON.stringify({ error: 'Synopsis not found.' });
    }

    const synopsisParagraph = synopsisDiv.find('p').first();
    const synopsis = synopsisParagraph.length ? synopsisParagraph.text().trim() : '';
    details['sinopsis'] = synopsis;

    // Extract image
    const imageElement = $('.thumbnail img');
    const image = imageElement.attr('src') || '';
    details['img'] = image;

    // Extract episode list and streaming URLs
    const episodeList = $('.list_eps_stream li');
    const episodes = [];
    episodeList.each((_, episodeItem) => {
      let episodeTitle = $(episodeItem).attr('title') || '';
      const episodeId = $(episodeItem).attr('id');

      // Handle episode titles based on id
      if (episodeId) {
        const episodeNumMatch = episodeId.match(/play_eps_(\d+)/);
        if (episodeNumMatch) {
          const episodeNum = episodeNumMatch[1];
          episodeTitle = `Episode ${episodeNum}`;
        }
      }

      const episodeData = JSON.parse(Buffer.from($(episodeItem).attr('data'), 'base64').toString('utf-8'));

      const streamingUrls = {};
      episodeData.forEach(dataDict => {
        if ('format' in dataDict) {
          const formatKey = dataDict['format'];
          if ('url' in dataDict && dataDict['url'].length) {
            streamingUrls[formatKey] = dataDict['url'][0];
          }
        }
      });

      episodes.push({
        title: episodeTitle,
        streaming_urls: streamingUrls,
        id: episodeId
      });
    });

    details['episodes'] = episodes;

    // Extract batch download links
    const downloadBox = $('.download_box');
    const batchDownloads = {};
    if (downloadBox.length) {
      const batchList = downloadBox.find('ul');
      if (batchList.length) {
        batchList.find('li').each((_, li) => {
          const [resolution, linksText] = $(li).text().split(' ', 1);
          batchDownloads[resolution] = $(li).find('a').map((_, a) => $(a).attr('href')).get();
        });
      }
    }
    details['batch_downloads'] = batchDownloads;

    // Extract episode download links
    const episodeDownloads = {};
    $('h4').each((_, h4) => {
      const episodeTitle = $(h4).text().trim();
      const downloadList = $(h4).next('ul');

      if (downloadList.length) {
        episodeDownloads[episodeTitle] = {};
        downloadList.find('a').each((_, aTag) => {
          const title = $(aTag).attr('title');
          if (title) {
            const resolutionMatch = title.match(/(\d+p)/);
            if (resolutionMatch) {
              const resolution = resolutionMatch[1];
              const linkName = $(aTag).text().trim();
              const link = $(aTag).attr('href');

              if (!(resolution in episodeDownloads[episodeTitle])) {
                episodeDownloads[episodeTitle][resolution] = {};
              }

              episodeDownloads[episodeTitle][resolution][linkName] = link;
            }
          }
        });
      }
    });

    details['episode_downloads'] = episodeDownloads;

    return JSON.stringify(details);
  } catch (error) {
    console.error('Network error:', error);
    return JSON.stringify({ error: `Network error: ${error.message}` });
  }
}

// If running as a script
if (require.main === module) {
  if (process.argv.length < 3) {
    console.error('Usage: node nimegami_details.js <anime_url>');
    process.exit(1);
  }

  const animeUrl = process.argv[2];
  fetchAnimeDetails(animeUrl)
    .then(data => console.log(data))
    .catch(error => {
      // Handle potential errors here, e.g., log to a file or display a user-friendly message
      console.error('An error occurred:', error);
    });
}

module.exports = { fetchAnimeDetails }; 
