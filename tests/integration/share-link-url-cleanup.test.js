import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Share link URL cleanup', () => {
    it('clears share params without preserving #spots hash', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        const fnMatch = source.match(/const clearShareParamsFromUrl = \(\) => \{([\s\S]*?)\n\s*\};/);
        expect(fnMatch).not.toBeNull();

        const body = fnMatch[1];
        expect(body).toContain('window.location.pathname');
        expect(body).toContain("window.history.replaceState({}, '', cleanUrl);");
        expect(body).not.toContain('window.location.hash');
        expect(body).not.toContain("window.location.hash || ''");
    });
});
