import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Single community review author preview', () => {
    it('renders author info below comment when only one community review exists', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('const hasBaseSpotEntry = baseSpotById.has(Number(spot.id));');
        expect(source).toContain("const singleCommunityCommentAuthor = !hasBaseSpotEntry && slides.length === 1");
        expect(source).toContain('${singleCommunityCommentAuthor ? `<div class="slide-author-info">— ${singleCommunityCommentAuthor}</div>` : \'\'}');
    });
});
