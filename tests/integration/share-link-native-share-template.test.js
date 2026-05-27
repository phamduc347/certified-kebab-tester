import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share link native share template', () => {
    it('uses native share text in file-share flow', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('function buildCommunityReviewNativeShareText(spotName, reviewerName)');
        expect(source).toContain('return `🥙 Checkout Kebab-Review for "${normalizedSpotName}" by ${normalizedReviewerName}`;');
        expect(source).toContain('await navigator.share({');
        expect(source).toContain('files: [shareFile],');
        expect(source).toContain('text: buildCommunityReviewNativeShareText(shareSpotName, shareReviewerName)');
    });
});
