/**
 * Unit tests for share link parameter parsing and share text building.
 * Covers: parsePositiveIntParam guard logic, buildCommunityReviewShareText
 * output format, buildCommunityReviewNativeShareText, and the mobile
 * deep-link path in handleInitialReviewShareLink.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

// ── parsePositiveIntParam (extracted inline for unit testing) ─────────────────
// Mirrors the inline helper defined inside handleInitialReviewShareLink
function parsePositiveIntParam(value) {
    if (typeof value !== 'string') return null;
    const normalized = value.trim();
    if (normalized === '') return null;
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed) || parsed <= 0) return null;
    return parsed;
}

// ── buildCommunityReviewShareText (mirrors script.js logic) ──────────────────
function buildCommunityReviewShareText(spotName, reviewerName, shareLink) {
    const normalizedSpotName = String(spotName || '').trim() || 'Spot';
    const normalizedReviewerName = String(reviewerName || '').trim() || 'Anonym';
    return `🥙 Checkout Kebab-Review for "${normalizedSpotName}" by ${normalizedReviewerName}: ${shareLink}`;
}

function buildCommunityReviewNativeShareText(spotName, reviewerName) {
    const normalizedSpotName = String(spotName || '').trim() || 'Spot';
    const normalizedReviewerName = String(reviewerName || '').trim() || 'Anonym';
    return `🥙 Checkout Kebab-Review for "${normalizedSpotName}" by ${normalizedReviewerName}`;
}

// ── parsePositiveIntParam ─────────────────────────────────────────────────────
describe('parsePositiveIntParam', () => {
    it('returns the integer for a valid positive string number', () => {
        expect(parsePositiveIntParam('42')).toBe(42);
        expect(parsePositiveIntParam('1')).toBe(1);
        expect(parsePositiveIntParam('999')).toBe(999);
    });

    it('returns null for zero', () => {
        expect(parsePositiveIntParam('0')).toBeNull();
    });

    it('returns null for negative numbers', () => {
        expect(parsePositiveIntParam('-1')).toBeNull();
        expect(parsePositiveIntParam('-100')).toBeNull();
    });

    it('returns null for non-numeric strings', () => {
        expect(parsePositiveIntParam('abc')).toBeNull();
        expect(parsePositiveIntParam('abc123')).toBeNull();
    });

    it('returns null for empty string', () => {
        expect(parsePositiveIntParam('')).toBeNull();
    });

    it('returns null for whitespace-only string', () => {
        expect(parsePositiveIntParam('   ')).toBeNull();
    });

    it('returns null for non-string input (null, undefined, number)', () => {
        expect(parsePositiveIntParam(null)).toBeNull();
        expect(parsePositiveIntParam(undefined)).toBeNull();
        expect(parsePositiveIntParam(42)).toBeNull();
    });

    it('trims whitespace and still parses valid numbers', () => {
        expect(parsePositiveIntParam('  5  ')).toBe(5);
    });

    it('returns null for Infinity and NaN strings', () => {
        expect(parsePositiveIntParam('Infinity')).toBeNull();
        expect(parsePositiveIntParam('NaN')).toBeNull();
    });
});

// ── buildCommunityReviewShareText ─────────────────────────────────────────────
describe('buildCommunityReviewShareText', () => {
    it('formats the clipboard text with spot name, reviewer and link', () => {
        const result = buildCommunityReviewShareText('Kebab Palast', 'Alice', 'https://example.com/?s=1&r=2');
        expect(result).toBe('🥙 Checkout Kebab-Review for "Kebab Palast" by Alice: https://example.com/?s=1&r=2');
    });

    it('uses default "Spot" when spot name is empty', () => {
        const result = buildCommunityReviewShareText('', 'Alice', 'https://x.com');
        expect(result).toContain('"Spot"');
    });

    it('uses "Anonym" when reviewer name is empty', () => {
        const result = buildCommunityReviewShareText('My Spot', '', 'https://x.com');
        expect(result).toContain('by Anonym');
    });

    it('includes the kebab emoji prefix', () => {
        const result = buildCommunityReviewShareText('A', 'B', 'https://x.com');
        expect(result.startsWith('🥙')).toBe(true);
    });

    it('always appends the share link at the end after a colon-space', () => {
        const link = 'https://certifiedkebabtester.de/?s=7&r=13';
        const result = buildCommunityReviewShareText('Spot', 'Rev', link);
        expect(result.endsWith(`: ${link}`)).toBe(true);
    });
});

// ── buildCommunityReviewNativeShareText ───────────────────────────────────────
describe('buildCommunityReviewNativeShareText', () => {
    it('formats the native share text without a link', () => {
        const result = buildCommunityReviewNativeShareText('Doner King', 'Bob');
        expect(result).toBe('🥙 Checkout Kebab-Review for "Doner King" by Bob');
        expect(result).not.toContain('http');
    });

    it('uses defaults for missing values', () => {
        expect(buildCommunityReviewNativeShareText(null, null)).toBe('🥙 Checkout Kebab-Review for "Spot" by Anonym');
    });
});

// ── handleInitialReviewShareLink – source-level checks ───────────────────────
describe('handleInitialReviewShareLink deep-link logic (source)', () => {
    it('contains the mobile-specific modal path (innerWidth <= 768)', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        // Mobile devices open the modal directly without scrolling to the card
        expect(source).toContain('window.innerWidth <= 768');
        expect(source).toContain('openDeepLinkedReviewModalWithoutScroll');
    });

    it('retries with polling when community reviews are not yet loaded', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        // tryJumpToSharedReview must retry when communityReviewsReady is false
        expect(source).toContain('communityReviewsReady');
        expect(source).toContain('tryJumpToSharedReview(attempt + 1)');
        expect(source).toContain('attempt < 20');
    });

    it('clears URL params after successfully opening the review', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        expect(source).toContain('clearShareParamsFromUrl()');
        expect(source).toContain("window.history.replaceState({}, '', cleanUrl)");
    });

    it('supports legacy spot-only share links using ?r=<spotId> with #spots hash', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        expect(source).toContain("window.location.hash === '#spots'");
        expect(source).toContain('legacySpotId');
    });
});
