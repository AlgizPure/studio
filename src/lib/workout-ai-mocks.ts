/**
 * Mock generators for workout AI insights (for development without API key)
 */

import type { WorkoutLog, Program } from '@/lib/types';

export type QuickInsight = {
  type: 'positive' | 'warning' | 'recommendation';
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  actionable: boolean;
  relatedProgram?: string;
};

export type QuickInsightsOutput = {
  insights: QuickInsight[];
  summary: string;
  confidence: number;
};

export type ProgressionSuggestion = {
  exerciseId: string;
  exerciseName: string;
  currentWeight?: number;
  currentReps?: number;
  suggestedWeight?: number;
  suggestedReps?: number;
  reasoning: string;
  confidence: number; // 0-100
  applyImmediately: boolean;
};

export type ProgressionSuggestionsOutput = {
  suggestions: ProgressionSuggestion[];
  globalRecommendation?: string;
};

export function generateQuickInsightsMock(
  workoutLogs: WorkoutLog[],
  programs: Program[],
  userGoal?: string
): QuickInsightsOutput {
  if (workoutLogs.length === 0) {
    return {
      insights: [
        {
          type: 'recommendation',
          priority: 3,
          title: 'Start Training',
          description: 'Log your first workout to get personalized insights.',
          actionable: true,
        },
      ],
      summary: 'No training data available yet.',
      confidence: 0.5,
    };
  }

  const insights: QuickInsight[] = [];
  
  // Calculate basic stats
  const totalVolume = workoutLogs.reduce((sum, log) => sum + (log.totalVolume || 0), 0);
  const avgDuration = workoutLogs.reduce((sum, log) => sum + (log.duration || 0), 0) / workoutLogs.length;
  const workoutCount = workoutLogs.length;

  // Positive: Consistent training
  if (workoutCount >= 8) {
    insights.push({
      type: 'positive',
      priority: 2,
      title: 'Consistent Training',
      description: `You completed ${workoutCount} workouts in the last period. Great consistency!`,
      actionable: false,
    });
  }

  // Warning: Low volume
  if (totalVolume < 10000 && workoutCount > 5) {
    insights.push({
      type: 'warning',
      priority: 2,
      title: 'Low Training Volume',
      description: `Total volume is ${Math.round(totalVolume)}kg. Consider increasing intensity or frequency.`,
      actionable: true,
    });
  }

  // Recommendation: Add variety
  if (programs.length === 0) {
    insights.push({
      type: 'recommendation',
      priority: 3,
      title: 'Create a Program',
      description: 'Structured programs help ensure progressive overload and balanced development.',
      actionable: true,
    });
  }

  return {
    insights: insights.slice(0, 5), // Limit to top 5
    summary: `Analyzed ${workoutCount} workouts with total volume ${Math.round(totalVolume)}kg.`,
    confidence: workoutCount >= 5 ? 0.8 : 0.5,
  };
}

export function generateProgressionSuggestionsMock(
  program: Program,
  recentWorkouts: WorkoutLog[]
): ProgressionSuggestionsOutput {
  const suggestions: ProgressionSuggestion[] = [];

  // Extract exercise data from recent workouts
  const exerciseMap = new Map<string, { weight: number; reps: number; count: number }>();

  recentWorkouts.forEach(log => {
    log.cycles.forEach(cycle => {
      cycle.exercises.forEach(ex => {
        const exId = ex.exerciseId;
        ex.sets.forEach(set => {
          if (set.weight && set.completed) {
            const existing = exerciseMap.get(exId) || { weight: 0, reps: 0, count: 0 };
            existing.weight += set.weight;
            existing.reps += set.reps;
            existing.count += 1;
            exerciseMap.set(exId, existing);
          }
        });
      });
    });
  });

  // Generate mock suggestions
  exerciseMap.forEach((data, exerciseId) => {
    const avgWeight = data.weight / data.count;
    const avgReps = data.reps / data.count;
    
    if (data.count >= 3 && avgWeight > 0) {
      suggestions.push({
        exerciseId,
        exerciseName: `Exercise ${exerciseId}`,
        currentWeight: avgWeight,
        currentReps: Math.round(avgReps),
        suggestedWeight: avgWeight * 1.025, // +2.5%
        suggestedReps: Math.round(avgReps),
        reasoning: `Mock: Based on ${data.count} recent sessions. Average ${Math.round(avgWeight)}kg × ${Math.round(avgReps)} reps.`,
        confidence: 70,
        applyImmediately: false,
      });
    }
  });

  return {
    suggestions: suggestions.slice(0, 10),
    globalRecommendation: suggestions.length > 0 
      ? `Consider progressing ${suggestions.length} exercises based on recent performance.`
      : undefined,
  };
}
