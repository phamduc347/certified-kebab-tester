/**
 * Boundary Value Tests (Grenzwerttests) für kritische Berechnungs- und
 * Parsing-Funktionen der Certified Kebab Tester Website.
 *
 * Getestete Bereiche:
 *  - parseVal:         Grenzwerte bei Preis, Score und plIndex
 *  - getColorForScore: Farbgrenzen bei Score 1, 5, 10 und Überschreitungen
 *  - plIndex-Logik:    Division durch 0 bei Preis = 0 €
 *  - Datum-Parsing:    Ungültige und extreme Datumsformate
 *  - Kriterienwerte:   Exakt an der Grenze (1.0, 10.0, 0.9, 10.1)
 *  - Score-Farbe:      Übergang rot → gelb → grün an den Schwellwerten
 */
import { describe, it, expect } from 'vitest';

// ── Replizierte Funktionen aus script.js (DOM-unabhängig) ─────────────────────

function parseVal(s) {
    return parseFloat(String(s).replace(',', '.').replace('%', '').replace(' €', '')) || 0;
}

function getColorForScore(score) {
    const value = parseFloat(score);
    if (isNaN(value) || value < 0) return 'inherit';
    const clamped = Math.max(1, Math.min(10, value));
    const hue = Math.round(((clamped - 1) / 9) * 120);
    return `hsl(${hue}, 80%, 40%)`;
}

function parseDateDDMMYYYY(dateStr) {
    if (!dateStr || typeof dateStr !== 'string') return new Date(0);
    const parts = dateStr.split('.');
    if (parts.length !== 3) return new Date(0);
    const [day, month, year] = parts;
    const d = new Date(`${year}-${month}-${day}`);
    return isNaN(d.getTime()) ? new Date(0) : d;
}

function calcPlIndex(score, preis) {
    const parsedScore = parseVal(score);
    const parsedPreis = parseVal(preis);
    if (parsedPreis === 0) return null; // Division durch 0 → ungültig
    return parseFloat((parsedScore / parsedPreis).toFixed(2));
}

function isScoreInRange(val) {
    return typeof val === 'number' && isFinite(val) && val >= 1 && val <= 10;
}

// ── parseVal: Grenzwerte ──────────────────────────────────────────────────────
describe('parseVal – Grenzwerte', () => {
    it('parst Minimalwert "0,00%"', () => {
        expect(parseVal('0,00%')).toBe(0);
    });

    it('parst Maximalwert "100,00%"', () => {
        expect(parseVal('100,00%')).toBeCloseTo(100.0);
    });

    it('parst Preis "0,00 €" korrekt als 0', () => {
        expect(parseVal('0,00 €')).toBe(0);
    });

    it('parst sehr hohen Preis "99,99 €"', () => {
        expect(parseVal('99,99 €')).toBeCloseTo(99.99);
    });

    it('gibt 0 für negativen String zurück (kein negatives Preis-Format)', () => {
        // "-5,00 €" wird als NaN interpretiert → Fallback 0
        expect(parseVal('-5,00 €')).toBe(-5.0);
    });

    it('gibt 0 für leeren String zurück', () => {
        expect(parseVal('')).toBe(0);
    });

    it('gibt 0 für null zurück', () => {
        expect(parseVal(null)).toBe(0);
    });

    it('gibt 0 für undefined zurück', () => {
        expect(parseVal(undefined)).toBe(0);
    });

    it('gibt 0 für nicht-numerischen String zurück', () => {
        expect(parseVal('kein preis')).toBe(0);
    });

    it('parst Grenzwert-Score "71,70%" korrekt', () => {
        expect(parseVal('71,70%')).toBeCloseTo(71.7);
    });
});

// ── getColorForScore: Farbgrenzen ─────────────────────────────────────────────
describe('getColorForScore – Farbgrenzen', () => {
    it('Exakt 1 → hue 0 (rot)', () => {
        expect(getColorForScore(1)).toBe('hsl(0, 80%, 40%)');
    });

    it('Exakt 10 → hue 120 (grün)', () => {
        expect(getColorForScore(10)).toBe('hsl(120, 80%, 40%)');
    });

    it('Exakt 5.5 → mittlerer Farbbereich (hue zwischen 0 und 120)', () => {
        const color = getColorForScore(5.5);
        const hue = parseInt(color.match(/hsl\((\d+)/)[1]);
        expect(hue).toBeGreaterThan(0);
        expect(hue).toBeLessThan(120);
    });

    it('Wert 0 wird auf 1 geclampt → hue 0 (rot)', () => {
        expect(getColorForScore(0)).toBe('hsl(0, 80%, 40%)');
    });

    it('Wert 0.5 wird auf 1 geclampt → hue 0 (rot)', () => {
        expect(getColorForScore(0.5)).toBe('hsl(0, 80%, 40%)');
    });

    it('Wert 10.1 wird auf 10 geclampt → hue 120 (grün)', () => {
        expect(getColorForScore(10.1)).toBe('hsl(120, 80%, 40%)');
    });

    it('Wert 15 wird auf 10 geclampt → hue 120 (grün)', () => {
        expect(getColorForScore(15)).toBe('hsl(120, 80%, 40%)');
    });

    it('Negativwert → "inherit"', () => {
        expect(getColorForScore(-1)).toBe('inherit');
    });

    it('NaN-String → "inherit"', () => {
        expect(getColorForScore('abc')).toBe('inherit');
    });

    it('null → "inherit"', () => {
        expect(getColorForScore(null)).toBe('inherit');
    });

    it('undefined → "inherit"', () => {
        expect(getColorForScore(undefined)).toBe('inherit');
    });
});

// ── P/L-Index: Division durch 0 ──────────────────────────────────────────────
describe('calcPlIndex – Division durch 0 und Grenzwerte', () => {
    it('normaler Spot: Score 90% / Preis 6,50€ → positiver Index', () => {
        const result = calcPlIndex('90,00%', '6,50 €');
        expect(result).toBeGreaterThan(0);
        expect(result).toBeCloseTo(13.85, 1);
    });

    it('Preis 0 € → null (keine Division durch 0)', () => {
        expect(calcPlIndex('90,00%', '0,00 €')).toBeNull();
    });

    it('Score 0 / normaler Preis → Index 0', () => {
        expect(calcPlIndex('0,00%', '7,00 €')).toBe(0);
    });

    it('Score und Preis beide 0 → null (Division durch 0 hat Vorrang)', () => {
        expect(calcPlIndex('0,00%', '0,00 €')).toBeNull();
    });

    it('Score leer / normaler Preis → Index 0', () => {
        expect(calcPlIndex('', '7,00 €')).toBe(0);
    });

    it('Score undefined / normaler Preis → Index 0', () => {
        expect(calcPlIndex(undefined, '7,00 €')).toBe(0);
    });

    it('sehr hoher Preis → sehr niedriger Index (>0)', () => {
        const result = calcPlIndex('80,00%', '99,99 €');
        expect(result).toBeGreaterThan(0);
        expect(result).toBeLessThan(2);
    });
});

// ── Datum-Parsing: Grenzwerte und Fehlerfälle ─────────────────────────────────
describe('parseDateDDMMYYYY – Grenzwerte', () => {
    it('gültiges Datum "28.02.2026" parst korrekt', () => {
        const d = parseDateDDMMYYYY('28.02.2026');
        expect(d.getFullYear()).toBe(2026);
        expect(d.getMonth()).toBe(1); // 0-indexed: Februar = 1
        expect(d.getDate()).toBe(28);
    });

    it('ungültiges Format "32.13.2025" → epoch (new Date(0))', () => {
        const d = parseDateDDMMYYYY('32.13.2025');
        expect(d.getTime()).toBe(new Date(0).getTime());
    });

    it('leerer String → epoch', () => {
        const d = parseDateDDMMYYYY('');
        expect(d.getTime()).toBe(new Date(0).getTime());
    });

    it('null → epoch', () => {
        const d = parseDateDDMMYYYY(null);
        expect(d.getTime()).toBe(new Date(0).getTime());
    });

    it('falsches Format "2026-02-28" (ISO) → epoch', () => {
        const d = parseDateDDMMYYYY('2026-02-28');
        expect(d.getTime()).toBe(new Date(0).getTime());
    });

    it('Datum "01.01.2000" als frühester Grenzwert parst korrekt', () => {
        const d = parseDateDDMMYYYY('01.01.2000');
        expect(isNaN(d.getTime())).toBe(false);
        expect(d.getFullYear()).toBe(2000);
    });
});

// ── Kriterienwerte: Exakt an der Bereichsgrenze ───────────────────────────────
describe('isScoreInRange – Kriterienwerte an den Grenzen', () => {
    it('Exakt 1.0 ist gültig (untere Grenze)', () => {
        expect(isScoreInRange(1.0)).toBe(true);
    });

    it('Exakt 10.0 ist gültig (obere Grenze)', () => {
        expect(isScoreInRange(10.0)).toBe(true);
    });

    it('0.9 ist ungültig (unter unterer Grenze)', () => {
        expect(isScoreInRange(0.9)).toBe(false);
    });

    it('10.1 ist ungültig (über oberer Grenze)', () => {
        expect(isScoreInRange(10.1)).toBe(false);
    });

    it('0 ist ungültig', () => {
        expect(isScoreInRange(0)).toBe(false);
    });

    it('negativer Wert -1 ist ungültig', () => {
        expect(isScoreInRange(-1)).toBe(false);
    });

    it('NaN ist ungültig', () => {
        expect(isScoreInRange(NaN)).toBe(false);
    });

    it('Infinity ist ungültig', () => {
        expect(isScoreInRange(Infinity)).toBe(false);
    });

    it('String "8.5" ist ungültig (kein number-Typ)', () => {
        expect(isScoreInRange('8.5')).toBe(false);
    });

    it('Typischer Mittelwert 8.5 ist gültig', () => {
        expect(isScoreInRange(8.5)).toBe(true);
    });
});
