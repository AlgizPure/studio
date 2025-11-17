import { describe, it, expect } from 'vitest';
import {
  calculateCorrelation,
  hasReflectedToday,
  getTopGratitudes,
} from '@/lib/reflections';
import type { DailyReflection } from '@/lib/types';

describe('Reflection Utilities', () => {
  describe('calculateCorrelation', () => {
    it('should calculate perfect positive correlation', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 5,
          energy: 5,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-01-02',
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-01-03',
          mood: 9,
          energy: 9,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'mood', 'energy');
      expect(correlation).toBe(1); // Perfect positive correlation
    });

    it('should calculate perfect negative correlation', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 10,
          energy: 5,
          stress: 2,
          sleepQuality: 5,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-01-02',
          mood: 7,
          energy: 5,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-01-03',
          mood: 4,
          energy: 5,
          stress: 8,
          sleepQuality: 5,
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'mood', 'stress');
      expect(correlation).toBe(-1); // Perfect negative correlation
    });

    it('should calculate low correlation', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 5,
          energy: 5,
          stress: 8,
          sleepQuality: 3,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-01-02',
          mood: 7,
          energy: 5,
          stress: 2,
          sleepQuality: 9,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-01-03',
          mood: 6,
          energy: 5,
          stress: 5,
          sleepQuality: 6,
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'mood', 'energy');
      // Energy is constant (5), so correlation should be 0
      expect(correlation).toBe(0);
    });

    it('should return 0 for insufficient data', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 5,
          energy: 5,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'mood', 'energy');
      expect(correlation).toBe(0); // Less than 2 points
    });

    it('should handle constant values (zero denominator)', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 5,
          energy: 7,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-01-02',
          mood: 5,
          energy: 8,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-01-03',
          mood: 5,
          energy: 9,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'mood', 'energy');
      expect(correlation).toBe(0); // Mood is constant, so no correlation
    });

    it('should calculate realistic correlation for sleep and energy', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 6,
          energy: 5,
          stress: 6,
          sleepQuality: 4,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-01-02',
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 7,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-01-03',
          mood: 5,
          energy: 4,
          stress: 7,
          sleepQuality: 3,
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
        {
          id: '4',
          userId: 'user1',
          date: '2025-01-04',
          mood: 8,
          energy: 8,
          stress: 4,
          sleepQuality: 9,
          createdAt: '2025-01-04T10:00:00Z',
          updatedAt: '2025-01-04T10:00:00Z',
        },
        {
          id: '5',
          userId: 'user1',
          date: '2025-01-05',
          mood: 6,
          energy: 6,
          stress: 6,
          sleepQuality: 6,
          createdAt: '2025-01-05T10:00:00Z',
          updatedAt: '2025-01-05T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'sleepQuality', 'energy');
      expect(correlation).toBeGreaterThan(0.5); // Should show positive correlation
      expect(correlation).toBeLessThanOrEqual(1);
    });

    it('should round to 2 decimal places', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 5,
          energy: 6,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-01-02',
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-01-03',
          mood: 6,
          energy: 8,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'mood', 'energy');
      // Should be rounded to 2 decimals
      expect(correlation.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
    });
  });

  describe('hasReflectedToday', () => {
    it('should return true if reflected today', () => {
      const today = new Date().toISOString().split('T')[0];
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: today,
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 8,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      expect(hasReflectedToday(reflections)).toBe(true);
    });

    it('should return false if not reflected today', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: yesterday,
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 8,
          createdAt: yesterday + 'T10:00:00Z',
          updatedAt: yesterday + 'T10:00:00Z',
        },
      ];

      expect(hasReflectedToday(reflections)).toBe(false);
    });

    it('should return false for empty array', () => {
      expect(hasReflectedToday([])).toBe(false);
    });
  });

  describe('getTopGratitudes', () => {
    it('should return top gratitudes by frequency', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 8,
          gratitude: ['Family', 'Health', 'Friends'],
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-01-02',
          mood: 8,
          energy: 8,
          stress: 4,
          sleepQuality: 9,
          gratitude: ['Health', 'Work', 'Family'],
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-01-03',
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 7,
          gratitude: ['Health', 'Sunshine', 'Coffee'],
          createdAt: '2025-01-03T10:00:00Z',
          updatedAt: '2025-01-03T10:00:00Z',
        },
      ];

      const topGratitudes = getTopGratitudes(reflections, 3);

      expect(topGratitudes).toContain('health'); // Appears 3 times (lowercase)
      expect(topGratitudes).toContain('family'); // Appears 2 times (lowercase)
      expect(topGratitudes.length).toBeLessThanOrEqual(3);
    });

    it('should handle empty reflections', () => {
      const topGratitudes = getTopGratitudes([]);
      expect(topGratitudes).toEqual([]);
    });

    it('should ignore reflections without gratitude', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 8,
          // No gratitude
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-01-02',
          mood: 8,
          energy: 8,
          stress: 4,
          sleepQuality: 9,
          gratitude: ['Health'],
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T10:00:00Z',
        },
      ];

      const topGratitudes = getTopGratitudes(reflections, 10);
      expect(topGratitudes).toEqual(['health']); // lowercase
    });

    it('should respect limit parameter', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-01-01',
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 8,
          gratitude: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T10:00:00Z',
        },
      ];

      const topGratitudes = getTopGratitudes(reflections, 3);
      expect(topGratitudes.length).toBeLessThanOrEqual(3);
    });
  });
});
