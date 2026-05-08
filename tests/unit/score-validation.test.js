/**
 * Unit tests for score input validation and parsing.
 */
import { describe, it, expect } from 'vitest';
import { parseScoreInput, getTodayIsoDate } from '../../assets/js/utils.js';

// ── parseScoreInput ──────────────────────────────────────────────────────────
describe('parseScoreInput', () => {
    it('parses valid single digit score (1-10)', () => {
        expect(parseScoreInput('5')).toBe(5);
        expect(parseScoreInput('1')).toBe(1);
        expect(parseScoreInput('10')).toBe(10);
    });

    it('parses valid scores with German comma decimal', () => {
        expect(parseScoreInput('8,5')).toBe(8.5);
        expect(parseScoreInput('7,2')).toBe(7.2);
        expect(parseScoreInput('9,9')).toBe(9.9);
    });

    it('parses valid scores with dot decimal', () => {
        expect(parseScoreInput('8.5')).toBe(8.5);
        expect(parseScoreInput('7.2')).toBe(7.2);
    });

    it('accepts "10" and "10,0" and "10.0" formats', () => {
        expect(parseScoreInput('10')).toBe(10);
        expect(parseScoreInput('10,0')).toBe(10);
        expect(parseScoreInput('10.0')).toBe(10);
    });

    it('rejects scores below 1', () => {
        expect(parseScoreInput('0')).toBeNaN();
        expect(parseScoreInput('0,5')).toBeNaN();
        expect(parseScoreInput('0.9')).toBeNaN();
    });

    it('rejects scores above 10', () => {
        expect(parseScoreInput('11')).toBeNaN();
        expect(parseScoreInput('10,5')).toBeNaN();
        expect(parseScoreInput('15')).toBeNaN();
    });

    it('rejects non-numeric input', () => {
        expect(parseScoreInput('abc')).toBeNaN();
        expect(parseScoreInput('')).toBeNaN();
        expect(parseScoreInput(null)).toBeNaN();
    });

    it('rejects multiple decimal places', () => {
        expect(parseScoreInput('8,55')).toBeNaN();
        expect(parseScoreInput('7.123')).toBeNaN();
    });

    it('handles whitespace (trims before parsing)', () => {
        // The function trims input before regex matching
        expect(parseScoreInput('  8,5  ')).toBe(8.5);
    });

    it('returns precise decimal values', () => {
        const result = parseScoreInput('8,5');
        expect(result).toBe(8.5);
        expect((result * 10) % 1).toBe(0); // No floating point errors
    });

    it('handles exact boundary values', () => {
        expect(parseScoreInput('1,0')).toBe(1);
        expect(parseScoreInput('10,0')).toBe(10);
        expect(parseScoreInput('1')).toBe(1);
        expect(parseScoreInput('10')).toBe(10);
    });

    it('rejects scores with multiple decimals', () => {
        expect(parseScoreInput('8,5,5')).toBeNaN();
    });

    it('rejects mixed separators', () => {
        expect(parseScoreInput('8,5.')).toBeNaN();
        expect(parseScoreInput('8.5,')).toBeNaN();
    });
});
