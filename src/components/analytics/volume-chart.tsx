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
import type { TimeRange } from '@/lib/analytics-utils';
import {
  groupWorkoutsByPeriod,
  getWorkoutsByDateRange,
  generateTrendLine,
  formatVolume,
} from '@/lib/analytics-utils';

/**
 * @fileoverview Компонент диаграммы для отслеживания общего объема тренировок с течением времени.
 */

/**
 * Свойства для компонента VolumeChart.
 * @interface VolumeChartProps
 * @property {WorkoutLog[]} workouts - Массив логов тренировок.
 * @property {TimeRange} timeRange - Временной диапазон для анализа.
 */
interface VolumeChartProps {
  workouts: WorkoutLog[];
  timeRange: TimeRange;
}

/**
 * Компонент диаграммы объема тренировок.
 * @param {VolumeChartProps} props - Свойства компонента.
 * @returns {JSX.Element} - Диаграмма объема тренировок.
 */
export function VolumeChart({ workouts, timeRange }: VolumeChartProps) {
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
      return `Н${weekNum}`;
    } else if (period === 'day') {
      const date = new Date(dateStr);
      return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
    } else {
      const [year, month] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString('ru-RU', { month: 'short' });
    }
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-sm font-medium">{payload[0].payload.date}</p>
          <p className="text-sm text-muted-foreground">
            Объем: <span className="font-medium text-foreground">{formatVolume(payload[0].value)}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Тренировок: <span className="font-medium text-foreground">{payload[0].payload.workouts}</span>
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
          <CardTitle>Общий объем с течением времени</CardTitle>
          <CardDescription>Отслеживайте прогресс вашего тренировочного объема</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>Нет данных о тренировках для этого временного диапазона</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Общий объем с течением времени</CardTitle>
        <CardDescription>
          Тренировочный объем (вес × повторения) с линией тренда
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
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}тыс.`}
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
              name="Объем (кг)"
            />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="hsl(var(--muted-foreground))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Тренд"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
