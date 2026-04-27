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

    // Menu logic
    const menuBtn = document.getElementById('menu-btn');
    const closeBtn = document.getElementById('close-menu-btn');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    function toggleMenu() {
        sideMenu.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    }

    if (menuBtn && closeBtn && sideMenu && menuOverlay) {
        menuBtn.addEventListener('click', toggleMenu);
        closeBtn.addEventListener('click', toggleMenu);
        menuOverlay.addEventListener('click', toggleMenu);

        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

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

    function renderCriteriaBar(label, value) {
        const percentage = (parseFloat(value) / 10) * 100;
        const color = getColorForScore(value);
        return `
            <div class="cat-item-bar">
                <div class="cat-info">
                    <span>${label}</span>
                    <span style="color: ${color}">${value}</span>
                </div>
                <div class="bar-bg">
                    <div class="bar-fill" style="width: ${percentage}%; background-color: ${color}"></div>
                </div>
            </div>
        `;
    }

    let activeCities = new Set();
    let activeDishes = new Set();

    function populateFilters() {
        const cities = [...new Set(kebabData.map(spot => spot.city))].sort();
        const dishes = [...new Set(kebabData.map(spot => spot.dish))].sort();
        
        const cityGroup = document.getElementById('filter-city-group');
        const dishGroup = document.getElementById('filter-dish-group');
        
        cities.forEach(city => {
            activeCities.add(city);
            const btn = document.createElement('button');
            btn.className = 'filter-bubble active';
            btn.textContent = city;
            btn.addEventListener('click', () => {
                if (activeCities.has(city)) {
                    activeCities.delete(city);
                    btn.classList.remove('active');
                } else {
                    activeCities.add(city);
                    btn.classList.add('active');
                }
                renderGrid();
            });
            cityGroup.appendChild(btn);
        });

        dishes.forEach(dish => {
            activeDishes.add(dish);
            const btn = document.createElement('button');
            btn.className = 'filter-bubble active';
            btn.textContent = dish;
            btn.addEventListener('click', () => {
                if (activeDishes.has(dish)) {
                    activeDishes.delete(dish);
                    btn.classList.remove('active');
                } else {
                    activeDishes.add(dish);
                    btn.classList.add('active');
                }
                renderGrid();
            });
            dishGroup.appendChild(btn);
        });
    }

    function renderGrid() {
        gridContainer.innerHTML = '';

        const filteredData = kebabData.filter(spot => {
            return activeCities.has(spot.city) && activeDishes.has(spot.dish);
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
                <div class="spot-card-header">
                    <div class="spot-rank">#${spot.rank}</div>
                    <div class="spot-header-text">
                        <h3>
                            <a href="${mapsLink}" target="_blank" rel="noopener noreferrer" class="maps-link" title="Auf Google Maps ansehen">
                                ${spot.name}
                            </a>
                        </h3>
                        <div class="spot-city">
                            ${spot.city}
                            ${spot.date ? `<span class="spot-date"> • ${spot.date}</span>` : ''}
                        </div>
                    </div>
                    <div class="spot-list-score">
                        <span class="stat-val">${spot.score}</span>
                        <span class="stat-val" style="color: #ffd700;">${spot.stars}</span>
                        <span class="expand-icon">▼</span>
                    </div>
                </div>
                
                <div class="spot-expandable">
                    <img src="${spot.image || 'kebab_spot_demo.png'}" alt="Bild von ${spot.name}" class="spot-image" />
                    <div class="spot-content">
                        <div class="spot-categories">
                            ${renderCriteriaBar('Fleisch', spot.fleisch)}
                            ${renderCriteriaBar('Gemüse', spot.gemuese)}
                            ${renderCriteriaBar('Soße', spot.sosse)}
                            ${renderCriteriaBar('Brot', spot.brot)}
                            ${renderCriteriaBar('Balance', spot.balance)}
                            ${renderCriteriaBar('Auswahl', spot.auswahl)}
                            ${renderCriteriaBar('Portion', spot.portion)}
                            ${renderCriteriaBar('Hygiene', spot.hygiene)}
                            ${renderCriteriaBar('Service', spot.service)}
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
                            ${spot.date ? `<span class="badge">Letzter Besuch: ${spot.date}</span>` : ''}
                        </div>
                        
                        ${spot.kommentar ? `<div class="spot-comment">"${spot.kommentar}"</div>` : ''}
                    </div>
                </div>
            `;
            
            const header = card.querySelector('.spot-card-header');
            header.addEventListener('click', (e) => {
                if (gridContainer.classList.contains('spots-list')) {
                    if (!e.target.closest('.maps-link')) {
                        card.classList.toggle('expanded');
                    }
                }
            });
            
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

    // Lightbox logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    gridContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('spot-image')) {
            lightboxImg.src = e.target.src;
            lightbox.classList.add('active');
            document.body.classList.add('lightbox-open');
        }
    });

    lightbox.addEventListener('click', () => {
        lightbox.classList.remove('active');
        document.body.classList.remove('lightbox-open');
        setTimeout(() => {
            if (!lightbox.classList.contains('active')) {
                lightboxImg.src = '';
            }
        }, 300);
    });
});
