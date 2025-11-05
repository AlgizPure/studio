'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { PlusSquare } from 'lucide-react';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { useMemo } from 'react';
import type { Habit, Day, Program, WorkoutExtended } from '@/lib/types';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { addDays } from 'date-fns';
import { buildDailySchedule } from '@/lib/utils/schedule-builder';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileoverview Диалоговое окно для планирования занятий на следующий день.
 */

/**
 * Компонент-диалог, который позволяет пользователям просмотреть свои запланированные
 * тренировки на завтра и добавить/убрать привычки из расписания на этот день.
 * @returns {JSX.Element} React-компонент.
 */
export function PlanTomorrowDialog() {
    const { user } = useUser();
    const firestore = useFirestore();

    const programsQuery = useMemoFirebase(
      () => (user ? collection(firestore, `users/${user.uid}/programs`) : null),
      [user, firestore]
    );
    const { data: programs } = useCollection<Program>(programsQuery);

    const workoutsQuery = useMemoFirebase(
      () => (user ? collection(firestore, `users/${user.uid}/workouts`) : null),
      [user, firestore]
    );
    const { data: workouts } = useCollection<WorkoutExtended>(workoutsQuery);
    
    const habitsQuery = useMemoFirebase(
      () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
      [user, firestore]
    );
    const { data: habits } = useCollection<Habit>(habitsQuery);
    
    const tomorrow = useMemo(() => addDays(new Date(), 1), []);
    const tomorrowDay = useMemo(() => tomorrow.toLocaleString('en-US', { weekday: 'long' }) as Day, [tomorrow]);

    const scheduledWorkouts = useMemo(() => {
      if (!programs || !workouts) return [];
      return buildDailySchedule(programs, workouts, tomorrow);
    }, [programs, workouts, tomorrow]);

    const workoutsMap = useMemo(() => {
      const map = new Map<string, WorkoutExtended>();
      workouts?.forEach(w => map.set(w.id, w));
      return map;
    }, [workouts]);

    const isHabitScheduled = (habit: Habit) => {
      if ('type' in habit) { // V2
        return habit.schedule?.days?.includes(tomorrowDay);
      }
      return (habit.days || []).includes(tomorrowDay); // Legacy
    };

    const { scheduledHabits, unscheduledHabits } = useMemo(() => {
        const scheduled = (habits || []).filter(isHabitScheduled);
        const unscheduled = (habits || []).filter(h => !isHabitScheduled(h));
        return { scheduledHabits: scheduled, unscheduledHabits: unscheduled };
    }, [habits, tomorrowDay]);

    /**
     * Обрабатывает переключение привычки (добавление/удаление из расписания на завтра).
     * @param {Habit} habit - Привычка для переключения.
     */
    const handleHabitToggle = (habit: Habit) => {
        if (!user || !firestore || !habit.id || 'type' in habit) return; // Пока только для Legacy
        const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
        const currentDays = (habit as any).days || [];
        const isScheduled = currentDays.includes(tomorrowDay);
        const updatedDays = isScheduled ? currentDays.filter((d: Day) => d !== tomorrowDay) : [...currentDays, tomorrowDay];
        updateDoc(habitDoc, { days: updatedDays }).catch(async (err) => {
          const permissionError = new FirestorePermissionError({
            operation: 'update',
            path: habitDoc.path,
            requestResourceData: { days: updatedDays },
          });
          errorEmitter.emit('permission-error', permissionError);
        });
    }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusSquare className="mr-2 h-4 w-4" />
          План на завтра
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">План на завтра ({tomorrowDay})</DialogTitle>
          <DialogDescription>
            Просмотрите свои запланированные тренировки и спланируйте привычки на завтра.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div>
            <h3 className="font-semibold text-lg">Запланированные тренировки</h3>
            <ScrollArea className="h-[45vh] pr-4">
              {/* ... рендеринг тренировок ... */}
            </ScrollArea>
          </div>
          <div>
            <h3 className="font-semibold text-lg">Привычки</h3>
            <ScrollArea className="h-[45vh] pr-4">
                <p className="text-sm font-medium text-muted-foreground">Запланированные</p>
                {/* ... рендеринг запланированных привычек ... */}
                <Separator className="my-4" />
                <p className="text-sm font-medium text-muted-foreground">Незапланированные</p>
                {/* ... рендеринг незапланированных привычек ... */}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
