import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const INDEX_PATH = path.resolve(process.cwd(), '../index.html');

describe('Community review popup card', () => {
    it('renders preview buttons and opens reviews through the modal system', () => {
        const scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        const indexSource = fs.readFileSync(INDEX_PATH, 'utf-8');

        expect(scriptSource).toContain('class="review-community-preview-btn"');
        expect(scriptSource).toContain('aria-haspopup="dialog"');
        expect(scriptSource).toContain('function openCommunityReviewPopup(spotId, reviewId, triggerElement = null)');
        expect(scriptSource).toContain("const communityReviewModal = document.getElementById('community-review-modal');");
        expect(scriptSource).toContain("return Array.from(card.querySelectorAll('.review-community-preview-btn'))");
        expect(scriptSource).not.toContain('class="review-community-item collapsible-panel"');

        expect(indexSource).toContain('id="community-review-modal"');
        expect(indexSource).toContain('id="community-review-modal-content"');
    });
});
