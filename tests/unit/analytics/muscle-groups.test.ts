// tests/unit/analytics/muscle-groups.test.ts
// Tests for muscle group analytics utilities

import { describe, it, expect } from 'vitest';
import {
  getExerciseMuscleGroup,
  getMuscleGroupMovementCategory,
  calculateMuscleGroupVolumeByWeek,
  calculateTrainingBalance,
  calculateVolumeDistribution,
  MUSCLE_GROUPS,
  MOVEMENT_CATEGORIES,
} from '@/lib/analytics/muscle-groups';
import type { WorkoutLog } from '@/lib/types/workout-log';

describe('Muscle Groups Analytics', () => {
  describe('getExerciseMuscleGroup', () => {
    it('should identify chest exercises', () => {
      expect(getExerciseMuscleGroup('Bench Press')).toBe('Chest');
      expect(getExerciseMuscleGroup('Chest Fly')).toBe('Chest');
      expect(getExerciseMuscleGroup('Incline Press')).toBe('Chest');
    });

    it('should identify back exercises', () => {
      expect(getExerciseMuscleGroup('Barbell Row')).toBe('Back');
      expect(getExerciseMuscleGroup('Pull-ups')).toBe('Back');
      expect(getExerciseMuscleGroup('Lat Pulldown')).toBe('Back');
      expect(getExerciseMuscleGroup('Deadlift')).toBe('Back');
    });

    it('should identify leg exercises', () => {
      expect(getExerciseMuscleGroup('Squat')).toBe('Legs');
      expect(getExerciseMuscleGroup('Leg Press')).toBe('Legs');
      expect(getExerciseMuscleGroup('Lunges')).toBe('Legs');
      expect(getExerciseMuscleGroup('Calf Raises')).toBe('Legs');
    });

    it('should identify shoulder exercises', () => {
      expect(getExerciseMuscleGroup('Shoulder Press')).toBe('Shoulders');
      expect(getExerciseMuscleGroup('Lateral Raise')).toBe('Shoulders');
      expect(getExerciseMuscleGroup('Overhead Press')).toBe('Shoulders');
      expect(getExerciseMuscleGroup('Military Press')).toBe('Shoulders');
    });

    it('should identify arm exercises', () => {
      expect(getExerciseMuscleGroup('Bicep Curl')).toBe('Arms');
      expect(getExerciseMuscleGroup('Tricep Extension')).toBe('Arms');
      expect(getExerciseMuscleGroup('Hammer Curl')).toBe('Arms');
    });

    it('should identify core exercises', () => {
      expect(getExerciseMuscleGroup('Plank')).toBe('Core');
      expect(getExerciseMuscleGroup('Ab Crunches')).toBe('Core');
      expect(getExerciseMuscleGroup('Core Workout')).toBe('Core');
    });

    it('should default to Core for unknown exercises', () => {
      expect(getExerciseMuscleGroup('Unknown Exercise')).toBe('Core');
      expect(getExerciseMuscleGroup('')).toBe('Core');
    });
  });

  describe('getMuscleGroupMovementCategory', () => {
    it('should categorize Push movements', () => {
      expect(getMuscleGroupMovementCategory('Chest')).toBe('Push');
      expect(getMuscleGroupMovementCategory('Shoulders')).toBe('Push');
      expect(getMuscleGroupMovementCategory('Arms')).toBe('Push');
    });

    it('should categorize Pull movements', () => {
      expect(getMuscleGroupMovementCategory('Back')).toBe('Pull');
      expect(getMuscleGroupMovementCategory('Core')).toBe('Pull');
    });

    it('should categorize Legs movements', () => {
      expect(getMuscleGroupMovementCategory('Legs')).toBe('Legs');
    });
  });

  describe('calculateMuscleGroupVolumeByWeek', () => {
    it('should calculate volume by muscle group and week', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          workoutId: 'workout1',
          userId: 'user1',
          programId: 'prog1',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [
                    { setNumber: 1, reps: 10, weight: 100, completed: true, timestamp: '2025-11-17T10:00:00Z' },
                    { setNumber: 2, reps: 10, weight: 100, completed: true, timestamp: '2025-11-17T10:05:00Z' },
                  ],
                  skipped: false,
                },
                {
                  exerciseId: 'ex2',
                  sets: [
                    { setNumber: 1, reps: 8, weight: 150, completed: true, timestamp: '2025-11-17T10:10:00Z' },
                  ],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = calculateMuscleGroupVolumeByWeek(workouts, 12);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('week');
      expect(result[0]).toHaveProperty('muscleGroup');
      expect(result[0]).toHaveProperty('volume');
      expect(result[0]).toHaveProperty('sets');

      // Verify Chest volume (100*10 + 100*10 = 2000)
      const chestData = result.find(r => r.muscleGroup === 'Chest');
      expect(chestData?.volume).toBe(2000);
      expect(chestData?.sets).toBe(2);

      // Verify Legs volume (150*8 = 1200)
      const legsData = result.find(r => r.muscleGroup === 'Legs');
      expect(legsData?.volume).toBe(1200);
      expect(legsData?.sets).toBe(1);
    });

    it('should filter workouts by weeksBack parameter', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100); // 100 days ago

      const workouts: WorkoutLog[] = [
        {
          id: '1',
          workoutId: 'workout1',
          userId: 'user1',
          programId: 'prog1',
          date: oldDate.toISOString(),
          startTime: oldDate.toISOString(),
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, completed: true, timestamp: '2025-11-17T10:00:00Z' }],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          createdAt: oldDate.toISOString(),
          updatedAt: oldDate.toISOString(),
        },
      ];

      const result = calculateMuscleGroupVolumeByWeek(workouts, 4); // Only last 4 weeks
      expect(result.length).toBe(0); // Old workout should be filtered out
    });

    it('should handle empty workouts', () => {
      const result = calculateMuscleGroupVolumeByWeek([], 12);
      expect(result).toEqual([]);
    });

    it('should ignore incomplete sets', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          workoutId: 'workout1',
          userId: 'user1',
          programId: 'prog1',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [
                    { setNumber: 1, reps: 10, weight: 100, completed: true, timestamp: '2025-11-17T10:00:00Z' },
                    { setNumber: 2, reps: 10, weight: 100, completed: false, timestamp: '2025-11-17T10:05:00Z' }, // Not completed
                  ],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = calculateMuscleGroupVolumeByWeek(workouts, 12);
      const chestData = result.find(r => r.muscleGroup === 'Chest');

      // Only 1 completed set: 100*10 = 1000
      expect(chestData?.volume).toBe(1000);
      expect(chestData?.sets).toBe(1);
    });
  });

  describe('calculateTrainingBalance', () => {
    it('should calculate balance across all muscle groups', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          workoutId: 'workout1',
          userId: 'user1',
          programId: 'prog1',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, completed: true, timestamp: '2025-11-17T10:00:00Z' }],
                  skipped: false,
                },
                {
                  exerciseId: 'ex2',
                  sets: [{ setNumber: 1, reps: 10, weight: 80, completed: true, timestamp: '2025-11-17T10:00:00Z' }],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = calculateTrainingBalance(workouts);

      // Should have data for all muscle groups
      expect(result.length).toBe(MUSCLE_GROUPS.length);

      // All results should have required properties
      result.forEach(item => {
        expect(item).toHaveProperty('muscleGroup');
        expect(item).toHaveProperty('volume');
        expect(item).toHaveProperty('percentage');
        expect(item).toHaveProperty('sets');
      });

      // Verify percentages sum to 100 (or 0 if no volume)
      const totalPercentage = result.reduce((sum, item) => sum + item.percentage, 0);
      expect(totalPercentage).toBe(100);

      // Verify Chest: 100*10 = 1000
      const chest = result.find(r => r.muscleGroup === 'Chest');
      expect(chest?.volume).toBe(1000);
      expect(chest?.sets).toBe(1);

      // Verify Back: 80*10 = 800
      const back = result.find(r => r.muscleGroup === 'Back');
      expect(back?.volume).toBe(800);
      expect(back?.sets).toBe(1);
    });

    it('should handle empty workouts with zero percentages', () => {
      const result = calculateTrainingBalance([]);

      expect(result.length).toBe(MUSCLE_GROUPS.length);

      result.forEach(item => {
        expect(item.volume).toBe(0);
        expect(item.percentage).toBe(0);
        expect(item.sets).toBe(0);
      });
    });

    it('should calculate correct percentages', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          workoutId: 'workout1',
          userId: 'user1',
          programId: 'prog1',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, completed: true, timestamp: '2025-11-17T10:00:00Z' }], // 1000 kg
                  skipped: false,
                },
                {
                  exerciseId: 'ex2',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, completed: true, timestamp: '2025-11-17T10:05:00Z' }], // 1000 kg
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = calculateTrainingBalance(workouts);

      // Total volume: 2000 kg
      // Chest: 1000 / 2000 = 50%
      // Legs: 1000 / 2000 = 50%
      const chest = result.find(r => r.muscleGroup === 'Chest');
      const legs = result.find(r => r.muscleGroup === 'Legs');

      expect(chest?.percentage).toBe(50);
      expect(legs?.percentage).toBe(50);
    });
  });

  describe('calculateVolumeDistribution', () => {
    it('should calculate distribution across movement categories', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          workoutId: 'workout1',
          userId: 'user1',
          programId: 'prog1',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 100, completed: true, timestamp: '2025-11-17T10:00:00Z' }],
                  skipped: false,
                },
                {
                  exerciseId: 'ex2',
                  sets: [{ setNumber: 1, reps: 10, weight: 80, completed: true, timestamp: '2025-11-17T10:05:00Z' }],
                  skipped: false,
                },
                {
                  exerciseId: 'ex3',
                  sets: [{ setNumber: 1, reps: 10, weight: 120, completed: true, timestamp: '2025-11-17T10:10:00Z' }],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = calculateVolumeDistribution(workouts);

      // Should have data for all movement categories
      expect(result.length).toBe(MOVEMENT_CATEGORIES.length);

      // All results should have required properties
      result.forEach(item => {
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('volume');
        expect(item).toHaveProperty('percentage');
        expect(item).toHaveProperty('sets');
      });

      // Verify percentages sum to 100
      const totalPercentage = result.reduce((sum, item) => sum + item.percentage, 0);
      expect(totalPercentage).toBe(100);

      // Verify Push: 100*10 = 1000
      const push = result.find(r => r.category === 'Push');
      expect(push?.volume).toBe(1000);

      // Verify Pull: 80*10 = 800
      const pull = result.find(r => r.category === 'Pull');
      expect(pull?.volume).toBe(800);

      // Verify Legs: 120*10 = 1200
      const legs = result.find(r => r.category === 'Legs');
      expect(legs?.volume).toBe(1200);
    });

    it('should handle empty workouts', () => {
      const result = calculateVolumeDistribution([]);

      expect(result.length).toBe(MOVEMENT_CATEGORIES.length);

      result.forEach(item => {
        expect(item.volume).toBe(0);
        expect(item.percentage).toBe(0);
        expect(item.sets).toBe(0);
      });
    });

    it('should calculate correct category percentages', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          workoutId: 'workout1',
          userId: 'user1',
          programId: 'prog1',
          date: new Date().toISOString(),
          startTime: new Date().toISOString(),
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 1,
              exercises: [
                {
                  exerciseId: 'ex1',
                  sets: [{ setNumber: 1, reps: 10, weight: 50, completed: true, timestamp: '2025-11-17T10:00:00Z' }], // 500 kg
                  skipped: false,
                },
                {
                  exerciseId: 'ex2',
                  sets: [{ setNumber: 1, reps: 10, weight: 50, completed: true, timestamp: '2025-11-17T10:05:00Z' }], // 500 kg
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      const result = calculateVolumeDistribution(workouts);

      // Total: 1000 kg
      // Push: 500 / 1000 = 50%
      // Pull: 500 / 1000 = 50%
      // Legs: 0 / 1000 = 0%
      const push = result.find(r => r.category === 'Push');
      const pull = result.find(r => r.category === 'Pull');
      const legs = result.find(r => r.category === 'Legs');

      expect(push?.percentage).toBe(50);
      expect(pull?.percentage).toBe(50);
      expect(legs?.percentage).toBe(0);
    });
  });
});
