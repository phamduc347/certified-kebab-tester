/**
 * Unit tests for community review aggregation functions.
 */
import { describe, it, expect } from 'vitest';
import { buildCommunityAverage } from '../../assets/js/utils.js';

// ── buildCommunityAverage ────────────────────────────────────────────────────
describe('buildCommunityAverage', () => {
    it('calculates average of all rating criteria', () => {
        const review = {
            fleisch: 8,
            gemuese: 7,
            sosse: 9,
            brot: 8,
            balance: 7,
            auswahl: 6,
            portion: 8,
            hygiene: 9,
            service: 7
        };
        const avg = buildCommunityAverage(review);
        expect(parseFloat(avg)).toBeCloseTo(7.7, 1);
    });

    it('returns formatted string with one decimal place', () => {
        const review = {
            fleisch: 5,
            gemuese: 5,
            sosse: 5,
            brot: 5,
            balance: 5,
            auswahl: 5,
            portion: 5,
            hygiene: 5,
            service: 5
        };
        const result = buildCommunityAverage(review);
        expect(result).toMatch(/^\d+\.\d$/);
    });

    it('handles perfect scores (all 10s)', () => {
        const review = {
            fleisch: 10,
            gemuese: 10,
            sosse: 10,
            brot: 10,
            balance: 10,
            auswahl: 10,
            portion: 10,
            hygiene: 10,
            service: 10
        };
        const result = buildCommunityAverage(review);
        expect(parseFloat(result)).toBe(10);
    });

    it('handles minimum scores (all 1s)', () => {
        const review = {
            fleisch: 1,
            gemuese: 1,
            sosse: 1,
            brot: 1,
            balance: 1,
            auswahl: 1,
            portion: 1,
            hygiene: 1,
            service: 1
        };
        const result = buildCommunityAverage(review);
        expect(parseFloat(result)).toBe(1);
    });

    it('ignores missing criteria fields', () => {
        const review = {
            fleisch: 8,
            gemuese: 8,
            sosse: 8,
            brot: 8,
            balance: 8,
            auswahl: 8,
            portion: 8
            // hygiene and service missing
        };
        const result = buildCommunityAverage(review);
        expect(parseFloat(result)).toBeCloseTo(8, 1);
    });

    it('ignores non-numeric criteria values', () => {
        const review = {
            fleisch: 8,
            gemuese: 'invalid',
            sosse: 8,
            brot: 8,
            balance: 8,
            auswahl: 8,
            portion: 8,
            hygiene: 8,
            service: 8
        };
        const result = buildCommunityAverage(review);
        // Average of: 8,8,8,8,8,8,8,8 = 8.0
        expect(parseFloat(result)).toBeCloseTo(8, 0);
    });

    it('throws error for null review (defensive)', () => {
        const review = null;
        expect(() => buildCommunityAverage(review)).toThrow();
    });

    it('handles empty review object', () => {
        const review = {};
        const result = buildCommunityAverage(review);
        expect(result).toBe('0.0');
    });

    it.skip('handles mixed valid and undefined values', () => {
        const review = {
            fleisch: 8,
            gemuese: undefined,
            sosse: 9,
            brot: 8,
            balance: 10,
            auswahl: 7,
            portion: 8,
            hygiene: 9,
            service: 8
        };
        const result = buildCommunityAverage(review);
        // undefined converts to 0, average = (8+0+9+8+10+7+8+9+8)/9 = 67/9 ≈ 7.444
        expect(parseFloat(result)).toMatch(/^7\./);
    });

    it('handles decimal score values', () => {
        const review = {
            fleisch: 8.5,
            gemuese: 7.5,
            sosse: 8.0,
            brot: 7.0,
            balance: 8.5,
            auswahl: 7.5,
            portion: 8.0,
            hygiene: 8.5,
            service: 7.5
        };
        const result = buildCommunityAverage(review);
        expect(parseFloat(result)).toBeCloseTo(8.0, 0);
    });

    it('formats result to exactly one decimal place', () => {
        const review = {
            fleisch: 8,
            gemuese: 7,
            sosse: 9,
            brot: 8,
            balance: 7,
            auswahl: 6,
            portion: 8,
            hygiene: 9,
            service: 7
        };
        const result = buildCommunityAverage(review);
        const parts = result.split('.');
        expect(parts.length).toBe(2);
        expect(parts[1].length).toBe(1);
    });
});
