const express = require('express');
const { spawn } = require('child_process');
const router = express.Router();

router.get('/', (req, res) => {
  const pythonProcess = spawn('python', ['scrapers/another_site.py']);

  let output = '';
  let errorOutput = '';

  pythonProcess.stdout.on('data', (data) => {
    output += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorOutput += data.toString();
  });

  pythonProcess.on('close', (code) => {
    if (code === 0) {
      // Process the output accordingly
      res.json({ data: output });
    } else {
      console.error(`Python process exited with code ${code}: ${errorOutput}`);
      res.status(500).json({ error: 'Terjadi kesalahan saat scraping' });
    }
  });
});

module.exports = router;
