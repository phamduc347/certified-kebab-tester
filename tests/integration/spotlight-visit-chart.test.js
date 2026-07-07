import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const HTML_PATH = path.resolve(process.cwd(), '../index.html');
const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

/**
 * Integration checks for the Spotlight visit chart container and renderer wiring.
 */
describe('Spotlight visit chart integration', () => {
    it('renders dedicated chart container markup above spotlight cards', () => {
        const html = fs.readFileSync(HTML_PATH, 'utf-8');

        expect(html).toContain('id="spotlight-visit-chart"');
        expect(html).toContain('id="spotlight-visit-chart-stage"');
        expect(html).toContain('id="spotlight-visit-chart-summary"');
    });

    it('contains chart rendering function and lifecycle hooks', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('function renderSpotlightVisitChart()');
        expect(source).toContain('renderSpotlightVisitChart();');
        expect(source).toContain('spotlight-visit-chart-stage');
    });
});
