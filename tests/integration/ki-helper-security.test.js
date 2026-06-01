import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const EDGE_FN_PATH = path.resolve(process.cwd(), '../supabase/functions/generate-review/index.ts');

describe('KI-Schreibhilfe Prompt Injection Protection', () => {
    it('should invoke the generate-review function with raw bulletPoints in the frontend', () => {
        const scriptSource = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        
        // Assert that the frontend sends bulletPoints directly in the body
        expect(scriptSource).toContain('body: { bulletPoints }');
        // Assert that client-side prompt building has been removed
        expect(scriptSource).not.toContain('Du schreibst einen kurzen Reviewkommentar für eine Dönerbewertung.');
    });

    it('should implement the Dual-LLM pattern (pre-check classifier) in the backend', () => {
        const edgeFnSource = fs.readFileSync(EDGE_FN_PATH, 'utf-8');

        // Assert that the edge function performs input sanitization
        expect(edgeFnSource).toContain('function sanitizeInput');
        expect(edgeFnSource).toContain('const forbiddenPatterns = [');

        // Assert that it defines a classification prompt for the precheck
        expect(edgeFnSource).toContain('const classificationInstruction =');
        expect(edgeFnSource).toContain('Du bist ein Sicherheitsfilter für ein Kebab-Review-System.');

        // Assert that it runs the pre-check classifier fetch call
        expect(edgeFnSource).toContain('const preCheckResponse = await fetch(');
        expect(edgeFnSource).toContain('systemInstruction: {');
        expect(edgeFnSource).toContain('parts: [{ text: classificationInstruction }]');

        // Assert that it correctly blocks request if classifier outputs "JA" or empty (blocked)
        expect(edgeFnSource).toContain('preCheckText.includes("JA") || preCheckText === ""');
    });
});
