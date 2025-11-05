'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Dumbbell, Target } from 'lucide-react';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import type { Habit, Day, Program, WorkoutExtended } from '@/lib/types';
import { doc, updateDoc, collection } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from './ui/skeleton';
import { buildDailySchedule } from '@/lib/utils/schedule-builder';

/**
 * @fileoverview Компонент для отображения запланированных на сегодня занятий (тренировок и привычек).
 */

/**
 * Компонент-карточка, который отображает список всех тренировок и привычек,
 * запланированных на текущий день. Позволяет отмечать привычки и начинать тренировки.
 * @returns {JSX.Element} React-компонент.
 */
export function TodaySchedule() {
  const [today, setToday] = useState<Date>(new Date());
  const { user } = useUser();
  const firestore = useFirestore();
  
  const habitsQuery = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/habits`) : null), [user, firestore]);
  const { data: habits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const programsQuery = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/programs`) : null), [user, firestore]);
  const { data: programs, isLoading: programsLoading } = useCollection<Program>(programsQuery);
  
  const workoutsQuery = useMemoFirebase(() => (user ? collection(firestore, `users/${user.uid}/workouts`) : null), [user, firestore]);
  const { data: workouts, isLoading: workoutsLoading } = useCollection<WorkoutExtended>(workoutsQuery);

  useEffect(() => { setToday(new Date()); }, []);
  
  /**
   * Переключает статус выполнения для привычки (только для legacy-привычек).
   * @param {Habit} habit - Привычка для переключения.
   */
  const handleHabitToggle = (habit: Habit) => {
    if (!user || !firestore || !habit.id || 'type' in habit) return;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
    const updatedData = { completed: !(habit as any).completed };
    updateDoc(habitDoc, updatedData).catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ operation: 'update', path: habitDoc.path, requestResourceData: updatedData })));
  };
  
  /**
   * Обрабатывает начало тренировки (placeholder).
   * @param {string} workoutId - ID тренировки.
   * @param {string} [programId] - ID программы (если есть).
   */
  const handleStartWorkout = (workoutId: string, programId?: string) => {
    console.log('Начать тренировку', workoutId, programId);
  };

  const scheduledWorkouts = useMemo(() => buildDailySchedule(programs || [], workouts || [], today), [programs, workouts, today]);
  const todayDay = useMemo(() => today.toLocaleString('en-US', { weekday: 'long' }) as Day, [today]);
  const workoutsMap = useMemo(() => {
    const map = new Map<string, WorkoutExtended>();
    workouts?.forEach(w => map.set(w.id, w));
    return map;
  }, [workouts]);

  const dailyHabits = (habits || []).filter(habit => {
    if ('type' in habit) {
      return habit.schedule?.days?.includes(todayDay);
    }
    return habit.days?.includes(todayDay);
  });

  const allItems = useMemo(() => {
    const items = [
      ...dailyHabits.map(habit => ({
        id: habit.id, time: 'Любое время', activityType: 'Habit' as const,
        activityName: habit.name, duration: ('goal' in habit ? habit.goal : '') || '',
        icon: Target, raw: habit, completed: ('completed' in habit ? !!habit.completed : false),
        onToggle: () => handleHabitToggle(habit),
      })),
      ...scheduledWorkouts.map(scheduled => {
        const workout = workoutsMap.get(scheduled.workoutId);
        return {
          id: scheduled.workoutId, time: scheduled.startTime || 'Любое время', activityType: 'Workout' as const,
          activityName: workout?.name || 'Тренировка', duration: workout?.estimatedDuration ? `${workout.estimatedDuration} мин` : '',
          icon: Dumbbell, raw: scheduled, completed: false,
          onToggle: () => handleStartWorkout(scheduled.workoutId, scheduled.programId),
          isPaused: scheduled.status === 'paused',
        };
      }),
    ];
    return items.sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'));
  }, [dailyHabits, scheduledWorkouts, workoutsMap]);

  const isLoading = habitsLoading || programsLoading || workoutsLoading;

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader><CardTitle>Занятия на сегодня</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-12 w-full" /> <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="glass">
      <CardHeader><CardTitle>Занятия на сегодня</CardTitle></CardHeader>
      <CardContent>
        {allItems.length > 0 ? (
          <div className="space-y-4">
            {allItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.id} className={`flex items-center p-3 rounded-lg ${item.isPaused ? 'opacity-50' : ''}`}>
                  {item.activityType === 'Workout' ? (
                    <Button variant="outline" size="sm" className="mr-4" onClick={() => item.onToggle()} disabled={item.isPaused}>Начать</Button>
                  ) : (
                    <Checkbox id={`today-${item.id}`} className="mr-4" checked={item.completed} onCheckedChange={() => item.onToggle()} />
                  )}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`today-${item.id}`} className="font-semibold cursor-pointer">{item.activityName}{item.isPaused && ' (На паузе)'}</Label>
                    <p className="text-sm text-muted-foreground">{item.time} &middot; {item.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">День отдыха. Вы это заслужили!</p>
        )}
      </CardContent>
    </Card>
  );
}
