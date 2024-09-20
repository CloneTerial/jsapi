// Fungsi untuk melakukan permintaan AJAX
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        // Tampilkan pesan error kepada pengguna
    }
}

// Penanganan formulir pencarian di index.html
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

searchForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Mencegah refresh halaman

    const query = searchInput.value;
    const data = await fetchData(`/api/search?q=${query}`);

    // Bersihkan hasil pencarian sebelumnya
    searchResults.innerHTML = '';

    // Tampilkan hasil pencarian
    if (data && data.length > 0) {
        data.forEach(anime => {
            const animeCard = `
                <div class="anime-card">
                    <img src="${anime.image}" alt="${anime.title}">
                    <div class="info">
                        <h3>${anime.title}</h3>
                        <p>${anime.status} - ${anime.type}</p>
                        <a href="detail.html?url=${encodeURIComponent(anime.anime_url)}">Lihat Detail</a>
                    </div>
                </div>
            `;
            searchResults.innerHTML += animeCard;
        });
    } else {
        searchResults.innerHTML = '<p>Tidak ada hasil ditemukan.</p>';
    }
});

// Penanganan halaman detail anime di detail.html
const animeDetails = document.getElementById('anime-details');
const videoIframe = document.getElementById('video-iframe');

// Ambil URL anime dari parameter query string
const urlParams = new URLSearchParams(window.location.search);
const animeUrl = urlParams.get('url');

if (animeUrl) {
    fetchData(`/api/details?url=${animeUrl}`)
        .then(data => {
            if (data && !data.error) {
                // Tampilkan detail anime
                animeDetails.innerHTML = `
                    <h1>${data.title}</h1>
                    <div class="poster">
                        <img src="${data.image}" alt="${data.title}">
                    </div>
                    <div class="info">
                        <p>Sinopsis: ${data.sinopsis}</p>
                        <p>Genre: ${data.Kategori.join(', ')}</p>
                        <p>Musim / Rilis: ${data['Musim / Rilis']}</p>
                        <p>Type: ${data.Type}</p>
                        <p>Series: ${data.Series}</p>
                        </div>
                    <div class="episodes">
                        <h2>Episode</h2>
                        <ul id="episode-list">
                            ${data.episodes.map((episode, index) => `
                                <li data-episode-index="${index}">${episode.title}</li>
                            `).join('')}
                        </ul>
                    </div>
                `;

                // Tambahkan event listener untuk pemilihan episode
                const episodeList = document.getElementById('episode-list');
                episodeList.addEventListener('click', (event) => {
                    const episodeIndex = event.target.dataset.episodeIndex;
                    const episode = data.episodes[episodeIndex];
                    const streamingUrls = episode.streaming_urls;

                    // Pilih resolusi tertinggi yang tersedia (misalnya 720p)
                    const preferredResolution = '720p';
                    const streamingUrl = streamingUrls[preferredResolution] || Object.values(streamingUrls)[0];

                    // Muat URL streaming ke dalam iframe
                    videoIframe.src = streamingUrl;
                });
            } else {
                animeDetails.innerHTML = '<p>Anime tidak ditemukan.</p>';
            }
        });
} else {
    animeDetails.innerHTML = '<p>URL anime tidak valid.</p>';
}
