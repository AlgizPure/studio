'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { Dumbbell, Target } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase/provider';
import { useUserCollection } from '@/hooks/use-user-collection';
import type { Habit, Day, Program, WorkoutExtended } from '@/lib/types';
import { doc, updateDoc, collection } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from './ui/skeleton';
import { buildDailySchedule } from '@/lib/utils/schedule-builder';

export function TodaySchedule() {
  const [today, setToday] = useState<Date>(new Date());
  const { user } = useUser();
  const firestore = useFirestore();
  
  const { data: habits, isLoading: habitsLoading } = useUserCollection<Habit>('habits');
  const { data: programs, isLoading: programsLoading } = useUserCollection<Program>('programs');
  const { data: workouts, isLoading: workoutsLoading } = useUserCollection<WorkoutExtended>('workouts');
  
  // ExerciseLogs могут понадобиться для проверки выполнения тренировок
  // Пока оставляем для будущего использования


  useEffect(() => {
    setToday(new Date());
  }, []);
  
  const handleHabitToggle = (habit: Habit) => {
    if (!user || !firestore || !habit.id) return;
    // Для legacy привычек используем completed, для V2 - отдельная логика
    const isLegacy = !('type' in habit);
    const currentCompleted = isLegacy ? (habit as any).completed : false;
    const newCompletedStatus = !currentCompleted;
    
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
    const updatedData = isLegacy 
      ? { completed: newCompletedStatus }
      : {}; // Для V2 привычек нужно логировать в отдельную коллекцию
    updateDoc(habitDoc, updatedData).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: habitDoc.path,
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };
  
  const handleStartWorkout = (workoutId: string, programId?: string) => {
    // TODO: Открыть интерфейс выполнения тренировки
    console.log('Start workout', workoutId, programId);
  };

  // Получаем запланированные тренировки на сегодня
  const scheduledWorkouts = useMemo(() => {
    if (!programs || !workouts) return [];
    return buildDailySchedule(programs, workouts, today);
  }, [programs, workouts, today]);

  // Получаем день недели для фильтрации привычек
  const todayDay = useMemo(() => 
    today.toLocaleString('en-US', { weekday: 'long' }) as Day,
    [today]
  );

  // Загружаем детали тренировок для отображения
  const workoutsMap = useMemo(() => {
    const map = new Map<string, WorkoutExtended>();
    workouts?.forEach(w => map.set(w.id, w));
    // Также нужно загрузить тренировки из программ
    // TODO: загрузить тренировки из подколлекций программ
    return map;
  }, [workouts]);

  const dailyHabits = (habits || []).filter(habit => {
    // Для привычек V2 используем schedule
    if ('type' in habit && habit.type) {
      // Это HabitV2, используем schedule
      if (habit.schedule?.intervalType === 'days_of_week') {
        return habit.schedule.days?.includes(todayDay);
      }
      // Другие типы расписания обрабатываем позже
      return true;
    }
    // Legacy привычки
    return habit.days?.includes(todayDay);
  });

  const allItems = useMemo(() => {
    const items = [
      // Привычки
      ...dailyHabits.map(habit => ({
        id: habit.id,
        time: 'Any time',
        activityType: 'Habit' as const,
        activityName: habit.name,
        duration: ('goal' in habit ? habit.goal : '') || '',
        icon: Target,
        raw: habit,
        completed: ('completed' in habit ? !!habit.completed : false),
        onToggle: () => handleHabitToggle(habit),
        hasParameters: false,
      })),
      // Тренировки из расписания
      ...scheduledWorkouts.map(scheduled => {
        const workout = workoutsMap.get(scheduled.workoutId);
        return {
          id: scheduled.workoutId,
          time: scheduled.startTime || 'Any time',
          activityType: 'Workout' as const,
          activityName: workout?.name || 'Workout',
          duration: workout?.estimatedDuration ? `${workout.estimatedDuration} min` : '',
          icon: Dumbbell,
          raw: { workoutId: scheduled.workoutId, programId: scheduled.programId, status: scheduled.status },
          completed: false, // TODO: проверить выполнена ли тренировка сегодня
          onToggle: () => handleStartWorkout(scheduled.workoutId, scheduled.programId),
          hasParameters: false,
          isPaused: scheduled.status === 'paused',
        };
      }),
    ];

    // Сортировка по времени
    return items.sort((a, b) => {
      const aTime = (a.time || '99:99').split(' ')[0];
      const bTime = (b.time || '99:99').split(' ')[0];
      if (aTime < bTime) return -1;
      if (aTime > bTime) return 1;
      return 0;
    });
  }, [dailyHabits, scheduledWorkouts, workoutsMap]);

  const isLoading = habitsLoading || programsLoading || workoutsLoading;


  if (isLoading) {
    return (
        <Card className="glass">
            <CardHeader>
                <CardTitle>Today's Activities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
            </CardContent>
        </Card>
    );
  }
  
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle>Today's Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {allItems.length > 0 ? (
          <div className="space-y-4">
            {allItems.map((item) => {
              const Icon = item.icon as LucideIcon;
              const itemId = `today-${item.id}`;
              return (
                <div 
                  key={item.id} 
                  className={`flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors ${
                    (item as any).isPaused ? 'opacity-50' : ''
                  }`}
                >
                  {item.activityType === 'Workout' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-4"
                      onClick={() => item.onToggle()}
                      disabled={(item as any).isPaused}
                    >
                      Start
                    </Button>
                  ) : (
                    <Checkbox 
                      id={itemId} 
                      className="mr-4" 
                      checked={item.completed}
                      onCheckedChange={() => item.onToggle()}
                    />
                  )}
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={itemId} className="font-semibold cursor-pointer">
                      {item.activityName}
                      {(item as any).isPaused && (
                        <span className="ml-2 text-xs text-muted-foreground">(Paused)</span>
                      )}
                    </Label>
                    <p className="text-sm text-muted-foreground">{item.time} &middot; {item.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Rest day. Well deserved!</p>
        )}
      </CardContent>
    </Card>
  );
}
