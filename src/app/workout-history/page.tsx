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
 * @fileoverview Страница истории тренировок.
 * Отображает список прошлых тренировок пользователя.
 */

/**
 * Компонент страницы истории тренировок.
 * @returns {JSX.Element} - Страница истории тренировок.
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
   * Форматирует строку с датой.
   * @param {string} dateString - Строка с датой.
   * @returns {string} - Отформатированная дата.
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Форматирует продолжительность в минутах.
   * @param {number} [minutes] - Продолжительность в минутах.
   * @returns {string} - Отформатированная продолжительность.
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
        <h1 className="text-3xl font-headline font-bold tracking-tight">История тренировок</h1>
        <p className="text-muted-foreground">Просматривайте свои прошлые тренировки и прогресс</p>
      </div>

      {!workoutLogs || workoutLogs.length === 0 ? (
        <Card className="glass">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">Истории тренировок пока нет</p>
            <p className="text-sm mt-2">Начните тренировку, чтобы увидеть свою историю здесь</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {workoutLogs.map((log) => (
            <Card key={log.id} className="glass hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Тренировка</CardTitle>
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
                      <p className="text-xs text-muted-foreground">Длительность</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Dumbbell className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{log.totalVolume || 0} кг</p>
                      <p className="text-xs text-muted-foreground">Общий объем</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium">{log.cycles.length} циклов</p>
                    <p className="text-xs text-muted-foreground">Завершено</p>
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
