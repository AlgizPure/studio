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
  time?: string;
  days?: Day[];
  authorId?: string;
  lastCompleted?: string; // ISO date string
  distance?: number; // in kilometers
  parameters?: ExerciseParameter[];
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

export type Habit = {
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
};

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
  };
  completed: number; // сколько раз выполнено
  skipped: number; // сколько раз пропущено
};

// Расширенная структура Workout (совместима с существующей)
export type WorkoutExtended = Omit<Workout, 'exercises'> & {
  targetMuscles?: string[]; // ['chest', 'triceps', 'shoulders']
  estimatedDuration?: number; // минуты
  cycles?: Cycle[]; // НОВОЕ: массив циклов
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
