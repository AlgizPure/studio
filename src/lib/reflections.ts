// src/lib/reflections.ts
// Daily Reflection utilities for analytics and trends

import type { DailyReflection } from './types';

/**
 * Reflection trend data for charting
 */
export type ReflectionTrendData = {
  date: string; // YYYY-MM-DD
  mood: number;
  energy: number;
  stress: number;
  sleepQuality: number;
};

/**
 * Reflection summary statistics
 */
export type ReflectionStats = {
  averageMood: number;
  averageEnergy: number;
  averageStress: number;
  averageSleepQuality: number;
  totalReflections: number;
  currentStreak: number; // consecutive days with reflections
  longestStreak: number;
  completionRate: number; // percentage of days with reflections
};

/**
 * Calculate average values for reflection metrics
 */
export function calculateReflectionStats(
  reflections: DailyReflection[],
  daysBack: number = 30
): ReflectionStats {
  if (reflections.length === 0) {
    return {
      averageMood: 0,
      averageEnergy: 0,
      averageStress: 0,
      averageSleepQuality: 0,
      totalReflections: 0,
      currentStreak: 0,
      longestStreak: 0,
      completionRate: 0,
    };
  }

  // Filter to recent reflections
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);
  const recent = reflections.filter(r => new Date(r.date) >= cutoffDate);

  // Calculate averages
  const totalMood = recent.reduce((sum, r) => sum + r.mood, 0);
  const totalEnergy = recent.reduce((sum, r) => sum + r.energy, 0);
  const totalStress = recent.reduce((sum, r) => sum + r.stress, 0);
  const totalSleep = recent.reduce((sum, r) => sum + r.sleepQuality, 0);

  const count = recent.length;

  // Calculate streaks
  const sorted = reflections
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sorted.length; i++) {
    const reflectionDate = new Date(sorted[i].date);
    reflectionDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(expectedDate.getDate() - i);

    if (reflectionDate.getTime() === expectedDate.getTime()) {
      tempStreak++;
      if (i === 0) currentStreak = tempStreak; // streak is current
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }
  }

  // Completion rate
  const completionRate = count > 0 ? Math.round((count / daysBack) * 100) : 0;

  return {
    averageMood: count > 0 ? Math.round((totalMood / count) * 10) / 10 : 0,
    averageEnergy: count > 0 ? Math.round((totalEnergy / count) * 10) / 10 : 0,
    averageStress: count > 0 ? Math.round((totalStress / count) * 10) / 10 : 0,
    averageSleepQuality: count > 0 ? Math.round((totalSleep / count) * 10) / 10 : 0,
    totalReflections: count,
    currentStreak,
    longestStreak,
    completionRate: Math.min(completionRate, 100),
  };
}

/**
 * Generate trend data for charts
 */
export function getReflectionTrends(
  reflections: DailyReflection[],
  daysBack: number = 30
): ReflectionTrendData[] {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysBack);

  const filtered = reflections
    .filter(r => new Date(r.date) >= cutoffDate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return filtered.map(r => ({
    date: r.date,
    mood: r.mood,
    energy: r.energy,
    stress: r.stress,
    sleepQuality: r.sleepQuality,
  }));
}

/**
 * Get reflection for a specific date
 */
export function getReflectionForDate(
  reflections: DailyReflection[],
  date: string // YYYY-MM-DD
): DailyReflection | null {
  return reflections.find(r => r.date === date) || null;
}

/**
 * Check if user has reflected today
 */
export function hasReflectedToday(reflections: DailyReflection[]): boolean {
  const today = new Date().toISOString().split('T')[0];
  return reflections.some(r => r.date === today);
}

/**
 * Get most common gratitudes (for insights)
 */
export function getTopGratitudes(reflections: DailyReflection[], limit: number = 10): string[] {
  const gratitudeMap = new Map<string, number>();

  reflections.forEach(r => {
    if (r.gratitude) {
      r.gratitude.forEach(g => {
        const normalized = g.trim().toLowerCase();
        if (normalized) {
          gratitudeMap.set(normalized, (gratitudeMap.get(normalized) || 0) + 1);
        }
      });
    }
  });

  return Array.from(gratitudeMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([gratitude]) => gratitude);
}

/**
 * Detect correlations between metrics
 * Returns Pearson correlation coefficient (-1 to 1)
 */
export function calculateCorrelation(
  reflections: DailyReflection[],
  metric1: keyof Pick<DailyReflection, 'mood' | 'energy' | 'stress' | 'sleepQuality'>,
  metric2: keyof Pick<DailyReflection, 'mood' | 'energy' | 'stress' | 'sleepQuality'>
): number {
  if (reflections.length < 2) return 0;

  const values1 = reflections.map(r => r[metric1]);
  const values2 = reflections.map(r => r[metric2]);

  const n = values1.length;
  const sum1 = values1.reduce((a, b) => a + b, 0);
  const sum2 = values2.reduce((a, b) => a + b, 0);
  const sum1Sq = values1.reduce((a, b) => a + b * b, 0);
  const sum2Sq = values2.reduce((a, b) => a + b * b, 0);
  const pSum = values1.reduce((sum, v1, i) => sum + v1 * values2[i], 0);

  const num = pSum - (sum1 * sum2) / n;
  const den = Math.sqrt((sum1Sq - (sum1 * sum1) / n) * (sum2Sq - (sum2 * sum2) / n));

  if (den === 0) return 0;
  return Math.round((num / den) * 100) / 100;
}

/**
 * Get insights from reflections
 */
export function generateReflectionInsights(reflections: DailyReflection[]): string[] {
  const insights: string[] = [];

  if (reflections.length < 7) {
    return ['Keep reflecting! More data will unlock personalized insights.'];
  }

  const stats = calculateReflectionStats(reflections, 30);

  // Mood insights
  if (stats.averageMood >= 8) {
    insights.push(`🎉 Your average mood is excellent (${stats.averageMood}/10)!`);
  } else if (stats.averageMood < 5) {
    insights.push(`💭 Your average mood has been low (${stats.averageMood}/10). Consider talking to someone.`);
  }

  // Energy insights
  if (stats.averageEnergy < 5) {
    insights.push(`⚡ Low energy levels (${stats.averageEnergy}/10). Focus on sleep and nutrition.`);
  }

  // Stress insights
  if (stats.averageStress > 7) {
    insights.push(`😰 High stress levels (${stats.averageStress}/10). Try stress-reduction techniques.`);
  }

  // Sleep insights
  if (stats.averageSleepQuality < 6) {
    insights.push(`😴 Poor sleep quality (${stats.averageSleepQuality}/10). Prioritize better sleep hygiene.`);
  }

  // Correlations
  const moodEnergy = calculateCorrelation(reflections, 'mood', 'energy');
  if (moodEnergy > 0.6) {
    insights.push(`💡 Your mood strongly correlates with energy levels (+${Math.round(moodEnergy * 100)}%).`);
  }

  const sleepEnergy = calculateCorrelation(reflections, 'sleepQuality', 'energy');
  if (sleepEnergy > 0.5) {
    insights.push(`💡 Better sleep quality significantly improves your energy (+${Math.round(sleepEnergy * 100)}%).`);
  }

  // Streak insights
  if (stats.currentStreak >= 7) {
    insights.push(`🔥 Amazing! You're on a ${stats.currentStreak}-day reflection streak!`);
  }

  return insights.length > 0 ? insights : ['Looking good! Keep tracking to see more insights.'];
}
