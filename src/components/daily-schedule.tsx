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
import type { Exercise, Habit, HabitCategory, ExerciseCategory } from '@/lib/types';
import { Target, Pencil, Dumbbell } from 'lucide-react';
import { AddExerciseDialog } from './add-exercise-dialog';
import { AddHabitDialog } from './add-habit-dialog';
import { Button } from './ui/button';
import { PomodoroIcon } from './pomodoro-icon';

const weeklySchedule: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface DailyScheduleProps {
    exercises: Exercise[];
    habits: Habit[];
    habitCategories: HabitCategory[];
    exerciseCategories: ExerciseCategory[];
    onExerciseAdd: (exercise: Omit<Exercise, 'id' | 'authorId'>) => void;
    onHabitAdd: (habit: Omit<Habit, 'id' | 'authorId'>) => void;
    onExerciseUpdate: (exercise: Exercise) => void;
    onHabitUpdate: (habit: Habit) => void;
    onExerciseDelete: (exerciseId: string) => void;
    onHabitDelete: (habitId: string) => void;
    openManageHabitCategories: () => void;
    openManageExerciseCategories: () => void;
}

export function DailySchedule({ 
    exercises, 
    habits, 
    habitCategories,
    exerciseCategories,
    onExerciseAdd, 
    onHabitAdd,
    onExerciseUpdate,
    onHabitUpdate,
    onExerciseDelete,
    onHabitDelete,
    openManageHabitCategories,
    openManageExerciseCategories,
}: DailyScheduleProps) {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });
  
  return (
    <>
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-headline">Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible defaultValue={today} className="w-full">
            {weeklySchedule.map((day) => {
              const dailyHabits = habits.filter(habit => habit.days?.includes(day));
              const dailyExercises = exercises.filter(ex => ex.days?.includes(day));
              
              const allItems = [
                ...dailyHabits.map(habit => ({
                  id: habit.id,
                  time: habitCategories.find(c => c.id === habit.categoryId)?.name || 'Habit',
                  activityType: 'Habit',
                  activityName: habit.name,
                  duration: habit.goal || '',
                  icon: Target,
                  raw: habit,
                  isPomodoro: !!habit.pomodoro,
                })),
                ...dailyExercises.map(ex => ({
                    id: ex.id,
                    time: ex.time || 'Any time',
                    activityType: 'Workout',
                    activityName: ex.name,
                    duration: exerciseCategories.find(c => c.id === ex.categoryId)?.name || 'Workout',
                    icon: Dumbbell,
                    raw: ex,
                }))
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
                                {(item as any).isPomodoro ? <PomodoroIcon className="mr-2"/> : null}
                                <Badge variant={item.activityType === 'Habit' ? 'secondary' : 'outline'} className="mr-2">{item.duration}</Badge>
                                
                                {item.activityType === 'Habit' ? (
                                    <AddHabitDialog
                                        habitToEdit={item.raw as Habit}
                                        onHabitUpdate={onHabitUpdate}
                                        onHabitDelete={onHabitDelete}
                                        onHabitAdd={onHabitAdd}
                                        trigger={editTrigger}
                                        openManageCategories={openManageHabitCategories}
                                        categories={habitCategories}
                                    />
                                ) : (
                                    <AddExerciseDialog
                                        exerciseToEdit={item.raw as Exercise}
                                        onExerciseUpdate={onExerciseUpdate}
                                        onExerciseDelete={onExerciseDelete}
                                        onExerciseAdd={onExerciseAdd}
                                        trigger={editTrigger}
                                        openManageCategories={openManageExerciseCategories}
                                        categories={exerciseCategories}
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
