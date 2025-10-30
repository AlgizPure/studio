import type { Program as AppProgram, WorkoutExtended as AppWorkout, WorkoutLog as AppWorkoutLog } from '@/lib/types';

export type FeedbackTag =
  | 'strong'
  | 'tired'
  | 'pain'
  | 'poor_sleep'
  | 'great_pump'
  | 'low_motivation';

// ZTL v1.0
export type ZTLExercise = {
  id: string;
  name: string;
  sets?: number;
  target_reps?: string; // "8-10"
  target_weight_kg?: number;
  target_rpe?: number; // 1-10
  target_duration_s?: number;
  target_intensity?: 'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5';
  rest_s?: number;
};

export type ZTLCycle = {
  type: 'normal' | 'circuit' | 'superset' | 'dropset';
  repetitions?: number;
  rest_after?: number;
  exercises: ZTLExercise[];
};

export type ZTLWorkout = {
  id: string;
  name: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  estimated_duration_min?: number;
  cycles: ZTLCycle[];
};

export type ZTLProgression = {
  rules: Array<{
    when: {
      all_sets_completed?: boolean;
      avg_rpe?: { lte?: number; gte?: number };
    };
    do: {
      action: 'increase_weight' | 'decrease_weight';
      amount: string; // "2.5%" or "2.5"
    };
  }>;
  microcycle_weeks?: number;
  deload?: {
    week: number;
    volume_reduction: string; // "40%"
  };
};

export type ZTLProgram = {
  meta: {
    version: '1.0';
    id: string;
    name: string;
    author?: string;
    goal?: 'hypertrophy' | 'strength' | 'fat_loss' | 'endurance' | 'mobility';
    duration?: { weeks: number };
    tags?: string[];
  };
  phases?: Array<{ name: string; weeks: string }>; // '1-4' or '5'
  schedule: {
    pattern: 'days_of_week' | 'every_n_days';
    days?: ZTLWorkout['day'][];
    every_n_days?: number;
  };
  workouts: ZTLWorkout[];
  progression?: ZTLProgression;
};

export type ZTLPatchOp =
  | {
      op: 'update-exercise';
      program_id: string;
      workout_id: string;
      exercise_id: string;
      set_target?: Partial<ZTLExercise>;
    }
  | { op: 'add-program'; program: ZTLProgram }
  | { op: 'update-program'; program_id: string; program: Partial<ZTLProgram> }
  | { op: 'remove-exercise'; program_id: string; workout_id: string; exercise_id: string };

export type ZTLPatch = { patch: ZTLPatchOp[] };

// Bridges to app domain
export type Program = AppProgram;
export type Workout = AppWorkout;
export type WorkoutLog = AppWorkoutLog;



