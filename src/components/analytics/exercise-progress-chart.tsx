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
import type { TimeRange } from '@/lib/analytics';
import {
  getExerciseProgress,
  getUniqueExercises,
  getWorkoutsByDateRange,
} from '@/lib/analytics';

interface ExerciseProgressChartProps {
  workouts: WorkoutLog[];
  timeRange: TimeRange;
}

export const ExerciseProgressChart = React.memo(function ExerciseProgressChart({ workouts, timeRange }: ExerciseProgressChartProps) {
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-md">
          <p className="text-sm font-medium mb-1">{payload[0].payload.date}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm text-muted-foreground">
              {entry.name}: <span className="font-medium text-foreground">{entry.value}</span>
              {entry.dataKey === 'maxWeight' || entry.dataKey === 'avgWeight' ? ' kg' : ''}
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
          <CardTitle>Exercise Progress</CardTitle>
          <CardDescription>Track weight and RPE over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>Complete workouts to see exercise progress</p>
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
              <CardTitle>Exercise Progress</CardTitle>
              <CardDescription>Track weight and RPE over time</CardDescription>
            </div>
            <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select exercise" />
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
            <p>No data for this exercise in the selected time range</p>
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
            <CardTitle>Exercise Progress</CardTitle>
            <CardDescription>
              Weight progression and RPE tracking
            </CardDescription>
          </div>
          <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select exercise" />
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
              label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
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
            <Bar yAxisId="left" dataKey="maxWeight" fill="hsl(var(--primary))" opacity={0.8} name="Max Weight (kg)" />
            <Line yAxisId="right" type="monotone" dataKey="avgRPE" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ fill: 'hsl(var(--chart-2))', r: 4 }} name="Avg RPE" />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
});


