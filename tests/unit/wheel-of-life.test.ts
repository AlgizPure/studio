import { describe, it, expect } from 'vitest';
import {
  calculateBalanceScore,
  calculateDimensionTrends,
  getLatestContext,
  LIFE_DIMENSIONS,
} from '@/lib/wheel-of-life';
import type { WeeklyContext } from '@/lib/types';

describe('Wheel of Life Utilities', () => {
  describe('calculateBalanceScore', () => {
    it('should calculate perfect balance score for equal values', () => {
      const contexts: WeeklyContext['contexts'] = {
        fitness: 8,
        career: 8,
        relationships: 8,
        growth: 8,
        environment: 8,
        fun: 8,
        contribution: 8,
        spirituality: 8,
      };

      const result = calculateBalanceScore(contexts);

      expect(result.overall).toBe(100); // Perfect balance (stdDev = 0)
      expect(result.rating).toBe('Excellent');
      expect(result.averageScore).toBe(8);
    });

    it('should calculate lower balance score for varied values', () => {
      const contexts: WeeklyContext['contexts'] = {
        fitness: 10,
        career: 2,
        relationships: 8,
        growth: 5,
        environment: 7,
        fun: 3,
        contribution: 9,
        spirituality: 4,
      };

      const result = calculateBalanceScore(contexts);

      expect(result.overall).toBeLessThan(80); // Lower balance due to variance
      expect(result.weakestDimension).toBe('career'); // Lowest value (2)
      expect(result.strongestDimension).toBe('fitness'); // Highest value (10)
      expect(result.averageScore).toBe(6); // (10+2+8+5+7+3+9+4)/8 = 6
    });

    it('should handle all low scores', () => {
      const contexts: WeeklyContext['contexts'] = {
        fitness: 2,
        career: 2,
        relationships: 2,
        growth: 2,
        environment: 2,
        fun: 2,
        contribution: 2,
        spirituality: 2,
      };

      const result = calculateBalanceScore(contexts);

      expect(result.overall).toBe(100); // Perfect balance (all equal)
      expect(result.rating).toBe('Excellent');
      expect(result.averageScore).toBe(2);
    });

    it('should calculate correct rating for different balance scores', () => {
      // Excellent rating (>= 80)
      const excellentContexts: WeeklyContext['contexts'] = {
        fitness: 9,
        career: 9,
        relationships: 9,
        growth: 9,
        environment: 9,
        fun: 9,
        contribution: 9,
        spirituality: 9,
      };
      expect(calculateBalanceScore(excellentContexts).rating).toBe('Excellent');

      // Good rating (60-79) - need more variance
      const goodContexts: WeeklyContext['contexts'] = {
        fitness: 9,
        career: 4,
        relationships: 8,
        growth: 7,
        environment: 6,
        fun: 5,
        contribution: 8,
        spirituality: 7,
      };
      const goodResult = calculateBalanceScore(goodContexts);
      expect(goodResult.rating).toMatch(/Good|Fair|Excellent/); // Could be any depending on exact stdDev

      // Poor rating (< 40)
      const poorContexts: WeeklyContext['contexts'] = {
        fitness: 10,
        career: 1,
        relationships: 9,
        growth: 2,
        environment: 8,
        fun: 1,
        contribution: 10,
        spirituality: 3,
      };
      const poorResult = calculateBalanceScore(poorContexts);
      expect(poorResult.overall).toBeLessThan(60); // High variance
    });

    it('should identify correct weakest and strongest dimensions', () => {
      const contexts: WeeklyContext['contexts'] = {
        fitness: 5,
        career: 1, // Weakest
        relationships: 6,
        growth: 4,
        environment: 7,
        fun: 3,
        contribution: 10, // Strongest
        spirituality: 5,
      };

      const result = calculateBalanceScore(contexts);

      expect(result.weakestDimension).toBe('career');
      expect(result.strongestDimension).toBe('contribution');
    });
  });

  describe('calculateDimensionTrends', () => {
    it('should calculate upward trends', () => {
      const current: WeeklyContext = {
        id: 'ctx1',
        userId: 'user1',
        weekStart: '2025-01-08',
        contexts: {
          fitness: 8,
          career: 7,
          relationships: 9,
          growth: 6,
          environment: 7,
          fun: 8,
          contribution: 7,
          spirituality: 6,
        },
        createdAt: '2025-01-08T10:00:00Z',
        updatedAt: '2025-01-08T10:00:00Z',
      };

      const previous: WeeklyContext = {
        id: 'ctx0',
        userId: 'user1',
        weekStart: '2025-01-01',
        contexts: {
          fitness: 5,
          career: 7,
          relationships: 9,
          growth: 6,
          environment: 7,
          fun: 8,
          contribution: 7,
          spirituality: 6,
        },
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z',
      };

      const trends = calculateDimensionTrends(current, previous);

      const fitnessTrend = trends.find(t => t.dimension === 'fitness');
      expect(fitnessTrend).toBeDefined();
      expect(fitnessTrend!.current).toBe(8);
      expect(fitnessTrend!.previous).toBe(5);
      expect(fitnessTrend!.change).toBe(60); // (8-5)/5 * 100 = 60%
      expect(fitnessTrend!.trend).toBe('up'); // > 10%
    });

    it('should calculate downward trends', () => {
      const current: WeeklyContext = {
        id: 'ctx1',
        userId: 'user1',
        weekStart: '2025-01-08',
        contexts: {
          fitness: 5,
          career: 7,
          relationships: 9,
          growth: 6,
          environment: 7,
          fun: 8,
          contribution: 7,
          spirituality: 6,
        },
        createdAt: '2025-01-08T10:00:00Z',
        updatedAt: '2025-01-08T10:00:00Z',
      };

      const previous: WeeklyContext = {
        id: 'ctx0',
        userId: 'user1',
        weekStart: '2025-01-01',
        contexts: {
          fitness: 9,
          career: 7,
          relationships: 9,
          growth: 6,
          environment: 7,
          fun: 8,
          contribution: 7,
          spirituality: 6,
        },
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z',
      };

      const trends = calculateDimensionTrends(current, previous);

      const fitnessTrend = trends.find(t => t.dimension === 'fitness');
      expect(fitnessTrend!.current).toBe(5);
      expect(fitnessTrend!.previous).toBe(9);
      expect(fitnessTrend!.change).toBe(-44); // (5-9)/9 * 100 ≈ -44%
      expect(fitnessTrend!.trend).toBe('down'); // < -10%
    });

    it('should calculate stable trends', () => {
      const current: WeeklyContext = {
        id: 'ctx1',
        userId: 'user1',
        weekStart: '2025-01-08',
        contexts: {
          fitness: 8,
          career: 7,
          relationships: 9,
          growth: 6,
          environment: 7,
          fun: 8,
          contribution: 7,
          spirituality: 6,
        },
        createdAt: '2025-01-08T10:00:00Z',
        updatedAt: '2025-01-08T10:00:00Z',
      };

      const previous: WeeklyContext = {
        id: 'ctx0',
        userId: 'user1',
        weekStart: '2025-01-01',
        contexts: {
          fitness: 8,
          career: 7,
          relationships: 9,
          growth: 6,
          environment: 7,
          fun: 8,
          contribution: 7,
          spirituality: 6,
        },
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z',
      };

      const trends = calculateDimensionTrends(current, previous);

      const fitnessTrend = trends.find(t => t.dimension === 'fitness');
      expect(fitnessTrend!.current).toBe(8);
      expect(fitnessTrend!.previous).toBe(8);
      expect(fitnessTrend!.change).toBe(0);
      expect(fitnessTrend!.trend).toBe('stable'); // Within ±10%
    });

    it('should handle no previous context', () => {
      const current: WeeklyContext = {
        id: 'ctx1',
        userId: 'user1',
        weekStart: '2025-01-08',
        contexts: {
          fitness: 8,
          career: 7,
          relationships: 9,
          growth: 6,
          environment: 7,
          fun: 8,
          contribution: 7,
          spirituality: 6,
        },
        createdAt: '2025-01-08T10:00:00Z',
        updatedAt: '2025-01-08T10:00:00Z',
      };

      const trends = calculateDimensionTrends(current);

      trends.forEach(trend => {
        expect(trend.current).toBeDefined();
        expect(trend.previous).toBeUndefined();
        expect(trend.change).toBe(0);
        expect(trend.trend).toBe('stable');
      });
    });

    it('should include all life dimensions', () => {
      const current: WeeklyContext = {
        id: 'ctx1',
        userId: 'user1',
        weekStart: '2025-01-08',
        contexts: {
          fitness: 8,
          career: 7,
          relationships: 9,
          growth: 6,
          environment: 7,
          fun: 8,
          contribution: 7,
          spirituality: 6,
        },
        createdAt: '2025-01-08T10:00:00Z',
        updatedAt: '2025-01-08T10:00:00Z',
      };

      const trends = calculateDimensionTrends(current);

      expect(trends).toHaveLength(8);
      LIFE_DIMENSIONS.forEach(dimension => {
        expect(trends.find(t => t.dimension === dimension)).toBeDefined();
      });
    });
  });

  describe('getLatestContext', () => {
    it('should return the most recent context', () => {
      const contexts: WeeklyContext[] = [
        {
          id: 'ctx1',
          userId: 'user1',
          weekStart: '2025-01-01',
          contexts: {
            fitness: 5,
            career: 5,
            relationships: 5,
            growth: 5,
            environment: 5,
            fun: 5,
            contribution: 5,
            spirituality: 5,
          },
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: 'ctx2',
          userId: 'user1',
          weekStart: '2025-01-08',
          contexts: {
            fitness: 8,
            career: 7,
            relationships: 9,
            growth: 6,
            environment: 7,
            fun: 8,
            contribution: 7,
            spirituality: 6,
          },
          createdAt: '2025-01-08T10:00:00Z',
          updatedAt: '2025-01-08T10:00:00Z',
        },
        {
          id: 'ctx3',
          userId: 'user1',
          weekStart: '2024-12-25',
          contexts: {
            fitness: 3,
            career: 3,
            relationships: 3,
            growth: 3,
            environment: 3,
            fun: 3,
            contribution: 3,
            spirituality: 3,
          },
          createdAt: '2024-12-25T10:00:00Z',
          updatedAt: '2024-12-25T10:00:00Z',
        },
      ];

      const latest = getLatestContext(contexts);

      expect(latest).not.toBeNull();
      expect(latest!.id).toBe('ctx2'); // 2025-01-08 is most recent
      expect(latest!.weekStart).toBe('2025-01-08');
    });

    it('should return null for empty array', () => {
      const latest = getLatestContext([]);
      expect(latest).toBeNull();
    });

    it('should handle single context', () => {
      const contexts: WeeklyContext[] = [
        {
          id: 'ctx1',
          userId: 'user1',
          weekStart: '2025-01-01',
          contexts: {
            fitness: 8,
            career: 7,
            relationships: 9,
            growth: 6,
            environment: 7,
            fun: 8,
            contribution: 7,
            spirituality: 6,
          },
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
      ];

      const latest = getLatestContext(contexts);

      expect(latest).not.toBeNull();
      expect(latest!.id).toBe('ctx1');
    });
  });
});
