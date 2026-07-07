import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const HTML_PATH = path.resolve(process.cwd(), '../index.html');
const STYLE_PATH = path.resolve(process.cwd(), '../assets/css/style.css');

describe('All Reviews view toggle', () => {
    it('renders switch buttons in the All Reviews toolbar', () => {
        const html = fs.readFileSync(HTML_PATH, 'utf-8');

        expect(html).toContain('id="btn-list"');
        expect(html).toContain('id="btn-grid"');
        expect(html).toContain('Ansicht wählen');
    });

    it('contains tile view state handling in script', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('REVIEWS_VIEW_MODE_STORAGE_KEY');
        expect(source).toContain("localStorage.getItem(REVIEWS_VIEW_MODE_STORAGE_KEY)");
        expect(source).toContain('function createReviewTileElement(spot, index, options = {})');
        expect(source).toContain("gridContainer.classList.toggle('spots-container--tiles'");
        expect(source).toContain('spot-tile-open-btn');
        expect(source).toContain('jumpToReview(spotId)');
    });

    it('defines responsive tile layout styles', () => {
        const css = fs.readFileSync(STYLE_PATH, 'utf-8');

        expect(css).toContain('.spots-container.spots-container--tiles');
        expect(css).toContain('.spot-tile-card');
        expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr));');
        expect(css).toContain('@media (max-width: 680px)');
    });
});
