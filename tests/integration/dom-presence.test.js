import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';

const HTML_PATH = path.resolve(process.cwd(), '../index.html');

describe('DOM Elements Presence', () => {
    let document;

    beforeAll(() => {
        const html = fs.readFileSync(HTML_PATH, 'utf-8');
        const dom = new JSDOM(html);
        document = dom.window.document;
    });

    it('should have the main header and logo', () => {
        expect(document.querySelector('.header')).not.toBeNull();
        expect(document.querySelector('.logo')).not.toBeNull();
        expect(document.querySelector('.logo-img')).not.toBeNull();
        expect(document.querySelector('.logo-main')).not.toBeNull();
    });

    it('should have the navigation elements', () => {
        expect(document.querySelector('.header-nav')).not.toBeNull();
        const links = document.querySelectorAll('.header-link');
        expect(links.length).toBeGreaterThan(0);
    });

    it('should have the action buttons', () => {
        expect(document.getElementById('hamburger-btn')).not.toBeNull();
    });

    it('should have the overlays', () => {
        expect(document.getElementById('sidebar-overlay')).not.toBeNull();
    });

    it('should have the main container and hero section', () => {
        expect(document.querySelector('main.container')).not.toBeNull();
        expect(document.querySelector('.hero-section')).not.toBeNull();
        expect(document.getElementById('kebab-canvas')).not.toBeNull();
    });

    it('should have the content sections', () => {
        expect(document.getElementById('spotlight')).not.toBeNull();
        expect(document.getElementById('spots')).not.toBeNull();
        expect(document.getElementById('analytics')).not.toBeNull();
        expect(document.getElementById('comparison')).not.toBeNull();
        expect(document.getElementById('weightings')).not.toBeNull();
    });

    it('should have the modals', () => {
        expect(document.getElementById('lightbox-modal')).not.toBeNull();
        expect(document.getElementById('legal-modal')).not.toBeNull();
        expect(document.getElementById('comment-feedback-modal')).not.toBeNull();
    });
});
