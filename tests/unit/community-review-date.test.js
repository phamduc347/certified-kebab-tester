import { describe, expect, it } from 'vitest';

function isFutureVisitDate(value, today) {
    const raw = String(value || '').trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        return false;
    }

    return raw > today;
}

describe('community review visit date validation', () => {
    it('accepts a visit date from today', () => {
        expect(isFutureVisitDate('2026-05-06', '2026-05-06')).toBe(false);
    });

    it('accepts a visit date from the past', () => {
        expect(isFutureVisitDate('2026-05-05', '2026-05-06')).toBe(false);
    });

    it('rejects a visit date from the future', () => {
        expect(isFutureVisitDate('2026-05-07', '2026-05-06')).toBe(true);
    });

    it('ignores malformed dates for the future check', () => {
        expect(isFutureVisitDate('06.05.2026', '2026-05-06')).toBe(false);
    });
});