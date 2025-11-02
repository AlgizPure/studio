'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Dumbbell } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, orderBy, query } from 'firebase/firestore';
import type { WorkoutLog } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Страница истории тренировок, которая отображает список прошлых тренировок пользователя.
 * @returns {JSX.Element} Компонент страницы истории тренировок.
 */
export default function WorkoutHistoryPage() {
  const { user } = useUser();
  const firestore = useFirestore();

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
   * Форматирует строку даты в локализованный формат.
   * @param {string} dateString - Строка даты для форматирования.
   * @returns {string} Отформатированная строка даты.
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Форматирует продолжительность в минутах в удобочитаемый формат.
   * @param {number | undefined} minutes - Продолжительность в минутах.
   * @returns {string} Отформатированная продолжительность.
   */
  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-headline font-bold tracking-tight">Workout History</h1>
        <p className="text-muted-foreground">View your past workouts and progress</p>
      </div>

      {!workoutLogs || workoutLogs.length === 0 ? (
        <Card className="glass">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No workout history yet</p>
            <p className="text-sm mt-2">Start a workout to see your history here</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workoutLogs.map((log) => (
            <Card key={log.id} className="glass hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Workout</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(log.date)}</span>
                    </div>
                  </div>
                  <Badge>{log.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{formatDuration(log.duration)}</p>
                      <p className="text-xs text-muted-foreground">Duration</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{log.totalVolume || 0} kg</p>
                      <p className="text-xs text-muted-foreground">Total Volume</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{log.cycles.length} cycles</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
