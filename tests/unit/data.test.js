/**
 * Unit tests validating the integrity and structure of kebab-data.js.
 * Acts as a data schema and regression guard — e.g. catches typos like
 * "Gamisch" and duplicate/inconsistent rank values.
 */
import { describe, it, expect } from 'vitest';
import { loadKebabData } from '../helpers/load-data.js';

const { kebabData, upcomingSpots } = loadKebabData();

const REQUIRED_SPOT_FIELDS = [
    'id', 'name', 'city', 'dish',
    'fleisch', 'gemuese', 'sosse', 'brot',
    'balance', 'auswahl', 'portion', 'hygiene', 'service',
    'score', 'rank', 'preis', 'plIndex', 'date', 'besuche'
];

const NUMERIC_CRITERIA_FIELDS = [
    'fleisch', 'gemuese', 'sosse', 'brot',
    'balance', 'auswahl', 'portion', 'hygiene', 'service'
];

const DATE_REGEX = /^\d{2}\.\d{2}\.\d{4}$/;
const SCORE_REGEX = /^\d{1,3},\d{1,2}%$/;

// ── Array integrity ──────────────────────────────────────────────────────────
describe('kebabData array integrity', () => {
    it('is a non-empty array', () => {
        expect(Array.isArray(kebabData)).toBe(true);
        expect(kebabData.length).toBeGreaterThan(0);
    });

    it('has no duplicate IDs', () => {
        const ids = kebabData.map(s => s.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
    });

    it('all IDs are positive integers', () => {
        kebabData.forEach(spot => {
            expect(Number.isInteger(spot.id)).toBe(true);
            expect(spot.id).toBeGreaterThan(0);
        });
    });
});

// ── Required fields ──────────────────────────────────────────────────────────
describe('kebabData required fields', () => {
    REQUIRED_SPOT_FIELDS.forEach(field => {
        it(`every spot has a "${field}" field`, () => {
            kebabData.forEach(spot => {
                expect(spot[field]).toBeDefined();
                expect(spot[field]).not.toBeNull();
            });
        });
    });
});

// ── Numeric criteria validation ──────────────────────────────────────────────
describe('kebabData numeric criteria scores', () => {
    NUMERIC_CRITERIA_FIELDS.forEach(field => {
        it(`"${field}" is a finite number between 1 and 10`, () => {
            kebabData.forEach(spot => {
                const val = spot[field];
                expect(typeof val).toBe('number');
                expect(isFinite(val)).toBe(true);
                expect(val).toBeGreaterThanOrEqual(1);
                expect(val).toBeLessThanOrEqual(10);
            });
        });
    });
});

// ── Score string format ──────────────────────────────────────────────────────
describe('kebabData score string format', () => {
    it('score matches "XX,XX%" format', () => {
        kebabData.forEach(spot => {
            expect(spot.score).toMatch(SCORE_REGEX);
        });
    });

    it('plIndex matches "XX,XX%" format', () => {
        kebabData.forEach(spot => {
            expect(spot.plIndex).toMatch(SCORE_REGEX);
        });
    });
});

// ── Date format ──────────────────────────────────────────────────────────────
describe('kebabData date format', () => {
    it('date matches "DD.MM.YYYY" format', () => {
        kebabData.forEach(spot => {
            expect(spot.date).toMatch(DATE_REGEX);
        });
    });

    it('date parses to a valid Date object', () => {
        kebabData.forEach(spot => {
            const [day, month, year] = spot.date.split('.');
            const d = new Date(`${year}-${month}-${day}`);
            expect(isNaN(d.getTime())).toBe(false);
        });
    });
});

// ── Rank consistency ─────────────────────────────────────────────────────────
describe('kebabData rank consistency', () => {
    it('rank values are positive integers', () => {
        kebabData.forEach(spot => {
            expect(Number.isInteger(spot.rank)).toBe(true);
            expect(spot.rank).toBeGreaterThan(0);
        });
    });

    it('score-based ordering aligns with rank (no two spots with different scores share a rank unless tied)', () => {
        const parseScore = s => parseFloat(String(s).replace(',', '.').replace('%', '')) || 0;
        const sorted = [...kebabData].sort((a, b) => parseScore(b.score) - parseScore(a.score));

        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];
            const sameScore = parseScore(current.score) === parseScore(next.score);
            if (!sameScore) {
                // Different scores must not have the same rank
                expect(current.rank).not.toBe(next.rank);
                // Higher score must have a lower (better) rank number
                expect(current.rank).toBeLessThan(next.rank);
            }
        }
    });
});

// ── Known city names (regression test) ──────────────────────────────────────
describe('kebabData city name regressions', () => {
    it('no spot has city "Gamisch-Partenkirchen" (typo regression)', () => {
        const typoSpot = kebabData.find(s => s.city === 'Gamisch-Partenkirchen');
        expect(typoSpot).toBeUndefined();
    });

    it('Garmisch-Partenkirchen is spelled correctly', () => {
        const spot = kebabData.find(s => s.city === 'Garmisch-Partenkirchen');
        expect(spot).toBeDefined();
    });
});

// ── upcomingSpots ────────────────────────────────────────────────────────────
describe('upcomingSpots array integrity', () => {
    it('is an array', () => {
        expect(Array.isArray(upcomingSpots)).toBe(true);
    });

    it('every entry has name, city, and description', () => {
        upcomingSpots.forEach(spot => {
            expect(spot.name).toBeDefined();
            expect(spot.city).toBeDefined();
            expect(spot.description).toBeDefined();
        });
    });
});
