/**
 * Loads kebab-data.js into a sandboxed VM context so it can be imported
 * in ESM test files without modifying the original browser script.
 */
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));

export function loadKebabData() {
    // Read the raw file and wrap const declarations into globalThis assignments
    // so they survive the VM sandbox boundary.
    const raw = readFileSync(join(__dirname, '../../assets/data/kebab-data.js'), 'utf-8');
    const wrapped = raw
        .replace(/^const (kebabData|upcomingSpots)/gm, 'globalThis.$1');

    const context = { globalThis: {} };
    vm.createContext(context);
    vm.runInContext(wrapped, context);

    return {
        kebabData: context.globalThis.kebabData ?? [],
        upcomingSpots: context.globalThis.upcomingSpots ?? [],
    };
}
