/**
 * Unit tests for computeCommunityOnlySpot — a synthetic spot built
 * purely from community reviews when no base spot exists.
 *
 * The production version in assets/js/utils.js has runtime references
 * to helpers that only exist inside script.js (getLatestCommunityReview,
 * generateStableSpotId, formatVisitDate, …). Following the existing pattern
 * in spot-merge.test.js we replicate the function in-file with the
 * required helpers so the business logic can be tested in isolation.
 */
import { describe, it, expect } from 'vitest';

// ── Helpers (mirror utils.js) ────────────────────────────────────────────────
function parsePercentNumber(value) {
    return Number.parseFloat(String(value || '').replace(',', '.').replace('%', '')) || 0;
}
function parseEuroNumber(value) {
    return Number.parseFloat(String(value || '').replace(',', '.').replace('€', '').replace(/\s/g, '')) || 0;
}
function formatPercentNumber(value) {
    return `${Number(value || 0).toFixed(2).replace('.', ',')}%`;
}
function formatEuroNumber(value) {
    return `${Number(value || 0).toFixed(2).replace('.', ',')} €`;
}
function formatVisitDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return '';
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function generateStableSpotId(name, city) {
    const str = `${String(name || '').trim().toLowerCase()}|${String(city || '').trim().toLowerCase()}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash) + 100000;
}
function getLatestCommunityReview(reviews) {
    if (!Array.isArray(reviews) || reviews.length === 0) return null;
    return [...reviews].sort((a, b) => {
        const ta = new Date(a.created_at || a.visit_date || 0).getTime();
        const tb = new Date(b.created_at || b.visit_date || 0).getTime();
        return tb - ta;
    })[0];
}

// ── Replicated function (mirror utils.js) ────────────────────────────────────
function computeCommunityOnlySpot(reviews) {
    const criteria = ['fleisch', 'gemuese', 'sosse', 'brot', 'balance', 'auswahl', 'portion', 'hygiene', 'service'];
    const first = reviews[0] || {};
    const latestReview = getLatestCommunityReview(reviews) || first;
    const generatedId = generateStableSpotId(first.spot_name, first.city);

    const generated = {
        id: generatedId,
        name: String(first.spot_name || 'Neuer Spot').trim() || 'Neuer Spot',
        city: String(first.city || '-').trim() || '-',
        dish: String(first.dish || '-').trim() || '-',
        preis: '-',
        plIndex: '-',
        score: '0,00%',
        rank: 0,
        stars: '☆☆☆☆☆',
        verzehrort: String(first.verzehrort || '-').trim() || '-',
        image: String(first.image_url || 'kebab_spot_demo.png').trim() || 'kebab_spot_demo.png',
        kommentar: String(first.comment_text || '').trim(),
        date: formatVisitDate(latestReview.visit_date) || formatVisitDate(first.visit_date),
        lastVisitReviewerName: String(latestReview.reviewer_name || '').trim(),
        besuche: reviews.length
    };

    criteria.forEach((key) => {
        const avg = reviews.reduce((sum, r) => sum + (Number(r[key]) || 0), 0) / reviews.length;
        generated[key] = Number(avg.toFixed(1));
    });

    const avgAcrossCriteria = criteria.reduce((sum, k) => sum + (Number(generated[k]) || 0), 0) / criteria.length;
    generated.score = formatPercentNumber(avgAcrossCriteria * 10);

    const latestPrice = parseEuroNumber(latestReview.preis);
    if (Number.isFinite(latestPrice) && latestPrice > 0) {
        generated.preis = formatEuroNumber(latestPrice);
        generated.plIndex = formatPercentNumber(parsePercentNumber(generated.score) / latestPrice);
    }
    return generated;
}

// ── Test data ────────────────────────────────────────────────────────────────
function makeReview(overrides = {}) {
    return {
        spot_name: 'Test Kebab',
        city: 'Berlin',
        dish: 'Döner',
        verzehrort: 'Vor Ort',
        image_url: 'test.jpg',
        comment_text: 'Lecker',
        reviewer_name: 'Anon',
        visit_date: '2026-05-01',
        created_at: '2026-05-01T12:00:00Z',
        preis: '7,50 €',
        fleisch: 8, gemuese: 8, sosse: 8, brot: 8, balance: 8,
        auswahl: 8, portion: 8, hygiene: 8, service: 8,
        ...overrides
    };
}

// ── Tests ────────────────────────────────────────────────────────────────────
describe('computeCommunityOnlySpot', () => {
    it('builds a spot from a single review', () => {
        const result = computeCommunityOnlySpot([makeReview()]);
        expect(result.name).toBe('Test Kebab');
        expect(result.city).toBe('Berlin');
        expect(result.besuche).toBe(1);
    });

    it('uses generateStableSpotId-derived numeric id (>=100000)', () => {
        const result = computeCommunityOnlySpot([makeReview()]);
        expect(Number.isInteger(result.id)).toBe(true);
        expect(result.id).toBeGreaterThanOrEqual(100000);
    });

    it('returns identical id for identical name/city across calls', () => {
        const a = computeCommunityOnlySpot([makeReview()]);
        const b = computeCommunityOnlySpot([makeReview({ visit_date: '2026-06-01' })]);
        expect(a.id).toBe(b.id);
    });

    it('averages criteria across multiple reviews and rounds to 1 decimal', () => {
        const reviews = [
            makeReview({ fleisch: 8 }),
            makeReview({ fleisch: 9 })
        ];
        const result = computeCommunityOnlySpot(reviews);
        expect(result.fleisch).toBe(8.5);
        expect(result.besuche).toBe(2);
    });

    it('produces score = avg(criteria) * 10 in German percent format', () => {
        const result = computeCommunityOnlySpot([makeReview()]); // all 8s
        expect(result.score).toBe('80,00%');
    });

    it('returns 100,00% score when all criteria are 10', () => {
        const review = makeReview({
            fleisch: 10, gemuese: 10, sosse: 10, brot: 10, balance: 10,
            auswahl: 10, portion: 10, hygiene: 10, service: 10
        });
        const result = computeCommunityOnlySpot([review]);
        expect(result.score).toBe('100,00%');
    });

    it('uses latest review price for preis and plIndex when valid', () => {
        const reviews = [
            makeReview({ preis: '5,00 €', created_at: '2026-01-01T00:00:00Z' }),
            makeReview({ preis: '8,00 €', created_at: '2026-06-01T00:00:00Z' })
        ];
        const result = computeCommunityOnlySpot(reviews);
        expect(result.preis).toBe('8,00 €');
        expect(result.plIndex).toMatch(/^\d+,\d{2}%$/);
    });

    it('keeps preis and plIndex as "-" when latest review price is missing or 0', () => {
        const result = computeCommunityOnlySpot([makeReview({ preis: '' })]);
        expect(result.preis).toBe('-');
        expect(result.plIndex).toBe('-');
    });

    it('falls back to "Neuer Spot" / "-" for missing string fields', () => {
        const result = computeCommunityOnlySpot([{
            fleisch: 5, gemuese: 5, sosse: 5, brot: 5, balance: 5,
            auswahl: 5, portion: 5, hygiene: 5, service: 5
        }]);
        expect(result.name).toBe('Neuer Spot');
        expect(result.city).toBe('-');
        expect(result.dish).toBe('-');
        expect(result.verzehrort).toBe('-');
    });

    it('uses the latest review for date and reviewer name', () => {
        const reviews = [
            makeReview({ created_at: '2026-01-01T00:00:00Z', visit_date: '2026-01-01', reviewer_name: 'Alice' }),
            makeReview({ created_at: '2026-06-01T00:00:00Z', visit_date: '2026-06-01', reviewer_name: 'Bob' })
        ];
        const result = computeCommunityOnlySpot(reviews);
        expect(result.lastVisitReviewerName).toBe('Bob');
        expect(result.date).toBe('01.06.2026');
    });

    it('counts besuche equal to number of reviews', () => {
        const reviews = [makeReview(), makeReview(), makeReview()];
        const result = computeCommunityOnlySpot(reviews);
        expect(result.besuche).toBe(3);
    });

    it('uses default placeholder image when image_url is missing', () => {
        const result = computeCommunityOnlySpot([makeReview({ image_url: '' })]);
        expect(result.image).toBe('kebab_spot_demo.png');
    });
});
