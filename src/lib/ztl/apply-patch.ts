import type { ZTLProgram, ZTLPatch, ZTLPatchOp, ZTLWorkout, ZTLExercise } from './types';

/**
 * Apply Logic for ZTL Patches
 *
 * Applies AI-generated patches to programs with validation and rollback support.
 *
 * Features:
 * - Type-safe patch operations
 * - Deep cloning to avoid mutations
 * - Rollback snapshots
 * - Validation before/after apply
 */

export type ApplyResult =
  | { success: true; program: ZTLProgram; rollback: ZTLProgram }
  | { success: false; error: string };

/**
 * Apply a ZTL Patch to a program
 *
 * @param program - Original program (will not be mutated)
 * @param patch - Patch operations to apply
 * @returns Result with updated program and rollback snapshot, or error
 *
 * Usage:
 * ```ts
 * const result = applyZTLPatch(program, patch);
 * if (result.success) {
 *   // Save result.program
 *   // Store result.rollback for undo
 * } else {
 *   console.error(result.error);
 * }
 * ```
 */
export function applyZTLPatch(program: ZTLProgram, patch: ZTLPatch): ApplyResult {
  // Deep clone for rollback
  const rollback = JSON.parse(JSON.stringify(program)) as ZTLProgram;

  // Deep clone for mutation
  let updated = JSON.parse(JSON.stringify(program)) as ZTLProgram;

  try {
    // Apply each operation
    for (const op of patch.patch) {
      updated = applyOperation(updated, op);
    }

    return {
      success: true,
      program: updated,
      rollback,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error applying patch',
    };
  }
}

/**
 * Apply a single patch operation
 */
function applyOperation(program: ZTLProgram, op: ZTLPatchOp): ZTLProgram {
  switch (op.op) {
    case 'update-exercise':
      return updateExercise(program, op);

    case 'add-program':
      // For 'add-program', return the new program (replaces entire program)
      return op.program;

    case 'update-program':
      return updateProgram(program, op);

    case 'remove-exercise':
      return removeExercise(program, op);

    default:
      // TypeScript exhaustiveness check
      const _exhaustive: never = op;
      throw new Error(`Unknown operation: ${JSON.stringify(_exhaustive)}`);
  }
}

/**
 * Update exercise targets in a workout
 */
function updateExercise(
  program: ZTLProgram,
  op: Extract<ZTLPatchOp, { op: 'update-exercise' }>
): ZTLProgram {
  const workout = program.workouts.find((w) => w.id === op.workout_id);
  if (!workout) {
    throw new Error(`Workout not found: ${op.workout_id}`);
  }

  // Find exercise in all cycles
  let exerciseFound = false;
  for (const cycle of workout.cycles) {
    const exercise = cycle.exercises.find((e) => e.id === op.exercise_id);
    if (exercise) {
      // Apply partial update
      Object.assign(exercise, op.set_target);
      exerciseFound = true;
      break;
    }
  }

  if (!exerciseFound) {
    throw new Error(`Exercise not found: ${op.exercise_id} in workout ${op.workout_id}`);
  }

  return program;
}

/**
 * Update program metadata or structure
 */
function updateProgram(
  program: ZTLProgram,
  op: Extract<ZTLPatchOp, { op: 'update-program' }>
): ZTLProgram {
  // Deep merge partial update
  return {
    ...program,
    ...op.program,
    meta: {
      ...program.meta,
      ...(op.program.meta || {}),
    },
  };
}

/**
 * Remove exercise from a workout
 */
function removeExercise(
  program: ZTLProgram,
  op: Extract<ZTLPatchOp, { op: 'remove-exercise' }>
): ZTLProgram {
  const workout = program.workouts.find((w) => w.id === op.workout_id);
  if (!workout) {
    throw new Error(`Workout not found: ${op.workout_id}`);
  }

  let exerciseRemoved = false;
  for (const cycle of workout.cycles) {
    const exerciseIndex = cycle.exercises.findIndex((e) => e.id === op.exercise_id);
    if (exerciseIndex !== -1) {
      cycle.exercises.splice(exerciseIndex, 1);
      exerciseRemoved = true;
      break;
    }
  }

  if (!exerciseRemoved) {
    throw new Error(`Exercise not found: ${op.exercise_id} in workout ${op.workout_id}`);
  }

  return program;
}

/**
 * Generate a diff summary for display
 *
 * Returns human-readable summary of changes.
 */
export function generatePatchSummary(patch: ZTLPatch): string[] {
  return patch.patch.map((op) => {
    switch (op.op) {
      case 'update-exercise':
        const changes = Object.keys(op.set_target || {}).join(', ');
        return `Update exercise: ${changes}`;

      case 'add-program':
        return `Add new program: ${op.program.meta.name}`;

      case 'update-program':
        const programChanges = Object.keys(op.program).join(', ');
        return `Update program: ${programChanges}`;

      case 'remove-exercise':
        return `Remove exercise from workout`;

      default:
        return 'Unknown operation';
    }
  });
}

/**
 * Validate patch can be applied to program
 *
 * Checks all referenced IDs exist before applying.
 */
export function validatePatch(program: ZTLProgram, patch: ZTLPatch): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const op of patch.patch) {
    switch (op.op) {
      case 'update-exercise':
      case 'remove-exercise': {
        const workout = program.workouts.find((w) => w.id === op.workout_id);
        if (!workout) {
          errors.push(`Workout not found: ${op.workout_id}`);
          continue;
        }

        let exerciseFound = false;
        for (const cycle of workout.cycles) {
          if (cycle.exercises.some((e) => e.id === op.exercise_id)) {
            exerciseFound = true;
            break;
          }
        }

        if (!exerciseFound) {
          errors.push(`Exercise not found: ${op.exercise_id} in workout ${op.workout_id}`);
        }
        break;
      }

      case 'update-program':
        if (op.program_id !== program.meta.id) {
          errors.push(`Program ID mismatch: ${op.program_id} !== ${program.meta.id}`);
        }
        break;

      case 'add-program':
        // Always valid
        break;
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
