import type { LucideIcon } from "lucide-react";

export type Day = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export type ExerciseParameter = {
  id: string; // e.g., 'distance'
  name: string; // e.g., 'Distance'
  unit: string; // e.g., 'km'
  defaultValue: number;
}

export type ExerciseCategory = {
  id: string;
  name: string;
  authorId?: string;
}

export type Exercise = {
  id: string;
  name: string;
  categoryId: string;
  description: string;
  image: string;
  custom?: boolean;
  authorId?: string;
  lastCompleted?: string; // ISO date string
  distance?: number; // in kilometers
  parameters?: ExerciseParameter[];
  
  // Planned and actual duration
  plannedDuration?: {
    minutes: number;
    seconds: number;
  };
  trackDuration?: boolean; // чекбокс "определять длительность упражнения"
  actualDuration?: number; // фактическая длительность в секундах (readonly, вычисляется из ExerciseLog)
};

export type ExerciseLogValue = {
    id: string;
    exerciseId: string;
    userId: string;
    date: string; // ISO date string YYYY-MM-DD
    values: {
      [parameterId: string]: number;
    }
}

export type Workout = {
  id: string;
  name:string;
  description: string;
  level?: number;
  exercises?: { exerciseId: string; sets?: number; reps?: number; duration?: string }[];
};

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

/**
 * Union type: Habit can be either Legacy (v1) or V2
 * Use isHabitV2() guard to discriminate
 */
export type Habit = HabitLegacy | HabitV2;

export type ScheduleItem = {
  id: string;
  time: string; // e.g., '06:00'
  activityType: 'Workout' | 'Run' | 'Habit';
  activityName: string;
  duration: string; // e.g., '45min'
  icon: LucideIcon;
};

export type DailySchedule = {
  day: Day;
  items: ScheduleItem[];
}

export type UserProfile = {
  id: string;
  email: string;
  displayName?: string | null;
  photoURL?: string | null;
  currentStreak?: number;
  lastActiveDate?: string | null; // ISO date string (e.g., '2024-07-26')
};

// ============================================
// НОВЫЕ ТИПЫ ДЛЯ КОНСТРУКТОРА ПРОГРАММ
// ============================================

// Статус программы
export type ProgramStatus = 'draft' | 'active' | 'paused' | 'completed';

// Тип длительности программы
export type ProgramDurationType = 'fixed' | 'infinite';

// Интервал повторения тренировки
export type IntervalType = 'days_of_week' | 'every_n_days' | 'custom';

// Тип цикла
export type CycleType = 'normal' | 'circuit' | 'superset' | 'dropset';

// Основная структура Программы
export type Program = {
  id: string;
  name: string;
  description?: string;
  startDate: string; // ISO date string
  endDate?: string; // вычисляемое поле, null для infinite
  durationType: ProgramDurationType;
  status: ProgramStatus;
  goal?: string; // 'mass_gain' | 'fat_loss' | 'strength' | 'endurance' | 'maintenance'
  tags: string[]; // ['#силовая', '#дома', '#новичок']
  workouts: ProgramWorkout[]; // тренировки в программе
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  userId: string; // для будущего
  isTemplate?: boolean; // optional flag for template cards
};

// Тренировка в контексте программы (с расписанием)
export type ProgramWorkout = {
  workoutId: string; // ссылка на Workout
  schedule: {
    intervalType: IntervalType;
    // Для 'days_of_week': ['monday', 'wednesday', 'friday']
    // Для 'every_n_days': число дней между тренировками
    intervalValue: string[] | number;
    duration: {
      value: number; // 8 недель, 3 месяца, 90 дней
      unit: 'days' | 'weeks' | 'months';
    };
    startOffset: number; // дней от начала программы
    startTime?: string; // 'HH:MM' - время начала тренировки в расписании
  };
  completed: number; // сколько раз выполнено
  skipped: number; // сколько раз пропущено
};

// Расширенная структура Workout (совместима с существующей)
export type WorkoutExtended = Omit<Workout, 'exercises'> & {
  targetMuscles?: string[]; // ['chest', 'triceps', 'shoulders']
  estimatedDuration?: number; // минуты (вычисляется: сумма plannedDuration всех упражнений)
  cycles?: Cycle[]; // НОВОЕ: массив циклов
  
  // Статус и расписание для самодостаточных тренировок
  status: 'active' | 'inactive'; // активная = в расписании
  isStandalone?: boolean; // галочка "самостоятельная"
  standaloneSchedule?: {
    days: Day[];
    startTime?: string; // 'HH:MM' - появляется при isStandalone = true
  };
  isHabit?: boolean; // галочка "привычка" - попадает в список привычек
};

// Цикл в тренировке
export type Cycle = {
  id: string;
  name?: string; // опциональное название цикла
  order: number; // порядковый номер
  type: CycleType;
  repetitions: number; // сколько раз повторить весь цикл
  restAfter: number; // отдых после цикла (секунды)
  exercises: CycleExercise[];
};

// Упражнение в цикле
export type CycleExercise = {
  exerciseId: string; // ссылка на Exercise
  order: number; // порядок внутри цикла
  // Целевые параметры
  targetReps?: string; // '8-12' или '10'
  targetWeight?: number; // килограммы
  targetRPE?: number; // 1-10
  targetDuration?: number; // для упражнений типа "планка" или "отдых"
  tempo?: string; // '3-0-1-0'
  restAfter: number; // отдых после упражнения (секунды)
  notes?: string; // заметки к упражнению
};

// Статистика программы
export type ProgramStats = {
  programId: string;
  totalPlanned: number;
  totalCompleted: number;
  totalSkipped: number;
  completionRate: number; // процент
  totalVolume: number; // килограммы
  totalDuration: number; // минуты
  lastUpdated: string; // ISO timestamp
};
// ============================================
// ТИПЫ ДЛЯ РЕЖИМА ВЫПОЛНЕНИЯ ТРЕНИРОВКИ
// ============================================

export type WorkoutExecutionStatus = 'not_started' | 'in_progress' | 'paused' | 'completed';

export type SetLog = {
  setNumber: number; // номер подхода
  reps: number; // выполненные повторения
  weight?: number; // использованный вес
  rpe?: number; // RPE (Rate of Perceived Exertion)
  completed: boolean;
  timestamp: string; // когда выполнен
};

export type ExerciseLog = {
  exerciseId: string;
  sets: SetLog[];
  notes?: string;
  skipped: boolean;
  startTime?: string;
  endTime?: string;
  duration?: number; // длительность выполнения упражнения в секундах
};

export type CycleLog = {
  cycleId: string;
  cycleNumber: number; // какое повторение цикла (для repetitions > 1)
  exercises: ExerciseLog[];
  completed: boolean;
};

export type WorkoutLog = {
  id: string;
  workoutId: string;
  programId?: string;
  userId: string;
  date: string; // ISO date
  startTime: string; // ISO timestamp
  endTime?: string; // ISO timestamp
  duration?: number; // минуты
  status: WorkoutExecutionStatus;
  cycles: CycleLog[];
  notes?: string;
  totalVolume?: number; // килограммы (сумма weight * reps)
  createdAt: string;
  updatedAt: string;
  userFeedback?: string;
  feedbackTags?: string[];
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
  contextParams?: { [systemId: string]: { [paramId: string]: any } };
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
  contextData?: { [systemId: string]: { [paramId: string]: any } };
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

export type DailyReflection = {
  date: string; // YYYY-MM-DD
  rawText: string;
  parsedEntries: {
    habitId: string;
    habitName?: string;
    extractedValue?: number;
    extractedDuration?: number;
    extractedNote?: string;
    mood?: 'low' | 'neutral' | 'high';
    energy?: 'low' | 'neutral' | 'high';
    confidence: number; // 0..1
    suggestedStatus: HabitLogStatus;
  }[];
  manualCorrections: boolean;
  correctedEntries?: {
    habitId: string;
    originalParsed: any;
    userCorrected: any;
  }[];
  createdAt: string;
  updatedAt: string;
};

// ===============================
// ANALYSIS SYSTEMS
// ===============================

export type SystemParameter = {
  id: string;
  label: string;
  type: 'select' | 'number' | 'slider' | 'checkbox' | 'text';
  options?: { value: string; label: string; icon?: string }[];
  min?: number;
  max?: number;
  default?: any;
  required: boolean;
  aiAssignable: boolean;
  description?: string;
};

export type AnalysisSystem = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  isPremium: boolean;
  price?: number;
  habitParameters: SystemParameter[];
  aiContext?: {
    role?: string;
    theory?: string;
    assignmentRules?: string;
    analysisPrompt?: string;
  };
  analytics?: {
    chartType: 'wheel' | 'pyramid' | 'matrix' | 'line' | 'bar';
    metrics: {
      id: string;
      label: string;
      calculation: string;
      description?: string;
    }[];
    insights?: string[];
  };
  icon?: string;
  color?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
};

export type ActiveSystem = {
  systemId: string;
  userId: string;
  activatedAt: string;
  isPremium: boolean;
  expiresAt?: string;
  settings?: {
    notificationsEnabled?: boolean;
    insightFrequency?: 'daily' | 'weekly' | 'monthly';
    customParams?: any;
  };
};

// ===============================
// IN-APP NOTIFICATIONS
// ===============================

export type NotificationType = 
  | 'habit_reminder'
  | 'workout_complete'
  | 'streak_milestone'
  | 'streak_broken'
  | 'ai_insight'
  | 'program_reminder'
  | 'achievement'
  | 'system';

export type InAppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string; // ISO timestamp
  read: boolean;
  readAt?: string; // ISO timestamp
  actionUrl?: string; // URL to navigate on click
  actionLabel?: string; // e.g., "Complete", "View", "Open"
  // Context data for different notification types
  data?: {
    habitId?: string;
    workoutId?: string;
    programId?: string;
    streakValue?: number;
    achievementId?: string;
    [key: string]: any;
  };
  priority?: 1 | 2 | 3 | 4 | 5; // Higher = more important
  expiresAt?: string; // ISO timestamp - auto-delete after this
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

// ===============================
// INSIGHTS
// ===============================

export type InsightType = 'recommendation' | 'warning' | 'achievement' | 'pattern';

export type HabitInsight = {
  id: string;
  date: string; // ISO date
  systemId?: string;
  type: InsightType;
  priority: 1 | 2 | 3 | 4 | 5;
  title: string;
  description: string;
  data?: {
    habitIds?: string[];
    metrics?: { [key: string]: number };
    suggestions?: {
      action: 'add' | 'modify' | 'remove' | 'pause' | 'change_schedule';
      habitId?: string;
      newParams?: any;
      reason?: string;
    }[];
  };
  dismissed?: boolean;
  actionTaken?: string;
  createdAt: string;
};

// ===============================
// EXPORT / IMPORT
// ===============================

export type HabitExportV1 = {
  version: '1.0';
  exportDate: string;
  userId: string;
  habits: HabitV2[];
  logs: HabitLog[];
  streaks: HabitStreak[];
  insights: HabitInsight[];
  activeSystems: { systemId: string; systemVersion: string }[];
  systemDefinitions?: AnalysisSystem[];
  metadata: {
    totalHabits: number;
    dateRange: { from: string; to: string };
    completionRate: number;
  };
};
