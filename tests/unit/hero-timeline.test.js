import { describe, it, expect } from 'vitest';
import { calculateTimelineStacks } from '../../assets/js/utils.js';

describe('calculateTimelineStacks', () => {
    const startTime = new Date('2026-05-01T00:00:00Z').getTime();
    const endTime = new Date('2026-05-15T00:00:00Z').getTime();

    it('returns empty array when no reviews exist', () => {
        const result = calculateTimelineStacks([], startTime, endTime);
        expect(result).toEqual([]);
    });

    it('processes a single review with stackIndex 0 and no clustering', () => {
        const reviews = [
            { id: 1, visit_date: '2026-05-05', spot_name: 'Spot A' }
        ];
        const result = calculateTimelineStacks(reviews, startTime, endTime);

        expect(result).toHaveLength(1);
        expect(result[0].stackIndex).toBe(0);
        expect(result[0].isCluster).toBe(false);
        expect(result[0].reviews).toHaveLength(1);
        expect(result[0].reviews[0].spot_name).toBe('Spot A');
    });

    it('stacks up to 3 reviews on the same day without clustering', () => {
        const reviews = [
            { id: 1, visit_date: '2026-05-05', spot_name: 'Spot A' },
            { id: 2, visit_date: '2026-05-05', spot_name: 'Spot B' },
            { id: 3, visit_date: '2026-05-05', spot_name: 'Spot C' }
        ];
        const result = calculateTimelineStacks(reviews, startTime, endTime);

        expect(result).toHaveLength(3);
        // Expect chronological order by stackIndex
        expect(result[0].stackIndex).toBe(0);
        expect(result[0].reviews[0].spot_name).toBe('Spot A');
        expect(result[1].stackIndex).toBe(1);
        expect(result[1].reviews[0].spot_name).toBe('Spot B');
        expect(result[2].stackIndex).toBe(2);
        expect(result[2].reviews[0].spot_name).toBe('Spot C');

        expect(result.every(item => !item.isCluster)).toBe(true);
    });

    it('clusters reviews beyond the first 2 when there are more than 3 on the same day', () => {
        const reviews = [
            { id: 1, visit_date: '2026-05-05', spot_name: 'Spot A' },
            { id: 2, visit_date: '2026-05-05', spot_name: 'Spot B' },
            { id: 3, visit_date: '2026-05-05', spot_name: 'Spot C' },
            { id: 4, visit_date: '2026-05-05', spot_name: 'Spot D' },
            { id: 5, visit_date: '2026-05-05', spot_name: 'Spot E' }
        ];
        const result = calculateTimelineStacks(reviews, startTime, endTime);

        // Should result in exactly 3 items: two single ones and one cluster
        expect(result).toHaveLength(3);

        expect(result[0].stackIndex).toBe(0);
        expect(result[0].isCluster).toBe(false);
        expect(result[0].reviews).toHaveLength(1);
        expect(result[0].reviews[0].spot_name).toBe('Spot A');

        expect(result[1].stackIndex).toBe(1);
        expect(result[1].isCluster).toBe(false);
        expect(result[1].reviews).toHaveLength(1);
        expect(result[1].reviews[0].spot_name).toBe('Spot B');

        // The third item is the cluster
        expect(result[2].stackIndex).toBe(2);
        expect(result[2].isCluster).toBe(true);
        // The cluster contains the remaining 3 reviews
        expect(result[2].reviews).toHaveLength(3);
        expect(result[2].reviews[0].spot_name).toBe('Spot C');
        expect(result[2].reviews[1].spot_name).toBe('Spot D');
        expect(result[2].reviews[2].spot_name).toBe('Spot E');
    });

    it('correctly maps position percent based on dates within the window', () => {
        const reviews = [
            { id: 1, visit_date: '2026-05-01', spot_name: 'Start' },
            { id: 2, visit_date: '2026-05-08', spot_name: 'Middle' },
            { id: 3, visit_date: '2026-05-15', spot_name: 'End' }
        ];
        const result = calculateTimelineStacks(reviews, startTime, endTime);

        expect(result).toHaveLength(3);
        expect(result[0].percent).toBeCloseTo(8, 1);
        expect(result[1].percent).toBeCloseTo(50, 1);
        expect(result[2].percent).toBeCloseTo(92, 1);
    });
});
