// src/lib/analytics/muscle-groups.ts
// Muscle group analytics utilities for advanced visualizations

import type { WorkoutLog } from '@/lib/types/workout-log';
import { calculateWorkoutVolume } from './volume';

/**
 * Standard muscle groups for analytics
 */
export const MUSCLE_GROUPS = [
  'Chest',
  'Back',
  'Legs',
  'Shoulders',
  'Arms',
  'Core',
] as const;

export type MuscleGroup = typeof MUSCLE_GROUPS[number];

/**
 * Movement categories for volume distribution
 */
export const MOVEMENT_CATEGORIES = ['Push', 'Pull', 'Legs'] as const;
export type MovementCategory = typeof MOVEMENT_CATEGORIES[number];

/**
 * Muscle group volume data for heatmap
 */
export type MuscleGroupVolumeData = {
  week: string; // e.g., 'Week 45' or '2025-W45'
  muscleGroup: MuscleGroup;
  volume: number; // total volume in kg
  sets: number; // total sets count
};

/**
 * Training balance data for radar chart
 */
export type TrainingBalanceData = {
  muscleGroup: MuscleGroup;
  volume: number; // total volume
  percentage: number; // percentage of total volume
  sets: number; // total sets
};

/**
 * Volume distribution data for pie/donut chart
 */
export type VolumeDistributionData = {
  category: MovementCategory;
  volume: number;
  percentage: number;
  sets: number;
};

/**
 * Simple exercise to muscle group mapping
 *
 * In a real app, this would come from exercise metadata.
 * For now, we use exercise name patterns to infer muscle groups.
 */
export function getExerciseMuscleGroup(exerciseName: string): MuscleGroup {
  const name = exerciseName.toLowerCase();

  // Chest exercises
  if (name.includes('bench') || name.includes('chest') || name.includes('fly') || name.includes('press') && !name.includes('shoulder')) {
    return 'Chest';
  }

  // Back exercises
  if (name.includes('row') || name.includes('pull') || name.includes('lat') || name.includes('deadlift')) {
    return 'Back';
  }

  // Leg exercises
  if (name.includes('squat') || name.includes('leg') || name.includes('lunge') || name.includes('calf')) {
    return 'Legs';
  }

  // Shoulder exercises
  if (name.includes('shoulder') || name.includes('lateral') || name.includes('overhead') || name.includes('military')) {
    return 'Shoulders';
  }

  // Arm exercises
  if (name.includes('curl') || name.includes('tricep') || name.includes('bicep') || name.includes('arm')) {
    return 'Arms';
  }

  // Core exercises
  if (name.includes('ab') || name.includes('core') || name.includes('plank') || name.includes('crunch')) {
    return 'Core';
  }

  // Default fallback
  return 'Core';
}

/**
 * Map muscle group to movement category
 */
export function getMuscleGroupMovementCategory(muscleGroup: MuscleGroup): MovementCategory {
  switch (muscleGroup) {
    case 'Chest':
    case 'Shoulders':
      return 'Push';
    case 'Back':
      return 'Pull';
    case 'Legs':
      return 'Legs';
    case 'Arms':
      return 'Push'; // Simplified - could split triceps/biceps
    case 'Core':
      return 'Pull'; // Simplified - core often trained with pull days
    default:
      return 'Pull';
  }
}

/**
 * Calculate volume by muscle group and week
 *
 * Returns heatmap data showing volume distribution across muscle groups over time.
 */
export function calculateMuscleGroupVolumeByWeek(
  workouts: WorkoutLog[],
  weeksBack: number = 12
): MuscleGroupVolumeData[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - weeksBack * 7);

  const filtered = workouts.filter(w => new Date(w.date) >= cutoffDate);

  // Group by week and muscle group
  const volumeMap = new Map<string, { volume: number; sets: number }>();

  filtered.forEach(workout => {
    const date = new Date(workout.date);
    const weekKey = getWeekKey(date);

    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        const exerciseName = exercise.exerciseName || exercise.exerciseId || '';
        const muscleGroup = getExerciseMuscleGroup(exerciseName);

        const completedSets = exercise.sets?.filter(s => s.completed) || [];
        const exerciseVolume = completedSets.reduce(
          (sum, set) => sum + (set.weight || 0) * set.reps,
          0
        );

        const key = `${weekKey}|${muscleGroup}`;
        const existing = volumeMap.get(key) || { volume: 0, sets: 0 };
        volumeMap.set(key, {
          volume: existing.volume + exerciseVolume,
          sets: existing.sets + completedSets.length,
        });
      });
    });
  });

  // Convert to array
  const result: MuscleGroupVolumeData[] = [];
  volumeMap.forEach((data, key) => {
    const [week, muscleGroup] = key.split('|');
    result.push({
      week,
      muscleGroup: muscleGroup as MuscleGroup,
      volume: Math.round(data.volume),
      sets: data.sets,
    });
  });

  return result.sort((a, b) => a.week.localeCompare(b.week));
}

/**
 * Calculate training balance across muscle groups
 *
 * Returns radar chart data showing relative volume distribution.
 */
export function calculateTrainingBalance(workouts: WorkoutLog[]): TrainingBalanceData[] {
  const volumeByGroup = new Map<MuscleGroup, { volume: number; sets: number }>();

  // Initialize all muscle groups
  MUSCLE_GROUPS.forEach(group => {
    volumeByGroup.set(group, { volume: 0, sets: 0 });
  });

  // Aggregate volume per muscle group
  workouts.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        const exerciseName = exercise.exerciseName || exercise.exerciseId || '';
        const muscleGroup = getExerciseMuscleGroup(exerciseName);

        const completedSets = exercise.sets?.filter(s => s.completed) || [];
        const exerciseVolume = completedSets.reduce(
          (sum, set) => sum + (set.weight || 0) * set.reps,
          0
        );

        const current = volumeByGroup.get(muscleGroup)!;
        volumeByGroup.set(muscleGroup, {
          volume: current.volume + exerciseVolume,
          sets: current.sets + completedSets.length,
        });
      });
    });
  });

  // Calculate total volume and percentages
  const totalVolume = Array.from(volumeByGroup.values()).reduce((sum, data) => sum + data.volume, 0);

  const result: TrainingBalanceData[] = MUSCLE_GROUPS.map(group => {
    const data = volumeByGroup.get(group)!;
    return {
      muscleGroup: group,
      volume: Math.round(data.volume),
      percentage: totalVolume > 0 ? Math.round((data.volume / totalVolume) * 100) : 0,
      sets: data.sets,
    };
  });

  return result;
}

/**
 * Calculate volume distribution by movement category
 *
 * Returns pie/donut chart data showing Push vs Pull vs Legs volume.
 */
export function calculateVolumeDistribution(workouts: WorkoutLog[]): VolumeDistributionData[] {
  const volumeByCategory = new Map<MovementCategory, { volume: number; sets: number }>();

  // Initialize all categories
  MOVEMENT_CATEGORIES.forEach(category => {
    volumeByCategory.set(category, { volume: 0, sets: 0 });
  });

  // Aggregate volume per category
  workouts.forEach(workout => {
    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        const exerciseName = exercise.exerciseName || exercise.exerciseId || '';
        const muscleGroup = getExerciseMuscleGroup(exerciseName);
        const category = getMuscleGroupMovementCategory(muscleGroup);

        const completedSets = exercise.sets?.filter(s => s.completed) || [];
        const exerciseVolume = completedSets.reduce(
          (sum, set) => sum + (set.weight || 0) * set.reps,
          0
        );

        const current = volumeByCategory.get(category)!;
        volumeByCategory.set(category, {
          volume: current.volume + exerciseVolume,
          sets: current.sets + completedSets.length,
        });
      });
    });
  });

  // Calculate total and percentages
  const totalVolume = Array.from(volumeByCategory.values()).reduce((sum, data) => sum + data.volume, 0);

  const result: VolumeDistributionData[] = MOVEMENT_CATEGORIES.map(category => {
    const data = volumeByCategory.get(category)!;
    return {
      category,
      volume: Math.round(data.volume),
      percentage: totalVolume > 0 ? Math.round((data.volume / totalVolume) * 100) : 0,
      sets: data.sets,
    };
  });

  return result;
}

/**
 * Get week key for grouping (ISO week format)
 * Returns format like "2025-W45"
 */
function getWeekKey(date: Date): string {
  const year = date.getFullYear();
  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

  return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
}
