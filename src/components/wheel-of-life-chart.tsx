'use client';

import React, { useMemo } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WeeklyContext } from '@/lib/types';
import { DIMENSION_INFO, calculateBalanceScore, getRadarChartData, generateContextInsights } from '@/lib/wheel-of-life';
import { Target, TrendingUp, Sparkles } from 'lucide-react';

interface WheelOfLifeChartProps {
  assessment: WeeklyContext;
  previousAssessment?: WeeklyContext;
  className?: string;
}

/**
 * Wheel of Life Radar Chart Component
 *
 * Visualizes life balance across 8 dimensions with radar chart.
 * Shows balance score, strongest/weakest areas, and insights.
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.7 - Context Visualization (Stage 4)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */
export function WheelOfLifeChart({
  assessment,
  previousAssessment,
  className,
}: WheelOfLifeChartProps) {
  const chartData = useMemo(() => {
    return getRadarChartData(assessment, previousAssessment);
  }, [assessment, previousAssessment]);

  const balanceScore = useMemo(() => {
    return calculateBalanceScore(assessment.contexts);
  }, [assessment.contexts]);

  const insights = useMemo(() => {
    return generateContextInsights(assessment.contexts, previousAssessment?.contexts);
  }, [assessment.contexts, previousAssessment?.contexts]);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; dataKey: string }>;
  }) => {
    if (active && payload && payload.length) {
      const dimension = payload[0].name;
      const current = payload.find(p => p.dataKey === 'current')?.value || 0;
      const previous = payload.find(p => p.dataKey === 'previous')?.value;

      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium mb-1">{dimension}</p>
          <p className="text-xs text-muted-foreground">
            Current: <span className="font-medium text-foreground">{current}/10</span>
          </p>
          {previous !== undefined && (
            <p className="text-xs text-muted-foreground">
              Previous: <span className="font-medium text-foreground">{previous}/10</span>
              {current !== previous && (
                <span className={current > previous ? 'text-green-600' : 'text-red-600'}>
                  {' '}({current > previous ? '+' : ''}{current - previous})
                </span>
              )}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const getBalanceColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Wheel of Life
            </CardTitle>
            <CardDescription>
              Your life balance for {new Date(assessment.weekStart).toLocaleDateString()}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Balance Score</p>
            <p className={`text-3xl font-bold ${getBalanceColor(balanceScore.overall)}`}>
              {balanceScore.overall}
            </p>
            <p className="text-xs text-muted-foreground">{balanceScore.rating}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Radar Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={chartData}>
            <PolarGrid strokeDasharray="3 3" className="stroke-muted" />
            <PolarAngleAxis
              dataKey="dimension"
              tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
              className="text-xs"
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 10]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickCount={6}
            />
            <Tooltip content={<CustomTooltip />} />

            {/* Previous week (if available) */}
            {previousAssessment && (
              <Radar
                name="Previous Week"
                dataKey="previous"
                stroke="hsl(var(--muted-foreground))"
                fill="hsl(var(--muted))"
                fillOpacity={0.3}
                strokeWidth={1}
                strokeDasharray="5 5"
              />
            )}

            {/* Current week */}
            <Radar
              name="Current Week"
              dataKey="current"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.5}
              strokeWidth={2}
            />

            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="circle"
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold">{balanceScore.averageScore}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Strongest Area</p>
            <div className="flex items-center gap-1">
              <span className="text-xl">{DIMENSION_INFO[balanceScore.strongestDimension].icon}</span>
              <p className="text-sm font-medium">{DIMENSION_INFO[balanceScore.strongestDimension].label}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {assessment.contexts[balanceScore.strongestDimension]}/10
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Needs Attention</p>
            <div className="flex items-center gap-1">
              <span className="text-xl">{DIMENSION_INFO[balanceScore.weakestDimension].icon}</span>
              <p className="text-sm font-medium">{DIMENSION_INFO[balanceScore.weakestDimension].label}</p>
            </div>
            <p className="text-xs text-muted-foreground">
              {assessment.contexts[balanceScore.weakestDimension]}/10
            </p>
          </div>
        </div>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Insights & Recommendations</span>
            </div>
            <div className="space-y-2">
              {insights.map((insight, index) => (
                <div
                  key={index}
                  className="text-sm bg-muted/50 rounded-md p-3 border-l-4 border-primary"
                >
                  {insight}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Dimension Breakdown */}
        <div className="space-y-2">
          <p className="text-sm font-medium flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dimension Breakdown
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {chartData.map((item) => {
              const dimension = item.dimensionKey;
              const info = DIMENSION_INFO[dimension];
              const value = item.current;
              const previous = item.previous;
              const change = previous ? value - previous : null;

              return (
                <div
                  key={dimension}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{info.icon}</span>
                    <div>
                      <p className="text-xs font-medium">{info.label}</p>
                      {change !== null && (
                        <p className={`text-xs ${change > 0 ? 'text-green-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change).toFixed(1)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold" style={{ color: info.color }}>
                      {value}/10
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
