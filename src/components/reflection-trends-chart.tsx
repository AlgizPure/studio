'use client';

import React, { useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { DailyReflection } from '@/lib/types';
import { getReflectionTrends, calculateReflectionStats, generateReflectionInsights } from '@/lib/reflections';
import { TrendingUp, Sparkles } from 'lucide-react';

interface ReflectionTrendsChartProps {
  reflections: DailyReflection[];
  daysToShow?: 7 | 14 | 30;
}

/**
 * Reflection Trends Chart Component
 *
 * Visualizes mood, energy, stress, and sleep quality trends over time.
 * Shows insights and statistics from daily reflections.
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.5 - Daily Reflection System (Stage 3)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */
export function ReflectionTrendsChart({
  reflections,
  daysToShow = 30,
}: ReflectionTrendsChartProps) {
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(daysToShow);

  const chartData = useMemo(() => {
    return getReflectionTrends(reflections, timeRange);
  }, [reflections, timeRange]);

  const stats = useMemo(() => {
    return calculateReflectionStats(reflections, timeRange);
  }, [reflections, timeRange]);

  const insights = useMemo(() => {
    return generateReflectionInsights(reflections);
  }, [reflections]);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-3 shadow-md">
          <p className="text-sm font-medium mb-2">{new Date(label!).toLocaleDateString()}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded mr-1" style={{ backgroundColor: entry.color }} />
              <span className="font-medium text-foreground">{entry.name}:</span> {entry.value}/10
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (reflections.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reflection Trends</CardTitle>
          <CardDescription>Track your mood, energy, stress, and sleep quality over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[350px] items-center justify-center text-muted-foreground">
            <p>No reflections yet. Start your first daily reflection!</p>
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
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Reflection Trends
            </CardTitle>
            <CardDescription>
              Your well-being metrics over the last {timeRange} days
            </CardDescription>
          </div>
          <Tabs value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v) as 7 | 14 | 30)}>
            <TabsList>
              <TabsTrigger value="7">7d</TabsTrigger>
              <TabsTrigger value="14">14d</TabsTrigger>
              <TabsTrigger value="30">30d</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Mood</p>
            <p className="text-2xl font-bold text-purple-600">{stats.averageMood}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Energy</p>
            <p className="text-2xl font-bold text-orange-600">{stats.averageEnergy}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Stress</p>
            <p className="text-2xl font-bold text-red-600">{stats.averageStress}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Avg Sleep</p>
            <p className="text-2xl font-bold text-blue-600">{stats.averageSleepQuality}</p>
          </div>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              domain={[0, 10]}
              ticks={[0, 2, 4, 6, 8, 10]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="hsl(280, 60%, 55%)"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Mood"
            />
            <Line
              type="monotone"
              dataKey="energy"
              stroke="hsl(30, 80%, 50%)"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Energy"
            />
            <Line
              type="monotone"
              dataKey="stress"
              stroke="hsl(0, 70%, 50%)"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Stress"
            />
            <Line
              type="monotone"
              dataKey="sleepQuality"
              stroke="hsl(210, 70%, 50%)"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Sleep"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Insights */}
        {insights.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Insights</span>
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

        {/* Streak Badge */}
        {stats.currentStreak > 0 && (
          <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 rounded-md border border-primary/20">
            <span className="text-2xl">🔥</span>
            <span className="text-sm font-medium">
              {stats.currentStreak} day reflection streak!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
