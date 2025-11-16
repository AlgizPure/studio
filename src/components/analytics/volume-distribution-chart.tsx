'use client';

import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { WorkoutLog } from '@/lib/types/workout-log';
import { calculateVolumeDistribution, formatVolume } from '@/lib/analytics';
import type { VolumeDistributionData } from '@/lib/analytics';

interface VolumeDistributionChartProps {
  workouts: WorkoutLog[];
}

/**
 * Volume Distribution Chart Component
 *
 * Visualizes training volume distribution by movement category (Push/Pull/Legs).
 * Helps ensure balanced programming and identify training biases.
 *
 * Module: Analytics (Module 9)
 * Function: 9.7 - Advanced Visualizations (Volume Distribution)
 * Reference: docs/requirements/09_analytics_requirements.md
 */
export const VolumeDistributionChart = React.memo(function VolumeDistributionChart({
  workouts,
}: VolumeDistributionChartProps) {
  const chartData = useMemo(() => {
    return calculateVolumeDistribution(workouts);
  }, [workouts]);

  const totalVolume = useMemo(() => {
    return chartData.reduce((sum, data) => sum + data.volume, 0);
  }, [chartData]);

  const colors: Record<string, string> = {
    Push: 'hsl(210, 70%, 50%)', // Blue
    Pull: 'hsl(140, 60%, 50%)', // Green
    Legs: 'hsl(30, 80%, 50%)', // Orange
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: VolumeDistributionData }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium mb-1">{data.category}</p>
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

  const CustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
  }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (totalVolume === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Volume Distribution</CardTitle>
          <CardDescription>Push vs Pull vs Legs breakdown</CardDescription>
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
        <CardTitle>Volume Distribution</CardTitle>
        <CardDescription>
          Training volume breakdown by movement category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={120}
              innerRadius={60}
              fill="#8884d8"
              dataKey="volume"
              paddingAngle={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[entry.category]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="square"
              formatter={(value, entry: any) => {
                const data = chartData.find(d => d.category === value);
                return `${value} (${data?.percentage}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="mt-4 space-y-3">
          <div className="text-xs text-muted-foreground text-center">
            <p>
              <strong>Balanced programming:</strong> Aim for roughly equal distribution
              (Push ~33%, Pull ~33%, Legs ~33%) to ensure comprehensive development.
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3">
            {chartData.map(data => (
              <div
                key={data.category}
                className="flex flex-col items-center p-3 rounded-md border"
                style={{ borderColor: colors[data.category], borderWidth: 2 }}
              >
                <div
                  className="w-3 h-3 rounded-full mb-1"
                  style={{ backgroundColor: colors[data.category] }}
                />
                <span className="text-sm font-semibold">{data.category}</span>
                <span className="text-lg font-bold text-primary">{data.percentage}%</span>
                <span className="text-xs text-muted-foreground">
                  {formatVolume(data.volume)}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {data.sets} sets
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
