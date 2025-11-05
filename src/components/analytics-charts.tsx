'use client';

import React, { useState } from 'react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, orderBy, query } from 'firebase/firestore';
import type { WorkoutLog } from '@/lib/types';
import type { TimeRange } from '@/lib/analytics-utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatsCards } from '@/components/analytics/stats-cards';
import { VolumeChart } from '@/components/analytics/volume-chart';
import { ExerciseProgressChart } from '@/components/analytics/exercise-progress-chart';

/**
 * @fileoverview Компонент для отображения аналитических диаграмм по тренировкам.
 */

/**
 * Основной компонент для отображения аналитики тренировок.
 * Он загружает логи тренировок и отображает статистику, графики объема и прогресса по упражнениям
 * с возможностью фильтрации по временному диапазону.
 * @returns {JSX.Element} React-компонент с аналитическими диаграммами.
 */
export function AnalyticsCharts() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'exercises'>('overview');

  const workoutLogsQuery = useMemoFirebase(
    () =>
      user
        ? query(
            collection(firestore, `users/${user.uid}/workoutLogs`),
            orderBy('startTime', 'desc')
          )
        : null,
    [user, firestore]
  );

  const { data: workoutLogs, isLoading } = useCollection<WorkoutLog>(workoutLogsQuery);

  /**
   * Обрабатывает изменение выбранного временного диапазона.
   * @param {string} value - Новое значение временного диапазона.
   */
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
    );
  }

  if (!workoutLogs || workoutLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">Пока нет данных о тренировках</h3>
          <p className="text-muted-foreground">
            Завершите свою первую тренировку, чтобы начать отслеживать прогресс.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Заголовок с селектором временного диапазона */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'exercises')}>
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="exercises">Упражнения</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Последние 7 дней</SelectItem>
            <SelectItem value="30d">Последние 30 дней</SelectItem>
            <SelectItem value="90d">Последние 90 дней</SelectItem>
            <SelectItem value="all">За все время</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Карточки со статистикой */}
      <StatsCards workouts={workoutLogs} timeRange={timeRange} />

      {/* Содержимое вкладок */}
      <TabsContent value="overview" className="space-y-6">
        <VolumeChart workouts={workoutLogs} timeRange={timeRange} />
      </TabsContent>

      <TabsContent value="exercises" className="space-y-6">
        <ExerciseProgressChart workouts={workoutLogs} timeRange={timeRange} />
      </TabsContent>
    </div>
  );
}
