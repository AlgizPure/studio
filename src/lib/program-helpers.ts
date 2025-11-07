/**
 * Helper functions for updating Program structures, especially for AI progression suggestions
 */

import type { Program, WorkoutExtended, Cycle, CycleExercise } from '@/lib/types';

type ProgramWithExerciseUpdates = Program & {
  exerciseUpdates?: Record<string, {
    targetWeight?: number;
    targetReps?: string;
    targetRPE?: number;
    updatedAt: string;
  }>;
};

/**
 * Find and update an exercise's targetWeight in a program.
 * Since Program.workouts only contains references (workoutId), we need to work with the full workout structure.
 * This function helps update the program when we have the full workout data.
 */
export function updateExerciseTargetInProgram(
  program: Program,
  workoutId: string,
  exerciseId: string,
  updates: {
    targetWeight?: number;
    targetReps?: string;
    targetRPE?: number;
  }
): ProgramWithExerciseUpdates {
  // Create updated program copy
  const updatedProgram: ProgramWithExerciseUpdates = { ...program };

  // If program has stored workout details (in a custom field), update them
  // Otherwise, we return the program as-is and rely on external workout updates

  // For now, we'll add the update info to program metadata
  // In a full implementation, you'd update the actual WorkoutExtended document
  if (!updatedProgram.exerciseUpdates) {
    updatedProgram.exerciseUpdates = {};
  }

  const updateKey = `${workoutId}_${exerciseId}`;
  updatedProgram.exerciseUpdates[updateKey] = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  updatedProgram.updatedAt = new Date().toISOString();

  return updatedProgram;
}

/**
 * Apply progression suggestion to a WorkoutExtended structure.
 * This is used when you have the full workout loaded.
 */
export function applyProgressionToWorkout(
  workout: WorkoutExtended,
  exerciseId: string,
  suggestion: {
    suggestedWeight?: number;
    suggestedReps?: number;
  }
): WorkoutExtended {
  if (!workout.cycles) {
    return workout;
  }

  const updatedWorkout = {
    ...workout,
    cycles: workout.cycles.map(cycle => ({
      ...cycle,
      exercises: cycle.exercises.map(ex => {
        if (ex.exerciseId === exerciseId) {
          return {
            ...ex,
            targetWeight: suggestion.suggestedWeight ?? ex.targetWeight,
            targetReps: suggestion.suggestedReps 
              ? String(suggestion.suggestedReps) 
              : ex.targetReps,
          };
        }
        return ex;
      }),
    })),
  };

  return updatedWorkout;
}

/**
 * Find exercise in a workout by exerciseId
 */
export function findExerciseInWorkout(
  workout: WorkoutExtended,
  exerciseId: string
): { cycle: Cycle; exercise: CycleExercise } | null {
  if (!workout.cycles) {
    return null;
  }

  for (const cycle of workout.cycles) {
    const exercise = cycle.exercises.find(ex => ex.exerciseId === exerciseId);
    if (exercise) {
      return { cycle, exercise };
    }
  }

  return null;
}

