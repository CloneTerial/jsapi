const express = require('express');
const { spawn } = require('child_process');
const path = require('path');

const app = express();
const port = 3000;

// Middleware untuk melayani file statis dari direktori 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Route untuk menangani permintaan pencarian
app.get('/api/search', (req, res) => {
    const query = req.query.q;
    const pythonProcess = spawn('python', ['scrapers/anoboy.py', query]);

    pythonProcess.stdout.on('data', (data) => {
        try {
            // Mengurai data JSON dari proses Python
            const jsonData = JSON.parse(data);
            res.json(jsonData);
        } catch (error) {
            res.status(500).send('Error parsing JSON: ' + error.message);
        }
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    pythonProcess.on('close', (code) => {
        if (code !== 0) {
            res.status(500).send(`Python process exited with code ${code}`);
        }
    });
});

// Route untuk melayani file HTML, CSS, dan JS dari direktori 'public'
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Menjalankan server pada port yang ditentukan
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
