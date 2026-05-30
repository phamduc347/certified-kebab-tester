import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Modal Scroll Behavior', () => {
    it('should configure .modal-content to only allow vertical scrolling', () => {
        const cssPath = path.resolve(process.cwd(), '../assets/css/style.css');
        const cssContent = fs.readFileSync(cssPath, 'utf-8');
        
        // Find the styling for .modal-content and make sure it has overflow-x: hidden
        const modalContentRegex = /\.modal-content\s*\{[^}]*overflow-x\s*:\s*hidden\s*;[^}]*\}/;
        expect(cssContent).toMatch(modalContentRegex);
    });
});
