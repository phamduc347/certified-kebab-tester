import { describe, expect, it } from 'vitest';

function getRemainingKiAttempts(count) {
    return Math.max(0, 10 - count);
}

describe('KI Schreibhilfe attempts limit', () => {
    it('initializes to max attempts (10) when count is 0', () => {
        expect(getRemainingKiAttempts(0)).toBe(10);
    });

    it('decrements attempts correctly based on count', () => {
        expect(getRemainingKiAttempts(1)).toBe(9);
        expect(getRemainingKiAttempts(5)).toBe(5);
        expect(getRemainingKiAttempts(9)).toBe(1);
        expect(getRemainingKiAttempts(10)).toBe(0);
    });

    it('never drops below 0 attempts', () => {
        expect(getRemainingKiAttempts(11)).toBe(0);
        expect(getRemainingKiAttempts(20)).toBe(0);
    });
});
