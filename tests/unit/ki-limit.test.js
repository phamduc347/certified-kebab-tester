import { describe, expect, it, beforeEach } from 'vitest';

const maxKiAttempts = 10;

function getRemainingKiAttempts(storage) {
    const stored = storage.getItem('kebab_tester_ki_attempts');
    if (stored === null) {
        storage.setItem('kebab_tester_ki_attempts', maxKiAttempts.toString());
        return maxKiAttempts;
    }
    return parseInt(stored, 10);
}

function decrementKiAttempts(storage) {
    const current = getRemainingKiAttempts(storage);
    const nextVal = Math.max(0, current - 1);
    storage.setItem('kebab_tester_ki_attempts', nextVal.toString());
    return nextVal;
}

describe('KI Schreibhilfe attempts limit', () => {
    let mockStorage;

    beforeEach(() => {
        const store = {};
        mockStorage = {
            getItem: (key) => store[key] !== undefined ? store[key] : null,
            setItem: (key, value) => { store[key] = String(value); },
            clear: () => { for (const k in store) delete store[k]; }
        };
    });

    it('initializes to max attempts (10) when storage is empty', () => {
        expect(getRemainingKiAttempts(mockStorage)).toBe(10);
        expect(mockStorage.getItem('kebab_tester_ki_attempts')).toBe('10');
    });

    it('decrements attempts correctly', () => {
        expect(getRemainingKiAttempts(mockStorage)).toBe(10);
        
        const remaining1 = decrementKiAttempts(mockStorage);
        expect(remaining1).toBe(9);
        expect(getRemainingKiAttempts(mockStorage)).toBe(9);

        const remaining2 = decrementKiAttempts(mockStorage);
        expect(remaining2).toBe(8);
        expect(getRemainingKiAttempts(mockStorage)).toBe(8);
    });

    it('never drops below 0 attempts', () => {
        // Run decrement 12 times
        for (let i = 0; i < 12; i++) {
            decrementKiAttempts(mockStorage);
        }
        expect(getRemainingKiAttempts(mockStorage)).toBe(0);
    });
});
