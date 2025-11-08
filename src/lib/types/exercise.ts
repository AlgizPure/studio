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
