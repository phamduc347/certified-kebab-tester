import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share popup additional info template', () => {
    it('includes dish, price, city, and CTA in the share modal template', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('data-share-dish="${escapeHtml(data.rawDish)}"');
        expect(source).toContain('data-share-price="${escapeHtml(data.rawPreisWithUnit)}"');
        expect(source).toContain('data-share-consumption-type="${escapeHtml(data.rawVerzehrort)}"');
        expect(source).toContain('data-share-city="${escapeHtml(data.rawCity)}"');

        expect(source).toContain('if (dish !== \'-\') detailBadges.push');
        expect(source).toContain('if (price !== \'-\') detailBadges.push');
        expect(source).toContain('if (city !== \'-\') detailBadges.push');
        expect(source).toContain('class="review-share-story-badges"');
        expect(source).toContain('MEHR REVIEWS AUF CERTIFIEDKEBABTESTER.DE');
    });
});
