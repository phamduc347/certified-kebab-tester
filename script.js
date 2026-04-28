document.addEventListener('DOMContentLoaded', () => {
    // ── Kebab Silhouette Canvas Animation ──────────────────────────────
    (function initKebabCanvas() {
        const canvas = document.getElementById('kebab-canvas');
        if (!canvas) return;
        const ctx2d = canvas.getContext('2d');
        let W, H, kebabs = [];

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            W = canvas.width  = rect.width;
            H = canvas.height = rect.height;
        }
        window.addEventListener('resize', resize);
        resize();

        // Draw original wrap silhouette (rounded rect + stripes + stick)
        function drawKebab(ctx, x, y, size, opacity, angle) {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#000';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = size * 0.04;

            // Wrap / bread body (rounded rectangle)
            const w = size * 0.45, h = size;
            const r = w * 0.45;
            ctx.beginPath();
            ctx.moveTo(-w/2 + r, -h/2);
            ctx.lineTo( w/2 - r, -h/2);
            ctx.arcTo(  w/2,    -h/2,  w/2,    -h/2 + r, r);
            ctx.lineTo( w/2,     h/2 - r);
            ctx.arcTo(  w/2,     h/2,  w/2 - r, h/2,     r);
            ctx.lineTo(-w/2 + r, h/2);
            ctx.arcTo( -w/2,     h/2, -w/2,     h/2 - r, r);
            ctx.lineTo(-w/2,    -h/2 + r);
            ctx.arcTo( -w/2,    -h/2, -w/2 + r,-h/2,     r);
            ctx.closePath();
            ctx.fill();

            // Filling stripes (lettuce / meat layers)
            ctx.globalAlpha = opacity * 0.35;
            ctx.fillStyle = '#fff';
            const stripes = 4;
            const stripeH = h / (stripes * 2.2);
            for (let i = 0; i < stripes; i++) {
                const sy = -h/2 + (i + 0.6) * (h / stripes);
                ctx.fillRect(-w/2 + ctx.lineWidth, sy, w - ctx.lineWidth * 2, stripeH);
            }

            // Skewer / stick at bottom
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#000';
            ctx.fillRect(-size * 0.04, h/2, size * 0.08, size * 0.35);

            // Skewer tip at top (shorter, with round cap)
            ctx.fillRect(-size * 0.04, -h/2 - size * 0.20, size * 0.08, size * 0.20);
            ctx.beginPath();
            ctx.arc(0, -h/2 - size * 0.20, size * 0.06, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        const COUNT = 18;

        function randomKebab() {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const size = 28 + Math.random() * 42;
            const startY = Math.random() * H;
            const speed  = 0.4 + Math.random() * 0.9;
            const drift  = (Math.random() - 0.5) * 0.4; // vertical drift
            const spin   = (Math.random() - 0.5) * 0.015;
            return {
                x:       side === 'left' ? -size : W + size,
                y:       startY,
                size,
                speed:   side === 'left' ? speed : -speed,
                drift,
                spin,
                angle:   Math.random() * Math.PI * 2,
                opacity: 0.04 + Math.random() * 0.09,
            };
        }

        for (let i = 0; i < COUNT; i++) {
            const k = randomKebab();
            // Scatter initial positions across the full width
            k.x = Math.random() * W;
            k.y = Math.random() * H;
            kebabs.push(k);
        }

        function animate() {
            ctx2d.clearRect(0, 0, W, H);
            for (const k of kebabs) {
                k.x    += k.speed;
                k.y    += k.drift;
                k.angle += k.spin;

                // Recycle when off-screen
                if (k.x > W + k.size * 2 || k.x < -k.size * 2 ||
                    k.y > H + k.size * 2 || k.y < -k.size * 2) {
                    Object.assign(k, randomKebab());
                }

                drawKebab(ctx2d, k.x, k.y, k.size, k.opacity, k.angle);
            }
            requestAnimationFrame(animate);
        }
        animate();
    })();
    // ── End Kebab Canvas ────────────────────────────────────────────────

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

    // Side menu logic removed - using top header nav now

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
                            display: true,
                            backdropColor: 'transparent',
                            color: '#9ca3af',
                            font: {
                                size: 10
                            }
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
        let minVal = 10;

        kebabData.forEach((spot, index) => {
            if (selectedSpots.has(spot.id)) {
                const scores = [
                    spot.fleisch, spot.gemuese, spot.sosse, spot.brot, 
                    spot.balance, spot.auswahl, spot.portion, spot.hygiene, spot.service
                ];
                
                scores.forEach(val => {
                    if (val < minVal) minVal = val;
                });

                const color = palette[index % palette.length];
                datasets.push({
                    label: spot.name,
                    data: scores,
                    backgroundColor: color.replace('0.9', '0.15'),
                    borderColor: color,
                    pointBackgroundColor: color,
                    pointBorderColor: '#000',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: color,
                    borderWidth: 2
                });
            }
        });
        
        // Dynamically set min to the floor of the lowest criteria found minus 1 for more "breathing room"
        radarChart.options.scales.r.min = datasets.length > 0 ? Math.max(0, Math.floor(minVal) - 1) : 5;
        
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
                    <div class="bar-fill" style="--target-width: ${percentage}%; background-color: ${color}"></div>
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
            btn.className = 'filter-bubble filter-city active';
            btn.innerHTML = `${city} <span class="filter-x">×</span>`;
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
            btn.className = 'filter-bubble filter-dish active';
            btn.innerHTML = `${dish} <span class="filter-x">×</span>`;
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
            const cityMatch = activeCities.size === 0 || activeCities.has(spot.city);
            const dishMatch = activeDishes.size === 0 || activeDishes.has(spot.dish);
            return cityMatch && dishMatch;
        });

        filteredData.forEach((spot, index) => {
            const card = document.createElement('div');
            card.className = 'spot-card';
            card.id = `spot-${spot.id}`;
            
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.city)}`;
            const displayRank = index + 1;

            card.innerHTML = `
                <div class="spot-card-header">
                    <div class="spot-rank">${displayRank}</div>
                    <div class="spot-header-text">
                        <h3>${spot.name}</h3>
                        <div class="spot-city">
                            ${spot.city}${spot.date ? `<span class="spot-header-date"> · ${spot.date}</span>` : ''}${spot.preis ? `<span class="spot-mobile-price"> · ${spot.preis}</span>` : ''}
                        </div>
                    </div>
                    <div class="spot-header-actions">
                        <a href="${mapsLink}" target="_blank" class="maps-button">
                            <span>Google Maps</span>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                        </a>
                        <div class="spot-score-pill">
                            <span class="label">SCORE</span>
                            <span class="value">${spot.score}</span>
                        </div>
                        <span class="expand-icon">▼</span>
                    </div>
                </div>
                
                <div class="spot-main-content">
                    <div class="spot-top-content">
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
                            
                            <div class="spot-details">
                                <span class="badge">${spot.dish}</span>
                                ${spot.preis ? `<span class="badge">Preis: ${spot.preis}</span>` : ''}
                                <span class="badge badge-tooltip">
                                    P/L: ${spot.plIndex}
                                    <span class="tooltip-text">Price-Leistungs-Index: Gesamtbewertung geteilt durch den Preis. Je höher, desto besser der Wert.</span>
                                </span>
                                <span class="badge">Besuche: ${spot.besuche || 1}</span>
                                ${spot.date ? `<span class="badge">Letzter Besuch: ${spot.date}</span>` : ''}
                            </div>

                            ${spot.kommentar ? `<div class="spot-comment">"${spot.kommentar}"</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            const header = card.querySelector('.spot-card-header');
            header.addEventListener('click', (e) => {
                if (!e.target.closest('.maps-button')) {
                    card.classList.toggle('expanded');
                }
            });
            
            gridContainer.appendChild(card);
        });
    }

    function jumpToReview(spotId) {
        // 1. Clear filters so the target spot is definitely in the grid
        activeCities.clear();
        activeDishes.clear();
        populateFilters(); 
        renderGrid();

        // 2. Find the card
        const card = document.getElementById(`spot-${spotId}`);
        if (card) {
            // 3. Smooth scroll to it
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // 4. Expand it after a short delay
            setTimeout(() => {
                card.classList.add('expanded');
            }, 600);
        }
    }

    function initSpotlight() {
        const container = document.getElementById('spotlight-container');
        const dotsContainer = document.getElementById('spotlight-dots');
        if (!container || !dotsContainer) return;

        // Helper to parse scores
        const parseScore = (s) => parseFloat(s.replace(',', '.').replace('%', ''));

        const sortedByDate = [...kebabData].sort((a, b) => {
            const dateA = a.date.split('.').reverse().join('-');
            const dateB = b.date.split('.').reverse().join('-');
            return new Date(dateB) - new Date(dateA);
        });

        const sortedByScore = [...kebabData].sort((a, b) => parseScore(b.score) - parseScore(a.score));
        const sortedByPL = [...kebabData].sort((a, b) => parseScore(b.plIndex) - parseScore(a.plIndex));
        const bestDresden = [...kebabData].filter(s => s.city === 'Dresden').sort((a, b) => parseScore(b.score) - parseScore(a.score))[0];

        const spotlightItems = [
            { spot: sortedByDate[0], label: "LATEST TEST", tag: "NEWEST ADDITION" },
            { spot: sortedByScore[0], label: "ALL-TIME BEST", tag: "THE BENCHMARK" },
            { spot: sortedByPL[0], label: "VALUE CHAMPION", tag: "BEST PRICE-PERFORMANCE" },
            { spot: bestDresden, label: "DRESDEN'S HERO", tag: "TOP LOCAL CHOICE" },
            { spot: sortedByScore[sortedByScore.length - 1], label: "BOTTOM RANK", tag: "ROOM FOR IMPROVEMENT" }
        ];

        let currentIndex = 0;
        let rotationTimer;

        function renderSpotlightItems() {
            container.innerHTML = spotlightItems.map((item, i) => {
                const spot = item.spot;
                const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.city)}`;
                return `
                    <div class="latest-card ${i === 0 ? 'active' : ''}" data-index="${i}">
                        <div class="latest-image-wrapper">
                            <img src="${spot.image || 'kebab_spot_demo.png'}" alt="${spot.name}" class="latest-image spot-image">
                            <div class="latest-badge">${item.label}</div>
                        </div>
                        <div class="latest-content">
                            <div class="latest-header">
                                <div class="latest-info">
                                    <span class="latest-label">${item.tag}</span>
                                    <h3><a href="${mapsLink}" target="_blank" class="maps-link">${spot.name}</a></h3>
                                    <div class="latest-meta">${spot.city} • ${spot.date}</div>
                                </div>
                                <div class="latest-score-block">
                                    <div class="latest-score-label">SCORE</div>
                                    <div class="latest-score-value">${spot.score}</div>
                                </div>
                            </div>
                            <div class="latest-body">
                                <div class="latest-details">
                                    <span class="badge">${spot.dish}</span>
                                    <span class="badge" style="color: #ffd700;">${spot.stars}</span>
                                </div>
                                <button class="spotlight-jump-btn" onclick="Antigravity.jumpToReview(${spot.id})">
                                    <span>Full Review</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function renderDots() {
            dotsContainer.innerHTML = spotlightItems.map((_, i) => 
                `<div class="dot ${i === currentIndex ? 'active' : ''}" data-index="${i}"></div>`
            ).join('');
        }

        function updateSpotlight(index = null) {
            if (index !== null) currentIndex = index;
            
            const cards = container.querySelectorAll('.latest-card');
            cards.forEach((card, i) => {
                card.classList.toggle('active', i === currentIndex);
            });
            
            renderDots();
        }

        function startRotation() {
            clearInterval(rotationTimer);
            rotationTimer = setInterval(() => {
                currentIndex = (currentIndex + 1) % spotlightItems.length;
                updateSpotlight();
            }, 8000);
        }

        dotsContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('dot')) {
                const index = parseInt(e.target.dataset.index);
                if (index === currentIndex) return;
                updateSpotlight(index);
                startRotation();
            }
        });

        renderSpotlightItems();
        updateSpotlight();
        startRotation();
    }

    // Initialization
    initChart();
    renderToggles();
    updateChart();
    populateFilters();
    renderGrid();
    initSpotlight();

    // Toggle-All Button logic
    const toggleAllBtn = document.getElementById('toggle-all-btn');
    const toggleAllLabel = document.getElementById('toggle-all-label');
    const toggleAllIcon = toggleAllBtn ? toggleAllBtn.querySelector('svg') : null;
    let allExpanded = false;

    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', () => {
            allExpanded = !allExpanded;
            const cards = gridContainer.querySelectorAll('.spot-card');
            cards.forEach(card => {
                if (allExpanded) {
                    card.classList.add('expanded');
                } else {
                    card.classList.remove('expanded');
                }
            });
            toggleAllLabel.textContent = allExpanded ? 'Alle einklappen' : 'Alle ausklappen';
            if (toggleAllIcon) {
                toggleAllIcon.style.transform = allExpanded ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });
    }

    // Lightbox logic
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (lightbox && lightboxImg) {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('spot-image')) {
                lightboxImg.src = e.target.src;
                lightbox.classList.add('active');
                document.body.classList.add('lightbox-open');
            }
        });

        const closeLightbox = () => {
            lightbox.classList.remove('active');
            document.body.classList.remove('lightbox-open');
            setTimeout(() => {
                if (!lightbox.classList.contains('active')) {
                    lightboxImg.src = '';
                }
            }, 300);
        };

        lightbox.addEventListener('click', (e) => {
            // Close if clicking the overlay or background
            if (e.target.id === 'lightbox' || e.target.classList.contains('lightbox-overlay')) {
                closeLightbox();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }
    // Legal Modal Logic
    const legalModal = document.getElementById('legal-modal');
    const modalContent = document.getElementById('modal-content');
    const openDisclaimer = document.getElementById('open-disclaimer');
    const openPrivacy = document.getElementById('open-privacy');

    const legalTexts = {
        disclaimer: `
            <h2>Disclaimer</h2>
            <div class="legal-section">
                <h3>1. Keine wirtschaftliche Absicht</h3>
                <p>Diese Webseite ist ein rein privates Hobby-Projekt. Es besteht keinerlei kommerzielle oder wirtschaftliche Absicht. Ich schalte keine Werbung, nutze keine Affiliate-Links und erhalte keine Vergütungen von den getesteten Betrieben.</p>
            </div>
            <div class="legal-section">
                <h3>2. Subjektivität & Momentaufnahme</h3>
                <p>Alle Bewertungen basieren auf meiner persönlichen Meinung zum Zeitpunkt des Besuchs. Geschmack ist subjektiv. Ein Testbericht stellt keine allgemeingültige Aussage über die dauerhafte Qualität eines Gastronomiebetriebs dar.</p>
            </div>
            <div class="legal-section">
                <h3>3. Richtigkeit der Angaben</h3>
                <p>Preise, Speisekarten und Öffnungszeiten können sich jederzeit ändern. Ich bemühe mich um Aktualität, kann aber keine Gewähr für die Richtigkeit der hier angezeigten Daten übernehmen.</p>
            </div>
            <div class="legal-section">
                <h3>4. Haftung für Links</h3>
                <p>Trotz sorgfältiger inhaltlicher Kontrolle übernehme ich keine Haftung für die Inhalte externer Links (z.B. Google Maps). Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.</p>
            </div>
        `,
        privacy: `
            <h2>Datenschutzerklärung</h2>
            <div class="legal-section">
                <h3>1. Grundsatz</h3>
                <p>Der Schutz deiner Daten ist mir extrem wichtig. Diese Seite ist darauf ausgelegt, so datensparsam wie möglich zu sein.</p>
            </div>
            <div class="legal-section">
                <h3>2. Server-Log-Files</h3>
                <p>Beim Aufruf dieser Webseite werden durch den Hosting-Provider (z. B. GitHub Pages) automatisch Informationen in sogenannten Server-Log-Files gespeichert (IP-Adresse, Browsertyp, Referrer URL, Zeitstempel). Diese Daten sind technisch notwendig für den Betrieb der Seite.</p>
            </div>
            <div class="legal-section">
                <h3>3. Keine Analyse-Tools</h3>
                <p>Ich verwende <strong>keinerlei Tracking-Tools</strong> wie Google Analytics, keine Werbenetzwerke und keine Social-Media-Pixel. Dein Surfverhalten wird auf dieser Seite nicht beobachtet.</p>
            </div>
            <div class="legal-section">
                <h3>4. LocalStorage & Cookies</h3>
                <p>Diese Seite nutzt keine klassischen Cookies. Wir verwenden lediglich den <strong>LocalStorage</strong> deines Browsers, um deine Präferenz für den Dark/Light Mode zu speichern. Diese Information verbleibt auf deinem Endgerät.</p>
            </div>
            <div class="legal-section">
                <h3>5. Externe Karten (Leaflet)</h3>
                <p>Für die Darstellung der Karte wird Leaflet.js genutzt. Dabei werden Kartendaten von OpenStreetMap/Carto geladen. Hierbei wird technisch bedingt deine IP-Adresse an diese Dienste übertragen.</p>
            </div>
        `
    };

    const openModal = (type) => {
        if (!legalModal || !modalContent) return;
        modalContent.innerHTML = legalTexts[type];
        legalModal.classList.add('active');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        if (!legalModal) return;
        legalModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    };

    if (openDisclaimer) openDisclaimer.addEventListener('click', (e) => { e.preventDefault(); openModal('disclaimer'); });
    if (openPrivacy) openPrivacy.addEventListener('click', (e) => { e.preventDefault(); openModal('privacy'); });

    if (legalModal) {
        legalModal.addEventListener('click', (e) => {
            if (e.target.id === 'legal-modal' || e.target.classList.contains('modal-overlay') || e.target.closest('.modal-close')) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && legalModal.classList.contains('active')) {
                closeModal();
            }
        });
    }
    // Header Scroll Optimization
    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.hero-section');
    
    // Optimized Scroll Listener
    let scrollTimeout;
    const navLinks = document.querySelectorAll('.header-link');
    const sections = Array.from(navLinks).map(link => {
        const id = link.getAttribute('href').substring(1);
        return document.getElementById(id);
    }).filter(el => el !== null);

    const handleScroll = () => {
        if (!header || !heroSection) return;
        
        if (!scrollTimeout) {
            scrollTimeout = requestAnimationFrame(() => {
                // Header shrink logic
                const heroHeight = heroSection.offsetHeight;
                if (window.scrollY > heroHeight - 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }

                // Active link logic
                let currentSectionId = "";
                const scrollPos = window.scrollY + 120; // Offset for sticky header

                sections.forEach(section => {
                    if (scrollPos >= section.offsetTop && scrollPos < section.offsetTop + section.offsetHeight) {
                        currentSectionId = section.getAttribute('id');
                    }
                });

                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSectionId}`) {
                        link.classList.add('active');
                    }
                });

                scrollTimeout = null;
            });
        }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Clean URL navigation — scroll without adding hash to URL
    document.querySelectorAll('.header-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', window.location.pathname);
            }
        });
    });
});
