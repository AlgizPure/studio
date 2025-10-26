
'use client';
import { weeklySchedule } from '@/lib/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from './ui/badge';
import type { LucideIcon } from 'lucide-react';
import type { Exercise, Habit } from '@/lib/types';
import { Target } from 'lucide-react';
import { AddExerciseDialog } from './add-exercise-dialog';

interface DailyScheduleProps {
    exercises: Exercise[];
    habits: Habit[];
    onExerciseAdd: (exercise: Exercise) => void;
}

export function DailySchedule({ exercises, habits, onExerciseAdd }: DailyScheduleProps) {
  const today = new Date().toLocaleString('en-US', { weekday: 'long' });

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">Exercises</CardTitle>
        <AddExerciseDialog onExerciseAdd={onExerciseAdd} />
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue={today} className="w-full">
          {weeklySchedule.map(({ day, items }) => {
            const dailyHabits = habits.filter(habit => habit.days?.includes(day) || !habit.days || habit.days.length === 0);
            const dailyExercises = exercises.filter(ex => ex.days?.includes(day));
            
            const allItems = [
              ...items,
              ...dailyHabits.map(habit => ({
                id: habit.id,
                time: 'Habit',
                activityType: 'Habit',
                activityName: habit.name,
                duration: habit.goal || '',
                icon: Target
              })),
              ...dailyExercises.map(ex => ({
                  id: ex.id,
                  time: ex.time || 'Any time',
                  activityType: 'Workout',
                  activityName: ex.name,
                  duration: ex.category,
                  icon: Dumbbell
              }))
            ].sort((a, b) => {
              if (a.time === 'Habit') return 1;
              if (b.time === 'Habit') return -1;
              if (a.time < b.time) return -1;
              if (a.time > b.time) return 1;
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
                          return (
                            <div key={item.id} className="flex items-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-4">
                                  <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                  <p className="font-semibold">{item.activityName}</p>
                                  <p className="text-sm text-muted-foreground">{item.time}</p>
                              </div>
                              <Badge variant={item.activityType === 'Habit' ? 'secondary' : 'outline'}>{item.duration}</Badge>
                            </div>
                          )
                      })}
                    </div>
                  ) : (
                    <p className="text-muted-foreground pt-2">Rest day. Well deserved!</p>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

// Dummy Dumbbell icon for exercises from dialog
const Dumbbell = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.4 14.4 9.6 9.6" />
    <path d="M18.657 21.485a2 2 0 1 1-2.829-2.828l-1.767 1.768a2 2 0 1 1-2.829-2.829l6.364-6.364a2 2 0 1 1 2.829 2.829l-1.768 1.767a2 2 0 1 1 2.828 2.829z" />
    <path d="m21.5 21.5-1.4-1.4" />
    <path d="M5.343 2.515a2 2 0 1 1 2.829 2.828l1.767-1.768a2 2 0 1 1 2.829 2.829L6.366 12.78A2 2 0 1 1 3.537 9.95l1.768-1.767a2 2 0 1 1-2.828-2.829z" />
    <path d="m2.5 2.5 1.4 1.4" />
  </svg>
);
