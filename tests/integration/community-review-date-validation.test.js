import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const HTML_PATH = path.resolve(process.cwd(), '../index.html');
const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Community Review visit date validation display', () => {
    it('should have the visit-date-error element in index.html', () => {
        const html = fs.readFileSync(HTML_PATH, 'utf-8');
        expect(html).toContain('id="visit-date-error"');
        expect(html).toContain('class="field-error-message"');
    });

    it('should update the error message in script.js when date is in the future', () => {
        const script = fs.readFileSync(SCRIPT_PATH, 'utf-8');
        expect(script).toContain("const errorEl = document.getElementById('visit-date-error');");
        expect(script).toContain("errorEl.textContent = 'Besuchsdaten in der Zukunft sind nicht möglich.';");
        expect(script).toContain("errorEl.classList.add('is-visible');");
        expect(script).toContain("errorEl.classList.remove('is-visible');");
    });
});
