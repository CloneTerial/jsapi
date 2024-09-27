const express = require('express');
const path = require('path');
const cors = require('cors');
const { fetchAnimeData } = require('../scrapers/nimegami_search');
const { fetchAnimeDetails } = require('../scrapers/nimegami_details');

const app = express();

// CORS untuk mengizinkan semua origin
app.use(cors());

// Middleware untuk melayani file statis dari direktori 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Endpoint untuk menangani permintaan pencarian
app.get('/api/search', async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: 'Parameter query "q" wajib diisi.' });
  }

  try {
    const jsonData = await fetchAnimeData(query);
    res.json(JSON.parse(jsonData)); // Parse the stringified JSON
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat melakukan scraping.' });
  }
});

// Endpoint untuk menangani permintaan detail anime
app.get('/api/details', async (req, res) => {
  const animeUrl = req.query.url;

  if (!animeUrl) {
    return res.status(400).json({ error: 'Parameter url wajib diisi.' });
  }

  try {
    const jsonData = await fetchAnimeDetails(animeUrl);
    res.json(JSON.parse(jsonData)); // Parse the stringified JSON
  } catch (error) {
    console.error('Error during scraping:', error);
    res.status(500).json({ error: 'Terjadi kesalahan saat melakukan scraping.' });
  }
});

// Endpoint untuk menangani permintaan streaming episode (sementara kosong)
app.get('/api/episode', (req, res) => {
  // ... (akan diimplementasikan nanti)
});

// Route untuk melayani berkas HTML dari direktori 'public'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Ekspor sebagai handler untuk serverless function
module.exports = app;
