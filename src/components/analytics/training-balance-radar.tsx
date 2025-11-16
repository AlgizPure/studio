'use client';

import React, { useMemo } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { WorkoutLog } from '@/lib/types/workout-log';
import { calculateTrainingBalance, formatVolume } from '@/lib/analytics';
import type { TrainingBalanceData } from '@/lib/analytics';

interface TrainingBalanceRadarProps {
  workouts: WorkoutLog[];
}

/**
 * Training Balance Radar Chart Component
 *
 * Visualizes relative training balance across muscle groups using radar chart.
 * Ideal distribution forms a perfect hexagon - imbalances appear as distortions.
 *
 * Module: Analytics (Module 9)
 * Function: 9.7 - Advanced Visualizations (Radar Chart)
 * Reference: docs/requirements/09_analytics_requirements.md
 */
export const TrainingBalanceRadar = React.memo(function TrainingBalanceRadar({
  workouts,
}: TrainingBalanceRadarProps) {
  const chartData = useMemo(() => {
    return calculateTrainingBalance(workouts);
  }, [workouts]);

  const totalVolume = useMemo(() => {
    return chartData.reduce((sum, data) => sum + data.volume, 0);
  }, [chartData]);

  // Calculate balance score (0-100)
  // Perfect balance = all muscle groups at ~16.7% (100/6)
  const balanceScore = useMemo(() => {
    if (totalVolume === 0) return 0;

    const idealPercentage = 100 / chartData.length; // ~16.7%
    const deviations = chartData.map(data =>
      Math.abs(data.percentage - idealPercentage)
    );
    const avgDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;

    // Score: 100 = perfect balance, 0 = max imbalance
    return Math.max(0, Math.round(100 - avgDeviation * 3));
  }, [chartData, totalVolume]);

  const getBalanceRating = (score: number): { label: string; variant: 'default' | 'secondary' | 'destructive' } => {
    if (score >= 80) return { label: 'Excellent Balance', variant: 'default' };
    if (score >= 60) return { label: 'Good Balance', variant: 'secondary' };
    return { label: 'Needs Balance', variant: 'destructive' };
  };

  const balanceRating = getBalanceRating(balanceScore);

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: TrainingBalanceData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium mb-1">{data.muscleGroup}</p>
          <p className="text-xs text-muted-foreground">
            Volume: <span className="font-medium text-foreground">{formatVolume(data.volume)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Share: <span className="font-medium text-foreground">{data.percentage}%</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Sets: <span className="font-medium text-foreground">{data.sets}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (totalVolume === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Balance Radar</CardTitle>
          <CardDescription>Muscle group balance analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            <p>No workout data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>Training Balance Radar</CardTitle>
            <CardDescription>
              Relative volume distribution across muscle groups
            </CardDescription>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={balanceRating.variant}>{balanceRating.label}</Badge>
            <span className="text-xs text-muted-foreground">Score: {balanceScore}/100</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <RadarChart data={chartData}>
            <PolarGrid className="stroke-muted" />
            <PolarAngleAxis
              dataKey="muscleGroup"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 'auto']}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <Radar
              name="Volume %"
              dataKey="percentage"
              stroke="hsl(var(--primary))"
              fill="hsl(var(--primary))"
              fillOpacity={0.5}
              strokeWidth={2}
            />
            <Tooltip content={<CustomTooltip />} />
          </RadarChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-2">
          <div className="text-xs text-muted-foreground text-center">
            <p>
              <strong>Balanced training:</strong> All muscle groups should have similar percentages (~17%).
              Large variations indicate potential imbalances.
            </p>
          </div>

          {/* Top 3 muscle groups */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {chartData
              .slice()
              .sort((a, b) => b.percentage - a.percentage)
              .slice(0, 3)
              .map((data, index) => (
                <div
                  key={data.muscleGroup}
                  className="flex flex-col items-center p-2 rounded-md bg-muted/50"
                >
                  <span className="text-[10px] text-muted-foreground uppercase">
                    #{index + 1} Most Trained
                  </span>
                  <span className="text-sm font-semibold">{data.muscleGroup}</span>
                  <span className="text-xs text-muted-foreground">{data.percentage}%</span>
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
