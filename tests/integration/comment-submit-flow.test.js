import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const SCRIPT_PATH = path.resolve(process.cwd(), '../assets/js/script.js');

describe('Comment submit flow coverage', () => {
    it('uses shared payload and validation logic in both comment submit handlers', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('function getCommentSubmissionPayload(form)');
        expect(source).toContain('function validateCommentSubmissionPayload(payload, targetId, form)');
        expect(source).toContain('const payload = getCommentSubmissionPayload(form);');

        const validationCalls = source.match(/validateCommentSubmissionPayload\(payload,\s*(spotId|reviewTargetId),\s*form\)/g) || [];
        expect(validationCalls.length).toBe(2);
    });

    it('optimistically updates the regular spot comment list after successful submit', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        expect(source).toContain('const commentsSection = form.closest(\'.review-comments\');');
        expect(source).toContain('commentsBySpot.get(spotId).unshift(newComment);');
        expect(source).toContain('appendOptimisticCommentToSection(');
    });

    it('keeps explicit database error handling in both submit handlers', () => {
        const source = fs.readFileSync(SCRIPT_PATH, 'utf-8');

        const insertCalls = source.match(/\.from\('review_comments'\)\s*\n\s*\.insert\(/g) || [];
        expect(insertCalls.length).toBeGreaterThanOrEqual(2);

        const errorStatusMessages = source.match(/Fehler beim Speichern\./g) || [];
        expect(errorStatusMessages.length).toBeGreaterThanOrEqual(2);
    });
});
