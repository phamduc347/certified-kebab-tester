import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const STYLE_PATH = path.resolve(process.cwd(), '../assets/css/style.css');

describe('Community review trend chart', () => {
    it('contains trend chart rendering logic in script.js', () => {
        const scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(scriptSource).toContain('function renderSpotTrendChart(reviews, spotId)');
        expect(scriptSource).toContain('class="review-community-trend-section"');
        expect(scriptSource).toContain('class="review-community-trend-chart-container"');
        expect(scriptSource).toContain('<svg viewBox="0 0 ');
        expect(scriptSource).toContain('trend-dot-group');
        expect(scriptSource).toContain('trend-tooltip');
    });

    it('contains trend chart styles in style.css', () => {
        const styleSource = fs.readFileSync(STYLE_PATH, 'utf-8');

        expect(styleSource).toContain('.review-community-trend-section');
        expect(styleSource).toContain('.review-community-trend-chart-container');
        expect(styleSource).toContain('.trend-dot');
        expect(styleSource).toContain('.trend-tooltip');
    });
});
