'use client';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import type { LucideIcon } from 'lucide-react';
import { useMemo } from 'react';
import type { Habit, HabitCategory, Program, WorkoutExtended, Day } from '@/lib/types';
import { Target, Pencil, Dumbbell } from 'lucide-react';
import { buildDailySchedule } from '@/lib/utils/schedule-builder';
import { AddHabitDialog } from './add-habit-dialog';
import { Button } from './ui/button';
import { PomodoroIcon } from './pomodoro-icon';

const weeklySchedule: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Type definitions for schedule items
type HabitItem = {
  id: string;
  time: string;
  activityType: 'Habit';
  activityName: string;
  duration: string;
  icon: typeof Target;
  raw: Habit;
  isPomodoro: boolean;
};

type WorkoutItem = {
  id: string;
  time: string;
  activityType: 'Workout';
  activityName: string;
  duration: string;
  icon: typeof Dumbbell;
  raw: { workoutId: string; programId?: string };
  isPaused: boolean;
};

type ScheduleItem = HabitItem | WorkoutItem;

// Type guard to check if an item is a habit
function isHabitItem(item: ScheduleItem): item is HabitItem {
  return item.activityType === 'Habit';
}

// Type guard to check if an item is a workout
function isWorkoutItem(item: ScheduleItem): item is WorkoutItem {
  return item.activityType === 'Workout';
}

interface DailyScheduleProps {
    programs?: Program[];
    workouts?: WorkoutExtended[];
    habits: Habit[];
    habitCategories: HabitCategory[];
    openManageHabitCategories: () => void;
}

export function DailySchedule({ 
    programs = [],
    workouts = [],
    habits, 
    habitCategories,
    openManageHabitCategories,
}: DailyScheduleProps) {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });
  
  // Создаем карту тренировок для быстрого доступа
  const workoutsMap = useMemo(() => {
    const map = new Map<string, WorkoutExtended>();
    workouts.forEach(w => map.set(w.id, w));
    return map;
  }, [workouts]);
  
  return (
    <>
      <Card className="glass">
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue={today} className="w-full">
            {weeklySchedule.map((day) => {
              // Получаем дату для этого дня недели
              const todayDate = new Date();
              const currentDay = todayDate.getDay();
              const dayIndex = weeklySchedule.indexOf(day);
              const diff = dayIndex - (currentDay === 0 ? 7 : currentDay) + 1;
              const dayDate = new Date(todayDate);
              dayDate.setDate(todayDate.getDate() + diff);
              
              // Получаем запланированные тренировки на этот день
              const scheduledWorkouts = buildDailySchedule(programs, workouts, dayDate);
              
              // Фильтруем привычки для этого дня
              const dailyHabits = habits.filter(habit => {
                if ('type' in habit && habit.type) {
                  // HabitV2
                  if (habit.schedule?.intervalType === 'days_of_week') {
                    return habit.schedule.days?.includes(day);
                  }
                  return true;
                }
                // Legacy
                return habit.days?.includes(day);
              });
              
              const allItems: ScheduleItem[] = [
                ...dailyHabits.map((habit): HabitItem => ({
                  id: habit.id,
                  time: habitCategories.find(c => c.id === habit.categoryId)?.name || 'Any time',
                  activityType: 'Habit' as const,
                  activityName: habit.name,
                  duration: ('goal' in habit ? habit.goal : '') || '',
                  icon: Target,
                  raw: habit,
                  isPomodoro: !!('pomodoro' in habit ? habit.pomodoro : false),
                })),
                ...scheduledWorkouts.map((scheduled): WorkoutItem => {
                  const workout = workoutsMap.get(scheduled.workoutId);
                  return {
                    id: scheduled.workoutId,
                    time: scheduled.startTime || 'Any time',
                    activityType: 'Workout' as const,
                    activityName: workout?.name || 'Workout',
                    duration: workout?.estimatedDuration ? `${workout.estimatedDuration} min` : '',
                    icon: Dumbbell,
                    raw: { workoutId: scheduled.workoutId, programId: scheduled.programId },
                    isPaused: scheduled.status === 'paused',
                  };
                })
              ].sort((a, b) => {
                const aTime = (a.time || '99:99').split(' ')[0];
                const bTime = (b.time || '99:99').split(' ')[0];
                if (aTime < bTime) return -1;
                if (aTime > bTime) return 1;
                return 0;
              });

              return (
                <AccordionItem value={day} key={day}>
                  <AccordionTrigger className="font-semibold">
                    {day}
                    {day === today && <Badge className="ml-2">Today</Badge>}
                  </AccordionTrigger>
                  <AccordionContent>
                    {allItems.length > 0 ? (
                      <div className="space-y-4 pt-2">
                        {allItems.map((item) => {
                            const Icon = item.icon as LucideIcon;

                            const editTrigger = (
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Pencil className="h-4 w-4" />
                              </Button>
                            );

                            return (
                              <div key={item.id} className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-4">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-semibold">{item.activityName}</p>
                                    <p className="text-sm text-muted-foreground">{item.time}</p>
                                </div>
                                {isHabitItem(item) && item.isPomodoro ? <PomodoroIcon className="mr-2"/> : null}
                                {isWorkoutItem(item) && item.isPaused && (
                                  <Badge variant="outline" className="mr-2 opacity-50">Paused</Badge>
                                )}
                                <Badge variant={item.activityType === 'Habit' ? 'secondary' : 'outline'} className="mr-2">{item.duration}</Badge>

                                {isHabitItem(item) && (
                                    <AddHabitDialog
                                        habitToEdit={item.raw}
                                        onHabitUpdate={() => {}}
                                        onHabitDelete={() => {}}
                                        onHabitAdd={() => {}}
                                        trigger={editTrigger}
                                        openManageCategories={openManageHabitCategories}
                                        categories={habitCategories}
                                    />
                                )}
                              </div>
                            )
                        })}
                      </div>
                    ) : (
                      <p className="text-muted-foreground pt-2">Nothing scheduled. Add an activity!</p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </>
  );
}
