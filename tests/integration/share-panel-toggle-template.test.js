import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share popup focused-only template', () => {
    it('removes the panel toggle and keeps only focused mode actions', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).not.toContain('class="review-share-panel-toggle"');
        expect(source).not.toContain('data-share-panel-toggle');
        expect(source).not.toContain('class="review-share-actions-shell"');

        expect(source).toContain('class="review-share-action-btn review-share-copy-btn"');
        expect(source).toContain('>Link kopieren</button>');
        expect(source).toContain("reviewShareModalContent.classList.add('is-photo-focus-mode')");
    });
});
