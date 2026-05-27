import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share panel toggle template', () => {
    it('renders a panel toggle and wires photo focus mode class toggle', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('class="review-share-panel-toggle"');
        expect(source).toContain('data-share-panel-toggle');
        expect(source).toContain("reviewShareModalContent.classList.toggle('is-photo-focus-mode')");
        expect(source).toContain("panelToggleBtn.dataset.collapsedLabel || 'CHECKOUT MY REVIEW'");
        expect(source).toContain("panelToggleBtn.dataset.expandedLabel || 'Review Teilen ausblenden'");
    });
});
