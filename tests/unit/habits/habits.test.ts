// tests/unit/habits/habits.test.ts
// Tests for habit utilities

import { describe, it, expect } from 'vitest';
import { isHabitDueToday, computeStreakFromLogs, calculateHabitStrengthScore } from '@/lib/habits';
import type { HabitV2, HabitLog } from '@/lib/types';

describe('Habit Utilities', () => {
  describe('isHabitDueToday', () => {
    it('should return true for habit with days_of_week schedule on correct day', () => {
      const habit: HabitV2 = {
        id: 'habit1',
        name: 'Morning Meditation',
        type: 'boolean',
        schedule: {
          intervalType: 'days_of_week',
          days: ['Monday', 'Wednesday', 'Friday'],
        },
      };

      const monday = new Date('2025-11-17T10:00:00Z'); // Monday
      expect(isHabitDueToday(habit, monday)).toBe(true);

      const tuesday = new Date('2025-11-18T10:00:00Z'); // Tuesday
      expect(isHabitDueToday(habit, tuesday)).toBe(false);
    });

    it('should return true for habit with no schedule', () => {
      const habit: HabitV2 = {
        id: 'habit1',
        name: 'Drink Water',
        type: 'boolean',
      };

      const today = new Date();
      expect(isHabitDueToday(habit, today)).toBe(true);
    });

    it('should respect start and end dates', () => {
      const habit: HabitV2 = {
        id: 'habit1',
        name: 'Temporary Habit',
        type: 'boolean',
        schedule: {
          intervalType: 'days_of_week',
          startDate: '2025-11-15',
          endDate: '2025-11-20',
        },
      };

      const before = new Date('2025-11-14T10:00:00Z');
      expect(isHabitDueToday(habit, before)).toBe(false);

      const during = new Date('2025-11-17T10:00:00Z');
      expect(isHabitDueToday(habit, during)).toBe(true);

      const after = new Date('2025-11-21T10:00:00Z');
      expect(isHabitDueToday(habit, after)).toBe(false);
    });
  });

  describe('computeStreakFromLogs', () => {
    it('should calculate current and longest streak', () => {
      const logs: HabitLog[] = [
        {
          id: '1',
          habitId: 'habit1',
          date: '2025-11-13',
          status: 'done',
          createdAt: '2025-11-13T10:00:00Z',
          updatedAt: '2025-11-13T10:00:00Z',
        },
        {
          id: '2',
          habitId: 'habit1',
          date: '2025-11-14',
          status: 'done',
          createdAt: '2025-11-14T10:00:00Z',
          updatedAt: '2025-11-14T10:00:00Z',
        },
        {
          id: '3',
          habitId: 'habit1',
          date: '2025-11-15',
          status: 'done',
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
        // Gap on 11-16
        {
          id: '4',
          habitId: 'habit1',
          date: '2025-11-17',
          status: 'done',
          createdAt: '2025-11-17T10:00:00Z',
          updatedAt: '2025-11-17T10:00:00Z',
        },
      ];

      const result = computeStreakFromLogs(logs);
      expect(result.current).toBe(1); // Only 11-17 is current
      expect(result.longest).toBe(3); // 11-13, 11-14, 11-15
      expect(result.lastCompletedDate).toBe('2025-11-17');
    });

    it('should return zeros for empty logs', () => {
      const logs: HabitLog[] = [];
      const result = computeStreakFromLogs(logs);
      expect(result.current).toBe(0);
      expect(result.longest).toBe(0);
      expect(result.lastCompletedDate).toBeUndefined();
    });
  });

  describe('calculateHabitStrengthScore', () => {
    it('should calculate high score for consistent habit', () => {
      const score = calculateHabitStrengthScore({
        currentStreak: 30,
        longestStreak: 50,
        completionRate90d: 90,
        consistencyScore: 85,
      });

      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate low score for poor habit', () => {
      const score = calculateHabitStrengthScore({
        currentStreak: 0,
        longestStreak: 5,
        completionRate90d: 30,
        consistencyScore: 20,
      });

      expect(score).toBeLessThan(40);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });
});
