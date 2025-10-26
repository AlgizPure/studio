
'use client';

import { habits } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit } from '@/lib/types';
import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';

export function HabitTracker() {
  const [trackedHabits, setTrackedHabits] = useState<Habit[]>(habits);

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
  
  const sortedHabits = useMemo(() => {
    return [...trackedHabits].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
  }, [trackedHabits]);

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">Daily Habits</CardTitle>
        <AddHabitDialog onHabitAdd={handleAddHabit} />
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedHabits.map((habit) => {
          const Icon = habit.icon;
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
              {habit.pomodoro && <PomodoroTimer cycles={habit.pomodoro.cycles} />}
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
