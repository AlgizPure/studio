// tests/unit/analytics/volume.test.ts
// Tests for volume calculation utilities

import { describe, it, expect } from 'vitest';
import { calculateWorkoutVolume, calculateTotalVolume } from '@/lib/analytics/volume';
import type { WorkoutLog } from '@/lib/types';

describe('Volume Calculations', () => {
  describe('calculateWorkoutVolume', () => {
    it('should calculate total volume for single exercise', () => {
      const workout: WorkoutLog = {
        id: '1',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-11-17',
        startTime: '2025-11-17T10:00:00Z',
        endTime: '2025-11-17T11:00:00Z',
        duration: 60,
        status: 'completed',
        cycles: [
          {
            cycleId: 'cycle1',
            cycleNumber: 0,
            exercises: [
              {
                exerciseId: 'bench-press',
                sets: [
                  { setNumber: 1, weight: 100, reps: 8, completed: true, timestamp: '2025-11-17T10:10:00Z' },
                  { setNumber: 2, weight: 100, reps: 7, completed: true, timestamp: '2025-11-17T10:15:00Z' },
                  { setNumber: 3, weight: 100, reps: 6, completed: true, timestamp: '2025-11-17T10:20:00Z' },
                ],
                skipped: false,
              },
            ],
            completed: true,
          },
        ],
        createdAt: '2025-11-17T10:00:00Z',
        updatedAt: '2025-11-17T11:00:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(2100); // 100*8 + 100*7 + 100*6 = 800 + 700 + 600
    });

    it('should calculate volume for multiple exercises', () => {
      const workout: WorkoutLog = {
        id: '2',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-11-17',
        startTime: '2025-11-17T10:00:00Z',
        endTime: '2025-11-17T11:30:00Z',
        duration: 90,
        status: 'completed',
        cycles: [
          {
            cycleId: 'cycle1',
            cycleNumber: 0,
            exercises: [
              {
                exerciseId: 'bench-press',
                sets: [
                  { setNumber: 1, weight: 100, reps: 10, completed: true, timestamp: '2025-11-17T10:10:00Z' },
                  { setNumber: 2, weight: 100, reps: 10, completed: true, timestamp: '2025-11-17T10:15:00Z' },
                ],
                skipped: false,
              },
              {
                exerciseId: 'squat',
                sets: [
                  { setNumber: 1, weight: 150, reps: 5, completed: true, timestamp: '2025-11-17T10:30:00Z' },
                  { setNumber: 2, weight: 150, reps: 5, completed: true, timestamp: '2025-11-17T10:35:00Z' },
                ],
                skipped: false,
              },
            ],
            completed: true,
          },
        ],
        createdAt: '2025-11-17T10:00:00Z',
        updatedAt: '2025-11-17T11:30:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(3500); // (100*10 + 100*10) + (150*5 + 150*5) = 2000 + 1500
    });

    it('should ignore incomplete sets', () => {
      const workout: WorkoutLog = {
        id: '3',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-11-17',
        startTime: '2025-11-17T10:00:00Z',
        endTime: '2025-11-17T10:30:00Z',
        duration: 30,
        status: 'completed',
        cycles: [
          {
            cycleId: 'cycle1',
            cycleNumber: 0,
            exercises: [
              {
                exerciseId: 'bench-press',
                sets: [
                  { setNumber: 1, weight: 100, reps: 10, completed: true, timestamp: '2025-11-17T10:10:00Z' },
                  { setNumber: 2, weight: 100, reps: 10, completed: false, timestamp: '2025-11-17T10:15:00Z' }, // Not completed
                  { setNumber: 3, weight: 100, reps: 10, completed: true, timestamp: '2025-11-17T10:20:00Z' },
                ],
                skipped: false,
              },
            ],
            completed: true,
          },
        ],
        createdAt: '2025-11-17T10:00:00Z',
        updatedAt: '2025-11-17T10:30:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(2000); // Only sets 1 and 3: 100*10 + 100*10
    });

    it('should handle sets without weight or reps', () => {
      const workout: WorkoutLog = {
        id: '4',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-11-17',
        startTime: '2025-11-17T10:00:00Z',
        endTime: '2025-11-17T10:20:00Z',
        duration: 20,
        status: 'completed',
        cycles: [
          {
            cycleId: 'cycle1',
            cycleNumber: 0,
            exercises: [
              {
                exerciseId: 'plank',
                sets: [
                  { setNumber: 1, reps: 0, completed: true, timestamp: '2025-11-17T10:10:00Z' }, // No weight/reps (duration exercise)
                ],
                skipped: false,
              },
            ],
            completed: true,
          },
        ],
        createdAt: '2025-11-17T10:00:00Z',
        updatedAt: '2025-11-17T10:20:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(0); // Duration exercises don't contribute to volume
    });

    it('should return 0 for workout with no cycles', () => {
      const workout: WorkoutLog = {
        id: '5',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-11-17',
        startTime: '2025-11-17T10:00:00Z',
        endTime: '2025-11-17T10:05:00Z',
        duration: 5,
        status: 'completed',
        cycles: [],
        createdAt: '2025-11-17T10:00:00Z',
        updatedAt: '2025-11-17T10:05:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(0);
    });
  });

  describe('calculateTotalVolume', () => {
    it('should calculate total volume for multiple workouts', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          workoutId: 'workout1',
          date: '2025-11-15',
          startTime: '2025-11-15T10:00:00Z',
          endTime: '2025-11-15T11:00:00Z',
          duration: 60,
          status: 'completed',
          totalVolume: 2000,
          cycles: [],
          createdAt: '2025-11-15T10:00:00Z',
          updatedAt: '2025-11-15T11:00:00Z',
        },
        {
          id: '2',
          userId: 'user1',
          workoutId: 'workout2',
          date: '2025-11-16',
          startTime: '2025-11-16T10:00:00Z',
          endTime: '2025-11-16T11:00:00Z',
          duration: 60,
          status: 'completed',
          totalVolume: 2500,
          cycles: [],
          createdAt: '2025-11-16T10:00:00Z',
          updatedAt: '2025-11-16T11:00:00Z',
        },
      ];

      const total = calculateTotalVolume(workouts);
      expect(total).toBe(4500); // 2000 + 2500
    });

    it('should calculate volume on-the-fly if totalVolume not present', () => {
      const workouts: WorkoutLog[] = [
        {
          id: '1',
          userId: 'user1',
          workoutId: 'workout1',
          date: '2025-11-17',
          startTime: '2025-11-17T10:00:00Z',
          endTime: '2025-11-17T11:00:00Z',
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 0,
              exercises: [
                {
                  exerciseId: 'bench-press',
                  sets: [
                    { setNumber: 1, weight: 100, reps: 10, completed: true, timestamp: '2025-11-17T10:10:00Z' },
                  ],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          createdAt: '2025-11-17T10:00:00Z',
          updatedAt: '2025-11-17T11:00:00Z',
        },
      ];

      const total = calculateTotalVolume(workouts);
      expect(total).toBe(1000); // 100 * 10
    });

    it('should return 0 for empty workout array', () => {
      const workouts: WorkoutLog[] = [];
      const total = calculateTotalVolume(workouts);
      expect(total).toBe(0);
    });
  });
});
