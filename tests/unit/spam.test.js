/**
 * Unit tests for the comment spam protection logic.
 * Functions are replicated from script.js to allow isolated testing
 * without DOM or localStorage dependencies (mocked via in-memory state).
 */
import { describe, it, expect, beforeEach } from 'vitest';

// ── Constants (mirror script.js) ─────────────────────────────────────────────
const COMMENT_COOLDOWN_MS = 30 * 1000;       // 30s between posts
const COMMENT_RATE_WINDOW_MS = 10 * 60 * 1000; // 10min window
const COMMENT_RATE_MAX = 4;                   // max comments per window
const COMMENT_BLOCK_MS = 15 * 60 * 1000;     // block duration after rate limit
const COMMENT_DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24h duplicate window

// ── In-memory localStorage mock ──────────────────────────────────────────────
let mockStorage = {};

function mockLocalStorage() {
    return {
        getItem: (key) => mockStorage[key] ?? null,
        setItem: (key, value) => { mockStorage[key] = String(value); },
        removeItem: (key) => { delete mockStorage[key]; },
    };
}

// ── Replicated spam logic (from script.js) ───────────────────────────────────
const LOCK_KEY = 'ckt_comment_locks_v1';

function loadCommentLocks(storage) {
    try {
        const raw = storage.getItem(LOCK_KEY);
        if (!raw) return { lastSubmitAt: 0, blockedUntil: 0, recent: [] };
        const parsed = JSON.parse(raw);
        return {
            lastSubmitAt: Number(parsed.lastSubmitAt) || 0,
            blockedUntil: Number(parsed.blockedUntil) || 0,
            recent: Array.isArray(parsed.recent) ? parsed.recent : []
        };
    } catch {
        return { lastSubmitAt: 0, blockedUntil: 0, recent: [] };
    }
}

function saveCommentLocks(storage, state) {
    storage.setItem(LOCK_KEY, JSON.stringify(state));
}

function normalizeCommentText(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function getClientSpamBlockReason(storage, spotId, commentValue, now = Date.now()) {
    const state = loadCommentLocks(storage);
    const recent = state.recent
        .filter(e => now - Number(e.at || 0) <= COMMENT_DUPLICATE_WINDOW_MS)
        .map(e => ({ at: Number(e.at) || 0, spotId: Number(e.spotId) || 0, text: String(e.text || '') }));

    if (state.blockedUntil > now) {
        const waitSeconds = Math.ceil((state.blockedUntil - now) / 1000);
        saveCommentLocks(storage, { ...state, recent });
        return `Zu viele Versuche. Bitte ${waitSeconds}s warten.`;
    }

    if (state.lastSubmitAt && now - state.lastSubmitAt < COMMENT_COOLDOWN_MS) {
        const waitSeconds = Math.ceil((COMMENT_COOLDOWN_MS - (now - state.lastSubmitAt)) / 1000);
        saveCommentLocks(storage, { ...state, recent });
        return `Bitte ${waitSeconds}s warten, bevor du erneut postest.`;
    }

    const attemptsInWindow = recent.filter(e => now - e.at <= COMMENT_RATE_WINDOW_MS).length;
    if (attemptsInWindow >= COMMENT_RATE_MAX) {
        state.blockedUntil = now + COMMENT_BLOCK_MS;
        saveCommentLocks(storage, { ...state, recent });
        return 'Temporäre Sperre aktiv. Bitte später erneut versuchen.';
    }

    const normalizedText = normalizeCommentText(commentValue);
    const duplicate = recent.some(e =>
        e.spotId === Number(spotId) &&
        e.text === normalizedText &&
        now - e.at <= COMMENT_DUPLICATE_WINDOW_MS
    );

    saveCommentLocks(storage, { ...state, recent });
    if (duplicate) return 'Doppelter Kommentar erkannt. Bitte formuliere ihn neu.';

    return '';
}

function markClientCommentSubmitted(storage, spotId, commentValue, now = Date.now()) {
    const state = loadCommentLocks(storage);
    const normalizedText = normalizeCommentText(commentValue);
    const recent = (Array.isArray(state.recent) ? state.recent : [])
        .filter(e => now - Number(e.at || 0) <= COMMENT_DUPLICATE_WINDOW_MS)
        .concat([{ at: now, spotId: Number(spotId), text: normalizedText }]);
    saveCommentLocks(storage, { lastSubmitAt: now, blockedUntil: Number(state.blockedUntil) || 0, recent });
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('spam protection: initial state', () => {
    beforeEach(() => { mockStorage = {}; });

    it('allows first comment with no previous history', () => {
        const storage = mockLocalStorage();
        const reason = getClientSpamBlockReason(storage, 1, 'Lecker!');
        expect(reason).toBe('');
    });
});

describe('spam protection: cooldown', () => {
    beforeEach(() => { mockStorage = {}; });

    it('blocks a second comment within the cooldown window', () => {
        const storage = mockLocalStorage();
        const now = Date.now();

        markClientCommentSubmitted(storage, 1, 'Erster Kommentar', now);
        const reason = getClientSpamBlockReason(storage, 1, 'Zweiter Kommentar', now + 5000);

        expect(reason).toMatch(/warten/i);
    });

    it('allows a comment after the cooldown expires', () => {
        const storage = mockLocalStorage();
        const now = Date.now();

        markClientCommentSubmitted(storage, 1, 'Erster Kommentar', now);
        const reason = getClientSpamBlockReason(storage, 1, 'Zweiter Kommentar', now + COMMENT_COOLDOWN_MS + 1000);

        expect(reason).toBe('');
    });
});

describe('spam protection: rate limiting', () => {
    beforeEach(() => { mockStorage = {}; });

    it('blocks after exceeding max comments in the rate window', () => {
        const storage = mockLocalStorage();
        const now = Date.now();
        const gap = COMMENT_COOLDOWN_MS + 1000;

        for (let i = 0; i < COMMENT_RATE_MAX; i++) {
            const submitTime = now + i * gap;
            // Check not blocked
            const reason = getClientSpamBlockReason(storage, 1, `Kommentar ${i}`, submitTime);
            expect(reason).toBe('');
            markClientCommentSubmitted(storage, 1, `Kommentar ${i}`, submitTime);
        }

        // COMMENT_RATE_MAX + 1 attempt
        const overLimitTime = now + COMMENT_RATE_MAX * gap;
        const reason = getClientSpamBlockReason(storage, 1, 'One more', overLimitTime);
        expect(reason).toMatch(/Sperre/i);
    });
});

describe('spam protection: block state', () => {
    beforeEach(() => { mockStorage = {}; });

    it('respects an active block and shows remaining wait time', () => {
        const storage = mockLocalStorage();
        const now = Date.now();
        const blockedUntil = now + 300_000; // 5 min block

        saveCommentLocks(storage, { lastSubmitAt: 0, blockedUntil, recent: [] });

        const reason = getClientSpamBlockReason(storage, 1, 'Try again', now + 1000);
        expect(reason).toMatch(/warten/i);
    });

    it('allows posting after block expires', () => {
        const storage = mockLocalStorage();
        const now = Date.now();
        const blockedUntil = now - 1000; // block already expired

        saveCommentLocks(storage, { lastSubmitAt: 0, blockedUntil, recent: [] });

        const reason = getClientSpamBlockReason(storage, 1, 'Free again', now);
        expect(reason).toBe('');
    });
});

describe('spam protection: duplicate detection', () => {
    beforeEach(() => { mockStorage = {}; });

    it('detects identical comment text on the same spot', () => {
        const storage = mockLocalStorage();
        const now = Date.now();

        markClientCommentSubmitted(storage, 1, 'Sehr lecker!', now - 60_000);

        // Try to post same text again (well after cooldown)
        const reason = getClientSpamBlockReason(storage, 1, 'Sehr lecker!', now + COMMENT_COOLDOWN_MS + 1000);
        expect(reason).toMatch(/Doppelter/i);
    });

    it('allows same text on a different spot', () => {
        const storage = mockLocalStorage();
        const now = Date.now();

        markClientCommentSubmitted(storage, 1, 'Sehr lecker!', now - 60_000);

        // Same text, different spot
        const reason = getClientSpamBlockReason(storage, 2, 'Sehr lecker!', now + COMMENT_COOLDOWN_MS + 1000);
        expect(reason).toBe('');
    });

    it('is case and whitespace insensitive', () => {
        const storage = mockLocalStorage();
        const now = Date.now();

        markClientCommentSubmitted(storage, 1, 'Super Döner!', now - 60_000);

        const reason = getClientSpamBlockReason(storage, 1, '  SUPER DÖNER!  ', now + COMMENT_COOLDOWN_MS + 1000);
        expect(reason).toMatch(/Doppelter/i);
    });
});
