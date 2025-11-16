import type { Day } from './common';

export type HabitCategory = {
  id: string;
  name: string;
  authorId?: string;
}

/**
 * Legacy Habit type (v1) - for backward compatibility
 * Has discriminator field 'schemaVersion?: 1' or absence of 'type' field
 */
export type HabitLegacy = {
  id: string;
  name: string;
  categoryId: string;
  goal?: string; // e.g., "3 lessons", "10 minutes"
  completed?: boolean;
  days?: Day[];
  pomodoro?: {
    cycles: number;
  };
  authorId?: string;
  schemaVersion?: 1; // discriminator
};

// ===============================
// HABIT TRACKER V2 - CORE TYPES
// ===============================

export type HabitType = 'boolean' | 'quantity' | 'duration' | 'range';

export type HabitTarget = {
  type: HabitType;
  unit?: string; // 'min' | 'ml' | 'km' | 'steps' | 'pages' | ...
  value?: number; // целевое значение (для quantity/duration)
  min?: number; // для диапазона
  max?: number; // для диапазона
  progressive?: {
    enabled: boolean;
    step: number; // величина изменения
    interval: number; // дней между изменениями
    maxValue?: number; // потолок цели
  };
};

export type HabitIntervalType = 'days_of_week' | 'every_n_days' | 'n_per_week' | 'custom';

export type HabitSchedule = {
  intervalType: HabitIntervalType;
  days?: Day[]; // для days_of_week
  everyNDays?: number; // для every_n_days
  nPerWeek?: number; // для n_per_week
  preferredDays?: Day[]; // предпочтительные дни для n_per_week
  timeWindow?: { start: string; end: string }; // 'HH:MM'
  startDate?: string; // ISO date
  endDate?: string; // ISO date
};

export type Reminder = {
  id: string;
  times: string[]; // список времени 'HH:MM'
  smart?: boolean;
  snooze?: boolean;
  untilDone?: boolean;
};

export type HabitV2 = {
  id: string;
  name: string;
  categoryId?: string;
  tags?: string[];
  type: HabitType; // discriminator field for V2
  target?: HabitTarget;
  schedule?: HabitSchedule;
  reminders?: Reminder[];
  dependencies?: string[]; // habit stacking
  stackingRule?: {
    triggerId: string;
    position: 'before' | 'after';
    delay?: number; // минуты
  };
  allowSkip?: boolean;
  graceDays?: number;
  priority?: 1 | 2 | 3 | 4 | 5;
  difficulty?: 'easy' | 'medium' | 'hard';
  contextParams?: Record<string, Record<string, unknown>>;
  archived?: boolean;
  authorId?: string;
  createdAt?: string;
  updatedAt?: string;
  schemaVersion?: 2; // optional discriminator
  // Legacy compatibility fields (optional for migration)
  completed?: boolean;
  goal?: string;
  days?: Day[];
  pomodoro?: {
    cycles: number;
  };
};

/**
 * Union type: Habit can be either Legacy (v1) or V2
 * Use isHabitV2() guard to discriminate
 */
export type Habit = HabitLegacy | HabitV2;

export type HabitLogStatus = 'done' | 'partial' | 'skipped' | 'missed';

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  status: HabitLogStatus;
  value?: number; // для quantity
  durationMin?: number; // для duration
  percentage?: number; // степень выполнения (0..100)
  note?: string;
  mood?: 'low' | 'neutral' | 'high';
  energy?: 'low' | 'neutral' | 'high';
  contextData?: Record<string, Record<string, unknown>>;
  extractedFrom?: 'reflection' | 'manual' | 'auto';
  aiConfidence?: number;
  manuallyEdited?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type HabitStreak = {
  habitId: string;
  current: number;
  longest: number;
  hss?: number; // Habit Strength Score (computed)
  frozenUntil?: string; // ISO date
  skipTokens?: number;
  maxSkipTokens?: number;
  lastCompletedDate?: string; // ISO date
  history?: {
    date: string; // ISO date
    action: 'completed' | 'skipped' | 'frozen' | 'broken';
    note?: string;
  }[];
};

/**
 * Daily Reflection (Stage 3) - End-of-day holistic tracking
 * Function 13.5: Daily Reflection System
 */
export type DailyReflection = {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  mood: number; // 1-10 scale
  energy: number; // 1-10 scale
  stress: number; // 1-10 scale
  sleepQuality: number; // 1-10 scale
  gratitude?: string[]; // Optional: 3 things you're grateful for
  notes?: string; // Free-form daily journal
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

/**
 * Weekly Context Assessment (Stage 4) - Wheel of Life tracking
 * Function 13.6: Context Systems
 */
export type WeeklyContext = {
  id: string;
  userId: string;
  weekStart: string; // ISO date (Monday of the week)
  contexts: {
    fitness: number; // 1-10
    career: number; // 1-10
    relationships: number; // 1-10
    growth: number; // 1-10
    environment: number; // 1-10
    fun: number; // 1-10
    contribution: number; // 1-10
    spirituality: number; // 1-10
  };
  notes?: Record<string, string>; // Optional notes per dimension
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};
