import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import vm from 'vm';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');
const DOM_READY_MARKER = "document.addEventListener('DOMContentLoaded', () => {";

function runBootstrap({ navigationType = 'navigate' } = {}) {
    const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');
    const bootstrap = source.split(DOM_READY_MARKER)[0];

    if (!bootstrap.includes('isReloadNavigation')) {
        throw new Error('Expected reload bootstrap block not found in script.js');
    }

    const calls = [];
    const listeners = {};

    const windowObj = {
        loaderStartTime: 0,
        scrollTo: (...args) => {
            calls.push(args);
        },
        addEventListener: (name, handler) => {
            listeners[name] = handler;
        }
    };

    const context = {
        window: windowObj,
        history: { scrollRestoration: 'auto' },
        performance: {
            getEntriesByType: (entryType) => (entryType === 'navigation' ? [{ type: navigationType }] : []),
            navigation: { type: navigationType === 'reload' ? 1 : 0 }
        },
        requestAnimationFrame: (cb) => {
            cb();
            return 1;
        },
        setTimeout: () => 1,
        clearTimeout: () => {},
        document: {
            getElementById: () => null
        }
    };

    vm.runInNewContext(bootstrap, context, { filename: 'script-bootstrap.js' });

    return {
        calls,
        listeners,
        history: context.history
    };
}

describe('Reload scroll-to-top bootstrap', () => {
    it('forces top scroll on reload and on late lifecycle events', () => {
        const result = runBootstrap({ navigationType: 'reload' });

        expect(result.history.scrollRestoration).toBe('manual');
        expect(result.calls.length).toBe(2);
        expect(result.calls[0][0]).toEqual({ top: 0, left: 0, behavior: 'auto' });
        expect(result.calls[1][0]).toEqual({ top: 0, left: 0, behavior: 'auto' });

        expect(typeof result.listeners.load).toBe('function');
        expect(typeof result.listeners.pageshow).toBe('function');

        result.listeners.load();
        result.listeners.pageshow();

        expect(result.calls.length).toBe(4);
        expect(result.calls[2][0]).toEqual({ top: 0, left: 0, behavior: 'auto' });
        expect(result.calls[3][0]).toEqual({ top: 0, left: 0, behavior: 'auto' });
    });

    it('does not enforce top scroll for non-reload navigation', () => {
        const result = runBootstrap({ navigationType: 'navigate' });

        expect(result.history.scrollRestoration).toBe('manual');
        expect(result.calls.length).toBe(0);
        expect(result.listeners.load).toBeUndefined();
        expect(result.listeners.pageshow).toBeUndefined();
    });
});
