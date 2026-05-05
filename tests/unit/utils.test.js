/**
 * Unit tests for pure utility functions used in script.js.
 * These functions are tested in isolation without any DOM or browser dependency.
 */
import { describe, it, expect } from 'vitest';

// ── Replicated pure functions (DOM-independent) ──────────────────────────────
// These mirror the implementations in script.js.
// If the implementation changes, update here too.

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function normalizeCommentText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

function getColorForScore(score) {
    const value = parseFloat(score);
    if (isNaN(value) || value < 0) return 'inherit';
    const clamped = Math.max(1, Math.min(10, value));
    const hue = Math.round(((clamped - 1) / 9) * 120);
    return `hsl(${hue}, 80%, 40%)`;
}

function parseVal(s) {
    return parseFloat(String(s).replace(',', '.').replace('%', '').replace(' €', '')) || 0;
}

function renderStarsScore(scoreStr) {
    if (!scoreStr) return null;
    return parseFloat(String(scoreStr).replace(',', '.').replace('%', ''));
}

// ── escapeHtml ───────────────────────────────────────────────────────────────
describe('escapeHtml', () => {
    it('escapes ampersands', () => {
        expect(escapeHtml('Döner & Pizza')).toBe('Döner &amp; Pizza');
    });

    it('escapes less-than and greater-than', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes double quotes', () => {
        expect(escapeHtml('"hello"')).toBe('&quot;hello&quot;');
    });

    it('escapes single quotes', () => {
        expect(escapeHtml("it's fine")).toBe('it&#39;s fine');
    });

    it('handles null/undefined gracefully', () => {
        expect(escapeHtml(null)).toBe('');
        expect(escapeHtml(undefined)).toBe('');
    });

    it('handles non-string input', () => {
        expect(escapeHtml(42)).toBe('42');
    });

    it('returns plain text unchanged', () => {
        expect(escapeHtml('Rüyam')).toBe('Rüyam');
    });
});

// ── normalizeCommentText ─────────────────────────────────────────────────────
describe('normalizeCommentText', () => {
    it('trims leading and trailing whitespace', () => {
        expect(normalizeCommentText('  hello  ')).toBe('hello');
    });

    it('converts to lowercase', () => {
        expect(normalizeCommentText('GREAT DÖNER')).toBe('great döner');
    });

    it('collapses multiple spaces into one', () => {
        expect(normalizeCommentText('so   many   spaces')).toBe('so many spaces');
    });

    it('handles null/undefined gracefully', () => {
        expect(normalizeCommentText(null)).toBe('');
        expect(normalizeCommentText(undefined)).toBe('');
    });

    it('handles empty string', () => {
        expect(normalizeCommentText('')).toBe('');
    });

    it('normalizes mixed whitespace', () => {
        expect(normalizeCommentText('  Hello   World  ')).toBe('hello world');
    });
});

// ── getColorForScore ─────────────────────────────────────────────────────────
describe('getColorForScore', () => {
    it('returns red (hue 0) for score 1', () => {
        expect(getColorForScore(1)).toBe('hsl(0, 80%, 40%)');
    });

    it('returns green (hue 120) for score 10', () => {
        expect(getColorForScore(10)).toBe('hsl(120, 80%, 40%)');
    });

    it('returns a mid-range hue for score 5.5', () => {
        const color = getColorForScore(5.5);
        expect(color).toMatch(/^hsl\(\d+, 80%, 40%\)$/);
        const hue = parseInt(color.match(/hsl\((\d+)/)[1]);
        expect(hue).toBeGreaterThan(0);
        expect(hue).toBeLessThan(120);
    });

    it('returns inherit for NaN input', () => {
        expect(getColorForScore('not-a-number')).toBe('inherit');
        expect(getColorForScore(null)).toBe('inherit');
        expect(getColorForScore(undefined)).toBe('inherit');
    });

    it('returns inherit for negative values', () => {
        expect(getColorForScore(-1)).toBe('inherit');
    });

    it('clamps values above 10 to green', () => {
        expect(getColorForScore(15)).toBe('hsl(120, 80%, 40%)');
    });

    it('clamps values at 1 (lower bound)', () => {
        expect(getColorForScore(0.5)).toBe('hsl(0, 80%, 40%)');
    });
});

// ── parseVal ─────────────────────────────────────────────────────────────────
describe('parseVal', () => {
    it('parses German decimal format with comma', () => {
        expect(parseVal('92,10%')).toBeCloseTo(92.1);
    });

    it('parses price string with euro symbol', () => {
        expect(parseVal('7,40 €')).toBeCloseTo(7.4);
    });

    it('parses plIndex string', () => {
        expect(parseVal('12,40%')).toBeCloseTo(12.4);
    });

    it('returns 0 for empty or null input', () => {
        expect(parseVal('')).toBe(0);
        expect(parseVal(null)).toBe(0);
        expect(parseVal(undefined)).toBe(0);
    });

    it('handles standard dot-decimal format', () => {
        expect(parseVal('90.80')).toBeCloseTo(90.8);
    });
});

// ── renderStarsScore ─────────────────────────────────────────────────────────
describe('renderStarsScore (score string parser)', () => {
    it('parses "92,10%" to 92.1', () => {
        expect(renderStarsScore('92,10%')).toBeCloseTo(92.1);
    });

    it('returns null for empty input', () => {
        expect(renderStarsScore(null)).toBeNull();
        expect(renderStarsScore('')).toBeNull();
    });

    it('parses whole number scores', () => {
        expect(renderStarsScore('80,00%')).toBeCloseTo(80.0);
    });
});
