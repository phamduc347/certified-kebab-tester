document.addEventListener('DOMContentLoaded', () => {
    // Notify Pushcut on page access
    const visitorInfo = {
        res: `${screen.width}x${screen.height}`,
        ref: document.referrer || 'Direct',
        lang: navigator.language
    };

    fetch('https://api.pushcut.io/VcqntPOAR-xGOoaXyGdur/notifications/Certified%20Kebab%20Tester%20-%20Access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            title: "New visit of certifiedkebabtester.com",
            text: `Res: ${visitorInfo.res} | Ref: ${visitorInfo.ref} | Lang: ${visitorInfo.lang}`
        })
    }).catch(() => { });

    const header = document.querySelector('.header');
    const heroSection = document.querySelector('.hero-section');

    // Helper: Scroll to element flush with the bottom of the header + breathing room
    const scrollToElementFlush = (target) => {
        if (!target || !header) return;

        // Ensure header is in scrolled state to get correct height
        const wasScrolled = header.classList.contains('scrolled');
        header.classList.add('no-transition');
        header.classList.add('scrolled');

        // Add 24px of breathing room below the header
        const scrollGap = 24;
        const targetOffset = header.offsetHeight + scrollGap;

        if (!wasScrolled) {
            header.classList.remove('scrolled');
        }

        setTimeout(() => {
            header.classList.remove('no-transition');
        }, 10);

        // 4. Scroll to exact position (Absolute Top - Measured Header Height - Gap)
        const absoluteTop = target.getBoundingClientRect().top + window.pageYOffset;

        window.scrollTo({
            top: absoluteTop - targetOffset,
            behavior: 'smooth'
        });
    };

    // ── Kebab Silhouette Canvas Animation ──────────────────────────────
    (function initKebabCanvas() {
        const canvas = document.getElementById('kebab-canvas');
        if (!canvas) return;
        const ctx2d = canvas.getContext('2d');
        let W, H, kebabs = [];

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            W = canvas.width = rect.width;
            H = canvas.height = rect.height;
        }

        let lastWidth = window.innerWidth;
        window.addEventListener('resize', () => {
            if (window.innerWidth !== lastWidth) {
                lastWidth = window.innerWidth;
                resize();
            }
        });
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
            ctx.moveTo(-w / 2 + r, -h / 2);
            ctx.lineTo(w / 2 - r, -h / 2);
            ctx.arcTo(w / 2, -h / 2, w / 2, -h / 2 + r, r);
            ctx.lineTo(w / 2, h / 2 - r);
            ctx.arcTo(w / 2, h / 2, w / 2 - r, h / 2, r);
            ctx.lineTo(-w / 2 + r, h / 2);
            ctx.arcTo(-w / 2, h / 2, -w / 2, h / 2 - r, r);
            ctx.lineTo(-w / 2, -h / 2 + r);
            ctx.arcTo(-w / 2, -h / 2, -w / 2 + r, -h / 2, r);
            ctx.closePath();
            ctx.fill();

            // Filling stripes (lettuce / meat layers)
            ctx.globalAlpha = opacity * 0.35;
            ctx.fillStyle = '#fff';
            const stripes = 4;
            const stripeH = h / (stripes * 2.2);
            for (let i = 0; i < stripes; i++) {
                const sy = -h / 2 + (i + 0.6) * (h / stripes);
                ctx.fillRect(-w / 2 + ctx.lineWidth, sy, w - ctx.lineWidth * 2, stripeH);
            }

            // Skewer / stick at bottom
            ctx.globalAlpha = opacity;
            ctx.fillStyle = '#000';
            ctx.fillRect(-size * 0.04, h / 2, size * 0.08, size * 0.35);

            // Skewer tip at top (shorter, with round cap)
            ctx.fillRect(-size * 0.04, -h / 2 - size * 0.20, size * 0.08, size * 0.20);
            ctx.beginPath();
            ctx.arc(0, -h / 2 - size * 0.20, size * 0.06, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }

        const COUNT = window.innerWidth < 768 ? 8 : 18;

        function randomKebab() {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const size = 28 + Math.random() * 42;
            const startY = Math.random() * H;
            const speed = 0.4 + Math.random() * 0.9;
            const drift = (Math.random() - 0.5) * 0.4; // vertical drift
            const spin = (Math.random() - 0.5) * 0.015;
            return {
                x: side === 'left' ? -size : W + size,
                y: startY,
                size,
                speed: side === 'left' ? speed : -speed,
                drift,
                spin,
                angle: Math.random() * Math.PI * 2,
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

        let rafId = null;
        function animate() {
            ctx2d.clearRect(0, 0, W, H);
            for (const k of kebabs) {
                k.x += k.speed;
                k.y += k.drift;
                k.angle += k.spin;

                // Recycle when off-screen
                if (k.x > W + k.size * 2 || k.x < -k.size * 2 ||
                    k.y > H + k.size * 2 || k.y < -k.size * 2) {
                    Object.assign(k, randomKebab());
                }

                drawKebab(ctx2d, k.x, k.y, k.size, k.opacity, k.angle);
            }
            rafId = requestAnimationFrame(animate);
        }

        // Pause the loop when the hero section leaves the viewport
        const canvasObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                if (!rafId) animate();
            } else {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        }, { threshold: 0 });
        canvasObserver.observe(canvas.parentElement);
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

    const DEFAULT_SUPABASE_URL = 'https://ehmrxhrfbejcaocpxfed.supabase.co';
    const DEFAULT_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVobXJ4aHJmYmVqY2FvY3B4ZmVkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODc0NzAsImV4cCI6MjA5MzQ2MzQ3MH0.dBcRE6zF9Bnso3A4eDHuhlLX3Sd5pD9AQq71ScnVc1Y';

    function buildSupabaseConfig() {
        const supabaseConfig = window.SUPABASE_CONFIG || {};
        const rawSupabaseUrl = typeof supabaseConfig.url === 'string' && supabaseConfig.url.trim()
            ? supabaseConfig.url.trim()
            : DEFAULT_SUPABASE_URL;

        const normalizedSupabaseUrl = rawSupabaseUrl
            .replace(/\/+$/, '')
            .replace(/\/rest\/v1$/i, '');

        let supabaseUrl = DEFAULT_SUPABASE_URL;
        try {
            const parsed = new URL(normalizedSupabaseUrl);
            supabaseUrl = `${parsed.protocol}//${parsed.host}`;
        } catch (_) {
            supabaseUrl = DEFAULT_SUPABASE_URL;
        }

        const supabaseAnonKey = typeof supabaseConfig.anonKey === 'string' && supabaseConfig.anonKey.trim()
            ? supabaseConfig.anonKey.trim()
            : DEFAULT_SUPABASE_ANON_KEY;

        return { supabaseUrl, supabaseAnonKey };
    }

    let supabaseClient = null;
    function ensureSupabaseClient() {
        if (supabaseClient) return supabaseClient;
        if (!window.supabase || typeof window.supabase.createClient !== 'function') {
            return null;
        }

        const { supabaseUrl, supabaseAnonKey } = buildSupabaseConfig();
        if (!supabaseUrl || !supabaseAnonKey) {
            return null;
        }

        try {
            supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
            return supabaseClient;
        } catch (err) {
            console.error('Supabase init failed:', err);
            supabaseClient = null;
            return null;
        }
    }

    supabaseClient = ensureSupabaseClient();

    const commentsBySpot = new Map();
    const reviewLikesBySpot = new Map();
    const reviewLikedByClient = new Set();
    let commentsReady = !supabaseClient;
    let commentsLoadError = false;

    const COMMENT_LOCKS_STORAGE_KEY = 'ckt_comment_locks_v1';
    const COMMENT_COOLDOWN_MS = 30 * 1000;
    const COMMENT_RATE_WINDOW_MS = 10 * 60 * 1000;
    const COMMENT_RATE_MAX = 4;
    const COMMENT_BLOCK_MS = 15 * 60 * 1000;
    const COMMENT_DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000;
    const COMMENT_VOTER_STORAGE_KEY = 'ckt_comment_voter_id_v1';

    function getCommentVoterFingerprint() {
        try {
            const existing = localStorage.getItem(COMMENT_VOTER_STORAGE_KEY);
            if (existing && existing.length >= 12) {
                return existing;
            }

            const generated = (window.crypto && typeof window.crypto.randomUUID === 'function')
                ? window.crypto.randomUUID()
                : `voter-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;

            localStorage.setItem(COMMENT_VOTER_STORAGE_KEY, generated);
            return generated;
        } catch (_) {
            return `voter-fallback-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        }
    }

    function loadCommentLocks() {
        try {
            const raw = localStorage.getItem(COMMENT_LOCKS_STORAGE_KEY);
            if (!raw) {
                return { lastSubmitAt: 0, blockedUntil: 0, recent: [] };
            }
            const parsed = JSON.parse(raw);
            return {
                lastSubmitAt: Number(parsed.lastSubmitAt) || 0,
                blockedUntil: Number(parsed.blockedUntil) || 0,
                recent: Array.isArray(parsed.recent) ? parsed.recent : []
            };
        } catch (_) {
            return { lastSubmitAt: 0, blockedUntil: 0, recent: [] };
        }
    }

    function saveCommentLocks(state) {
        try {
            localStorage.setItem(COMMENT_LOCKS_STORAGE_KEY, JSON.stringify(state));
        } catch (_) {
            // ignore storage failures
        }
    }

    function normalizeCommentText(value) {
        return String(value || '')
            .trim()
            .toLowerCase()
            .replace(/\s+/g, ' ');
    }

    function getClientSpamBlockReason(spotId, commentValue) {
        const now = Date.now();
        const state = loadCommentLocks();
        const recent = state.recent
            .filter((entry) => now - Number(entry.at || 0) <= COMMENT_DUPLICATE_WINDOW_MS)
            .map((entry) => ({
                at: Number(entry.at) || 0,
                spotId: Number(entry.spotId) || 0,
                text: String(entry.text || '')
            }));

        if (state.blockedUntil > now) {
            const waitSeconds = Math.ceil((state.blockedUntil - now) / 1000);
            saveCommentLocks({ ...state, recent });
            return `Zu viele Versuche. Bitte ${waitSeconds}s warten.`;
        }

        if (state.lastSubmitAt && now - state.lastSubmitAt < COMMENT_COOLDOWN_MS) {
            const waitSeconds = Math.ceil((COMMENT_COOLDOWN_MS - (now - state.lastSubmitAt)) / 1000);
            saveCommentLocks({ ...state, recent });
            return `Bitte ${waitSeconds}s warten, bevor du erneut postest.`;
        }

        const attemptsInWindow = recent.filter((entry) => now - entry.at <= COMMENT_RATE_WINDOW_MS).length;
        if (attemptsInWindow >= COMMENT_RATE_MAX) {
            state.blockedUntil = now + COMMENT_BLOCK_MS;
            saveCommentLocks({ ...state, recent });
            return 'Temporäre Sperre aktiv. Bitte später erneut versuchen.';
        }

        const normalizedText = normalizeCommentText(commentValue);
        const duplicate = recent.some((entry) =>
            entry.spotId === Number(spotId) &&
            entry.text === normalizedText &&
            now - entry.at <= COMMENT_DUPLICATE_WINDOW_MS
        );

        saveCommentLocks({ ...state, recent });
        if (duplicate) {
            return 'Doppelter Kommentar erkannt. Bitte formuliere ihn neu.';
        }

        return '';
    }

    function markClientCommentSubmitted(spotId, commentValue) {
        const now = Date.now();
        const state = loadCommentLocks();
        const normalizedText = normalizeCommentText(commentValue);
        const recent = (Array.isArray(state.recent) ? state.recent : [])
            .filter((entry) => now - Number(entry.at || 0) <= COMMENT_DUPLICATE_WINDOW_MS)
            .concat([{ at: now, spotId: Number(spotId), text: normalizedText }]);

        saveCommentLocks({
            lastSubmitAt: now,
            blockedUntil: Number(state.blockedUntil) || 0,
            recent
        });
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function formatCommentDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (Number.isNaN(date.getTime())) return '';
        return date.toLocaleString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function renderReviewCommentsSection(spotId) {
        const comments = commentsBySpot.get(Number(spotId)) || [];
        const setupMissing = !supabaseClient;
        const loading = supabaseClient && !commentsReady;

        let stateText = '';
        if (setupMissing) {
            stateText = 'Kommentare sind noch nicht aktiviert. Trage zuerst deine Supabase-Daten ein.';
        } else if (loading) {
            stateText = 'Kommentare werden geladen...';
        } else if (commentsLoadError) {
            stateText = 'Kommentare konnten nicht geladen werden. Bitte Supabase-Setup prüfen.';
        }

        const commentsHtml = comments.length > 0
            ? comments.map((comment) => {
                const author = escapeHtml(comment.author || 'Anonym');
                const text = escapeHtml(comment.comment_text || '');
                const createdAt = formatCommentDate(comment.created_at);
                return `
                    <article class="review-comment-item">
                        <div class="review-comment-head">
                            <span class="review-comment-author">${author}</span>
                            ${createdAt ? `<span class="review-comment-date">${createdAt}</span>` : ''}
                        </div>
                        <p class="review-comment-text">${text}</p>
                    </article>
                `;
            }).join('')
            : '<p class="review-comments-empty">Noch keine Kommentare. Sei der Erste.</p>';

        return `
            <section class="review-comments" aria-label="Kommentare zum Review" data-spot-id="${spotId}">
                <div class="review-comments-header">
                    <h4>Community-Kommentare</h4>
                    <span class="review-comments-count">${comments.length}</span>
                </div>
                ${stateText ? `<p class="review-comments-state">${stateText}</p>` : ''}
                <div class="review-comments-list">${commentsHtml}</div>
                <form class="review-comments-form" data-spot-id="${spotId}">
                    <div class="comment-honeypot" aria-hidden="true">
                        <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
                    </div>
                    <input class="review-comment-input" type="text" name="author" maxlength="40" placeholder="Dein Name (optional)" />
                    <textarea class="review-comment-textarea" name="comment" maxlength="500" placeholder="Dein Kommentar..." required></textarea>
                    <div class="review-comments-actions">
                        <button type="submit" class="review-comment-submit" ${setupMissing ? 'disabled' : ''}>Senden</button>
                        <span class="comment-form-status" aria-live="polite"></span>
                    </div>
                </form>
            </section>
        `;
    }

    function attachCommentSectionHandlers(card) {
        const commentsSection = card.querySelector('.review-comments');
        const form = card.querySelector('.review-comments-form');
        const reviewHelpfulButton = card.querySelector('.review-helpful-btn');

        if (commentsSection) {
            commentsSection.addEventListener('click', (event) => event.stopPropagation());
            commentsSection.addEventListener('keydown', (event) => event.stopPropagation());
        }

        if (form) {
            form.addEventListener('submit', handleCommentSubmit);
        }

        if (reviewHelpfulButton) {
            reviewHelpfulButton.addEventListener('click', handleReviewHelpfulClick);
        }
    }

    function refreshCommentsForSpot(spotId) {
        const card = document.getElementById(`spot-${spotId}`);
        if (!card) return;

        const host = card.querySelector('.review-comments-host');
        if (!host) return;

        host.innerHTML = renderReviewCommentsSection(spotId);
        attachCommentSectionHandlers(card);
    }

    async function loadReviewComments() {
        const client = ensureSupabaseClient();
        if (!client) return;

        commentsReady = false;
        commentsLoadError = false;

        const { data, error } = await client
            .from('review_comments')
            .select('id, spot_id, author, comment_text, created_at')
            .eq('is_approved', true)
            .order('created_at', { ascending: false });

        commentsReady = true;

        if (error) {
            commentsLoadError = true;
            renderGrid();
            return;
        }

        const spotIds = kebabData.map((spot) => Number(spot.id)).filter((id) => Number.isFinite(id));
        const voterFingerprint = getCommentVoterFingerprint();

        reviewLikesBySpot.clear();
        reviewLikedByClient.clear();

        if (spotIds.length > 0) {
            const { data: likesData, error: likesError } = await client
                .from('review_spot_likes')
                .select('spot_id, voter_fingerprint')
                .in('spot_id', spotIds);

            if (!likesError && Array.isArray(likesData)) {
                likesData.forEach((like) => {
                    const likedSpotId = Number(like.spot_id);
                    reviewLikesBySpot.set(likedSpotId, (reviewLikesBySpot.get(likedSpotId) || 0) + 1);
                    if (String(like.voter_fingerprint || '') === voterFingerprint) {
                        reviewLikedByClient.add(likedSpotId);
                    }
                });
            }
        }

        commentsBySpot.clear();
        (data || []).forEach((comment) => {
            const spotId = Number(comment.spot_id);

            if (!commentsBySpot.has(spotId)) {
                commentsBySpot.set(spotId, []);
            }
            commentsBySpot.get(spotId).push(comment);
        });

        renderGrid();
    }

    async function handleCommentSubmit(event) {
        event.preventDefault();
        event.stopPropagation();

        const form = event.currentTarget;
        const spotId = Number(form.dataset.spotId);
        const authorInput = form.querySelector('input[name="author"]');
        const commentInput = form.querySelector('textarea[name="comment"]');
        const websiteInput = form.querySelector('input[name="website"]');
        const submitButton = form.querySelector('button[type="submit"]');
        const status = form.querySelector('.comment-form-status');

        const client = ensureSupabaseClient();
        if (!client) {
            if (status) status.textContent = 'Kommentarservice aktuell nicht verfuegbar.';
            return;
        }

        const authorValue = (authorInput?.value || '').trim() || 'Anonym';
        const commentValue = (commentInput?.value || '').trim();
        const websiteValue = (websiteInput?.value || '').trim();

        if (!commentValue) {
            if (status) status.textContent = 'Bitte Kommentar eingeben.';
            return;
        }

        if (commentValue.length < 3) {
            if (status) status.textContent = 'Kommentar ist zu kurz.';
            return;
        }

        if (websiteValue) {
            if (status) status.textContent = 'Danke!';
            form.reset();
            return;
        }

        const blockReason = getClientSpamBlockReason(spotId, commentValue);
        if (blockReason) {
            if (status) status.textContent = blockReason;
            return;
        }

        if (submitButton) submitButton.disabled = true;
        if (status) status.textContent = 'Senden...';

        const { error } = await client
            .from('review_comments')
            .insert({
                spot_id: spotId,
                author: authorValue.slice(0, 40),
                comment_text: commentValue.slice(0, 500)
            });

        if (submitButton) submitButton.disabled = false;

        if (error) {
            if (status) status.textContent = error.message ? `Fehler: ${error.message}` : 'Fehler beim Speichern.';
            return;
        }

        markClientCommentSubmitted(spotId, commentValue);

        const spot = kebabData.find(s => s.id === spotId);
        const spotName = spot ? spot.name : `Spot #${spotId}`;

        // Notify Pushcut on new comment
        fetch('https://api.pushcut.io/VcqntPOAR-xGOoaXyGdur/notifications/Certified%20Kebab%20Tester%20-%20Comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: `"${commentValue}" - under ${spotName}`,
                title: `${authorValue} - wants to comment:`
            })
        }).catch(() => { });

        if (commentInput) commentInput.value = '';
        if (authorInput) authorInput.value = '';
        if (status) status.textContent = 'Danke. Dein Kommentar ist eingegangen und wird nach Freigabe sichtbar.';

        openCommentFeedbackModal();
    }

    async function handleReviewHelpfulClick(event) {
        const likeButton = event.currentTarget;
        if (!likeButton) return;

        event.preventDefault();
        event.stopPropagation();

        if (likeButton.disabled || likeButton.dataset.pending === 'true') {
            return;
        }

        const alreadyLiked = likeButton.dataset.liked === 'true';
        if (alreadyLiked) {
            return;
        }

        const spotId = Number(likeButton.dataset.spotId);
        if (!Number.isFinite(spotId)) {
            return;
        }

        const client = ensureSupabaseClient();
        if (!client) {
            return;
        }

        likeButton.dataset.pending = 'true';
        likeButton.disabled = true;

        const voterFingerprint = getCommentVoterFingerprint();
        const { error } = await client
            .from('review_spot_likes')
            .insert({
                spot_id: spotId,
                voter_fingerprint: voterFingerprint
            });

        const duplicateVote = Boolean(error && (error.code === '23505' || /duplicate/i.test(error.message || '')));
        if (error && !duplicateVote) {
            likeButton.dataset.pending = 'false';
            likeButton.disabled = false;
            return;
        }

        if (!error) {
            const spot = kebabData.find((entry) => Number(entry.id) === spotId);
            const spotName = spot ? spot.name : `Spot #${spotId}`;

            fetch('https://api.pushcut.io/VcqntPOAR-xGOoaXyGdur/notifications/Certified%20Kebab%20Tester%20-%20Like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: `New like for review "${spotName}"`,
                    text: 'Vote was logged in supabase.'
                })
            }).catch(() => { });
        }

        if (!reviewLikedByClient.has(spotId)) {
            reviewLikedByClient.add(spotId);
            reviewLikesBySpot.set(spotId, (reviewLikesBySpot.get(spotId) || 0) + 1);
        }

        const nextCount = reviewLikesBySpot.get(spotId) || 0;
        likeButton.dataset.liked = 'true';
        likeButton.dataset.pending = 'false';
        likeButton.classList.add('is-liked');
        likeButton.disabled = false;

        const countEl = likeButton.querySelector('.review-helpful-count');
        if (countEl) {
            countEl.textContent = String(nextCount);
        }
    }

    // ── Star Rating Renderer ──────────────────────────────────────────
    function renderStars(scoreStr) {
        if (!scoreStr) return '';
        // Convert "92,10%" to 92.1
        const scoreVal = parseFloat(scoreStr.replace(',', '.'));

        return `
            <div class="star-rating" title="${scoreStr}">
                <div class="stars-outer">
                    <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    <div class="stars-inner" style="width: ${scoreVal}%">
                        <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                    </div>
                </div>
            </div>
        `;
    }

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

    function renderToggles(query = '') {
        togglesContainer.innerHTML = '';
        const lowerQuery = query.toLowerCase();

        kebabData.forEach((spot, index) => {
            if (query && !spot.name.toLowerCase().includes(lowerQuery) && !spot.city.toLowerCase().includes(lowerQuery)) {
                return;
            }

            const color = palette[index % palette.length];

            const label = document.createElement('label');
            label.className = 'toggle-label';
            if (selectedSpots.has(spot.id)) label.classList.add('selected');

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = spot.id;
            checkbox.checked = selectedSpots.has(spot.id);

            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    selectedSpots.add(spot.id);
                    label.classList.add('selected');
                } else {
                    selectedSpots.delete(spot.id);
                    label.classList.remove('selected');
                }
                updateChart();
            });

            const indicator = document.createElement('span');
            indicator.className = 'spot-color-indicator';
            indicator.style.backgroundColor = color;

            const nameSpan = document.createElement('span');
            nameSpan.className = 'toggle-name';
            nameSpan.innerHTML = `<strong>${spot.name}</strong> <small>${spot.city}</small>`;

            label.appendChild(checkbox);
            label.appendChild(indicator);
            label.appendChild(nameSpan);

            togglesContainer.appendChild(label);
        });
    }

    const searchInput = document.getElementById('spot-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            renderToggles(e.target.value);
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

    const cities = [...new Set(kebabData.map(spot => spot.city))].sort();
    const dishes = [...new Set(kebabData.map(spot => spot.dish))].sort();
    let activeCities = new Set(cities);
    let activeDishes = new Set(dishes);

    function populateFilters() {
        const cityGroup = document.getElementById('filter-city-group');
        const dishGroup = document.getElementById('filter-dish-group');
        if (!cityGroup || !dishGroup) return;

        cityGroup.innerHTML = '';
        dishGroup.innerHTML = '';

        cities.forEach(city => {
            const btn = document.createElement('button');
            btn.className = `filter-bubble filter-city ${activeCities.has(city) ? 'active' : ''}`;
            btn.innerHTML = `${city} <span class="filter-x">×</span>`;
            btn.addEventListener('click', () => {
                if (activeCities.has(city)) {
                    activeCities.delete(city);
                    btn.classList.remove('active');
                } else {
                    activeCities.add(city);
                    btn.classList.add('active');
                }
                visibleCount = SPOTS_PER_PAGE;
                renderGrid();
            });
            cityGroup.appendChild(btn);
        });

        dishes.forEach(dish => {
            const btn = document.createElement('button');
            btn.className = `filter-bubble filter-dish ${activeDishes.has(dish) ? 'active' : ''}`;
            btn.innerHTML = `${dish} <span class="filter-x">×</span>`;
            btn.addEventListener('click', () => {
                if (activeDishes.has(dish)) {
                    activeDishes.delete(dish);
                    btn.classList.remove('active');
                } else {
                    activeDishes.add(dish);
                    btn.classList.add('active');
                }
                visibleCount = SPOTS_PER_PAGE;
                renderGrid();
            });
            dishGroup.appendChild(btn);
        });
    }

    const SPOTS_PER_PAGE = 6;
    let visibleCount = SPOTS_PER_PAGE;

    function renderGrid() {
        gridContainer.innerHTML = '';

        const filteredData = kebabData.filter(spot => {
            const cityMatch = activeCities.size === 0 || activeCities.has(spot.city);
            const dishMatch = activeDishes.size === 0 || activeDishes.has(spot.dish);
            return cityMatch && dishMatch;
        }).sort((a, b) => {
            const parseScore = s => parseFloat(String(s).replace(',', '.').replace('%', '')) || 0;
            return parseScore(b.score) - parseScore(a.score);
        });

        const toShow = filteredData.slice(0, visibleCount);

        toShow.forEach((spot, index) => {
            const card = document.createElement('div');
            card.className = 'spot-card';
            card.id = `spot-${spot.id}`;
            // Staggered entry animation (slowed down)
            card.style.animationDelay = `${index * 0.08}s`;

            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.city)}`;
            const displayRank = index + 1;
            const reviewLikeCount = reviewLikesBySpot.get(spot.id) || 0;
            const reviewLiked = reviewLikedByClient.has(spot.id);
            const setupMissing = !supabaseClient;

            card.innerHTML = `
                <div class="spot-card-header">
                    <div class="spot-rank">${displayRank}</div>
                    <div class="spot-header-text">
                        <div class="spot-title-row">
                            <h3>${spot.name}</h3>
                            ${renderStars(spot.score)}
                        </div>
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
                        <div class="spot-image-container">
                            <img src="${spot.image || 'kebab_spot_demo.png'}" alt="Bild von ${spot.name}" class="spot-image" loading="lazy" />
                        </div>
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
                                ${spot.verzehrort ? `<span class="badge badge-tooltip">${spot.verzehrort}<span class="tooltip-text">Verzehrort: Döner wurde vor Ort gegessen (Dine-in) oder mitgenommen/geliefert (Take-away).</span></span>` : ''}
                                <span class="badge badge-tooltip">
                                    P/L: ${spot.plIndex}
                                    <span class="tooltip-text">Price-Leistungs-Index: Gesamtbewertung geteilt durch den Preis. Je höher der Wert, desto besser die Preis-Leistung.</span>
                                </span>
                                <span class="badge badge-tooltip">Besuche: ${spot.besuche || 1}<span class="tooltip-text">Die finale Bewertung basiert auf dem Durchschnitt der Bewertungen über alle Besuche.</span></span>
                                ${spot.date ? `<span class="badge">Letzter Besuch: ${spot.date}</span>` : ''}
                            </div>

                            ${spot.kommentar ? `<div class="spot-comment">"${spot.kommentar}"</div>` : ''}
                            <div class="review-feedback-row">
                                <button
                                    type="button"
                                    class="review-helpful-btn ${reviewLiked ? 'is-liked' : ''}"
                                    data-spot-id="${spot.id}"
                                    data-liked="${reviewLiked ? 'true' : 'false'}"
                                    ${setupMissing ? 'disabled' : ''}
                                    aria-label="Review als hilfreich markieren"
                                >
                                    <span class="review-helpful-icon" aria-hidden="true">&#9829;</span>
                                    <span class="review-helpful-label">Hilfreich</span>
                                    <span class="review-helpful-count">${reviewLikeCount}</span>
                                </button>
                            </div>
                            <div class="review-comments-host" data-spot-id="${spot.id}">
                                ${renderReviewCommentsSection(spot.id)}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            const header = card.querySelector('.spot-card-header');
            header.addEventListener('click', (e) => {
                if (!e.target.closest('.maps-button')) {
                    const isOpening = !card.classList.contains('expanded');
                    card.classList.toggle('expanded');

                    if (isOpening) {
                        setTimeout(() => {
                            scrollToElementFlush(card);
                        }, 50);
                    }
                }
            });

            attachCommentSectionHandlers(card);

            gridContainer.appendChild(card);
        });

        // Load More button
        if (visibleCount < filteredData.length) {
            const remaining = filteredData.length - visibleCount;
            const loadMoreBtn = document.createElement('button');
            loadMoreBtn.className = 'load-more-btn';
            loadMoreBtn.textContent = `${remaining} weitere anzeigen`;
            loadMoreBtn.addEventListener('click', () => {
                visibleCount += SPOTS_PER_PAGE;
                renderGrid();
            });
            gridContainer.appendChild(loadMoreBtn);
        }
    }

    function jumpToReview(spotId) {
        // 1. Reset filters to all active
        activeCities = new Set(cities);
        activeDishes = new Set(dishes);
        visibleCount = kebabData.length; // show all so target card is in DOM
        populateFilters();
        renderGrid();

        // 2. Find the card
        const card = document.getElementById(`spot-${spotId}`);
        if (card) {
            // 3. Smooth scroll to it - using dynamic flush scroll
            scrollToElementFlush(card);

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
                                    <h3 class="latest-title" data-id="${spot.id}">${spot.name}</h3>
                                    ${renderStars(spot.score)}
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
                                </div>
                                <button class="spotlight-jump-btn" data-id="${spot.id}">
                                    <span>Full Review</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');

            // Attach event listeners after rendering
            container.querySelectorAll('.spotlight-jump-btn, .latest-title').forEach(el => {
                el.addEventListener('click', () => {
                    const id = el.dataset.id;
                    jumpToReview(id);
                });
            });
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
    initAnalytics();
    loadReviewComments();

    // ── Analytics Section ────────────────────────────────────────────
    function initAnalytics() {
        const container = document.getElementById('pl-chart-container');
        if (!container) return;

        const parseVal = (s) => parseFloat(String(s).replace(',', '.').replace('%', '').replace(' €', '')) || 0;

        // Sort by P/L-Index descending, take top 5
        const top5 = [...kebabData]
            .sort((a, b) => parseVal(b.plIndex) - parseVal(a.plIndex))
            .slice(0, 5);

        const maxPL = parseVal(top5[0].plIndex);

        container.innerHTML = top5.map((spot, i) => {
            const pl = parseVal(spot.plIndex);
            const sc = parseVal(spot.score);
            const pct = (pl / maxPL) * 100;
            const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(spot.name + ' ' + spot.city)}`;

            return `
            <div class="pl-row" style="--pl-delay: ${i * 0.1}s">
                <div class="pl-rank">${i + 1}</div>
                <div class="pl-info">
                    <div class="pl-name-row">
                        <span class="pl-name" data-id="${spot.id}">${spot.name}</span>
                        <span class="pl-city">${spot.city}</span>
                    </div>
                    <div class="pl-bar-wrap">
                        <div class="pl-bar-track">
                            <div class="pl-bar-fill" style="--pl-width: ${pct}%"></div>
                        </div>
                        <span class="pl-value">${spot.plIndex}</span>
                    </div>
                </div>
                <div class="pl-meta">
                    <div class="pl-meta-score">
                        <span class="pl-meta-label">SCORE</span>
                        <span class="pl-meta-val">${spot.score}</span>
                    </div>
                    <div class="pl-meta-price">
                        <span class="pl-meta-label">PREIS</span>
                        <span class="pl-meta-val">${spot.preis}</span>
                    </div>
                    <a href="${mapsLink}" target="_blank" class="pl-maps-btn" title="Google Maps">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                </div>
            </div>`;
        }).join('');

        // Animate bars when section enters viewport
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                container.classList.add('pl-animate');
                observer.unobserve(container);
            }
        }, { threshold: 0.2 });
        observer.observe(container);

        // Click on name → jump to review
        container.querySelectorAll('.pl-name[data-id]').forEach(el => {
            el.addEventListener('click', () => jumpToReview(el.dataset.id));
        });

        // ── Kategorie-Awards ─────────────────────────────────────────
        const awardsContainer = document.getElementById('category-awards-container');
        if (awardsContainer) {
            const cats = [
                { key: 'fleisch', label: 'Fleisch' },
                { key: 'gemuese', label: 'Gemüse' },
                { key: 'sosse', label: 'Soße' },
                { key: 'brot', label: 'Brot' },
                { key: 'balance', label: 'Balance' },
                { key: 'auswahl', label: 'Auswahl' },
                { key: 'portion', label: 'Portion' },
                { key: 'hygiene', label: 'Hygiene' },
                { key: 'service', label: 'Service' },
            ];

            awardsContainer.innerHTML = cats.map(({ key, label }) => {
                const winner = kebabData.reduce((best, s) =>
                    s[key] > best[key] ? s : best, kebabData[0]);
                const val = winner[key];
                // shorten long names
                const shortName = winner.name.length > 18
                    ? winner.name.slice(0, 17).trimEnd() + '…'
                    : winner.name;
                return `
                <div class="award-tile" data-id="${winner.id}">
                    <span class="award-cat">${label}</span>
                    <span class="award-name">${shortName}</span>
                    <span class="award-val">${val.toFixed(1)}</span>
                </div>`;
            }).join('');

            awardsContainer.querySelectorAll('.award-tile[data-id]').forEach(el => {
                el.addEventListener('click', () => jumpToReview(el.dataset.id));
            });
        }

        // ── Kriterien-Heatmap ────────────────────────────────────────
        const heatmapContainer = document.getElementById('heatmap-container');
        if (heatmapContainer) {
            const cats = [
                { key: 'fleisch', label: 'Fleisch' },
                { key: 'gemuese', label: 'Gemüse' },
                { key: 'sosse', label: 'Soße' },
                { key: 'brot', label: 'Brot' },
            ];

            // Sort spots by overall score descending, limit to top 5
            // Hand-picked for maximum visual contrast:
            // Yaprak=Fleisch-Spezialist, Hugoo Gemüse=Gemüse-Spezialist,
            // Med Dürüm=Brot-Champion, Planet Bistro=ausgewogen stark,
            // Mudi's=Mittelfeld, Kebab & Smash=schwache Soße → volle Farbskala
            const heatmapIds = [2, 3, 4, 5, 13, 14];
            const spots = kebabData
                .filter(s => heatmapIds.includes(s.id))
                .sort((a, b) => parseVal(b.score) - parseVal(a.score));

            // Color: 5=red (hue 0), 7.5=yellow-orange (hue 45), 10=green (hue 120)
            const cellColor = (v) => {
                const t = Math.max(0, Math.min(1, (v - 5) / 5)); // 5→0, 10→1
                const hue = Math.round(t * 120);
                const sat = 80;
                const lig = 42;
                return `hsl(${hue},${sat}%,${lig}%)`;
            };
            const textColor = () => '#fff';

            // Header row (category labels)
            const headerCells = cats.map(c =>
                `<div class="hm-col-label">${c.label}</div>`
            ).join('');

            // Data rows
            const dataRows = spots.map(spot => {
                const shortName = spot.name.length > 16
                    ? spot.name.slice(0, 15).trimEnd() + '…'
                    : spot.name;
                const cells = cats.map(c => {
                    const v = spot[c.key];
                    const bg = cellColor(v);
                    const fg = textColor(v);
                    return `<div class="hm-cell" style="background:${bg};color:${fg}" title="${c.label}: ${v}">${v.toFixed(1)}</div>`;
                }).join('');
                return `
                <div class="hm-row" data-id="${spot.id}">
                    <div class="hm-row-label" title="${spot.name}">${shortName}</div>
                    ${cells}
                </div>`;
            }).join('');

            heatmapContainer.innerHTML = `
                <div class="hm-header">
                    <div class="hm-row-label"></div>
                    ${headerCells}
                </div>
                <div class="hm-body hm-animate-target">
                    ${dataRows}
                </div>
                <div class="hm-legend">
                    <span class="hm-legend-label">5.0</span>
                    <div class="hm-legend-bar"></div>
                    <span class="hm-legend-label">7.5</span>
                    <div class="hm-legend-bar hm-legend-bar--upper"></div>
                    <span class="hm-legend-label">10.0</span>
                </div>`;

            heatmapContainer.querySelectorAll('.hm-row[data-id]').forEach(el => {
                el.addEventListener('click', () => jumpToReview(el.dataset.id));
            });

            const hmObserver = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting) {
                    heatmapContainer.querySelector('.hm-animate-target')
                        ?.classList.add('hm-animate');
                    hmObserver.unobserve(heatmapContainer);
                }
            }, { threshold: 0.15 });
            hmObserver.observe(heatmapContainer);
        }
    }

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
    const commentFeedbackModal = document.getElementById('comment-feedback-modal');
    const commentFeedbackConfirm = commentFeedbackModal
        ? commentFeedbackModal.querySelector('.comment-feedback-confirm')
        : null;

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

        lightbox.addEventListener('click', closeLightbox);

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
    const openImpressum = document.getElementById('open-impressum');

    const syncModalOpenState = () => {
        const hasActiveModal =
            (legalModal && legalModal.classList.contains('active')) ||
            (commentFeedbackModal && commentFeedbackModal.classList.contains('active'));

        document.body.classList.toggle('modal-open', Boolean(hasActiveModal));
    };

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
        `,
        impressum: `
            <h2>Impressum</h2>
            <div class="legal-section">
                <h3>Angaben gemäß § 5 TMG</h3>
                <p>Pham Certified Kebab Tester<br>
                Privatprojekt zur Unterhaltung</p>
            </div>
            <div class="legal-section">
                <h3>Kontakt</h3>
                <p>E-Mail: <a href="mailto:certifiedkebabtester-feedback@yahoo.com">certifiedkebabtester-feedback@yahoo.com</a></p>
            </div>
            <div class="legal-section">
                <h3>Verantwortlich für den Inhalt</h3>
                <p>Pham (Anschrift auf Anfrage per E-Mail)</p>
            </div>
        `
    };

    const openModal = (type) => {
        if (!legalModal || !modalContent) return;
        modalContent.innerHTML = legalTexts[type];
        legalModal.classList.add('active');
        syncModalOpenState();
    };

    const closeModal = () => {
        if (!legalModal) return;
        legalModal.classList.remove('active');
        syncModalOpenState();
    };

    const openCommentFeedbackModal = () => {
        if (!commentFeedbackModal) return;
        commentFeedbackModal.classList.add('active');
        syncModalOpenState();
    };

    const closeCommentFeedbackModal = () => {
        if (!commentFeedbackModal) return;
        commentFeedbackModal.classList.remove('active');
        syncModalOpenState();
    };

    if (openDisclaimer) openDisclaimer.addEventListener('click', (e) => { e.preventDefault(); openModal('disclaimer'); });
    if (openPrivacy) openPrivacy.addEventListener('click', (e) => { e.preventDefault(); openModal('privacy'); });
    if (openImpressum) openImpressum.addEventListener('click', (e) => { e.preventDefault(); openModal('impressum'); });

    if (legalModal) {
        legalModal.addEventListener('click', closeModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && legalModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    if (commentFeedbackModal) {
        commentFeedbackModal.querySelector('.modal-overlay')?.addEventListener('click', closeCommentFeedbackModal);
        commentFeedbackModal.querySelector('.modal-close')?.addEventListener('click', closeCommentFeedbackModal);
        commentFeedbackConfirm?.addEventListener('click', closeCommentFeedbackModal);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && commentFeedbackModal.classList.contains('active')) {
                closeCommentFeedbackModal();
            }
        });
    }
    // Optimized Scroll Listener
    let scrollTimeout;
    const scrollGap = 24;
    const navLinks = document.querySelectorAll('.header-link');
    const sections = Array.from(navLinks).map(link => {
        const id = link.getAttribute('href').substring(1);
        return document.getElementById(id);
    }).filter(el => el !== null);

    // Cache section offsets to avoid layout reads on every scroll frame
    let sectionOffsets = sections.map(s => s ? s.offsetTop : 0);

    // Update CSS variable and offset cache — only on resize/init, not every scroll
    function updateHeaderHeight() {
        if (header) {
            document.documentElement.style.setProperty('--header-h', (header.offsetHeight + scrollGap) + 'px');
        }
        sectionOffsets = sections.map(s => s ? s.offsetTop : 0);
    }
    updateHeaderHeight();

    const handleScroll = () => {
        if (!header || !heroSection) return;

        if (!scrollTimeout) {
            scrollTimeout = requestAnimationFrame(() => {
                const currentScrollY = window.scrollY;
                const headerH = header.offsetHeight;

                // 1. Base scrolled state
                if (currentScrollY > 50) {
                    header.classList.add('scrolled');
                } else {
                    header.classList.remove('scrolled');
                }

                // 2. Active link tracking
                let currentSectionId = "";
                // Use a trigger point that matches the new landing position (Header + Gap)
                const scrollPos = currentScrollY + headerH + scrollGap + 10;

                // Check if we are at the bottom of the page (for Contact)
                const isBottom = (window.innerHeight + currentScrollY) >= document.documentElement.scrollHeight - 50;

                if (isBottom) {
                    currentSectionId = "contact";
                } else {
                    sections.forEach((section, i) => {
                        // Find the last section we've passed (using cached offsets)
                        if (scrollPos >= sectionOffsets[i]) {
                            currentSectionId = section.getAttribute('id');
                        }
                    });
                }

                navLinks.forEach(link => {
                    link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
                });

                scrollTimeout = null;
            });
        }
    };

    let resizeTimer;
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            updateHeaderHeight();
            handleScroll();
        }, 150);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    handleScroll();

    // ── Weighting Diagram Animation Trigger ──────────────────────────
    const weightingVisual = document.querySelector('.weightings-visual');
    if (weightingVisual) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    weightingVisual.classList.add('animate');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });
        observer.observe(weightingVisual);
    }

    // Clean URL navigation — scroll without adding hash to URL for ALL internal links
    // Using event delegation to support dynamically injected links (Spotlight, Reviews, etc.)
    document.body.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (href === '#') return;

        e.preventDefault();
        const targetId = href.substring(1);
        const target = document.getElementById(targetId);

        if (target) {
            // Immediately sync active state so old link doesn't linger
            if (link.classList.contains('header-link')) {
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                link.blur(); // release browser focus/hover state
            }
            scrollToElementFlush(target);
            history.replaceState(null, '', window.location.pathname);
        }
    });

    // Add Logo Click Scroll to Top
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ── Back to Top Button ──────────────────────────────────────────
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── Price-Performance Chart ───────────────────────────────────────
    (function initPricePerformanceChart() {
        const canvas = document.getElementById('price-performance-chart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let width, height;
        const padding = { top: 40, right: 60, bottom: 40, left: 60 };

        // Process data
        const data = kebabData.map(d => ({
            name: d.name,
            price: parseFloat(d.preis.replace(',', '.').replace(' €', '')) || 0,
            score: parseFloat(d.score.replace(',', '.').replace('%', '')) || 0,
            rank: d.rank
        }));

        // Dynamic Ranges (ZOOMED IN)
        const prices = data.map(d => d.price);
        const scores = data.map(d => d.score);
        const minPrice = Math.min(...prices) - 0.2, maxPrice = Math.max(...prices) + 0.2;
        const minScore = Math.max(0, Math.min(...scores) - 2), maxScore = Math.min(100, Math.max(...scores) + 2);

        // Assign Unique Colors for Top 5
        const topSpots = data.filter(d => d.rank <= 5).sort((a, b) => a.rank - b.rank);
        const topColors = ['#e63946', '#40916c', '#457b9d', '#fca311', '#9b5de5'];
        const spotColorMap = {};
        topSpots.forEach((s, i) => spotColorMap[s.name] = topColors[i]);

        // Inject Legend
        const legendContainer = document.getElementById('chart-legend');
        if (legendContainer) {
            legendContainer.innerHTML = topSpots.map(s => `
                <div class="legend-item">
                    <span class="dot" style="background: ${spotColorMap[s.name]}"></span>
                    ${s.name}
                </div>
            `).join('');
        }

        function resize() {
            const container = canvas.parentElement;
            if (!container) return;
            const dpr = window.devicePixelRatio || 1;
            width = canvas.width = container.clientWidth * dpr;
            height = canvas.height = container.clientHeight * dpr;
            ctx.scale(dpr, dpr);
            width /= dpr;
            height /= dpr;
            draw();
        }

        new ResizeObserver(resize).observe(canvas.parentElement);

        function mapX(p) { return padding.left + ((p - minPrice) / (maxPrice - minPrice)) * (width - padding.left - padding.right); }
        function mapY(s) { return height - padding.bottom - ((s - minScore) / (maxScore - minScore)) * (height - padding.top - padding.bottom); }

        function draw() {
            if (width < 50 || height < 50) return;
            ctx.clearRect(0, 0, width, height);

            // Value Zone
            ctx.fillStyle = 'rgba(64, 145, 108, 0.08)';
            ctx.fillRect(mapX(minPrice), mapY(maxScore), mapX(minPrice + (maxPrice - minPrice) * 0.33) - mapX(minPrice), mapY(maxScore - (maxScore - minScore) * 0.25) - mapY(maxScore));

            // Grid & Ticks
            ctx.strokeStyle = 'rgba(0,0,0,0.03)';
            ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
            ctx.fillStyle = 'rgba(0,0,0,0.3)'; ctx.font = '800 8px Inter';

            const scoreStep = (maxScore - minScore) / 4;
            for (let i = 0; i <= 4; i++) {
                const s = minScore + i * scoreStep;
                const y = mapY(s);
                ctx.beginPath(); ctx.moveTo(padding.left, y); ctx.lineTo(width - padding.right, y); ctx.stroke();
                ctx.textAlign = 'right'; ctx.fillText(Math.round(s) + '%', padding.left - 10, y + 3);
            }

            const priceStep = (maxPrice - minPrice) / 4;
            for (let i = 0; i <= 4; i++) {
                const p = minPrice + i * priceStep;
                const x = mapX(p);
                ctx.beginPath(); ctx.moveTo(x, padding.top); ctx.lineTo(x, height - padding.bottom); ctx.stroke();
                ctx.textAlign = 'center'; ctx.fillText(p.toFixed(1) + '€', x, height - padding.bottom + 15);
            }
            ctx.setLineDash([]);

            // Axes
            ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.moveTo(padding.left, padding.top); ctx.lineTo(padding.left, height - padding.bottom); ctx.lineTo(width - padding.right, height - padding.bottom); ctx.stroke();

            // Spreading
            const pts = data.map(d => ({ ...d, x: mapX(d.price), y: mapY(d.score) }));
            for (let i = 0; i < 8; i++) {
                pts.forEach(p1 => {
                    pts.forEach(p2 => {
                        if (p1 === p2) return;
                        const dx = p1.x - p2.x, dy = p1.y - p2.y, dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < 40) {
                            const angle = Math.atan2(dy, dx), force = (40 - dist) * 0.3;
                            p1.x += Math.cos(angle) * force; p1.y += Math.sin(angle) * force;
                            p2.x -= Math.cos(angle) * force; p2.y -= Math.sin(angle) * force;
                        }
                    });
                    p1.x = Math.max(padding.left + 10, Math.min(width - padding.right - 10, p1.x));
                    p1.y = Math.max(padding.top + 10, Math.min(height - padding.bottom - 10, p1.y));
                });
            }

            // Labels
            ctx.font = '900 10px Inter'; ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.letterSpacing = '2px'; ctx.textAlign = 'center';
            ctx.fillText('PREIS', padding.left + (width - padding.left - padding.right) / 2, height - padding.bottom + 35);
            ctx.save(); ctx.translate(padding.left - 45, padding.top + (height - padding.top - padding.bottom) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText('SCORE', 0, 0); ctx.restore();

            // Points
            pts.forEach(p => {
                const color = spotColorMap[p.name] || 'rgba(0,0,0,0.1)';
                const isTop = p.rank <= 5;
                if (isTop) {
                    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 12);
                    g.addColorStop(0, color + '33'); g.addColorStop(1, color + '00');
                    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, 12, 0, Math.PI * 2); ctx.fill();
                }
                ctx.fillStyle = color; ctx.beginPath(); ctx.arc(p.x, p.y, isTop ? 5 : 2, 0, Math.PI * 2); ctx.fill();
            });
        }
        resize();
    })();

    // ── Next up Ticker ───────────────────────────────────────────
    (function initNextUp() {
        const ticker = document.getElementById('next-up-ticker');
        if (!ticker || typeof upcomingSpots === 'undefined') return;

        const renderItems = (items) => {
            return items.map(spot => `
                <div class="next-up-item" data-spot="${spot.name}" style="cursor: pointer;" title="Auf Karte zeigen">
                    <div class="next-up-info">
                        <div class="next-up-main">
                            <span class="next-up-name">${spot.name}</span>
                            <span class="next-up-city">${spot.city}</span>
                        </div>
                        ${spot.description ? `<span class="next-up-desc">${spot.description}</span>` : ''}
                    </div>
                </div>
                <span class="next-up-separator">/</span>
            `).join('');
        };

        // Populate ticker twice to allow seamless infinite scroll
        const tickerContent = renderItems(upcomingSpots);
        ticker.innerHTML = tickerContent + tickerContent;
    })();

    // ── Next Up Map ───────────────────────────────────────────────
    (function initNextUpMap() {
        const mapContainer = document.getElementById('next-up-map');
        if (!mapContainer || typeof L === 'undefined') return;

        // Approximate coordinates for the next up spots
        const coords = {
            "Hans Kebab": [48.163, 11.579], // Munich
            "Berlin'er Gemüse Döner": [51.0655, 13.7483], // Dresden
            "Jami's Gemüse Kebab": [51.054, 13.771], // Dresden
            "Der Dicke Schmidt Neustadt": [51.0664, 13.7538], // Dresden
            "Golt'z kebap": [52.490, 13.355] // Berlin
        };

        const map = L.map('next-up-map', {
            scrollWheelZoom: true,
            dragging: !L.Browser.mobile,
            tap: !L.Browser.mobile
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);

        const markers = [];
        const markerMap = {}; // Map spot names to Leaflet markers

        upcomingSpots.forEach(spot => {
            const pos = coords[spot.name];
            if (!pos) return;

            const icon = L.divIcon({
                className: 'map-marker',
                html: `<div class="marker-inner planned"></div>`,
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });

            const popupContent = `
                <div class="map-popup">
                    <span class="map-popup-title">${spot.name}</span>
                    <span class="map-popup-meta">${spot.city} · Geplant</span>
                </div>
            `;

            const marker = L.marker(pos, { icon }).bindPopup(popupContent, {
                className: 'map-popup',
                offset: [0, -5]
            });

            markers.push(marker);
            markerMap[spot.name] = marker;
            marker.addTo(map);
        });

        if (markers.length > 0) {
            const group = new L.featureGroup(markers);
            const bounds = group.getBounds();

            // Fit bounds with some padding so markers aren't on the edge
            map.fitBounds(bounds, { padding: [30, 30] });

            // Add Reset View Button
            const ResetControl = L.Control.extend({
                options: { position: 'topleft' },
                onAdd: function () {
                    const btn = L.DomUtil.create('button', 'leaflet-bar map-reset-btn');
                    btn.innerHTML = '&#8634;'; // Reset icon
                    btn.title = 'Ansicht zurücksetzen';
                    btn.onclick = function () {
                        map.fitBounds(bounds, { padding: [30, 30] });
                    };
                    return btn;
                }
            });
            map.addControl(new ResetControl());

            // Listen for clicks on ticker items to jump to marker
            document.addEventListener('click', function (e) {
                const item = e.target.closest('.next-up-item');
                if (!item) return;

                const spotName = item.getAttribute('data-spot');
                const targetMarker = markerMap[spotName];

                if (targetMarker) {
                    // Smoothly fly to the location and open popup
                    map.flyTo(targetMarker.getLatLng(), 15, {
                        duration: 1.5
                    });

                    // Open popup after flying finishes
                    map.once('moveend', function () {
                        targetMarker.openPopup();
                    });
                }
            });
        } else {
            map.setView([51.165, 10.451], 6); // Default Germany view
        }
    })();
});
