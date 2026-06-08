import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const HTML_PATH = path.resolve(process.cwd(), '../index.html');
const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Spotlight Döner News subsection', () => {
    it('renders dedicated Döner News section in spotlight markup', () => {
        const html = fs.readFileSync(HTML_PATH, 'utf-8');

        expect(html).toContain('id="doner-news-heading"');
        expect(html).toContain('id="doner-news-status"');
        expect(html).toContain('id="doner-news-list"');
        expect(html).toContain('id="doner-news-expand-btn"');
        expect(html).toContain('Döner News');
    });

    it('fetches Google News RSS for Döner News with 7-day recency intent', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain("const DONER_NEWS_QUERY = 'Döner News';");
        expect(source).toContain('const DONER_NEWS_INITIAL_ITEMS = 3;');
        expect(source).toContain('const DONER_NEWS_EXPAND_COUNT = 4;');
        expect(source).toContain('const DONER_NEWS_MAX_ITEMS = DONER_NEWS_INITIAL_ITEMS + DONER_NEWS_EXPAND_COUNT;');
        expect(source).toContain('when:7d');
        expect(source).toContain('https://news.google.com/rss/search?q=');
        expect(source).toContain('DONER_NEWS_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000');
    });

    it('prefers supabase edge function before browser-side direct feed fallback', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain("client.functions.invoke('doner-news'");
        expect(source).toContain('fallback to direct fetch candidates');
    });

    it('keeps fallback behavior when feed is unavailable', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('https://api.allorigins.win/raw?url=');
        expect(source).toContain('News-Feed derzeit nicht erreichbar.');
        expect(source).toContain('fallbackSearchUrl');
    });
});
