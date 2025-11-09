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
import { calculateRPEDistribution } from '@/lib/analytics';

interface RPEDistributionChartProps {
  workouts: WorkoutLog[];
}

export const RPEDistributionChart = React.memo(function RPEDistributionChart({ workouts }: RPEDistributionChartProps) {
  const chartData = useMemo(() => {
    return calculateRPEDistribution(workouts);
  }, [workouts]);

  // Color scale based on RPE intensity
  const getColor = (rpe: number) => {
    if (rpe >= 9) return 'hsl(0, 70%, 50%)'; // Dark red for very hard
    if (rpe >= 7) return 'hsl(30, 90%, 55%)'; // Orange for hard
    if (rpe >= 5) return 'hsl(60, 90%, 55%)'; // Yellow for moderate
    return 'hsl(120, 50%, 50%)'; // Green for easy
  };

  const totalSets = chartData.reduce((sum, d) => sum + d.count, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium mb-1">RPE {data.rpe}</p>
          <p className="text-xs text-muted-foreground">
            Sets: <span className="font-medium text-foreground">{data.count}</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Percentage: <span className="font-medium text-foreground">{data.percentage.toFixed(1)}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  if (totalSets === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>RPE Distribution</CardTitle>
          <CardDescription>Intensity distribution of your training</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>No RPE data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>RPE Distribution</CardTitle>
        <CardDescription>
          Rate of Perceived Exertion across {totalSets} sets
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
              dataKey="rpe"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'RPE', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Sets', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.rpe)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(120, 50%, 50%)' }} />
            <span>Easy (1-4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(60, 90%, 55%)' }} />
            <span>Moderate (5-6)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(30, 90%, 55%)' }} />
            <span>Hard (7-8)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded" style={{ backgroundColor: 'hsl(0, 70%, 50%)' }} />
            <span>Very Hard (9-10)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
