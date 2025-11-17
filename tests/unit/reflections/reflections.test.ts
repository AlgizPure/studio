// tests/unit/reflections/reflections.test.ts
// Tests for reflections and wheel-of-life utilities

import { describe, it, expect } from 'vitest';
import { calculateReflectionStats, calculateCorrelation } from '@/lib/reflections';
import { calculateBalanceScore } from '@/lib/wheel-of-life';
import type { DailyReflection, WeeklyContext } from '@/lib/types';

describe('Reflections Utilities', () => {
  describe('calculateReflectionStats', () => {
    it('should calculate average values correctly', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-11-15',
          mood: 8,
          energy: 7,
          stress: 4,
          sleepQuality: 8,
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-11-16',
          mood: 7,
          energy: 6,
          stress: 5,
          sleepQuality: 7,
          createdAt: '2025-11-16T10:00:00Z',
          updatedAt: '2025-11-16T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-11-17',
          mood: 9,
          energy: 8,
          stress: 3,
          sleepQuality: 9,
          createdAt: '2025-11-17T10:00:00Z',
          updatedAt: '2025-11-17T10:00:00Z',
        },
      ];

      const stats = calculateReflectionStats(reflections, 30);

      expect(stats.averageMood).toBe(8); // (8+7+9)/3 = 8
      expect(stats.averageEnergy).toBe(7); // (7+6+8)/3 = 7
      expect(stats.averageStress).toBe(4); // (4+5+3)/3 = 4
      expect(stats.averageSleepQuality).toBe(8); // (8+7+9)/3 = 8
      expect(stats.totalReflections).toBe(3);
    });

    it('should return zeros for empty reflections', () => {
      const reflections: DailyReflection[] = [];
      const stats = calculateReflectionStats(reflections, 30);

      expect(stats.averageMood).toBe(0);
      expect(stats.averageEnergy).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.totalReflections).toBe(0);
    });
  });

  describe('calculateCorrelation', () => {
    it('should calculate positive correlation', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-11-15',
          mood: 5,
          energy: 5,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-11-16',
          mood: 7,
          energy: 7,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-11-16T10:00:00Z',
          updatedAt: '2025-11-16T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          date: '2025-11-17',
          mood: 9,
          energy: 9,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-11-17T10:00:00Z',
          updatedAt: '2025-11-17T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'mood', 'energy');
      expect(correlation).toBe(1); // Perfect positive correlation
    });

    it('should return 0 for constant values', () => {
      const reflections: DailyReflection[] = [
        {
          id: '1',
          userId: 'user1',
          date: '2025-11-15',
          mood: 7,
          energy: 5,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          date: '2025-11-16',
          mood: 7,
          energy: 5,
          stress: 5,
          sleepQuality: 5,
          createdAt: '2025-11-16T10:00:00Z',
          updatedAt: '2025-11-16T10:00:00Z',
        },
      ];

      const correlation = calculateCorrelation(reflections, 'mood', 'energy');
      expect(correlation).toBe(0); // No variance = no correlation
    });
  });
});

describe('Wheel of Life Utilities', () => {
  describe('calculateBalanceScore', () => {
    it('should calculate perfect balance for equal values', () => {
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

    it('should calculate lower score for varied values', () => {
      const contexts: WeeklyContext['contexts'] = {
        fitness: 9,
        career: 3,
        relationships: 8,
        growth: 4,
        environment: 7,
        fun: 2,
        contribution: 5,
        spirituality: 6,
      };

      const result = calculateBalanceScore(contexts);

      expect(result.overall).toBeLessThan(100);
      expect(result.weakestDimension).toBe('fun'); // 2 is lowest
      expect(result.strongestDimension).toBe('fitness'); // 9 is highest
    });
  });
});
