// src/components/analytics/volume-chart.tsx
'use client';

import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkoutLog } from '@/lib/types';
import type { TimeRange } from '@/lib/analytics';
import {
  groupWorkoutsByPeriod,
  getWorkoutsByDateRange,
  generateTrendLine,
  formatVolume,
} from '@/lib/analytics';

interface VolumeChartProps {
  workouts: WorkoutLog[];
  timeRange: TimeRange;
}

export const VolumeChart = React.memo(function VolumeChart({ workouts, timeRange }: VolumeChartProps) {
  const chartData = useMemo(() => {
    const filteredWorkouts = getWorkoutsByDateRange(workouts, timeRange);
    const period = timeRange === '90d' ? 'week' : 'day';
    const grouped = groupWorkoutsByPeriod(filteredWorkouts, period);
    const volumes = grouped.map(g => g.totalVolume);
    const trendLine = generateTrendLine(volumes);
    return grouped.map((group, index) => ({
      date: formatDate(group.date, period),
      volume: group.totalVolume,
      trend: Math.round(trendLine[index] || 0),
      workouts: group.workoutCount,
    }));
  }, [workouts, timeRange]);

  const formatDate = (dateStr: string, period: 'day' | 'week' | 'month') => {
    if (period === 'week') {
      const weekNum = dateStr.split('-W')[1];
      return `W${weekNum}`;
    } else if (period === 'day') {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } else {
      const [year, month] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('en-US', { month: 'short' });
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-sm font-medium">{payload[0].payload.date}</p>
          <p className="text-sm text-muted-foreground">
            Volume: <span className="font-medium text-foreground">{formatVolume(payload[0].value)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Workouts: <span className="font-medium text-foreground">{payload[0].payload.workouts}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Total Volume Over Time</CardTitle>
          <CardDescription>Track your training volume progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>No workout data available for this time range</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Volume Over Time</CardTitle>
        <CardDescription>
          Training volume (weight × reps) with trend line
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="volume"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--primary))', r: 4 }}
              activeDot={{ r: 6 }}
              name="Volume (kg)"
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Trend"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});


