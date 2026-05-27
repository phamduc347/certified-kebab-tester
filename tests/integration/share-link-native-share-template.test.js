import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share link native share template', () => {
    it('uses native share text without appending the link', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('function buildCommunityReviewNativeShareText(spotName, reviewerName)');
        expect(source).toContain('return `🥙 Checkout Kebab-Review for "${normalizedSpotName}" by ${normalizedReviewerName}`;');
        expect(source).toContain('const text = buildCommunityReviewNativeShareText(shareSpotName, shareReviewerName);');
        expect(source).toContain('url: shareLink');
    });
});
