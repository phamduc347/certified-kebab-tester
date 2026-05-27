/**
 * Integration tests for the renderReviewShareStoryModal story card template.
 * Covers: no star rating, badge pills, QR code URL, comment truncation,
 * and the auto-clipboard copy triggered before image download.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Story card template (renderReviewShareStoryModal)', () => {
    it('does NOT render star rating markup inside the story card', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        // Locate the renderReviewShareStoryModal function body
        const fnStart = source.indexOf('function renderReviewShareStoryModal(payload)');
        expect(fnStart).toBeGreaterThan(-1);

        // Find closing brace (matching brace depth)
        let depth = 0;
        let fnEnd = -1;
        for (let i = fnStart; i < source.length; i++) {
            if (source[i] === '{') depth++;
            else if (source[i] === '}') {
                depth--;
                if (depth === 0) { fnEnd = i + 1; break; }
            }
        }
        expect(fnEnd).toBeGreaterThan(fnStart);

        const fnBody = source.slice(fnStart, fnEnd);

        // Stars must NOT appear inside the story card — they were intentionally removed
        // to not pre-empt the rating reveal.
        expect(fnBody).not.toContain('renderStars(');
        expect(fnBody).not.toContain('class="stars"');
        expect(fnBody).not.toContain('★');
    });

    it('renders badge pills for dish, price, consumption type and city', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        const fnStart = source.indexOf('function renderReviewShareStoryModal(payload)');
        let depth = 0, fnEnd = -1;
        for (let i = fnStart; i < source.length; i++) {
            if (source[i] === '{') depth++;
            else if (source[i] === '}') { depth--; if (depth === 0) { fnEnd = i + 1; break; } }
        }
        const fnBody = source.slice(fnStart, fnEnd);

        expect(fnBody).toContain('review-share-story-pill review-share-story-pill--accent');
        expect(fnBody).toContain('review-share-story-pill');
        expect(fnBody).toContain('review-share-story-badges');
        // Pills are conditionally added for each field
        expect(fnBody).toContain("if (dish !== '-') detailBadges.push");
        expect(fnBody).toContain("if (price !== '-') detailBadges.push");
        expect(fnBody).toContain("if (consumptionType !== '-') detailBadges.push");
        expect(fnBody).toContain("if (city !== '-') detailBadges.push");
    });

    it('generates QR code URL only when a shareLink is provided', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        const fnStart = source.indexOf('function renderReviewShareStoryModal(payload)');
        let depth = 0, fnEnd = -1;
        for (let i = fnStart; i < source.length; i++) {
            if (source[i] === '{') depth++;
            else if (source[i] === '}') { depth--; if (depth === 0) { fnEnd = i + 1; break; } }
        }
        const fnBody = source.slice(fnStart, fnEnd);

        expect(fnBody).toContain('api.qrserver.com/v1/create-qr-code/');
        expect(fnBody).toContain('encodeURIComponent(shareLink)');
        // Must be conditional on shareLink existing
        expect(fnBody).toContain('qrCodeUrl ?');
        expect(fnBody).toContain("const qrCodeUrl = shareLink");
    });

    it('truncates long comments to 180 characters with an ellipsis', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        const fnStart = source.indexOf('function renderReviewShareStoryModal(payload)');
        let depth = 0, fnEnd = -1;
        for (let i = fnStart; i < source.length; i++) {
            if (source[i] === '{') depth++;
            else if (source[i] === '}') { depth--; if (depth === 0) { fnEnd = i + 1; break; } }
        }
        const fnBody = source.slice(fnStart, fnEnd);

        expect(fnBody).toContain('180');
        expect(fnBody).toContain("slice(0, 180)");
        expect(fnBody).toContain('...`');
        expect(fnBody).toContain('previewText');

    });

    it('renders spot name in <h3> and reviewer/date in review-share-story-meta', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        const fnStart = source.indexOf('function renderReviewShareStoryModal(payload)');
        let depth = 0, fnEnd = -1;
        for (let i = fnStart; i < source.length; i++) {
            if (source[i] === '{') depth++;
            else if (source[i] === '}') { depth--; if (depth === 0) { fnEnd = i + 1; break; } }
        }
        const fnBody = source.slice(fnStart, fnEnd);

        expect(fnBody).toContain('<h3>${spotName}</h3>');
        expect(fnBody).toContain('review-share-story-meta');
        expect(fnBody).toContain('von ${reviewerName}');
        expect(fnBody).toContain('· ${date}');
    });

    it('includes auto-clipboard copy before the PNG download', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        // The download-image action must silently copy the share link to clipboard
        // BEFORE generating or sharing the PNG (feature added to avoid extra UX step)
        const downloadHandlerIdx = source.indexOf("if (action === 'download-image')");
        expect(downloadHandlerIdx).toBeGreaterThan(-1);

        // copyCommunityReviewShareText must appear inside the download-image block
        const afterDownload = source.slice(downloadHandlerIdx, downloadHandlerIdx + 2000);
        expect(afterDownload).toContain('await copyCommunityReviewShareText(shareSpotName, shareReviewerName, payload.shareLink)');
    });
});
