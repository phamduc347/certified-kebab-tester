/**
 * Unit tests for number parsing and formatting functions.
 * Tests: parsePercentNumber, parseEuroNumber, formatPercentNumber, formatEuroNumber, normalizeSpotScoreDisplay
 */
import { describe, it, expect } from 'vitest';
import {
    parsePercentNumber,
    parseEuroNumber,
    formatPercentNumber,
    formatEuroNumber,
    normalizeSpotScoreDisplay
} from '../../assets/js/utils.js';

// ── parsePercentNumber ───────────────────────────────────────────────────────
describe('parsePercentNumber', () => {
    it('parses German percent format with comma', () => {
        expect(parsePercentNumber('92,50%')).toBeCloseTo(92.5);
    });

    it('parses percent string without percent sign', () => {
        expect(parsePercentNumber('85,00')).toBeCloseTo(85.0);
    });

    it('parses standard dot-decimal format', () => {
        expect(parsePercentNumber('90.80%')).toBeCloseTo(90.8);
    });

    it('returns 0 for empty input', () => {
        expect(parsePercentNumber('')).toBe(0);
    });

    it('returns 0 for null input', () => {
        expect(parsePercentNumber(null)).toBe(0);
    });

    it('returns 0 for undefined input', () => {
        expect(parsePercentNumber(undefined)).toBe(0);
    });

    it('handles numeric input', () => {
        expect(parsePercentNumber(75)).toBeCloseTo(75);
    });

    it('parses very high percent values', () => {
        expect(parsePercentNumber('99,99%')).toBeCloseTo(99.99);
    });

    it('parses very low percent values', () => {
        expect(parsePercentNumber('0,01%')).toBeCloseTo(0.01);
    });
});

// ── parseEuroNumber ─────────────────────────────────────────────────────────
describe('parseEuroNumber', () => {
    it('parses German euro format with comma and symbol', () => {
        expect(parseEuroNumber('7,40 €')).toBeCloseTo(7.4);
    });

    it('parses euro format without space before symbol', () => {
        expect(parseEuroNumber('12,99€')).toBeCloseTo(12.99);
    });

    it('parses standard dot-decimal format', () => {
        expect(parseEuroNumber('5.50')).toBeCloseTo(5.5);
    });

    it('parses price string without euro symbol', () => {
        expect(parseEuroNumber('9,95')).toBeCloseTo(9.95);
    });

    it('returns 0 for empty input', () => {
        expect(parseEuroNumber('')).toBe(0);
    });

    it('returns 0 for null input', () => {
        expect(parseEuroNumber(null)).toBe(0);
    });

    it('returns 0 for undefined input', () => {
        expect(parseEuroNumber(undefined)).toBe(0);
    });

    it('handles numeric input', () => {
        expect(parseEuroNumber(15.5)).toBeCloseTo(15.5);
    });

    it('parses very high euro values', () => {
        expect(parseEuroNumber('99,99 €')).toBeCloseTo(99.99);
    });

    it('parses zero euro', () => {
        expect(parseEuroNumber('0,00 €')).toBe(0);
    });

    it('ignores multiple spaces around symbol', () => {
        expect(parseEuroNumber('10,50   €')).toBeCloseTo(10.5);
    });
});

// ── formatPercentNumber ──────────────────────────────────────────────────────
describe('formatPercentNumber', () => {
    it('formats number to German percent format', () => {
        expect(formatPercentNumber(92.5)).toBe('92,50%');
    });

    it('formats integer to percent with two decimals', () => {
        expect(formatPercentNumber(80)).toBe('80,00%');
    });

    it('formats small decimal values', () => {
        expect(formatPercentNumber(0.1)).toBe('0,10%');
    });

    it('handles null by formatting as 0', () => {
        expect(formatPercentNumber(null)).toBe('0,00%');
    });

    it('handles undefined by formatting as 0', () => {
        expect(formatPercentNumber(undefined)).toBe('0,00%');
    });

    it('formats high percentages', () => {
        expect(formatPercentNumber(99.99)).toBe('99,99%');
    });

    it('formats zero', () => {
        expect(formatPercentNumber(0)).toBe('0,00%');
    });

    it('rounds to two decimal places', () => {
        expect(formatPercentNumber(92.556)).toBe('92,56%');
    });
});

// ── formatEuroNumber ────────────────────────────────────────────────────────
describe('formatEuroNumber', () => {
    it('formats number to German euro format', () => {
        expect(formatEuroNumber(7.4)).toBe('7,40 €');
    });

    it('formats integer to euro with two decimals', () => {
        expect(formatEuroNumber(15)).toBe('15,00 €');
    });

    it('formats small decimal values', () => {
        expect(formatEuroNumber(0.05)).toBe('0,05 €');
    });

    it('handles null by formatting as 0', () => {
        expect(formatEuroNumber(null)).toBe('0,00 €');
    });

    it('handles undefined by formatting as 0', () => {
        expect(formatEuroNumber(undefined)).toBe('0,00 €');
    });

    it('formats high euro values', () => {
        expect(formatEuroNumber(99.99)).toBe('99,99 €');
    });

    it('formats zero', () => {
        expect(formatEuroNumber(0)).toBe('0,00 €');
    });

    it('rounds to two decimal places', () => {
        expect(formatEuroNumber(12.556)).toBe('12,56 €');
    });
});

// ── normalizeSpotScoreDisplay ────────────────────────────────────────────────
describe('normalizeSpotScoreDisplay', () => {
    it('multiplies 10-point score (≤10) by 10 to get percentage', () => {
        expect(normalizeSpotScoreDisplay('8,5')).toBe('85,00%');
    });

    it('leaves already-percentage scores (>10) unchanged', () => {
        expect(normalizeSpotScoreDisplay('92,50%')).toBe('92,50%');
    });

    it('handles score of 10 exactly', () => {
        expect(normalizeSpotScoreDisplay('10')).toBe('100,00%');
    });

    it('handles score of 1', () => {
        expect(normalizeSpotScoreDisplay('1')).toBe('10,00%');
    });

    it('returns 0,00% for null/undefined', () => {
        expect(normalizeSpotScoreDisplay(null)).toBe('0,00%');
        expect(normalizeSpotScoreDisplay(undefined)).toBe('0,00%');
    });

    it('handles German decimal format', () => {
        expect(normalizeSpotScoreDisplay('7,2')).toBe('72,00%');
    });

    it('handles scores with percent sign', () => {
        expect(normalizeSpotScoreDisplay('95,00%')).toBe('95,00%');
    });

    it('handles edge case of 0 score', () => {
        expect(normalizeSpotScoreDisplay('0')).toBe('0,00%');
    });
});
