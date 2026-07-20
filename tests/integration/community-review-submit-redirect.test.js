import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Community review submit redirect flow', () => {
    it('stores a rich pending redirect payload after successful submit', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('let pendingPublishedReviewRedirect = null;');
        expect(source).toContain("const PENDING_PUBLISHED_REVIEW_STORAGE_KEY = 'ckt-pending-published-review';");
        expect(source).toContain(".select('id')");
        expect(source).toContain('.single();');
        expect(source).toContain('pendingPublishedReviewRedirect = Number.isFinite(targetSpotId) && targetSpotId > 0');
        expect(source).toContain('reviewerName,');
        expect(source).toContain('commentText,');
    });

    it('persists pending payload and forces a reload when the feedback modal closes', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('const redirectPayload = pendingPublishedReviewRedirect;');
        expect(source).toContain('sessionStorage.setItem(PENDING_PUBLISHED_REVIEW_STORAGE_KEY, JSON.stringify(redirectPayload));');
        expect(source).toContain('window.location.reload();');
    });

    it('re-opens the pending review from session storage after reload', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('function handlePendingPublishedReviewLink() {');
        expect(source).toContain('sessionStorage.getItem(PENDING_PUBLISHED_REVIEW_STORAGE_KEY);');
        expect(source).toContain('jumpToReview(targetSpotId, targetReviewId);');
        expect(source).toContain('handlePendingPublishedReviewLink();');
    });

    it('uses a direct modal fallback when review trigger button is missing', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('const tryOpenReviewPopup = (attempt = 0) => {');
        expect(source).toContain('const opened = openCommunityReviewPopup(spotId, reviewId, reviewTrigger || card);');
        expect(source).toContain('if (!opened && attempt < 8) {');
    });
});
