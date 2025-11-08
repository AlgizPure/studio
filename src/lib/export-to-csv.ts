import type { WorkoutLog } from '@/lib/types';
import type { PersonalRecord } from '@/lib/analytics';

/**
 * Escapes a value for CSV format
 */
function escapeCSV(value: string | number | undefined | null): string {
  if (value === undefined || value === null) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains comma, quote, or newline, wrap it in quotes and escape internal quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Converts workout logs to CSV format
 * Columns: Date, Workout ID, Duration (min), Total Volume (kg), Total Sets, Avg RPE, Notes
 */
export function convertWorkoutsToCSV(workouts: WorkoutLog[]): string {
  const headers = ['Date', 'Workout ID', 'Duration (min)', 'Total Volume (kg)', 'Total Sets', 'Avg RPE', 'Notes'];
  const rows = workouts.map(workout => {
    const date = new Date(workout.date).toLocaleDateString();
    const workoutId = workout.workoutId || 'Unknown';
    const duration = workout.duration || 0;

    // Calculate total volume and sets
    let totalVolume = 0;
    let totalSets = 0;
    let totalRPE = 0;
    let setsWithRPE = 0;

    workout.cycles?.forEach(cycle => {
      cycle.exercises?.forEach(exercise => {
        exercise.sets?.forEach(set => {
          if (set.completed) {
            totalSets++;
            totalVolume += (set.weight || 0) * (set.reps || 0);
            if (set.rpe) {
              totalRPE += set.rpe;
              setsWithRPE++;
            }
          }
        });
      });
    });

    const avgRPE = setsWithRPE > 0 ? (totalRPE / setsWithRPE).toFixed(1) : '';
    const notes = workout.notes || '';

    return [date, workoutId, duration, totalVolume.toFixed(1), totalSets, avgRPE, notes]
      .map(escapeCSV)
      .join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Converts all sets from workout logs to detailed CSV format
 * Columns: Date, Workout ID, Cycle, Exercise ID, Set #, Weight (kg), Reps, RPE, Completed
 */
export function convertSetsToCSV(workouts: WorkoutLog[]): string {
  const headers = ['Date', 'Workout ID', 'Cycle', 'Exercise ID', 'Set #', 'Weight (kg)', 'Reps', 'RPE', 'Completed'];
  const rows: string[] = [];

  workouts.forEach(workout => {
    const date = new Date(workout.date).toLocaleDateString();
    const workoutId = workout.workoutId || 'Unknown';

    workout.cycles?.forEach(cycle => {
      const cycleNum = cycle.cycleNumber;

      cycle.exercises?.forEach(exercise => {
        const exerciseId = exercise.exerciseId;

        exercise.sets?.forEach((set, index) => {
          const setNumber = set.setNumber || (index + 1);
          const weight = set.weight || 0;
          const reps = set.reps || 0;
          const rpe = set.rpe || '';
          const completed = set.completed ? 'Yes' : 'No';

          rows.push(
            [date, workoutId, cycleNum, exerciseId, setNumber, weight, reps, rpe, completed]
              .map(escapeCSV)
              .join(',')
          );
        });
      });
    });
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Converts personal records to CSV format
 * Columns: Exercise, Max Weight (kg), Max Volume (kg), Max Reps, Date, Recent Progress
 */
export function convertPRsToCSV(records: PersonalRecord[]): string {
  const headers = ['Exercise', 'Max Weight (kg)', 'Max Volume (kg)', 'Max Reps', 'Date', 'Recent Progress'];
  const rows = records.map(record => {
    return [
      record.exerciseName,
      record.maxWeight.toFixed(1),
      record.maxVolume.toFixed(1),
      record.maxReps,
      new Date(record.date).toLocaleDateString(),
      record.recentProgress
    ]
      .map(escapeCSV)
      .join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

/**
 * Triggers a browser download of CSV content
 */
export function downloadCSV(content: string, filename: string): void {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) {
    // Create a link to the file
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
