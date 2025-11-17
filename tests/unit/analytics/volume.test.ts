import { describe, it, expect } from 'vitest';
import { calculateWorkoutVolume, calculateTotalVolume } from '@/lib/analytics/volume';
import type { WorkoutLog } from '@/lib/types';

describe('Volume Calculations', () => {
  describe('calculateWorkoutVolume', () => {
    it('should calculate total volume for single exercise', () => {
      const workout: WorkoutLog = {
        id: 'test-workout',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-01-01',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
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
                  { setNumber: 1, weight: 100, reps: 8, completed: true, timestamp: '2025-01-01T10:10:00Z' },
                  { setNumber: 2, weight: 100, reps: 7, completed: true, timestamp: '2025-01-01T10:15:00Z' },
                  { setNumber: 3, weight: 100, reps: 6, completed: true, timestamp: '2025-01-01T10:20:00Z' },
                ],
                skipped: false,
              },
            ],
            completed: true,
          },
        ],
        totalVolume: 0,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T11:00:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(2100); // 100*8 + 100*7 + 100*6 = 800 + 700 + 600
    });

    it('should calculate volume across multiple exercises', () => {
      const workout: WorkoutLog = {
        id: 'test-workout',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-01-01',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
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
                  { setNumber: 1, weight: 100, reps: 8, completed: true, timestamp: '2025-01-01T10:10:00Z' },
                ],
                skipped: false,
              },
              {
                exerciseId: 'squat',
                sets: [
                  { setNumber: 1, weight: 150, reps: 5, completed: true, timestamp: '2025-01-01T10:20:00Z' },
                ],
                skipped: false,
              },
            ],
            completed: true,
          },
        ],
        totalVolume: 0,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T11:00:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(1550); // 100*8 + 150*5 = 800 + 750
    });

    it('should ignore incomplete sets', () => {
      const workout: WorkoutLog = {
        id: 'test-workout',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-01-01',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
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
                  { setNumber: 1, weight: 100, reps: 8, completed: true, timestamp: '2025-01-01T10:10:00Z' },
                  { setNumber: 2, weight: 100, reps: 7, completed: false, timestamp: '2025-01-01T10:15:00Z' }, // Not completed
                ],
                skipped: false,
              },
            ],
            completed: true,
          },
        ],
        totalVolume: 0,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T11:00:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(800); // Only first set counted
    });

    it('should handle workout with no cycles', () => {
      const workout: WorkoutLog = {
        id: 'test-workout',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-01-01',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
        duration: 60,
        status: 'completed',
        cycles: [],
        totalVolume: 0,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T11:00:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(0);
    });

    it('should handle sets without weight or reps', () => {
      const workout: WorkoutLog = {
        id: 'test-workout',
        userId: 'user1',
        workoutId: 'workout1',
        date: '2025-01-01',
        startTime: '2025-01-01T10:00:00Z',
        endTime: '2025-01-01T11:00:00Z',
        duration: 60,
        status: 'completed',
        cycles: [
          {
            cycleId: 'cycle1',
            cycleNumber: 0,
            exercises: [
              {
                exerciseId: 'plank',
                sets: [
                  { setNumber: 1, duration: 60, completed: true, timestamp: '2025-01-01T10:10:00Z' }, // No weight/reps (duration exercise)
                ],
                skipped: false,
              },
            ],
            completed: true,
          },
        ],
        totalVolume: 0,
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T11:00:00Z',
      };

      const volume = calculateWorkoutVolume(workout);
      expect(volume).toBe(0); // Duration exercises don't contribute to volume
    });
  });

  describe('calculateTotalVolume', () => {
    it('should sum volumes across multiple workouts', () => {
      const workouts: WorkoutLog[] = [
        {
          id: 'workout1',
          userId: 'user1',
          workoutId: 'w1',
          date: '2025-01-01',
          startTime: '2025-01-01T10:00:00Z',
          endTime: '2025-01-01T11:00:00Z',
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
                    { setNumber: 1, weight: 100, reps: 8, completed: true, timestamp: '2025-01-01T10:10:00Z' },
                  ],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          totalVolume: 800, // Pre-calculated
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T11:00:00Z',
        },
        {
          id: 'workout2',
          userId: 'user1',
          workoutId: 'w2',
          date: '2025-01-02',
          startTime: '2025-01-02T10:00:00Z',
          endTime: '2025-01-02T11:00:00Z',
          duration: 60,
          status: 'completed',
          cycles: [
            {
              cycleId: 'cycle1',
              cycleNumber: 0,
              exercises: [
                {
                  exerciseId: 'squat',
                  sets: [
                    { setNumber: 1, weight: 150, reps: 5, completed: true, timestamp: '2025-01-02T10:10:00Z' },
                  ],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          totalVolume: 750, // Pre-calculated
          createdAt: '2025-01-02T10:00:00Z',
          updatedAt: '2025-01-02T11:00:00Z',
        },
      ];

      const total = calculateTotalVolume(workouts);
      expect(total).toBe(1550); // 800 + 750
    });

    it('should calculate volume if totalVolume is missing', () => {
      const workouts: WorkoutLog[] = [
        {
          id: 'workout1',
          userId: 'user1',
          workoutId: 'w1',
          date: '2025-01-01',
          startTime: '2025-01-01T10:00:00Z',
          endTime: '2025-01-01T11:00:00Z',
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
                    { setNumber: 1, weight: 100, reps: 10, completed: true, timestamp: '2025-01-01T10:10:00Z' },
                  ],
                  skipped: false,
                },
              ],
              completed: true,
            },
          ],
          totalVolume: 0, // Not pre-calculated
          createdAt: '2025-01-01T10:00:00Z',
          updatedAt: '2025-01-01T11:00:00Z',
        },
      ];

      const total = calculateTotalVolume(workouts);
      expect(total).toBe(1000); // Calculated dynamically: 100*10
    });

    it('should handle empty workout array', () => {
      const total = calculateTotalVolume([]);
      expect(total).toBe(0);
    });
  });
});
