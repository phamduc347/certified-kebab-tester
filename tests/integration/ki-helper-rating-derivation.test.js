import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const HTML_PATH = path.resolve(process.cwd(), '../index.html');
const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const EDGE_FN_PATH = path.resolve(process.cwd(), '../supabase/functions/generate-review/index.ts');

describe('KI-Schreibhilfe Rating Derivation', () => {
    it('should update DOM sliders and score inputs when receiving derived scores in the frontend', () => {
        const scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        const htmlSource = fs.readFileSync(HTML_PATH, 'utf-8');

        // Check if the HTML contains the notice modal
        expect(htmlSource).toContain('id="ki-score-notice-modal"');
        expect(htmlSource).toContain('class="ki-score-confirm"');

        // Check if the script contains the key categories array
        expect(scriptSource).toContain("const scoreKeys = ['fleisch', 'gemuese', 'sosse', 'brot', 'balance', 'auswahl', 'portion', 'hygiene', 'service']");
        
        // Check if it stashes target scores stashing and triggers the modal
        expect(scriptSource).toContain('pendingAiScores = data.scores;');
        expect(scriptSource).toContain('hasAiGeneratedScores = true;');
        expect(scriptSource).toContain('openKiScoreNoticeModal();');

        // Check if closing the modal starts the animation
        expect(scriptSource).toContain('animateSlidersToTarget(pendingAiScores);');
        
        // Check the animation loop inside animateSlidersToTarget
        expect(scriptSource).toContain('function animateSlidersToTarget(targetScores) {');
        expect(scriptSource).toContain('requestAnimationFrame(step);');
        expect(scriptSource).toContain('updateCommunityScoreSliderFill(slider, clamped);');
        expect(scriptSource).toContain('validateCommunityScoreInput(numberInput);');
    });

    it('should define the schema for scores in the Gemini response Schema', () => {
        const edgeFnSource = fs.readFileSync(EDGE_FN_PATH, 'utf-8');

        // Check backend instructions and schema definition
        expect(edgeFnSource).toContain('scores: {');
        expect(edgeFnSource).toContain('fleisch: { type: "NUMBER"');
        expect(edgeFnSource).toContain('gemuese: { type: "NUMBER"');
        expect(edgeFnSource).toContain('sosse: { type: "NUMBER"');
        expect(edgeFnSource).toContain('brot: { type: "NUMBER"');
        expect(edgeFnSource).toContain('balance: { type: "NUMBER"');
        expect(edgeFnSource).toContain('auswahl: { type: "NUMBER"');
        expect(edgeFnSource).toContain('portion: { type: "NUMBER"');
        expect(edgeFnSource).toContain('hygiene: { type: "NUMBER"');
        expect(edgeFnSource).toContain('service: { type: "NUMBER"');

        // Ensure scores are extracted and returned in the HTTP response
        expect(edgeFnSource).toContain('scores = parsed.scores || null;');
        expect(edgeFnSource).toContain('scores,');
    });
});
