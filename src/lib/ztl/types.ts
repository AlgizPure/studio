import type { Program as AppProgram, WorkoutExtended as AppWorkout, WorkoutLog as AppWorkoutLog } from '@/lib/types';

/**
 * @fileoverview Определения типов TypeScript для ZTL (Zenith Training Language) и их сопоставление с типами приложения.
 */

/**
 * @typedef {'strong' | 'tired' | 'pain' | 'poor_sleep' | 'great_pump' | 'low_motivation'} FeedbackTag
 * @description Теги обратной связи для описания состояния во время тренировки.
 */
export type FeedbackTag =
  | 'strong'
  | 'tired'
  | 'pain'
  | 'poor_sleep'
  | 'great_pump'
  | 'low_motivation';

/**
 * @typedef {object} ZTLExercise
 * @description Представляет одно упражнение в рамках ZTL.
 * @property {string} id - Уникальный идентификатор упражнения.
 * @property {string} name - Название упражнения.
 * @property {number} [sets] - Количество подходов.
 * @property {string} [target_reps] - Целевое количество повторений (например, "8-10").
 * @property {number} [target_weight_kg] - Целевой вес в килограммах.
 * @property {number} [target_rpe] - Целевой RPE (Rate of Perceived Exertion) от 1 до 10.
 * @property {number} [target_duration_s] - Целевая длительность в секундах.
 * @property {'zone1' | 'zone2' | 'zone3' | 'zone4' | 'zone5'} [target_intensity] - Целевая зона интенсивности.
 * @property {number} [rest_s] - Время отдыха в секундах.
 */
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

/**
 * @typedef {object} ZTLCycle
 * @description Представляет цикл упражнений в ZTL (например, суперсет, дроп-сет).
 * @property {'normal' | 'circuit' | 'superset' | 'dropset'} type - Тип цикла.
 * @property {number} [repetitions] - Количество повторений цикла.
 * @property {number} [rest_after] - Отдых после завершения цикла.
 * @property {ZTLExercise[]} exercises - Массив упражнений в цикле.
 */
export type ZTLCycle = {
  type: 'normal' | 'circuit' | 'superset' | 'dropset';
  repetitions?: number;
  rest_after?: number;
  exercises: ZTLExercise[];
};

/**
 * @typedef {object} ZTLWorkout
 * @description Представляет одну тренировку в ZTL.
 * @property {string} id - Уникальный идентификатор тренировки.
 * @property {string} name - Название тренировки.
 * @property {'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'} day - День недели.
 * @property {number} [estimated_duration_min] - Предполагаемая длительность в минутах.
 * @property {ZTLCycle[]} cycles - Массив циклов упражнений.
 */
export type ZTLWorkout = {
  id: string;
  name: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  estimated_duration_min?: number;
  cycles: ZTLCycle[];
};

/**
 * @typedef {object} ZTLProgression
 * @description Определяет правила прогрессии нагрузки в программе ZTL.
 * @property {Array<object>} rules - Массив правил для изменения нагрузки.
 * @property {number} [microcycle_weeks] - Длительность микроцикла в неделях.
 * @property {object} [deload] - Параметры разгрузочной недели.
 */
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

/**
 * @typedef {object} ZTLProgram
 * @description Представляет полную программу тренировок в ZTL.
 * @property {object} meta - Метаданные программы.
 * @property {Array<object>} [phases] - Фазы программы.
 * @property {object} schedule - Расписание тренировок.
 * @property {ZTLWorkout[]} workouts - Массив тренировок.
 * @property {ZTLProgression} [progression] - Правила прогрессии.
 */
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

/**
 * @typedef {object} ZTLPatchOp
 * @description Определяет операцию для изменения (патча) программы ZTL.
 */
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

/**
 * @typedef {object} ZTLPatch
 * @description Представляет набор операций для изменения программы ZTL.
 * @property {ZTLPatchOp[]} patch - Массив операций.
 */
export type ZTLPatch = { patch: ZTLPatchOp[] };

// Мосты к домену приложения
/**
 * @typedef {AppProgram} Program
 * @description Тип программы, используемый в приложении.
 */
export type Program = AppProgram;

/**
 * @typedef {AppWorkout} Workout
 * @description Расширенный тип тренировки, используемый в приложении.
 */
export type Workout = AppWorkout;

/**
 * @typedef {AppWorkoutLog} WorkoutLog
 * @description Тип для лога выполненной тренировки в приложении.
 */
export type WorkoutLog = AppWorkoutLog;
