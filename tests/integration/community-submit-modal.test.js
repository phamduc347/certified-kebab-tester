import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const HTML_PATH = path.resolve(process.cwd(), '../index.html');
const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Community submit modal spot selection', () => {
    it('uses the spot dropdown as the mode selector and keeps the first existing spot selected by default', () => {
        const html = fs.readFileSync(HTML_PATH, 'utf-8');
        const script = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(html).not.toContain('id="spot-entry-mode"');
        expect(html).toContain('id="existing-spot-select"');
        expect(html).not.toContain('Review-Typ');

        expect(script).toContain('<option value="new">NEUER DÖNERSPOT</option>');
        expect(script).toContain('const isNewSpot = selectedValue === \'new\';');
        expect(script).toContain('existingSpotSelect.value = String(sortedSpots[0].id);');
        expect(script).toContain('existingSpotSelect.value = \'new\';');
        expect(script).toContain("setCommunityFormStep(activeCommunityFormStep + 1, true, 'forward');");
        expect(script).toContain("setCommunityFormStep(activeCommunityFormStep - 1, true, 'backward');");
        expect(script).toContain("communityStepTransitionDirection = transitionDirection;");
        expect(script).toContain("is-transition-forward");
        expect(script).toContain("is-transition-backward");
        expect(script).not.toContain('spot_entry_mode');
    });
});