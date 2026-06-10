import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const HTML_PATH = path.resolve(process.cwd(), '../index.html');
const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const STYLE_PATH = path.resolve(process.cwd(), '../assets/css/style.css');

describe('Spotlight Döner News subsection', () => {
    it('renders dedicated Döner News section in spotlight markup', () => {
        const html = fs.readFileSync(HTML_PATH, 'utf-8');
        const skeletonCount = (html.match(/class="doner-news-skeleton"/g) || []).length;

        expect(html).toContain('id="doner-news-heading"');
        expect(html).toContain('id="doner-news-status"');
        expect(html).toContain('id="doner-news-list"');
        expect(html).toContain('id="doner-news-refresh-btn"');
        expect(html).toContain('>Aktualisieren</button>');
        expect(html).toContain('id="doner-news-expand-btn"');
        expect(html).toContain('class="load-more-btn doner-news-expand-btn"');
        expect(html).toContain('>Weitere anzeigen</button>');
        expect(html).toContain('Döner News');
        expect(skeletonCount).toBe(4);
    });

    it('keeps only three loading placeholders visible on mobile', () => {
        const css = fs.readFileSync(STYLE_PATH, 'utf-8');

        expect(css).toContain('@media (max-width: 768px)');
        expect(css).toContain('.doner-news-list[aria-busy="true"] .doner-news-skeleton:nth-child(n+4)');
        expect(css).toContain('display: none;');
    });

    it('fetches Google News RSS for Döner News with 7-day recency intent', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain("const DONER_NEWS_QUERY = 'Döner News';");
        expect(source).toContain('const DONER_NEWS_DESKTOP_INITIAL_ITEMS = 4;');
        expect(source).toContain('const DONER_NEWS_MOBILE_INITIAL_ITEMS = 3;');
        expect(source).toContain('const DONER_NEWS_EXPAND_COUNT = 4;');
        expect(source).toContain('const DONER_NEWS_MAX_ITEMS = DONER_NEWS_DESKTOP_INITIAL_ITEMS + DONER_NEWS_EXPAND_COUNT;');
        expect(source).toContain("window.matchMedia('(max-width: 768px)').matches");
        expect(source).toContain("const nextLabel = isExpanded ? 'Weniger anzeigen' : 'Weitere anzeigen';");
        expect(source).toContain('when:7d');
        expect(source).toContain('https://news.google.com/rss/search?q=');
        expect(source).toContain('DONER_NEWS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000');
        expect(source).toContain("const DONER_NEWS_CACHE_KEY = 'doner-news-cache-v1';");
        expect(source).toContain('const DONER_NEWS_CACHE_TTL_MS = 30 * 60 * 1000;');
        expect(source).toContain('localStorage.getItem(DONER_NEWS_CACHE_KEY)');
        expect(source).toContain('localStorage.setItem(DONER_NEWS_CACHE_KEY');
        expect(source).toContain('loadNews({ forceRefresh: true });');
        expect(source).toContain('const cachedPayload = readCachedNewsItems({ allowStale: true });');
        expect(source).toContain("statusEl.textContent = 'Aktualisiere Artikel...';");
        expect(source).toContain("renderNewsItems(supabaseItems, forceRefresh ? 'Artikel wurden aktualisiert.' : 'Top-Themen rund um Döner aus der letzten Woche.');");
    });

    it('prefers supabase edge function before browser-side direct feed fallback', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain("invokeWithTimeout(client, 'doner-news'");
        expect(source).toContain('fetchViaSupabaseFunction');
        expect(source).toContain('fetchViaDirectCandidates');
    });

    it('keeps fallback behavior when feed is unavailable', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('https://api.allorigins.win/raw?url=');
        expect(source).toContain('News-Feed derzeit nicht erreichbar.');
        expect(source).toContain('fallbackSearchUrl');
    });

    it('filters Google placeholder images so article thumbnails are preferred', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('isLikelyPlaceholderNewsImage');
        expect(source).toContain('isGoogleHost');
        expect(source).toContain('!isLikelyPlaceholderNewsImage(article.imageUrl)');
        expect(source).toContain('articleDomain && !isGoogleHost(articleDomain)');
    });

    it('animates collapse when hiding extra doner news items', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        const css = fs.readFileSync(STYLE_PATH, 'utf-8');

        expect(source).toContain('DONER_NEWS_COLLAPSE_ANIMATION_MS');
        expect(source).toContain("item.classList.add('doner-news-item-collapsing')");
        expect(css).toContain('.doner-news-item-collapsing');
        expect(css).toContain('@keyframes doner-news-fade-out');
    });
});
