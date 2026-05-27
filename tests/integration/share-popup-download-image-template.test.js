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
        expect(source).toContain("await window.html2canvas(storyCard");
        expect(source).toContain("typeof navigator !== 'undefined' && typeof navigator.share === 'function'");
        expect(source).toContain("const shareFile = new File([imageBlob], filename, { type: 'image/png' });");
        expect(source).toContain('files: [shareFile]');
        expect(source).toContain("applyShareButtonState(button, 'Teilen geöffnet', 'is-success')");
        expect(source).toContain("canvas.toDataURL('image/png')");
        expect(source).toContain('downloadLink.download = filename;');
    });
});
