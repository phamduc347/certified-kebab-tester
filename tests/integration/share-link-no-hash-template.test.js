import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share link generation without hash', () => {
    it('builds community review share links without #spots anchor scrolling', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        const fnMatch = source.match(/function buildCommunityReviewShareLink\(spotId, reviewId\) \{([\s\S]*?)\n\s*\}/);
        expect(fnMatch).not.toBeNull();

        const body = fnMatch[1];
        expect(body).not.toContain("shareUrl.hash = 'spots'");
        expect(body).toContain("shareUrl.searchParams.set('s', String(normalizedSpotId))");
        expect(body).toContain("shareUrl.searchParams.set('r', normalizedReviewId)");

        expect(source).toContain("const hadLegacyReviewHash = window.location.hash === '#spots';");
        expect(source).toContain("window.history.replaceState({}, '', urlWithoutHash);");
        expect(source).toContain("window.scrollTo({ top: 0, behavior: 'auto' });");
    });
});
