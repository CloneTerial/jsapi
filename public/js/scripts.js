fetch('/api/anoboy')
    .then(response => response.json())
    .then(data => {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        if (data.error) {
            resultsDiv.textContent = data.error;
        } else {
            data.forEach(anime => {
                const animeDiv = document.createElement('div');
                animeDiv.innerHTML = `
                    <h2>${anime.title}</h2>
                    <p>Episode: ${anime.episode}</p>
                    <img src="${anime.image}" alt="${anime.title}">
                    <p>Rating: ${anime.rating}</p>
                    <hr>
                `;
                resultsDiv.appendChild(animeDiv);
            });
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        document.getElementById('results').textContent = 'Terjadi kesalahan saat mengambil data.';
    });
