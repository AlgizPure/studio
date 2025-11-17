// tests/unit/analytics/statistics.test.ts
// Tests for statistics utilities

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  calculateStats,
  calculateDayFrequency,
  calculatePersonalRecords,
  calculateRPEDistribution,
  calculatePeriodStats,
  comparePeriods,
} from '@/lib/analytics/statistics';
import type { WorkoutLog } from '@/lib/types';
import type { PeriodStats } from '@/lib/analytics/types';

// Mock date-utils to control date filtering
vi.mock('@/lib/analytics/date-utils', () => ({
  getWorkoutsByDateRange: (workouts: WorkoutLog[], range: string) => {
    // For testing, just return all workouts
    return workouts;
  },
}));

// Mock trend-analysis
vi.mock('@/lib/analytics/trend-analysis', () => ({
  calculateTrend: (values: number[]) => {
    const first = values[0] || 0;
    const last = values[values.length - 1] || 0;
    const change = first > 0 ? ((last - first) / first) * 100 : 0;
    return {
      slope: last - first,
      trend: change > 2 ? 'increasing' : change < -2 ? 'decreasing' : 'stable',
      changePercentage: change,
    };
  },
}));

describe('Statistics Utilities', () => {
  describe('calculateStats', () => {
    it('should calculate basic statistics for workouts', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          totalVolume: 1000,
          cycles: [],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-16',
          duration: 45,
          totalVolume: 800,
          cycles: [],
          createdAt: '2025-11-16T10:00:00Z',
          updatedAt: '2025-11-16T10:00:00Z',
        },
      ];

      const stats = calculateStats(workouts, '7d');

      expect(stats.totalWorkouts).toBe(2);
      expect(stats.totalVolume).toBe(1800); // 1000 + 800
      expect(stats.avgDuration).toBe(53); // (60 + 45) / 2 = 52.5 => 53
      expect(stats.consistency).toBeGreaterThanOrEqual(0);
      expect(stats.consistency).toBeLessThanOrEqual(100);
    });

    it('should return zeros for empty workouts', () => {
      const stats = calculateStats([], '30d');

      expect(stats.totalWorkouts).toBe(0);
      expect(stats.totalVolume).toBe(0);
      expect(stats.avgDuration).toBe(0);
      expect(stats.consistency).toBe(0);
    });

    it('should cap consistency at 100%', () => {
      // Create many workouts to test consistency cap
      const workouts: WorkoutLog[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        userId: 'user1',
        programId: 'prog1',
        date: `2025-11-${(i % 30) + 1}`,
        duration: 60,
        totalVolume: 1000,
        cycles: [],
        createdAt: `2025-11-${(i % 30) + 1}T10:00:00Z`,
        updatedAt: `2025-11-${(i % 30) + 1}T10:00:00Z`,
      }));

      const stats = calculateStats(workouts, '7d');

      expect(stats.consistency).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateDayFrequency', () => {
    beforeEach(() => {
      // Mock Date to ensure consistent results
      vi.setSystemTime(new Date('2025-11-17T12:00:00Z'));
    });

    it('should calculate frequency for each day of week', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-17', // Monday
          duration: 60,
          totalVolume: 1000,
          cycles: [],
          createdAt: '2025-11-17T10:00:00Z',
          updatedAt: '2025-11-17T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-18', // Tuesday
          duration: 45,
          totalVolume: 800,
          cycles: [],
          createdAt: '2025-11-18T10:00:00Z',
          updatedAt: '2025-11-18T10:00:00Z',
        },
      ];

      const frequency = calculateDayFrequency(workouts);

      expect(frequency).toHaveLength(7); // 7 days of week

      // Verify structure
      frequency.forEach(day => {
        expect(day).toHaveProperty('dayOfWeek');
        expect(day).toHaveProperty('dayIndex');
        expect(day).toHaveProperty('count');
        expect(day).toHaveProperty('avgVolume');
        expect(day).toHaveProperty('avgDuration');
      });

      // Verify day names
      const dayNames = frequency.map(d => d.dayOfWeek);
      expect(dayNames).toEqual(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']);
    });

    it('should aggregate workouts on the same day', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-17', // Monday
          duration: 60,
          totalVolume: 1000,
          cycles: [],
          createdAt: '2025-11-17T10:00:00Z',
          updatedAt: '2025-11-17T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-17', // Monday (same day)
          duration: 45,
          totalVolume: 800,
          cycles: [],
          createdAt: '2025-11-17T14:00:00Z',
          updatedAt: '2025-11-17T14:00:00Z',
        },
      ];

      const frequency = calculateDayFrequency(workouts);
      const monday = frequency.find(d => d.dayOfWeek === 'Mon');

      expect(monday?.count).toBe(2);
      expect(monday?.avgVolume).toBe(900); // (1000 + 800) / 2
      expect(monday?.avgDuration).toBe(53); // (60 + 45) / 2 = 52.5 => 53
    });

    it('should return zero counts for days with no workouts', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-17', // Monday only
          duration: 60,
          totalVolume: 1000,
          cycles: [],
          createdAt: '2025-11-17T10:00:00Z',
          updatedAt: '2025-11-17T10:00:00Z',
        },
      ];

      const frequency = calculateDayFrequency(workouts);
      const tuesday = frequency.find(d => d.dayOfWeek === 'Tue');

      expect(tuesday?.count).toBe(0);
      expect(tuesday?.avgVolume).toBe(0);
      expect(tuesday?.avgDuration).toBe(0);
    });
  });

  describe('calculatePersonalRecords', () => {
    it('should calculate personal records for exercises', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'bench-press',
                  exerciseName: 'Bench Press',
                  sets: [
                    { setNumber: 1, reps: 10, weight: 100, completed: true },
                    { setNumber: 2, reps: 8, weight: 110, completed: true },
                  ],
                },
              ],
            },
          ],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
      ];

      const records = calculatePersonalRecords(workouts);

      expect(records.length).toBe(1);
      expect(records[0].exerciseId).toBe('bench-press');
      expect(records[0].exerciseName).toBe('bench-press'); // No name map provided
      expect(records[0].maxWeight).toBe(110); // Max weight from set 2
      expect(records[0].maxReps).toBe(10); // Max reps from set 1
      expect(records[0].maxVolume).toBe(1880); // 100*10 + 110*8 = 1880
      expect(records[0].date).toBe('2025-11-15');
      expect(records[0].recentProgress).toBeDefined();
    });

    it('should use exercise name map when provided', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  exerciseName: '',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, completed: true }],
                },
              ],
            },
          ],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
      ];

      const nameMap = { ex1: 'Bench Press' };
      const records = calculatePersonalRecords(workouts, nameMap);

      expect(records[0].exerciseName).toBe('Bench Press');
    });

    it('should update records across multiple workouts', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, completed: true }],
                },
              ],
            },
          ],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-16',
          duration: 60,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 8, weight: 120, completed: true }], // Higher weight
                },
              ],
            },
          ],
          createdAt: '2025-11-16T10:00:00Z',
          updatedAt: '2025-11-16T10:00:00Z',
        },
      ];

      const records = calculatePersonalRecords(workouts);

      expect(records.length).toBe(1);
      expect(records[0].maxWeight).toBe(120); // Updated from second workout
      expect(records[0].date).toBe('2025-11-16'); // Date of new record
    });

    it('should sort records by max weight descending', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 50, completed: true }],
                },
                {
                  exerciseId: 'ex2',
                  sets: [{ setNumber: 1, reps: 10, weight: 150, completed: true }],
                },
                {
                  exerciseId: 'ex3',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, completed: true }],
                },
              ],
            },
          ],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
      ];

      const records = calculatePersonalRecords(workouts);

      expect(records[0].exerciseId).toBe('ex2'); // 150 kg
      expect(records[1].exerciseId).toBe('ex3'); // 100 kg
      expect(records[2].exerciseId).toBe('ex1'); // 50 kg
    });
  });

  describe('calculateRPEDistribution', () => {
    it('should calculate RPE distribution', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [
                    { setNumber: 1, reps: 10, weight: 100, rpe: 7, completed: true },
                    { setNumber: 2, reps: 10, weight: 100, rpe: 8, completed: true },
                    { setNumber: 3, reps: 10, weight: 100, rpe: 8, completed: true },
                  ],
                },
              ],
            },
          ],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
      ];

      const distribution = calculateRPEDistribution(workouts);

      expect(distribution).toHaveLength(10); // RPE 1-10

      // Verify structure
      distribution.forEach(item => {
        expect(item).toHaveProperty('rpe');
        expect(item).toHaveProperty('count');
        expect(item).toHaveProperty('percentage');
      });

      // Verify RPE 7: 1 set = 33%
      const rpe7 = distribution.find(d => d.rpe === 7);
      expect(rpe7?.count).toBe(1);
      expect(rpe7?.percentage).toBe(33); // 1/3 = 33.33% => 33

      // Verify RPE 8: 2 sets = 67%
      const rpe8 = distribution.find(d => d.rpe === 8);
      expect(rpe8?.count).toBe(2);
      expect(rpe8?.percentage).toBe(67); // 2/3 = 66.66% => 67

      // Verify unused RPEs have 0
      const rpe5 = distribution.find(d => d.rpe === 5);
      expect(rpe5?.count).toBe(0);
      expect(rpe5?.percentage).toBe(0);
    });

    it('should ignore incomplete sets', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [
                    { setNumber: 1, reps: 10, weight: 100, rpe: 7, completed: true },
                    { setNumber: 2, reps: 10, weight: 100, rpe: 9, completed: false }, // Incomplete
                  ],
                },
              ],
            },
          ],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
      ];

      const distribution = calculateRPEDistribution(workouts);

      const rpe7 = distribution.find(d => d.rpe === 7);
      const rpe9 = distribution.find(d => d.rpe === 9);

      expect(rpe7?.count).toBe(1); // Completed set
      expect(rpe9?.count).toBe(0); // Incomplete set ignored
    });

    it('should round RPE values', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [
                    { setNumber: 1, reps: 10, weight: 100, rpe: 7.4, completed: true }, // Rounds to 7
                    { setNumber: 2, reps: 10, weight: 100, rpe: 7.6, completed: true }, // Rounds to 8
                  ],
                },
              ],
            },
          ],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
      ];

      const distribution = calculateRPEDistribution(workouts);

      const rpe7 = distribution.find(d => d.rpe === 7);
      const rpe8 = distribution.find(d => d.rpe === 8);

      expect(rpe7?.count).toBe(1);
      expect(rpe8?.count).toBe(1);
    });
  });

  describe('calculatePeriodStats', () => {
    it('should calculate stats for a specific period', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-15',
          duration: 60,
          totalVolume: 1000,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, rpe: 7, completed: true }],
                },
              ],
            },
          ],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T10:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-16',
          duration: 45,
          totalVolume: 800,
          cycles: [
            {
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 80, rpe: 8, completed: true }],
                },
              ],
            },
          ],
          createdAt: '2025-11-16T10:00:00Z',
          updatedAt: '2025-11-16T10:00:00Z',
        },
        {
          id: '3',
          userId: 'user1',
          programId: 'prog1',
          date: '2025-11-20', // Outside period
          duration: 50,
          totalVolume: 900,
          cycles: [],
          createdAt: '2025-11-20T10:00:00Z',
          updatedAt: '2025-11-20T10:00:00Z',
        },
      ];

      const startDate = new Date('2025-11-15');
      const endDate = new Date('2025-11-16');

      const stats = calculatePeriodStats(workouts, startDate, endDate);

      expect(stats.totalWorkouts).toBe(2); // Only workouts within period
      expect(stats.totalVolume).toBe(1800); // 1000 + 800
      expect(stats.avgDuration).toBe(53); // (60 + 45) / 2 = 52.5 => 53
      expect(stats.avgRPE).toBe(7.5); // (7 + 8) / 2 = 7.5
      expect(stats.consistency).toBeGreaterThanOrEqual(0);
      expect(stats.consistency).toBeLessThanOrEqual(100);
    });

    it('should handle empty period', () => {
      const workouts: WorkoutLog[] = [];
      const startDate = new Date('2025-11-15');
      const endDate = new Date('2025-11-16');

      const stats = calculatePeriodStats(workouts, startDate, endDate);

      expect(stats.totalWorkouts).toBe(0);
      expect(stats.totalVolume).toBe(0);
      expect(stats.avgDuration).toBe(0);
      expect(stats.avgRPE).toBe(0);
      expect(stats.consistency).toBe(0);
    });
  });

  describe('comparePeriods', () => {
    it('should compare two periods correctly', () => {
      const currentStats: PeriodStats = {
        totalWorkouts: 10,
        totalVolume: 5000,
        avgDuration: 60,
        avgRPE: 7.5,
        consistency: 80,
      };

      const previousStats: PeriodStats = {
        totalWorkouts: 8,
        totalVolume: 4000,
        avgDuration: 55,
        avgRPE: 7.0,
        consistency: 70,
      };

      const comparison = comparePeriods(currentStats, previousStats);

      expect(comparison).toHaveLength(4); // Workouts, Volume, Avg Duration, Avg RPE

      // Verify Workouts: 10 vs 8 = +25%
      const workouts = comparison.find(c => c.metric === 'Workouts');
      expect(workouts?.current).toBe(10);
      expect(workouts?.previous).toBe(8);
      expect(workouts?.change).toBe(25); // (10-8)/8 = 0.25 = 25%
      expect(workouts?.changeType).toBe('positive');

      // Verify Volume: 5000 vs 4000 = +25%
      const volume = comparison.find(c => c.metric === 'Volume');
      expect(volume?.current).toBe(5000);
      expect(volume?.previous).toBe(4000);
      expect(volume?.change).toBe(25);
      expect(volume?.changeType).toBe('positive');
    });

    it('should handle zero previous values', () => {
      const currentStats: PeriodStats = {
        totalWorkouts: 10,
        totalVolume: 5000,
        avgDuration: 60,
        avgRPE: 7.5,
        consistency: 80,
      };

      const previousStats: PeriodStats = {
        totalWorkouts: 0,
        totalVolume: 0,
        avgDuration: 0,
        avgRPE: 0,
        consistency: 0,
      };

      const comparison = comparePeriods(currentStats, previousStats);

      const workouts = comparison.find(c => c.metric === 'Workouts');
      expect(workouts?.change).toBe(100); // 0 to 10 = +100%
      expect(workouts?.changeType).toBe('positive');
    });

    it('should detect negative changes', () => {
      const currentStats: PeriodStats = {
        totalWorkouts: 5,
        totalVolume: 2000,
        avgDuration: 50,
        avgRPE: 6.5,
        consistency: 60,
      };

      const previousStats: PeriodStats = {
        totalWorkouts: 10,
        totalVolume: 5000,
        avgDuration: 60,
        avgRPE: 7.5,
        consistency: 80,
      };

      const comparison = comparePeriods(currentStats, previousStats);

      const workouts = comparison.find(c => c.metric === 'Workouts');
      expect(workouts?.change).toBe(-50); // (5-10)/10 = -0.5 = -50%
      expect(workouts?.changeType).toBe('negative');

      const volume = comparison.find(c => c.metric === 'Volume');
      expect(volume?.change).toBe(-60); // (2000-5000)/5000 = -0.6 = -60%
      expect(volume?.changeType).toBe('negative');
    });

    it('should mark duration and RPE as neutral', () => {
      const currentStats: PeriodStats = {
        totalWorkouts: 10,
        totalVolume: 5000,
        avgDuration: 65,
        avgRPE: 8.0,
        consistency: 80,
      };

      const previousStats: PeriodStats = {
        totalWorkouts: 10,
        totalVolume: 5000,
        avgDuration: 55,
        avgRPE: 7.0,
        consistency: 80,
      };

      const comparison = comparePeriods(currentStats, previousStats);

      const duration = comparison.find(c => c.metric === 'Avg Duration');
      const rpe = comparison.find(c => c.metric === 'Avg RPE');

      expect(duration?.changeType).toBe('neutral');
      expect(rpe?.changeType).toBe('neutral');
    });
  });
});
