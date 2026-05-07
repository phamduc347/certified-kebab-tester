/**
 * utils.js – Exportierte reine Utility-Funktionen für Unit-Tests.
 *
 * ⚠️  WICHTIG: Diese Datei ist ein exakter Spiegel der gleichnamigen Funktionen
 * in assets/js/script.js. Wenn dort Logik geändert wird, muss diese Datei
 * synchron aktualisiert werden, damit die Tests den echten Code abbilden.
 *
 * Die Datei wird NICHT im Browser geladen – sie dient ausschließlich der
 * Test-Infrastruktur (Vitest / ESM-Imports in tests/).
 */

/**
 * Escapes HTML special characters.
 * Mirror of: escapeHtml() in script.js (line ~534)
 */
export function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Normalizes comment text for spam/duplicate detection.
 * Mirror of: normalizeCommentText() in script.js (line ~467)
 */
export function normalizeCommentText(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ');
}

/**
 * Returns an HSL color string for a given score (1–10).
 *  - 1 → Purple (hsl 280)
 *  - 5 → Red   (hsl 360/0)
 *  - 10 → Green (hsl 120)
 * Mirror of: getColorForScore() in script.js (line ~1550)
 */
export function getColorForScore(score) {
    const value = parseFloat(score);
    if (isNaN(value) || value < 0) return 'inherit';
    const clamped = Math.max(1, Math.min(10, value));

    let hue;
    if (clamped <= 5) {
        // Scale 1 to 5: Purple (280) to Red (360)
        const t = (clamped - 1) / 4;
        hue = 280 + t * 80;
    } else {
        // Scale 5 to 10: Red (0) to Green (120)
        const t = (clamped - 5) / 5;
        hue = t * 120;
    }

    return `hsl(${Math.round(hue)}, 80%, 40%)`;
}

/**
 * Parses a German-formatted number string (e.g. "92,10%", "7,40 €").
 * Mirror of: parseVal arrow fn in script.js (line ~2274)
 */
export function parseVal(s) {
    return parseFloat(String(s).replace(',', '.').replace('%', '').replace(' €', '')) || 0;
}

/**
 * Parses a score string to a float for star rendering.
 * Derived from score-rendering logic in script.js.
 */
export function renderStarsScore(scoreStr) {
    if (!scoreStr) return null;
    return parseFloat(String(scoreStr).replace(',', '.').replace('%', ''));
}

/**
 * Parses a "DD.MM.YYYY" date string into a Date object.
 * Returns new Date(0) (epoch) for invalid input.
 * Mirror of: parseDate() in tests/unit/spotlight.test.js and inline logic in script.js.
 */
export function parseDateDDMMYYYY(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return new Date(0);
    const parts = dateStr.split('.');
    if (parts.length !== 3) return new Date(0);
    const [day, month, year] = parts;
    const d = new Date(`${year}-${month}-${day}`);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

/**
 * Calculates the Price/Leistungs-Index (score per euro).
 * Returns null when price is 0 to avoid division by zero.
 * Derived from plIndex calculation in script.js.
 */
export function calcPlIndex(score, preis) {
    const parsedScore = parseVal(score);
    const parsedPreis = parseVal(preis);
    if (parsedPreis === 0) return null;
    return parseFloat((parsedScore / parsedPreis).toFixed(2));
}

/**
 * Checks whether a score value is within the valid [1, 10] range.
 * Derived from validation logic in script.js / data.test.js.
 */
export function isScoreInRange(val) {
    return typeof val === 'number' && isFinite(val) && val >= 1 && val <= 10;
}
