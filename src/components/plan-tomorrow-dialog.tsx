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
import type { Habit, HabitCategory, Day, Program, WorkoutExtended } from '@/lib/types';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useUserCollection } from '@/hooks/use-user-collection';
import { addDays } from 'date-fns';
import { buildDailySchedule } from '@/lib/utils/schedule-builder';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';


export function PlanTomorrowDialog() {
    const { user } = useUser();
    const firestore = useFirestore();

    // Загружаем программы и тренировки для отображения запланированных тренировок
    const { data: programs } = useUserCollection<Program>('programs');
    const { data: workouts } = useUserCollection<WorkoutExtended>('workouts');
    const { data: habits } = useUserCollection<Habit>('habits');
    const { data: habitCategories } = useUserCollection<HabitCategory>('habitCategories');
    
    const tomorrow = useMemo(() => {
        return addDays(new Date(), 1);
    }, []);

    const tomorrowDay = useMemo(() => 
      tomorrow.toLocaleString('en-US', { weekday: 'long' }) as Day,
      [tomorrow]
    );

    // Получаем запланированные тренировки на завтра
    const scheduledWorkouts = useMemo(() => {
      if (!programs || !workouts) return [];
      return buildDailySchedule(programs, workouts, tomorrow);
    }, [programs, workouts, tomorrow]);

    // Карта тренировок для отображения
    const workoutsMap = useMemo(() => {
      const map = new Map<string, WorkoutExtended>();
      workouts?.forEach(w => map.set(w.id, w));
      return map;
    }, [workouts]);

    const isHabitScheduled = (habit: Habit) => {
      if ('type' in habit && habit.type) {
        // HabitV2
        if (habit.schedule?.intervalType === 'days_of_week') {
          return habit.schedule.days?.includes(tomorrowDay);
        }
        return true;
      }
      // Legacy
      return (habit.days || []).includes(tomorrowDay);
    };

    const { scheduledHabits, unscheduledHabits } = useMemo(() => {
        const scheduled = (habits || []).filter(isHabitScheduled);
        const unscheduled = (habits || []).filter(h => !isHabitScheduled(h));
        return { scheduledHabits: scheduled, unscheduledHabits: unscheduled };
    }, [habits, tomorrowDay]);

    const handleHabitToggle = (habit: Habit) => {
        if (!user || !firestore || !habit.id) return;
        const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
        
        // Для legacy привычек обновляем days
        const isLegacy = !('type' in habit);
        if (isLegacy) {
          const legacyHabit = habit as Habit & { days?: Day[] };
          const currentDays = legacyHabit.days || [];
          const isScheduled = currentDays.includes(tomorrowDay);
          
          const updatedDays = isScheduled 
              ? currentDays.filter((day: Day) => day !== tomorrowDay)
              : [...currentDays, tomorrowDay];

          const updatedData = { days: updatedDays };
          updateDoc(habitDoc, updatedData).catch(async (err) => {
            const permissionError = new FirestorePermissionError({
              operation: 'update',
              path: habitDoc.path,
              requestResourceData: updatedData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });
        }
        // Для V2 привычек нужна отдельная логика через HabitLog
    }


  return (
    <>
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusSquare className="mr-2 h-4 w-4" />
          Plan for Tomorrow
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline">Plan for Tomorrow ({tomorrowDay})</DialogTitle>
          <DialogDescription>
            Review your scheduled workouts and plan your habits for tomorrow.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-lg">Scheduled Workouts</h3>
            <ScrollArea className="h-[45vh] pr-4">
              <div className="space-y-3">
                {scheduledWorkouts.length > 0 ? (
                  scheduledWorkouts.map((scheduled) => {
                    const workout = workoutsMap.get(scheduled.workoutId);
                    return (
                      <div key={scheduled.workoutId} className="flex items-center p-3 rounded-lg border bg-card/50">
                        <div className="flex-1">
                          <Label className="font-medium">{workout?.name || 'Workout'}</Label>
                          <p className="text-xs text-muted-foreground">
                            {scheduled.startTime || 'Any time'} &middot; {workout?.estimatedDuration ? `${workout.estimatedDuration} min` : ''}
                            {scheduled.status === 'paused' && ' (Paused)'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No workouts scheduled for tomorrow.</p>
                )}
              </div>
            </ScrollArea>
          </div>
          <div className="flex flex-col space-y-4">
            <h3 className="font-semibold text-lg">Habits</h3>
            <ScrollArea className="h-[45vh] pr-4">
              <div className="space-y-3">
                 <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
                {scheduledHabits.map((habit) => (
                   <div key={habit.id} className="flex items-center p-3 rounded-lg border bg-card/50">
                    <Checkbox 
                        id={`hb-${habit.id}`} 
                        className="mr-4" 
                        checked={true}
                        onCheckedChange={() => handleHabitToggle(habit)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`hb-${habit.id}`} className="font-medium cursor-pointer">{habit.name}</Label>
                      <p className="text-xs text-muted-foreground">{('goal' in habit ? habit.goal : '') || ''}</p>
                    </div>
                  </div>
                ))}
                {scheduledHabits.length === 0 && <p className="text-xs text-muted-foreground text-center py-2">Nothing scheduled yet.</p>}
                <Separator className="my-4" />
                <p className="text-sm font-medium text-muted-foreground">Unscheduled</p>
                 {unscheduledHabits.map((habit) => (
                   <div key={habit.id} className="flex items-center p-3 rounded-lg border bg-card/50 opacity-70 hover:opacity-100 transition-opacity">
                    <Checkbox 
                        id={`hb-add-${habit.id}`} 
                        className="mr-4" 
                        checked={false}
                        onCheckedChange={() => handleHabitToggle(habit)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`hb-add-${habit.id}`} className="font-medium cursor-pointer">{habit.name}</Label>
                      <p className="text-xs text-muted-foreground">{('goal' in habit ? habit.goal : '') || ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
