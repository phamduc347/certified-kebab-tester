document.addEventListener('DOMContentLoaded', () => {
    // Elegant monochrome palette for the spots
    const palette = [
        'rgba(239, 68, 68, 0.9)',      // Red
        'rgba(59, 130, 246, 0.9)',     // Blue
        'rgba(16, 185, 129, 0.9)',     // Green
        'rgba(245, 158, 11, 0.9)',     // Amber
        'rgba(139, 92, 246, 0.9)',     // Purple
        'rgba(236, 72, 153, 0.9)'      // Pink
    ];

    const ctx = document.getElementById('radarChart').getContext('2d');
    const togglesContainer = document.getElementById('spot-toggles');
    const gridContainer = document.getElementById('spots-grid');
    const btnGrid = document.getElementById('btn-grid');
    const btnList = document.getElementById('btn-list');
    const filterCity = document.getElementById('filter-city');
    const filterDish = document.getElementById('filter-dish');

    let radarChart;
    const selectedSpots = new Set([kebabData[0].id, kebabData[1].id]); // Select top 2 by default

    // Chart Configuration
    const categories = ['Fleisch', 'Gemüse', 'Soße', 'Brot', 'Balance', 'Auswahl', 'Portion', 'Hygiene', 'Service'];

    function initChart() {
        radarChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: categories,
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        min: 5,
                        max: 10,
                        ticks: {
                            stepSize: 1,
                            display: false // Hide numbers on the rings for cleaner look
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        pointLabels: {
                            color: '#6b7280',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false // We use custom toggles instead
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#000000',
                        bodyColor: '#333333',
                        borderColor: 'rgba(0, 0, 0, 0.1)',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true
                    }
                }
            }
        });
    }

    function updateChart() {
        const datasets = [];
        kebabData.forEach((spot, index) => {
            if (selectedSpots.has(spot.id)) {
                const color = palette[index % palette.length];
                datasets.push({
                    label: spot.name,
                    data: [
                        spot.fleisch, spot.gemuese, spot.sosse, spot.brot, 
                        spot.balance, spot.auswahl, spot.portion, spot.hygiene, spot.service
                    ],
                    backgroundColor: color.replace('0.9', '0.15'), // Transparent fill
                    borderColor: color,
                    pointBackgroundColor: color,
                    pointBorderColor: '#000',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: color,
                    borderWidth: 2
                });
            }
        });
        
        radarChart.data.datasets = datasets;
        radarChart.update();
    }

    function renderToggles() {
        kebabData.forEach((spot, index) => {
            const color = palette[index % palette.length];
            
            const label = document.createElement('label');
            label.className = 'toggle-label';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = spot.id;
            checkbox.checked = selectedSpots.has(spot.id);
            
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedSpots.add(spot.id);
                } else {
                    selectedSpots.delete(spot.id);
                }
                updateChart();
            });

            const indicator = document.createElement('span');
            indicator.className = 'spot-color-indicator';
            indicator.style.backgroundColor = color;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'toggle-name';
            nameSpan.textContent = spot.name;

            label.appendChild(checkbox);
            label.appendChild(indicator);
            label.appendChild(nameSpan);

            togglesContainer.appendChild(label);
        });
    }

    function getColorForScore(score) {
        const value = parseFloat(score);
        if (isNaN(value)) return 'inherit';
        let hue = ((value - 1) / 9) * 120;
        hue = Math.max(0, Math.min(120, hue));
        return `hsl(${hue}, 80%, 40%)`;
    }

    function populateFilters() {
        const cities = [...new Set(kebabData.map(spot => spot.city))].sort();
        const dishes = [...new Set(kebabData.map(spot => spot.dish))].sort();
        
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            filterCity.appendChild(option);
        });

        dishes.forEach(dish => {
            const option = document.createElement('option');
            option.value = dish;
            option.textContent = dish;
            filterDish.appendChild(option);
        });
    }

    function renderGrid() {
        gridContainer.innerHTML = '';
        const selectedCity = filterCity.value;
        const selectedDish = filterDish.value;

        const filteredData = kebabData.filter(spot => {
            const matchCity = selectedCity === '' || spot.city === selectedCity;
            const matchDish = selectedDish === '' || spot.dish === selectedDish;
            return matchCity && matchDish;
        });

        if (filteredData.length === 0) {
            gridContainer.innerHTML = '<p style="color: var(--text-muted); grid-column: 1 / -1;">Keine passenden Spots gefunden.</p>';
            return;
        }

        filteredData.forEach(spot => {
            const card = document.createElement('div');
            card.className = 'spot-card';
            
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.city)}`;

            card.innerHTML = `
                <img src="${spot.image || 'kebab_spot_demo.png'}" alt="Bild von ${spot.name}" class="spot-image" />
                <div class="spot-content">
                    <div class="spot-rank">#${spot.rank}</div>
                    <h3>
                        <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="maps-link" title="Auf Google Maps ansehen">
                            ${spot.name}
                        </a>
                    </h3>
                    <div class="spot-city">
                        <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="maps-link">
                            ${spot.city}
                        </a>
                    </div>
                    
                    <div class="spot-categories">
                        <div class="cat-item"><span>Fleisch</span><span style="color: ${getColorForScore(spot.fleisch)}">${spot.fleisch}</span></div>
                        <div class="cat-item"><span>Gemüse</span><span style="color: ${getColorForScore(spot.gemuese)}">${spot.gemuese}</span></div>
                        <div class="cat-item"><span>Soße</span><span style="color: ${getColorForScore(spot.sosse)}">${spot.sosse}</span></div>
                        <div class="cat-item"><span>Brot</span><span style="color: ${getColorForScore(spot.brot)}">${spot.brot}</span></div>
                        <div class="cat-item"><span>Balance</span><span style="color: ${getColorForScore(spot.balance)}">${spot.balance}</span></div>
                        <div class="cat-item"><span>Auswahl</span><span style="color: ${getColorForScore(spot.auswahl)}">${spot.auswahl}</span></div>
                        <div class="cat-item"><span>Portion</span><span style="color: ${getColorForScore(spot.portion)}">${spot.portion}</span></div>
                        <div class="cat-item"><span>Hygiene</span><span style="color: ${getColorForScore(spot.hygiene)}">${spot.hygiene}</span></div>
                        <div class="cat-item"><span>Service</span><span style="color: ${getColorForScore(spot.service)}">${spot.service}</span></div>
                    </div>
                    
                    <div class="spot-stats">
                        <div class="stat-item">
                            <span class="stat-label">Score</span>
                            <span class="stat-val">${spot.score}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Rating</span>
                            <span class="stat-val" style="color: #ffd700;">${spot.stars}</span>
                        </div>
                    </div>
                    
                    <div class="spot-details">
                        <span class="badge">${spot.dish}</span>
                        <span class="badge">P/L: ${spot.plIndex}</span>
                        <span class="badge">Besuche: ${spot.besuche || 1}</span>
                    </div>
                </div>
            `;
            
            gridContainer.appendChild(card);
        });
    }

    // Initialization
    initChart();
    renderToggles();
    updateChart();
    populateFilters();
    renderGrid();

    // View toggles
    btnGrid.addEventListener('click', () => {
        gridContainer.className = 'spots-grid';
        btnGrid.classList.add('active');
        btnList.classList.remove('active');
    });

    btnList.addEventListener('click', () => {
        gridContainer.className = 'spots-list';
        btnList.classList.add('active');
        btnGrid.classList.remove('active');
    });

    // Filters
    filterCity.addEventListener('change', renderGrid);
    filterDish.addEventListener('change', renderGrid);
});
