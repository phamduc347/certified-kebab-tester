import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share popup PNG download template', () => {
    it('renders a photo-focus PNG download button and export flow', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('class="review-share-action-btn review-share-download-btn"');
        expect(source).toContain('data-share-action="download-image"');
        expect(source).toContain("if (action === 'download-image')");
        expect(source).toContain("typeof window.html2canvas !== 'function'");
        expect(source).toContain("cloneNode(true)");
        expect(source).toContain("classList.add('is-export')");
        expect(source).toContain("await window.html2canvas(exportCard");
        expect(source).toContain("width: 1080");
        expect(source).toContain("height: 1920");
        // Performance: scale:2 entfernt (1080x1920 reicht fuer Story-Format)
        expect(source).not.toContain("scale: 2");
        // Performance: JPEG statt PNG fuer schnelleres Encoding
        expect(source).toContain("canvas.toBlob(resolve, 'image/jpeg', 0.9)");
        expect(source).toContain("imageBlob.size > 30 * 1024 * 1024");
        expect(source).toContain("typeof navigator !== 'undefined' && typeof navigator.share === 'function'");
        expect(source).toContain("const shareFile = new File([imageBlob], filename, { type: 'image/jpeg' });");
        expect(source).toContain('files: [shareFile]');
        expect(source).toContain("applyShareButtonState(button, 'Story-Karte geteilt', 'is-success')");
        expect(source).toContain("URL.createObjectURL(imageBlob)");
        expect(source).toContain('downloadLink.download = filename;');
        expect(source).toContain("await copyCommunityReviewShareText(shareSpotName, shareReviewerName, payload.shareLink)");

        // Assert story card DOM flickering prevention styles exist in CSS
        const cssPath = path.resolve(process.cwd(), '../assets/css/style.css');
        const cssSource = fs.readFileSync(cssPath, 'utf-8');
        expect(cssSource).toContain('.review-share-story-card::before');
        expect(cssSource).toContain('.review-share-story-card .review-share-story-image');
        expect(cssSource).toContain('opacity: 0');
        expect(cssSource).toContain('.review-share-story-card.is-export::before');
        expect(cssSource).toContain('opacity: 1 !important');
    });
});
