// src/lib/analytics/trend-analysis.ts
// Trend calculation utilities

import type { TrendData } from './types';

export function calculateTrend(data: number[]): TrendData {
  if (data.length < 2) {
    return { slope: 0, trend: 'stable', changePercentage: 0 };
  }
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = data.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const firstValue = data[0];
  const lastValue = data[data.length - 1];
  const changePercentage = firstValue !== 0 ? ((lastValue - firstValue) / firstValue) * 100 : 0;
  let trend: 'increasing' | 'stable' | 'decreasing';
  if (Math.abs(changePercentage) < 5) {
    trend = 'stable';
  } else if (changePercentage > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }
  return { slope, trend, changePercentage };
}

export function generateTrendLine(data: number[]): number[] {
  if (data.length < 2) return data;
  const n = data.length;
  const indices = Array.from({ length: n }, (_, i) => i);
  const sumX = indices.reduce((sum, x) => sum + x, 0);
  const sumY = data.reduce((sum, y) => sum + y, 0);
  const sumXY = indices.reduce((sum, x, i) => sum + x * data[i], 0);
  const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  return indices.map(x => slope * x + intercept);
}
