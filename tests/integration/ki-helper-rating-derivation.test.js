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
        
        // Check if it iterates and sets value of slider/input based on data.scores
        expect(scriptSource).toContain('if (data.scores) {');
        expect(scriptSource).toContain('const scoreVal = data.scores[key];');
        expect(scriptSource).toContain('const numberInput = communityReviewForm.querySelector(`.community-score-grid input[name="${key}"]`);');
        expect(scriptSource).toContain('updateCommunityScoreSliderFill(slider, clamped);');
        expect(scriptSource).toContain('validateCommunityScoreInput(numberInput);');

        // Check if notice modal is triggered
        expect(scriptSource).toContain('let hasAiGeneratedScores = false;');
        expect(scriptSource).toContain('hasAiGeneratedScores = true;');
        expect(scriptSource).toContain('openKiScoreNoticeModal();');
        expect(scriptSource).toContain('closeKiScoreNoticeModal();');
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
