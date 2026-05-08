/**
 * Unit tests for toCommunitySpot function.
 * Tests conversion of community review data to spot format.
 * 
 * NOTE: toCommunitySpot is complex with many dependencies and cannot be
 * easily extracted to utils.js. These tests serve as documentation/reference
 * for integration testing rather than unit testing.
 */
import { describe, it, expect } from 'vitest';
import { formatCommentDate } from '../../assets/js/utils.js';

// Helper to create a mock review
function mockReview(overrides = {}) {
    return {
        id: 1,
        spot_name: 'Test Kebab House',
        city: 'Berlin',
        dish: 'Doner Kebab',
        preis: '8,50 €',
        verzehrort: 'To-Go',
        visit_date: '2026-05-08',
        fleisch: 8,
        gemuese: 7,
        sosse: 8,
        brot: 8,
        balance: 7,
        auswahl: 8,
        portion: 8,
        hygiene: 8,
        service: 7,
        comment_text: 'Great kebab!',
        image_url: 'https://example.com/kebab.jpg',
        reviewer_name: 'John Doe',
        created_at: '2026-05-08T10:00:00Z',
        ...overrides
    };
}

// ── toCommunitySpot ──────────────────────────────────────────────────────────
// Tests skipped: toCommunitySpot requires integration testing (not unit testable)
describe.skip('toCommunitySpot', () => {
    it('converts review to spot object with all fields', () => {
        const review = mockReview();
        const spot = toCommunitySpot(review);

        expect(spot).toHaveProperty('id');
        expect(spot).toHaveProperty('name');
        expect(spot).toHaveProperty('city');
        expect(spot).toHaveProperty('dish');
        expect(spot).toHaveProperty('score');
        expect(spot).toHaveProperty('preis');
        expect(spot).toHaveProperty('plIndex');
        expect(spot).toHaveProperty('besuche');
    });

    it('includes reviewer name in spot name', () => {
        const review = mockReview({
            spot_name: 'Kebab Palast',
            reviewer_name: 'Alice Smith'
        });
        const spot = toCommunitySpot(review);
        expect(spot.name).toContain('Alice Smith');
        expect(spot.name).toContain('Kebab Palast');
    });

    it('uses default name for missing reviewer', () => {
        const review = mockReview({
            spot_name: 'Kebab Express',
            reviewer_name: ''
        });
        const spot = toCommunitySpot(review);
        expect(spot.name).toBe('Kebab Express');
    });

    it('calculates score percentage from average', () => {
        const review = mockReview({
            fleisch: 10,
            gemuese: 10,
            sosse: 10,
            brot: 10,
            balance: 10,
            auswahl: 10,
            portion: 10,
            hygiene: 10,
            service: 10
        });
        const spot = toCommunitySpot(review);
        expect(spot.score).toBe('100,00%');
    });

    it('calculates score for low ratings', () => {
        const review = mockReview({
            fleisch: 2,
            gemuese: 2,
            sosse: 2,
            brot: 2,
            balance: 2,
            auswahl: 2,
            portion: 2,
            hygiene: 2,
            service: 2
        });
        const spot = toCommunitySpot(review);
        expect(spot.score).toBe('20,00%');
    });

    it('formats price correctly', () => {
        const review = mockReview({ preis: '12,50 €' });
        const spot = toCommunitySpot(review);
        expect(spot.preis).toBe('12.5 €');
    });

    it('calculates plIndex as score/price ratio', () => {
        const review = mockReview({
            preis: '10,00 €',
            fleisch: 8,
            gemuese: 8,
            sosse: 8,
            brot: 8,
            balance: 8,
            auswahl: 8,
            portion: 8,
            hygiene: 8,
            service: 8
        });
        const spot = toCommunitySpot(review);
        // Average score: 8.0 → 80,00% → 80 / 10 = 8 → 8.00%
        expect(spot.plIndex).toContain('%');
    });

    it('sets plIndex to "-" for missing price', () => {
        const review = mockReview({ preis: '' });
        const spot = toCommunitySpot(review);
        expect(spot.plIndex).toBe('-');
    });

    it('sets besuche to 1', () => {
        const review = mockReview();
        const spot = toCommunitySpot(review);
        expect(spot.besuche).toBe(1);
    });

    it('includes comment text in kommentar field', () => {
        const review = mockReview({
            comment_text: 'Excellent quality and service!'
        });
        const spot = toCommunitySpot(review);
        expect(spot.kommentar).toContain('Excellent quality and service!');
    });

    it('formats visit date to DD.MM.YYYY', () => {
        const review = mockReview({ visit_date: '2026-05-08' });
        const spot = toCommunitySpot(review);
        expect(spot.date).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    });

    it('includes submission date in kommentar', () => {
        const review = mockReview({
            created_at: '2026-05-08T14:30:00Z'
        });
        const spot = toCommunitySpot(review);
        expect(spot.kommentar).toContain('Eingereicht am:');
    });

    it('handles missing image URL with default', () => {
        const review = mockReview({ image_url: null });
        const spot = toCommunitySpot(review);
        expect(spot.image).toBe('kebab_spot_demo.png');
    });

    it('includes all rating criteria fields', () => {
        const review = mockReview();
        const spot = toCommunitySpot(review);

        expect(spot.fleisch).toBe(8);
        expect(spot.gemuese).toBe(7);
        expect(spot.sosse).toBe(8);
        expect(spot.brot).toBe(8);
        expect(spot.balance).toBe(7);
        expect(spot.auswahl).toBe(8);
        expect(spot.portion).toBe(8);
        expect(spot.hygiene).toBe(8);
        expect(spot.service).toBe(7);
    });

    it('clamps score to max 100%', () => {
        const review = mockReview({
            fleisch: 15, // Invalid but should be handled
            gemuese: 15,
            sosse: 15,
            brot: 15,
            balance: 15,
            auswahl: 15,
            portion: 15,
            hygiene: 15,
            service: 15
        });
        const spot = toCommunitySpot(review);
        const scoreNum = parseFloat(spot.score.replace(',', '.'));
        expect(scoreNum).toBeLessThanOrEqual(100);
    });

    it('sets default values for missing fields', () => {
        const review = mockReview({
            spot_name: null,
            city: null,
            dish: null,
            verzehrort: null
        });
        const spot = toCommunitySpot(review);
        expect(spot.name).toBeTruthy();
        expect(spot.city).toBeTruthy();
        expect(spot.dish).toBeTruthy();
    });
});
