import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const STYLE_PATH = path.resolve(process.cwd(), '../assets/css/style.css');

describe('Spotreview category chart', () => {
    it('renders the current bar chart markup in renderCriteriaBar', () => {
        const scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(scriptSource).toContain('function renderCriteriaBar(label, value, options = {})');
        expect(scriptSource).toContain('class="cat-item-bar"');
        expect(scriptSource).toContain('class="cat-info"');
        expect(scriptSource).toContain('class="bar-bg"');
        expect(scriptSource).toContain('class="bar-fill" style="--target-width: ${percentage}%; background-color: ${color}"');
        expect(scriptSource).toContain("${showAverageSymbol ? 'Ø ' : ''}${value}");
    });

    it('contains the current bar chart styles in style.css', () => {
        const styleSource = fs.readFileSync(STYLE_PATH, 'utf-8');

        expect(styleSource).toContain('.spot-categories');
        expect(styleSource).toContain('.cat-item-bar');
        expect(styleSource).toContain('.cat-info');
        expect(styleSource).toContain('.bar-bg');
        expect(styleSource).toContain('.bar-fill');
        expect(styleSource).toContain('.spot-card.expanded .bar-fill');
    });
});