'use client';

import { habits } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit } from '@/lib/types';
import { useState } from 'react';

export function HabitTracker() {
  const [trackedHabits, setTrackedHabits] = useState<Habit[]>(habits);

  const handleToggleCompletion = (habitId: string) => {
    setTrackedHabits(prevHabits =>
      prevHabits.map(h =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      )
    );
  };
  
  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-headline">Daily Habits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {trackedHabits.map((habit) => {
          const Icon = habit.icon;
          return (
            <div key={habit.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors">
              <Checkbox 
                id={habit.id} 
                checked={habit.completed}
                onCheckedChange={() => handleToggleCompletion(habit.id)}
              />
              <div className="flex-1">
                <Label htmlFor={habit.id} className="font-medium cursor-pointer">
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
