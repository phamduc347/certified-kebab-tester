import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const STYLE_PATH = path.resolve(process.cwd(), '../assets/css/style.css');

describe('Spotreview category chart', () => {
    it('renders the new lollipop chart markup in renderCriteriaBar', () => {
        const scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(scriptSource).toContain('function renderCriteriaBar(label, value, options = {})');
        expect(scriptSource).toContain('class="cat-score-chip"');
        expect(scriptSource).toContain('class="bar-bg cat-lollipop-track"');
        expect(scriptSource).toContain('class="bar-fill cat-lollipop-fill"');
        expect(scriptSource).toContain('class="cat-lollipop-dot"');
        expect(scriptSource).toContain("<small>/10</small>");
    });

    it('contains the new lollipop chart styles in style.css', () => {
        const styleSource = fs.readFileSync(STYLE_PATH, 'utf-8');

        expect(styleSource).toContain('.cat-score-chip');
        expect(styleSource).toContain('.cat-lollipop-shell');
        expect(styleSource).toContain('.cat-lollipop-track::before');
        expect(styleSource).toContain('.cat-lollipop-dot');
    });
});