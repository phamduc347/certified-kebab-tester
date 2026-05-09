/**
 * Unit tests for spot key building and date formatting functions.
 */
import { describe, it, expect } from 'vitest';
import {
    buildSpotKey,
    formatVisitDate,
    getTodayIsoDate
} from '../../assets/js/utils.js';

// ── buildSpotKey ────────────────────────────────────────────────────────────
describe('buildSpotKey', () => {
    it('creates lowercase key from name and city', () => {
        expect(buildSpotKey('Döner King', 'Berlin')).toBe('döner king|berlin');
    });

    it('trims whitespace from name and city', () => {
        expect(buildSpotKey('  Kebab House  ', '  Munich  ')).toBe('kebab house|munich');
    });

    it('handles special characters in city name', () => {
        expect(buildSpotKey('Rüyam', 'Düsseldorf')).toBe('rüyam|düsseldorf');
    });

    it('creates unique keys for different combinations', () => {
        const key1 = buildSpotKey('Kebab House', 'Berlin');
        const key2 = buildSpotKey('Kebab House', 'Munich');
        expect(key1).not.toBe(key2);
    });

    it('handles null name gracefully', () => {
        expect(buildSpotKey(null, 'Berlin')).toBe('|berlin');
    });

    it('handles null city gracefully', () => {
        expect(buildSpotKey('Kebab House', null)).toBe('kebab house|');
    });

    it('handles both null gracefully', () => {
        expect(buildSpotKey(null, null)).toBe('|');
    });

    it('case-insensitive matching for same spot', () => {
        const key1 = buildSpotKey('KEBAB HOUSE', 'BERLIN');
        const key2 = buildSpotKey('kebab house', 'berlin');
        expect(key1).toBe(key2);
    });

    it('handles numeric input', () => {
        expect(buildSpotKey(123, 456)).toBe('123|456');
    });

    it('handles empty strings', () => {
        expect(buildSpotKey('', '')).toBe('|');
    });
});

// ── formatVisitDate ─────────────────────────────────────────────────────────
describe('formatVisitDate', () => {
    it('formats ISO date to German DD.MM.YYYY format', () => {
        // Note: This test depends on system locale/timezone. Adjust if needed.
        const result = formatVisitDate('2026-05-08');
        expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    });

    it('returns empty string for null input', () => {
        expect(formatVisitDate(null)).toBe('');
    });

    it('returns empty string for undefined input', () => {
        expect(formatVisitDate(undefined)).toBe('');
    });

    it('returns empty string for empty string', () => {
        expect(formatVisitDate('')).toBe('');
    });

    it('returns empty string for invalid date', () => {
        expect(formatVisitDate('invalid-date')).toBe('');
    });

    it('returns empty string for malformed ISO date', () => {
        expect(formatVisitDate('2026-13-32')).toBe('');
    });

    it('handles ISO date with time component', () => {
        const result = formatVisitDate('2026-05-08T14:30:00');
        expect(result).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    });

    it('handles date at end of month', () => {
        const result = formatVisitDate('2026-05-31');
        expect(result).toBe('31.05.2026');
    });

    it('handles date at start of year', () => {
        const result = formatVisitDate('2026-01-01');
        expect(result).toBe('01.01.2026');
    });

    it('handles leap year date', () => {
        const result = formatVisitDate('2024-02-29');
        expect(result).toBe('29.02.2024');
    });
});

// ── getTodayIsoDate ─────────────────────────────────────────────────────────
describe('getTodayIsoDate', () => {
    it('returns date in YYYY-MM-DD format', () => {
        const result = getTodayIsoDate();
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('returns a valid ISO date that can be parsed', () => {
        const result = getTodayIsoDate();
        const date = new Date(result);
        expect(date.toString()).not.toBe('Invalid Date');
    });

    it('returns current date (approximately)', () => {
        const result = getTodayIsoDate();
        const now = new Date();
        const year = String(now.getFullYear());
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const expected = `${year}-${month}-${day}`;
        expect(result).toBe(expected);
    });

    it('returns date with proper padding (e.g., 01 not 1)', () => {
        const result = getTodayIsoDate();
        const parts = result.split('-');
        expect(parts[0].length).toBe(4); // year
        expect(parts[1].length).toBe(2); // month
        expect(parts[2].length).toBe(2); // day
    });
});
