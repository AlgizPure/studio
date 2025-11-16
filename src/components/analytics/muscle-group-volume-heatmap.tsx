'use client';

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkoutLog } from '@/lib/types/workout-log';
import { calculateMuscleGroupVolumeByWeek, MUSCLE_GROUPS, formatVolume } from '@/lib/analytics';
import type { MuscleGroupVolumeData } from '@/lib/analytics';

interface MuscleGroupVolumeHeatmapProps {
  workouts: WorkoutLog[];
  weeksToShow?: number;
}

/**
 * Muscle Group Volume Heatmap Component
 *
 * Visualizes training volume distribution across muscle groups over time.
 * Shows which muscle groups are trained most/least to identify imbalances.
 *
 * Module: Analytics (Module 9)
 * Function: 9.7 - Advanced Visualizations (Heatmap)
 * Reference: docs/requirements/09_analytics_requirements.md
 */
export const MuscleGroupVolumeHeatmap = React.memo(function MuscleGroupVolumeHeatmap({
  workouts,
  weeksToShow = 8,
}: MuscleGroupVolumeHeatmapProps) {
  const chartData = useMemo(() => {
    const volumeData = calculateMuscleGroupVolumeByWeek(workouts, weeksToShow);

    // Group by week for stacked bar chart
    const weekMap = new Map<string, Record<string, number>>();

    volumeData.forEach(({ week, muscleGroup, volume }) => {
      if (!weekMap.has(week)) {
        weekMap.set(week, {
          week,
          ...Object.fromEntries(MUSCLE_GROUPS.map(g => [g, 0])),
        });
      }

      const weekData = weekMap.get(week)!;
      weekData[muscleGroup] = volume;
    });

    return Array.from(weekMap.values()).slice(-weeksToShow);
  }, [workouts, weeksToShow]);

  // Color palette for muscle groups
  const colors: Record<string, string> = {
    Chest: 'hsl(210, 70%, 50%)', // Blue
    Back: 'hsl(140, 60%, 50%)', // Green
    Legs: 'hsl(30, 80%, 50%)', // Orange
    Shoulders: 'hsl(280, 60%, 55%)', // Purple
    Arms: 'hsl(0, 70%, 55%)', // Red
    Core: 'hsl(50, 80%, 50%)', // Yellow
  };

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; fill: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);

      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium mb-2">{label}</p>
          {payload
            .filter(entry => entry.value > 0)
            .sort((a, b) => b.value - a.value)
            .map((entry, index) => {
              const percentage = total > 0 ? Math.round((entry.value / total) * 100) : 0;
              return (
                <p key={index} className="text-xs text-muted-foreground">
                  <span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: entry.fill }} />
                  <span className="font-medium text-foreground">{entry.name}:</span>{' '}
                  {formatVolume(entry.value)} ({percentage}%)
                </p>
              );
            })}
          <div className="mt-2 pt-2 border-t">
            <p className="text-xs font-medium text-foreground">Total: {formatVolume(total)}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Muscle Group Volume Heatmap</CardTitle>
          <CardDescription>Training volume distribution across muscle groups</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            <p>No workout data available for the selected period</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Muscle Group Volume Heatmap</CardTitle>
        <CardDescription>
          Training volume by muscle group over the last {weeksToShow} weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            stackOffset="none"
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="week"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{
                value: 'Volume (kg)',
                angle: -90,
                position: 'insideLeft',
                style: { fontSize: 12 },
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="square"
            />

            {MUSCLE_GROUPS.map(muscleGroup => (
              <Bar
                key={muscleGroup}
                dataKey={muscleGroup}
                stackId="volume"
                fill={colors[muscleGroup]}
                radius={[2, 2, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        <div className="mt-4 text-xs text-muted-foreground text-center">
          <p>
            Stacked bars show relative volume distribution across muscle groups.
            Balanced training should show relatively even distribution.
          </p>
        </div>
      </CardContent>
    </Card>
  );
});
