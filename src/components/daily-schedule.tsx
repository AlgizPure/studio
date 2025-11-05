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

/**
 * @fileoverview Компонент для отображения недельного расписания тренировок и привычек.
 */

const weeklySchedule: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * @interface DailyScheduleProps
 * @description Свойства для компонента DailySchedule.
 */
interface DailyScheduleProps {
    /** Список программ тренировок. */
    programs?: Program[];
    /** Список расширенных тренировок. */
    workouts?: WorkoutExtended[];
    /** Список привычек. */
    habits: Habit[];
    /** Список категорий привычек. */
    habitCategories: HabitCategory[];
    /** Функция для открытия диалогового окна управления категориями привычек. */
    openManageHabitCategories: () => void;
}

/**
 * Компонент, отображающий недельное расписание в виде аккордеона.
 * Каждый элемент аккордеона представляет день недели и содержит список
 * запланированных тренировок и привычек на этот день.
 * @param {DailyScheduleProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
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
          <CardTitle>Недельное расписание</CardTitle>
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
              
              const allItems = [
                ...dailyHabits.map(habit => ({
                  id: habit.id,
                  time: habitCategories.find(c => c.id === habit.categoryId)?.name || 'Любое время',
                  activityType: 'Habit' as const,
                  activityName: habit.name,
                  duration: ('goal' in habit ? habit.goal : '') || '',
                  icon: Target,
                  raw: habit,
                  isPomodoro: !!('pomodoro' in habit ? habit.pomodoro : false),
                })),
                ...scheduledWorkouts.map(scheduled => {
                  const workout = workoutsMap.get(scheduled.workoutId);
                  return {
                    id: scheduled.workoutId,
                    time: scheduled.startTime || 'Любое время',
                    activityType: 'Workout' as const,
                    activityName: workout?.name || 'Тренировка',
                    duration: workout?.estimatedDuration ? `${workout.estimatedDuration} мин` : '',
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
                    {day === today && <Badge className="ml-2">Сегодня</Badge>}
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
                                {(item as any).isPomodoro ? <PomodoroIcon className="mr-2"/> : null}
                                {(item as any).isPaused && (
                                  <Badge variant="outline" className="mr-2 opacity-50">На паузе</Badge>
                                )}
                                <Badge variant={item.activityType === 'Habit' ? 'secondary' : 'outline'} className="mr-2">{item.duration}</Badge>
                                
                                {item.activityType === 'Habit' && (
                                    <AddHabitDialog
                                        habitToEdit={item.raw as Habit}
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
                      <p className="text-muted-foreground pt-2">Ничего не запланировано. Добавьте занятие!</p>
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
