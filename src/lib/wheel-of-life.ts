// src/lib/wheel-of-life.ts
// Wheel of Life utilities for life balance tracking

import type { WeeklyContext } from './types';
import { startOfWeek } from 'date-fns';

/**
 * Life dimensions for Wheel of Life
 */
export const LIFE_DIMENSIONS = [
  'fitness',
  'career',
  'relationships',
  'growth',
  'environment',
  'fun',
  'contribution',
  'spirituality',
] as const;

export type LifeDimension = typeof LIFE_DIMENSIONS[number];

/**
 * Dimension metadata
 */
export const DIMENSION_INFO: Record<LifeDimension, { label: string; icon: string; color: string; description: string }> = {
  fitness: {
    label: 'Fitness & Health',
    icon: '💪',
    color: 'hsl(120, 60%, 50%)',
    description: 'Physical health, workouts, sleep, nutrition',
  },
  career: {
    label: 'Career & Finance',
    icon: '💼',
    color: 'hsl(210, 70%, 50%)',
    description: 'Work satisfaction, income goals, professional growth',
  },
  relationships: {
    label: 'Relationships & Social',
    icon: '❤️',
    color: 'hsl(0, 70%, 55%)',
    description: 'Quality time, connections, family, friends',
  },
  growth: {
    label: 'Personal Growth',
    icon: '🌱',
    color: 'hsl(140, 60%, 50%)',
    description: 'Learning, hobbies, creativity, skills',
  },
  environment: {
    label: 'Environment',
    icon: '🏡',
    color: 'hsl(30, 80%, 50%)',
    description: 'Home, workspace organization, surroundings',
  },
  fun: {
    label: 'Fun & Recreation',
    icon: '🎉',
    color: 'hsl(280, 60%, 55%)',
    description: 'Leisure, travel, entertainment, hobbies',
  },
  contribution: {
    label: 'Contribution',
    icon: '🤝',
    color: 'hsl(50, 80%, 50%)',
    description: 'Volunteering, helping others, giving back',
  },
  spirituality: {
    label: 'Spirituality',
    icon: '🧘',
    color: 'hsl(260, 60%, 60%)',
    description: 'Meditation, values alignment, purpose',
  },
};

/**
 * Balance score data
 */
export type BalanceScore = {
  overall: number; // 0-100
  rating: 'Poor' | 'Fair' | 'Good' | 'Excellent';
  weakestDimension: LifeDimension;
  strongestDimension: LifeDimension;
  averageScore: number; // 1-10
};

/**
 * Dimension trend data
 */
export type DimensionTrend = {
  dimension: LifeDimension;
  current: number;
  previous?: number;
  change: number; // percentage
  trend: 'up' | 'down' | 'stable';
};

/**
 * Get week start date (Monday)
 */
export function getWeekStart(date: Date = new Date()): string {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  return weekStart.toISOString().split('T')[0];
}

/**
 * Calculate balance score from contexts
 */
export function calculateBalanceScore(contexts: WeeklyContext['contexts']): BalanceScore {
  const values = Object.values(contexts);
  const average = values.reduce((sum, v) => sum + v, 0) / values.length;

  // Calculate standard deviation for balance
  const variance = values.reduce((sum, v) => sum + Math.pow(v - average, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Balance score: lower standard deviation = better balance
  // Perfect balance (all 10s) = 100, high variance = lower score
  const balanceScore = Math.max(0, Math.round(100 - stdDev * 15));

  // Find weakest and strongest
  const entries = Object.entries(contexts) as [LifeDimension, number][];
  const sorted = entries.sort((a, b) => a[1] - b[1]);
  const weakest = sorted[0][0];
  const strongest = sorted[sorted.length - 1][0];

  // Rating
  let rating: BalanceScore['rating'];
  if (balanceScore >= 80) rating = 'Excellent';
  else if (balanceScore >= 60) rating = 'Good';
  else if (balanceScore >= 40) rating = 'Fair';
  else rating = 'Poor';

  return {
    overall: balanceScore,
    rating,
    weakestDimension: weakest,
    strongestDimension: strongest,
    averageScore: Math.round(average * 10) / 10,
  };
}

/**
 * Calculate dimension trends
 */
export function calculateDimensionTrends(
  current: WeeklyContext,
  previous?: WeeklyContext
): DimensionTrend[] {
  return LIFE_DIMENSIONS.map(dimension => {
    const currentValue = current.contexts[dimension];
    const previousValue = previous?.contexts[dimension];

    let change = 0;
    let trend: DimensionTrend['trend'] = 'stable';

    if (previousValue !== undefined) {
      change = Math.round(((currentValue - previousValue) / previousValue) * 100);
      if (change > 10) trend = 'up';
      else if (change < -10) trend = 'down';
    }

    return {
      dimension,
      current: currentValue,
      previous: previousValue,
      change,
      trend,
    };
  });
}

/**
 * Get latest context assessment
 */
export function getLatestContext(contexts: WeeklyContext[]): WeeklyContext | null {
  if (contexts.length === 0) return null;
  return contexts.sort((a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime())[0];
}

/**
 * Get context for specific week
 */
export function getContextForWeek(contexts: WeeklyContext[], weekStart: string): WeeklyContext | null {
  return contexts.find(c => c.weekStart === weekStart) || null;
}

/**
 * Check if user has assessed this week
 */
export function hasAssessedThisWeek(contexts: WeeklyContext[]): boolean {
  const thisWeekStart = getWeekStart();
  return contexts.some(c => c.weekStart === thisWeekStart);
}

/**
 * Generate insights from context data
 */
export function generateContextInsights(
  current: WeeklyContext,
  previous?: WeeklyContext
): string[] {
  const insights: string[] = [];
  const balance = calculateBalanceScore(current.contexts);

  // Overall balance
  if (balance.overall >= 80) {
    insights.push(`🎯 Excellent life balance! Your score is ${balance.overall}/100.`);
  } else if (balance.overall < 50) {
    insights.push(`⚠️ Life balance needs attention (${balance.overall}/100). Focus on weaker areas.`);
  }

  // Weakest dimension
  const weakestScore = current.contexts[balance.weakestDimension];
  if (weakestScore < 5) {
    const info = DIMENSION_INFO[balance.weakestDimension];
    insights.push(`📉 ${info.label} is your weakest area (${weakestScore}/10). Consider prioritizing it.`);
  }

  // Strongest dimension
  const strongestScore = current.contexts[balance.strongestDimension];
  if (strongestScore >= 8) {
    const info = DIMENSION_INFO[balance.strongestDimension];
    insights.push(`✨ ${info.label} is thriving (${strongestScore}/10). Great work!`);
  }

  // Trends
  if (previous) {
    const trends = calculateDimensionTrends(current, previous);
    const improving = trends.filter(t => t.trend === 'up');
    const declining = trends.filter(t => t.trend === 'down');

    if (improving.length > 0) {
      const dimensions = improving.map(t => DIMENSION_INFO[t.dimension].label).join(', ');
      insights.push(`📈 Improving areas: ${dimensions}`);
    }

    if (declining.length > 0) {
      const dimensions = declining.map(t => DIMENSION_INFO[t.dimension].label).join(', ');
      insights.push(`📉 Needs attention: ${dimensions}`);
    }
  }

  // Specific recommendations
  if (current.contexts.fitness < 6 && current.contexts.relationships > 7) {
    insights.push(`💡 Strong relationships but low fitness. Try social workouts!`);
  }

  if (current.contexts.career > 8 && current.contexts.fun < 5) {
    insights.push(`💡 Career is great but fun is lacking. Remember work-life balance!`);
  }

  return insights.length > 0 ? insights : ['Looking good! Keep tracking to see more insights.'];
}

/**
 * Get radar chart data
 */
export function getRadarChartData(context: WeeklyContext) {
  return LIFE_DIMENSIONS.map(dimension => ({
    dimension: DIMENSION_INFO[dimension].label,
    value: context.contexts[dimension],
    fullMark: 10,
  }));
}
