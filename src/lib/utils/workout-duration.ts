import type { WorkoutExtended, Exercise, Cycle } from '@/lib/types';

/**
 * Рассчитывает планируемую длительность тренировки
 * как сумму plannedDuration всех упражнений в циклах
 * (без учета restAfter)
 */
export function calculateWorkoutEstimatedDuration(
  workout: WorkoutExtended,
  exercises: Map<string, Exercise> | Record<string, Exercise>
): number {
  if (!workout.cycles || workout.cycles.length === 0) return 0;
  
  // Преобразуем Record в Map если нужно
  const exercisesMap = exercises instanceof Map 
    ? exercises 
    : new Map(Object.entries(exercises));
  
  let totalSeconds = 0;
  
  workout.cycles.forEach((cycle: Cycle) => {
    // Учитываем repetitions цикла
    for (let rep = 0; rep < cycle.repetitions; rep++) {
      cycle.exercises.forEach(cycleEx => {
        const exercise = exercisesMap.get(cycleEx.exerciseId);
        if (exercise?.plannedDuration) {
          totalSeconds += 
            exercise.plannedDuration.minutes * 60 + 
            exercise.plannedDuration.seconds;
        }
      });
    }
  });
  
  // Возвращаем в минутах (округление вверх)
  return Math.ceil(totalSeconds / 60);
}

