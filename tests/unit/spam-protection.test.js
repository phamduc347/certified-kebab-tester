/**
 * Unit tests for spam protection and comment rate limiting logic.
 * Tests the getClientSpamBlockReason function with simulated time and state.
 */
import { describe, it, expect, beforeEach } from 'vitest';

// ── Constants (mirror script.js) ─────────────────────────────────────────────
const COMMENT_COOLDOWN_MS = 30 * 1000;       // 30s between posts
const COMMENT_RATE_WINDOW_MS = 10 * 60 * 1000; // 10min window
const COMMENT_RATE_MAX = 4;                   // max comments per window
const COMMENT_BLOCK_MS = 15 * 60 * 1000;     // block duration after rate limit
const COMMENT_DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h duplicate window

// ── Implementation (mirror of script.js) ─────────────────────────────────────
function normalizeCommentText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function getClientSpamBlockReason(spotId, commentValue, now, state) {
    const recent = state.recent
        .filter((entry) => now - Number(entry.at || 0) <= COMMENT_DUPLICATE_WINDOW_MS)
        .map((entry) => ({
            at: Number(entry.at) || 0,
            spotId: Number(entry.spotId) || 0,
            text: String(entry.text || '')
        }));

    if (state.blockedUntil > now) {
        const waitSeconds = Math.ceil((state.blockedUntil - now) / 1000);
        return `Zu viele Versuche. Bitte ${waitSeconds}s warten.`;
    }

    if (state.lastSubmitAt && now - state.lastSubmitAt < COMMENT_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((COMMENT_COOLDOWN_MS - (now - state.lastSubmitAt)) / 1000);
        return `Bitte ${waitSeconds}s warten, bevor du erneut postest.`;
    }

    const attemptsInWindow = recent.filter((entry) => now - entry.at <= COMMENT_RATE_WINDOW_MS).length;
    if (attemptsInWindow >= COMMENT_RATE_MAX) {
        state.blockedUntil = now + COMMENT_BLOCK_MS;
        return 'Temporäre Sperre aktiv. Bitte später erneut versuchen.';
    }

    const normalizedText = normalizeCommentText(commentValue);
    const duplicate = recent.some((entry) =>
        entry.spotId === Number(spotId) &&
        entry.text === normalizedText &&
        now - entry.at <= COMMENT_DUPLICATE_WINDOW_MS
    );

    if (duplicate) {
        return 'Doppelter Kommentar erkannt. Bitte formuliere ihn neu.';
    }

    return '';
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('spam protection: getClientSpamBlockReason', () => {
    let now = Date.now();

    beforeEach(() => {
        now = Date.now();
    });

    describe('initial state', () => {
        it('allows first comment with no previous history', () => {
            const state = { lastSubmitAt: 0, blockedUntil: 0, recent: [] };
            const reason = getClientSpamBlockReason(123, 'Great kebab!', now, state);
            expect(reason).toBe('');
        });
    });

    describe('cooldown protection', () => {
        it('blocks a second comment within the cooldown window', () => {
            const state = {
                lastSubmitAt: now - 10 * 1000, // 10s ago
                blockedUntil: 0,
                recent: []
            };
            const reason = getClientSpamBlockReason(123, 'Another comment', now, state);
            expect(reason).toContain('warten');
            expect(reason).toContain('s'); // Shows wait time
        });

        it('calculates correct remaining cooldown time', () => {
            const state = {
                lastSubmitAt: now - 20 * 1000, // 20s ago (10s remaining)
                blockedUntil: 0,
                recent: []
            };
            const reason = getClientSpamBlockReason(123, 'Comment', now, state);
            expect(reason).toContain('10'); // ~10 seconds remain
        });

        it('allows a comment after the cooldown expires', () => {
            const state = {
                lastSubmitAt: now - COMMENT_COOLDOWN_MS - 1000, // 31s ago
                blockedUntil: 0,
                recent: []
            };
            const reason = getClientSpamBlockReason(123, 'Comment', now, state);
            expect(reason).toBe('');
        });
    });

    describe('rate limiting', () => {
        it('blocks after exceeding max comments in the rate window', () => {
            const recent = [];
            for (let i = 0; i < 4; i++) {
                recent.push({
                    at: now - (5000 + i * 1000), // Spread over 5s
                    spotId: 123,
                    text: `comment ${i}`
                });
            }
            const state = {
                lastSubmitAt: now - (COMMENT_COOLDOWN_MS + 1000), // Beyond cooldown
                blockedUntil: 0,
                recent
            };
            const reason = getClientSpamBlockReason(123, 'Comment 5', now, state);
            expect(reason).toContain('Temporäre Sperre');
            expect(state.blockedUntil).toBeGreaterThan(now);
        });

        it('allows comments below the rate limit', () => {
            const recent = [];
            for (let i = 0; i < 3; i++) {
                recent.push({
                    at: now - (5000 + i * 1000),
                    spotId: 123,
                    text: `comment ${i}`
                });
            }
            const state = {
                lastSubmitAt: now - (COMMENT_COOLDOWN_MS + 1000), // Beyond cooldown
                blockedUntil: 0,
                recent
            };
            const reason = getClientSpamBlockReason(123, 'Comment 4', now, state);
            expect(reason).toBe('');
        });
    });

    describe('block state', () => {
        it('respects an active block and shows remaining wait time', () => {
            const state = {
                lastSubmitAt: now - (COMMENT_COOLDOWN_MS + 1000),
                blockedUntil: now + 600 * 1000, // Blocked for 600s
                recent: []
            };
            const reason = getClientSpamBlockReason(123, 'Comment', now, state);
            expect(reason).toContain('Zu viele Versuche');
            expect(reason).toContain('600');
        });

        it('allows posting after block expires', () => {
            const state = {
                lastSubmitAt: now - (COMMENT_COOLDOWN_MS + 1000),
                blockedUntil: now - 1000, // Block expired
                recent: []
            };
            const reason = getClientSpamBlockReason(123, 'Comment', now, state);
            expect(reason).toBe('');
        });
    });

    describe('duplicate detection', () => {
        it('detects identical comment text on the same spot', () => {
            const state = {
                lastSubmitAt: now - (COMMENT_COOLDOWN_MS + 1000),
                blockedUntil: 0,
                recent: [
                    {
                        at: now - 1000,
                        spotId: 123,
                        text: 'great kebab'
                    }
                ]
            };
            const reason = getClientSpamBlockReason(123, 'GREAT KEBAB', now, state);
            expect(reason).toContain('Doppelter Kommentar');
        });

        it('allows same text on a different spot', () => {
            const state = {
                lastSubmitAt: now - (COMMENT_COOLDOWN_MS + 1000),
                blockedUntil: 0,
                recent: [
                    {
                        at: now - 1000,
                        spotId: 123,
                        text: 'great kebab'
                    }
                ]
            };
            const reason = getClientSpamBlockReason(456, 'Great Kebab', now, state);
            expect(reason).toBe('');
        });

        it('is case and whitespace insensitive', () => {
            const state = {
                lastSubmitAt: now - (COMMENT_COOLDOWN_MS + 1000),
                blockedUntil: 0,
                recent: [
                    {
                        at: now - 1000,
                        spotId: 123,
                        text: 'great kebab' // normalized: single space
                    }
                ]
            };
            const reason = getClientSpamBlockReason(123, '  GREAT KEBAB  ', now, state);
            expect(reason).toContain('Doppelter Kommentar');
        });

        it('ignores duplicate outside the 24h window', () => {
            const state = {
                lastSubmitAt: now - 31 * 1000,
                blockedUntil: 0,
                recent: [
                    {
                        at: now - COMMENT_DUPLICATE_WINDOW_MS - 1000,
                        spotId: 123,
                        text: 'great kebab'
                    }
                ]
            };
            const reason = getClientSpamBlockReason(123, 'Great Kebab', now, state);
            expect(reason).toBe('');
        });
    });

    describe('priority of checks', () => {
        it('block check has priority over other checks', () => {
            const state = {
                lastSubmitAt: now - 1000,
                blockedUntil: now + 300 * 1000,
                recent: [
                    { at: now - 1000, spotId: 123, text: 'duplicate text' }
                ]
            };
            const reason = getClientSpamBlockReason(123, 'duplicate text', now, state);
            expect(reason).toContain('Zu viele Versuche');
        });

        it('cooldown check has priority over duplicate check', () => {
            const state = {
                lastSubmitAt: now - 10 * 1000,
                blockedUntil: 0,
                recent: [
                    { at: now - 1000, spotId: 123, text: 'duplicate' }
                ]
            };
            const reason = getClientSpamBlockReason(123, 'duplicate', now, state);
            expect(reason).toContain('warten');
            expect(reason).not.toContain('Doppelter');
        });
    });
});
