// src/components/analytics/stats-cards.tsx
'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dumbbell, Clock, TrendingUp, Calendar } from 'lucide-react';
import type { WorkoutLog } from '@/lib/types';
import type { TimeRange } from '@/lib/analytics-utils';
import { calculateStats, formatVolume, formatDuration } from '@/lib/analytics-utils';

/**
 * @fileoverview Компонент, отображающий карточки с основной статистикой по тренировкам.
 */

/**
 * Свойства для компонента StatsCards.
 * @interface StatsCardsProps
 * @property {WorkoutLog[]} workouts - Массив логов тренировок.
 * @property {TimeRange} timeRange - Временной диапазон для анализа.
 */
interface StatsCardsProps {
  workouts: WorkoutLog[];
  timeRange: TimeRange;
}

/**
 * Компонент карточек со статистикой.
 * @param {StatsCardsProps} props - Свойства компонента.
 * @returns {JSX.Element} - Карточки со статистикой.
 */
export function StatsCards({ workouts, timeRange }: StatsCardsProps) {
  const stats = useMemo(() => {
    return calculateStats(workouts, timeRange);
  }, [workouts, timeRange]);

  const cards = [
    {
      title: 'Всего тренировок',
      value: stats.totalWorkouts,
      icon: Calendar,
      description: 'Завершенные сессии',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Общий объем',
      value: formatVolume(stats.totalVolume),
      icon: Dumbbell,
      description: 'Вес × повторения',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      title: 'Сред. длительность',
      value: formatDuration(stats.avgDuration),
      icon: Clock,
      description: 'За тренировку',
      color: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Постоянство',
      value: `${stats.consistency}%`,
      icon: TrendingUp,
      description: 'Частота тренировок',
      color: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground">
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
