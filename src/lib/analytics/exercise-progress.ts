// src/lib/analytics/exercise-progress.ts
// Exercise-specific analytics utilities

import type { WorkoutLog } from '@/lib/types';
import type { ExerciseProgressData } from './types';

export function getExerciseProgress(
  workouts: WorkoutLog[],
  exerciseId: string,
  exerciseName: string
): ExerciseProgressData[] {
  const progressData: ExerciseProgressData[] = [];
  workouts.forEach(workout => {
    let maxWeight = 0;
    let totalWeight = 0;
    let totalRPE = 0;
    let totalVolume = 0;
    let totalReps = 0;
    let setCount = 0;
    let rpeCount = 0;
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        if (exercise.exerciseId === exerciseId) {
          exercise.sets?.forEach(set => {
            if (set.completed) {
              if (set.weight) {
                maxWeight = Math.max(maxWeight, set.weight);
                totalWeight += set.weight;
                totalVolume += set.weight * set.reps;
                setCount++;
              }
              totalReps += set.reps;
              if (set.rpe) {
                totalRPE += set.rpe;
                rpeCount++;
              }
            }
          });
        }
      });
    });
    if (setCount > 0) {
      progressData.push({
        date: workout.date,
        exerciseName,
        maxWeight,
        avgWeight: totalWeight / setCount,
        avgRPE: rpeCount > 0 ? totalRPE / rpeCount : 0,
        totalVolume,
        totalReps,
      });
    }
  });
  return progressData.sort((a, b) => a.date.localeCompare(b.date));
}

export function getUniqueExercises(workouts: WorkoutLog[]): Array<{ id: string; name: string }> {
  const exerciseMap = new Map<string, string>();
  workouts.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        if (!exerciseMap.has(exercise.exerciseId)) {
          exerciseMap.set(exercise.exerciseId, exercise.exerciseId);
        }
      });
    });
  });
  return Array.from(exerciseMap.entries()).map(([id, name]) => ({ id, name }));
}
