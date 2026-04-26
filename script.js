document.addEventListener('DOMContentLoaded', () => {
    // Elegant monochrome palette for the spots
    const palette = [
        'rgba(255, 255, 255, 0.9)',    // White
        'rgba(170, 170, 170, 0.9)',    // Light Gray
        'rgba(100, 100, 100, 0.9)',    // Mid Gray
        'rgba(200, 200, 200, 0.9)',    // Silver
        'rgba(130, 130, 130, 0.9)',    // Slate
        'rgba(220, 220, 220, 0.9)'     // Pearl
    ];

    const ctx = document.getElementById('radarChart').getContext('2d');
    const togglesContainer = document.getElementById('spot-toggles');
    const gridContainer = document.getElementById('spots-grid');

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
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: '#888888',
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
                        backgroundColor: 'rgba(10, 10, 10, 0.9)',
                        titleColor: '#ffffff',
                        bodyColor: '#cccccc',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
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

    function renderGrid() {
        kebabData.forEach(spot => {
            const card = document.createElement('div');
            card.className = 'spot-card';
            
            card.innerHTML = `
                <div class="spot-rank">#${spot.rank}</div>
                <h3>${spot.name}</h3>
                <div class="spot-city">${spot.city}</div>
                
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
                </div>
            `;
            
            gridContainer.appendChild(card);
        });
    }

    // Initialization
    initChart();
    renderToggles();
    updateChart();
    renderGrid();
});
