
'use client';

import { habits as initialHabits } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';

export function HabitTracker() {
  const [trackedHabits, setTrackedHabits] = useState<Habit[]>(initialHabits);
  const [today, setToday] = useState<Day | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);


  useEffect(() => {
    const date = new Date();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }) as Day;
    setToday(dayOfWeek);
  }, []);

  const handleToggleCompletion = (habitId: string) => {
    setTrackedHabits(prevHabits =>
      prevHabits.map(h =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      )
    );
  };

  const handleAddHabit = (newHabit: Habit) => {
    setTrackedHabits(prev => [...prev, newHabit]);
  };
  
  const todaysHabits = useMemo(() => {
    if (!today) return [];
    return trackedHabits.filter(habit => {
      // Show if days are not specified (all days) or if today is in the days array
      return !habit.days || habit.days.length === 0 || habit.days.includes(today);
    });
  }, [trackedHabits, today]);

  const sortedHabits = useMemo(() => {
    return [...todaysHabits].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
  }, [todaysHabits]);

  return (
      <>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-headline">Daily Habits</CardTitle>
            <AddHabitDialog onHabitAdd={handleAddHabit} openManageCategories={() => setIsManageCategoriesOpen(true)}/>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedHabits.map((habit) => {
              return (
                <div 
                  key={habit.id} 
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-all",
                    habit.completed && "opacity-50"
                  )}
                >
                  <Checkbox 
                    id={habit.id} 
                    checked={habit.completed}
                    onCheckedChange={() => handleToggleCompletion(habit.id)}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={habit.id} 
                      className={cn(
                        "font-medium cursor-pointer",
                        habit.completed && "line-through"
                      )}
                    >
                      {habit.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">{habit.goal}</p>
                  </div>
                  {habit.pomodoro && <PomodoroTimer cycles={habit.pomodoro.cycles} disabled={habit.completed} />}
                </div>
              );
            })}
             {sortedHabits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No habits scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <ManageCategoriesDialog open={isManageCategoriesOpen} onOpenChange={setIsManageCategoriesOpen} />
    </>
  );
}
