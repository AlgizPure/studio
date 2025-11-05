// src/components/analytics/exercise-progress-chart.tsx
'use client';

import React, { useState, useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { WorkoutLog } from '@/lib/types';
import type { TimeRange } from '@/lib/analytics-utils';
import {
  getExerciseProgress,
  getUniqueExercises,
  getWorkoutsByDateRange,
} from '@/lib/analytics-utils';

/**
 * @fileoverview Компонент диаграммы для отслеживания прогресса по конкретному упражнению.
 */

/**
 * Свойства для компонента ExerciseProgressChart.
 * @interface ExerciseProgressChartProps
 * @property {WorkoutLog[]} workouts - Массив логов тренировок.
 * @property {TimeRange} timeRange - Временной диапазон для анализа.
 */
interface ExerciseProgressChartProps {
  workouts: WorkoutLog[];
  timeRange: TimeRange;
}

/**
 * Компонент диаграммы прогресса по упражнениям.
 * @param {ExerciseProgressChartProps} props - Свойства компонента.
 * @returns {JSX.Element} - Диаграмма прогресса по упражнениям.
 */
export function ExerciseProgressChart({ workouts, timeRange }: ExerciseProgressChartProps) {
  const exercises = useMemo(() => {
    return getUniqueExercises(workouts);
  }, [workouts]);

  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(
    exercises[0]?.id || ''
  );

  const chartData = useMemo(() => {
    if (!selectedExerciseId) return [];
    const filteredWorkouts = getWorkoutsByDateRange(workouts, timeRange);
    const exerciseName = exercises.find(e => e.id === selectedExerciseId)?.name || selectedExerciseId;
    const progress = getExerciseProgress(filteredWorkouts, selectedExerciseId, exerciseName);
    return progress.map(p => ({
      date: formatDate(p.date),
      maxWeight: p.maxWeight,
      avgWeight: Math.round(p.avgWeight * 10) / 10,
      avgRPE: Math.round(p.avgRPE * 10) / 10,
      volume: p.totalVolume,
    }));
  }, [workouts, timeRange, selectedExerciseId, exercises]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-sm font-medium mb-1">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
              {entry.dataKey === 'maxWeight' || entry.dataKey === 'avgWeight' ? ' кг' : ''}
              {entry.dataKey === 'avgRPE' ? ' / 10' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (exercises.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Прогресс по упражнениям</CardTitle>
          <CardDescription>Отслеживайте вес и RPE с течением времени</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>Выполняйте тренировки, чтобы увидеть прогресс по упражнениям</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Прогресс по упражнениям</CardTitle>
              <CardDescription>Отслеживайте вес и RPE с течением времени</CardDescription>
            </div>
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Выберите упражнение" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map(exercise => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>Нет данных для этого упражнения в выбранном временном диапазоне</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Прогресс по упражнениям</CardTitle>
            <CardDescription>
              Прогрессия веса и отслеживание RPE
            </CardDescription>
          </div>
          <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Выберите упражнение" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map(exercise => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
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
              yAxisId="left"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Вес (кг)', angle: -90, position: 'insideLeft' }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 10]}
              label={{ value: 'RPE', angle: 90, position: 'insideRight' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar yAxisId="left" dataKey="maxWeight" fill="hsl(var(--primary))" opacity={0.8} name="Макс. вес (кг)" />
            <Line yAxisId="right" type="monotone" dataKey="avgRPE" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))', r: 4 }} name="Сред. RPE" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
