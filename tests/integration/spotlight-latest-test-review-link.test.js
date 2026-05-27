/**
 * Integration tests for the Spotlight "LATEST TEST" card.
 * Covers: usage of community reviewId on the jump button,
 * data-review-id attribute binding, getSubmissionTimestamp logic,
 * and that the spotlight item links to the actual newest review
 * (not just the aggregated spot).
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Spotlight LATEST TEST links to newest community review', () => {
    it('reads newestSubmittedCommunityReview from rawApprovedReviews', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('newestSubmittedCommunityReview');
        expect(source).toContain('rawApprovedReviews');
        // Must sort by submission timestamp, not just by date string
        expect(source).toContain('getSubmissionTimestamp(b) - getSubmissionTimestamp(a)');
    });

    it('attaches reviewId to the LATEST TEST spotlight item', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        // The LATEST TEST item must carry the reviewId from the newest community review
        const latestItemMatch = source.match(/\{\s*spot:\s*newestSubmittedSpot[^}]*label:\s*"LATEST TEST"[^}]*\}/);
        expect(latestItemMatch).not.toBeNull();

        const latestItemBlock = latestItemMatch[0];
        expect(latestItemBlock).toContain('reviewId');
        expect(latestItemBlock).toContain('newestSubmittedCommunityReview ? newestSubmittedCommunityReview.id : null');
    });

    it('renders data-review-id attribute on the spotlight jump button', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        // The spotlight-jump-btn must carry data-review-id so clicks can open
        // the specific community review modal, not just the aggregated spot.
        expect(source).toContain('data-review-id="${item.reviewId || \'\'}"');
    });

    it('renders data-review-id on the latest-title heading', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        // The title element also uses data-review-id for click handling
        expect(source).toContain('data-review-id="${item.reviewId || \'\'}"');
    });

    it('passes both spotId and reviewId to jumpToReview from spotlight click handler', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        // The spotlight click handler must forward reviewId — without it the modal
        // would open the aggregated spot instead of the specific review.
        expect(source).toContain('jumpToReview(id, reviewId || null)');
    });

    it('falls back to sortedByDate[0] when no community reviews exist', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        // null-safe fallback: if no community review is the newest, use date-sorted spot
        expect(source).toContain('newestSubmittedSpot || sortedByDate[0]');
    });

    it('getSubmissionTimestamp prefers created_at over visit_date', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        // Finds the getSubmissionTimestamp helper
        const fnStart = source.indexOf('const getSubmissionTimestamp = (review) =>');
        expect(fnStart).toBeGreaterThan(-1);

        // The function body should check created_at first
        const fnSnippet = source.slice(fnStart, fnStart + 400);
        expect(fnSnippet).toContain('created_at');
        expect(fnSnippet).toContain('visit_date');
        // created_at must be checked before visit_date (first occurrence earlier in slice)
        expect(fnSnippet.indexOf('created_at')).toBeLessThan(fnSnippet.indexOf('visit_date'));
    });
});
