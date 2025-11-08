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
