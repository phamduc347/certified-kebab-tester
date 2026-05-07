/**
 * Unit tests for the Spotlight section logic.
 * Covers: date sorting, score sorting, null-safety for missing fields,
 * and the Dresden fallback for the bestDresden spotlight item.
 */
import { describe, it, expect } from 'vitest';
import { loadKebabData } from '../helpers/load-data.js';

const { kebabData } = loadKebabData();

import {
    parseVal as parseScore,
    parseDateDDMMYYYY as parseDate
} from '../../assets/js/utils.js';

function buildSpotlightItems(data) {
    if (!data || data.length === 0) return [];

    const sortedByDate = [...data].sort((a, b) => parseDate(b.date) - parseDate(a.date));
    const sortedByScore = [...data].sort((a, b) => parseScore(b.score) - parseScore(a.score));
    const sortedByPL = [...data].sort((a, b) => parseScore(b.plIndex) - parseScore(a.plIndex));
    const dresdenSpots = [...data].filter(s => s.city === 'Dresden').sort((a, b) => parseScore(b.score) - parseScore(a.score));
    const bestDresden = dresdenSpots[0] || sortedByScore[0];

    return [
        { spot: sortedByDate[0], label: 'LATEST TEST' },
        { spot: sortedByScore[0], label: 'ALL-TIME BEST' },
        { spot: sortedByPL[0], label: 'VALUE CHAMPION' },
        { spot: bestDresden, label: "DRESDEN'S HERO" },
        { spot: sortedByScore[sortedByScore.length - 1], label: 'BOTTOM RANK' },
    ].filter(item => item.spot != null);
}

// ── Tests ─────────────────────────────────────────────────────────────────────
describe('parseDate', () => {
    it('parses a valid date string correctly', () => {
        const d = parseDate('28.02.2026');
        expect(d.getFullYear()).toBe(2026);
        expect(d.getMonth()).toBe(1); // 0-indexed → February
        expect(d.getDate()).toBe(28);
    });

    it('returns epoch for null input', () => {
        expect(parseDate(null).getTime()).toBe(0);
    });

    it('returns epoch for undefined input', () => {
        expect(parseDate(undefined).getTime()).toBe(0);
    });

    it('returns epoch for malformed date string', () => {
        expect(parseDate('not-a-date').getTime()).toBe(0);
        expect(parseDate('2026/02/28').getTime()).toBe(0);
    });

    it('returns epoch for empty string', () => {
        expect(parseDate('').getTime()).toBe(0);
    });
});

describe('buildSpotlightItems with real kebabData', () => {
    it('returns 5 spotlight items from full dataset', () => {
        const items = buildSpotlightItems(kebabData);
        expect(items).toHaveLength(5);
    });

    it('no item has an undefined spot', () => {
        const items = buildSpotlightItems(kebabData);
        items.forEach(item => {
            expect(item.spot).toBeDefined();
            expect(item.spot).not.toBeNull();
        });
    });

    it('LATEST TEST is the most recently dated spot', () => {
        const items = buildSpotlightItems(kebabData);
        const latestItem = items.find(i => i.label === 'LATEST TEST');
        expect(latestItem).toBeDefined();

        // Verify it is actually the most recent
        const latestDate = parseDate(latestItem.spot.date);
        kebabData.forEach(spot => {
            expect(parseDate(spot.date).getTime()).toBeLessThanOrEqual(latestDate.getTime());
        });
    });

    it('ALL-TIME BEST has the highest score', () => {
        const items = buildSpotlightItems(kebabData);
        const best = items.find(i => i.label === 'ALL-TIME BEST');
        expect(best).toBeDefined();

        const topScore = parseScore(best.spot.score);
        kebabData.forEach(spot => {
            expect(parseScore(spot.score)).toBeLessThanOrEqual(topScore);
        });
    });

    it('BOTTOM RANK has the lowest score', () => {
        const items = buildSpotlightItems(kebabData);
        const bottom = items.find(i => i.label === 'BOTTOM RANK');
        expect(bottom).toBeDefined();

        const bottomScore = parseScore(bottom.spot.score);
        kebabData.forEach(spot => {
            expect(parseScore(spot.score)).toBeGreaterThanOrEqual(bottomScore);
        });
    });

    it("DRESDEN'S HERO is a Dresden spot", () => {
        const items = buildSpotlightItems(kebabData);
        const hero = items.find(i => i.label === "DRESDEN'S HERO");
        expect(hero).toBeDefined();
        expect(hero.spot.city).toBe('Dresden');
    });
});

describe('buildSpotlightItems edge cases', () => {
    it('returns empty array for empty input', () => {
        const items = buildSpotlightItems([]);
        expect(items).toHaveLength(0);
    });

    it('does not crash when a spot has no date', () => {
        const dataWithMissingDate = [
            { id: 99, name: 'Test Spot', city: 'Dresden', date: null, score: '80,00%', plIndex: '10,00%' }
        ];
        expect(() => buildSpotlightItems(dataWithMissingDate)).not.toThrow();
    });

    it('falls back to top-ranked spot when no Dresden spots exist', () => {
        const noDresden = kebabData.filter(s => s.city !== 'Dresden');
        if (noDresden.length === 0) return; // Skip if all are Dresden

        const items = buildSpotlightItems(noDresden);
        const hero = items.find(i => i.label === "DRESDEN'S HERO");

        // Fallback: the hero should still be defined (= global top-ranked spot)
        expect(hero).toBeDefined();
        expect(hero.spot).toBeDefined();
    });

    it('does not crash with a single spot', () => {
        const single = [{ ...kebabData[0] }];
        let items;
        expect(() => { items = buildSpotlightItems(single); }).not.toThrow();
        // With a single spot, multiple spotlight items will reference the same spot —
        // that is valid behaviour. At minimum 1 item must be returned.
        expect(items.length).toBeGreaterThanOrEqual(1);
    });
});
