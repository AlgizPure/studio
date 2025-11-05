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
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkoutLog } from '@/lib/types';
import { calculateDayFrequency, formatVolume } from '@/lib/analytics-utils';

interface FrequencyHeatmapProps {
  workouts: WorkoutLog[];
}

export function FrequencyHeatmap({ workouts }: FrequencyHeatmapProps) {
  const chartData = useMemo(() => {
    return calculateDayFrequency(workouts);
  }, [workouts]);

  // Color scale based on workout count
  const getColor = (count: number, maxCount: number) => {
    if (maxCount === 0) return 'hsl(var(--muted))';
    const intensity = count / maxCount;
    if (intensity > 0.7) return 'hsl(var(--primary))';
    if (intensity > 0.4) return 'hsl(var(--primary) / 0.7)';
    if (intensity > 0.2) return 'hsl(var(--primary) / 0.4)';
    return 'hsl(var(--muted))';
  };

  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium mb-1">{data.dayOfWeek}</p>
          <p className="text-xs text-muted-foreground">
            Workouts: <span className="font-medium text-foreground">{data.count}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Avg Volume: <span className="font-medium text-foreground">{formatVolume(data.avgVolume)}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Avg Duration: <span className="font-medium text-foreground">{data.avgDuration} min</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0 || chartData.every(d => d.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout Frequency by Day</CardTitle>
          <CardDescription>See which days you train most often</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>No workout data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Frequency by Day</CardTitle>
        <CardDescription>
          Your training patterns throughout the week
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="dayOfWeek"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Workouts', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.count, maxCount)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(var(--muted))' }} />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(var(--primary) / 0.4)' }} />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(var(--primary))' }} />
            <span>High</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
