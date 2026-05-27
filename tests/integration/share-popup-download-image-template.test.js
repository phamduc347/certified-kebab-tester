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
        expect(source).toContain("scale: 2");
        expect(source).toContain("imageBlob.size > 30 * 1024 * 1024");
        expect(source).toContain("typeof navigator !== 'undefined' && typeof navigator.share === 'function'");
        expect(source).toContain("const shareFile = new File([imageBlob], filename, { type: 'image/png' });");
        expect(source).toContain('files: [shareFile]');
        expect(source).toContain("applyShareButtonState(button, 'Story-Karte geteilt', 'is-success')");
        expect(source).toContain("URL.createObjectURL(imageBlob)");
        expect(source).toContain('downloadLink.download = filename;');
        expect(source).toContain("await copyCommunityReviewShareText(shareSpotName, shareReviewerName, payload.shareLink)");
    });
});
