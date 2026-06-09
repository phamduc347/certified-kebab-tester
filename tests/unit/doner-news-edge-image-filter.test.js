import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const EDGE_FUNCTION_PATH = path.resolve(process.cwd(), '../supabase/functions/doner-news/index.ts');

describe('doner-news edge function image filtering', () => {
    it('drops placeholder Google/icon images and enriches with OG image when needed', () => {
        const source = fs.readFileSync(EDGE_FUNCTION_PATH, 'utf-8');

        expect(source).toContain('function isPlaceholderNewsImage');
        expect(source).toContain('if (normalized.includes("/s2/favicons")) return true;');
        expect(source).toContain('const hasValidImage = !!item.imageUrl && !isPlaceholderNewsImage(item.imageUrl);');
        expect(source).toContain('return isPlaceholderNewsImage(metaImage) ? "" : metaImage;');
    });
});
