import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const HTML_PATH = path.resolve(process.cwd(), '../index.html');

describe('All Reviews search reviewer support', () => {
    it('uses reviewer names in review filter search matching', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('function getSpotReviewerSearchText(spot)');
        expect(source).toContain('approvedCommunityReviewsBySpotId.get(Number(spot && spot.id)) || []');
        expect(source).toContain('review.reviewer_name');
        expect(source).toContain('getSpotReviewerSearchText(spot)');
    });

    it('updates the All Reviews search placeholder copy', () => {
        const html = fs.readFileSync(HTML_PATH, 'utf-8');

        expect(html).toContain('placeholder="Suche nach Dönerspots, Städten oder Reviewern"');
    });
});
