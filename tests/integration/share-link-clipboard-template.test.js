import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share link clipboard template', () => {
    it('builds the clipboard text using spot and reviewer names', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        const templateFnMatch = source.match(/function buildCommunityReviewShareText\(spotName, reviewerName, shareLink\) \{([\s\S]*?)\n\s*\}/);
        expect(templateFnMatch).not.toBeNull();

        const templateBody = templateFnMatch[1];
        expect(templateBody).toContain('🥙 Checkout Kebab-Review for');
        expect(templateBody).toContain('Checkout Kebab-Review for');
        expect(templateBody).toContain('by ${normalizedReviewerName}: ${shareLink}');

        expect(source).toContain('data-share-spot-name="${escapeHtml(data.rawSpotName)}"');
        expect(source).toContain('data-share-reviewer-name="${escapeHtml(data.rawReviewerName)}"');
        expect(source).toContain('const shareText = buildCommunityReviewShareText(shareSpotName, shareReviewerName, shareLink);');
        expect(source).toContain('await copyTextToClipboard(shareText);');
    });
});
