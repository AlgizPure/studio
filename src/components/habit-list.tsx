
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit } from '@/lib/types';
import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';
import { Pencil } from 'lucide-react';
import { Button } from './ui/button';

interface HabitListProps {
    habits: Habit[];
    onHabitAdd: (habit: Habit) => void;
    onHabitUpdate: (habit: Habit) => void;
    onHabitDelete: (habitId: string) => void;
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
    openManageCategories: () => void;
}

export function HabitList({ habits, onHabitAdd, onHabitUpdate, onHabitDelete, setHabits, openManageCategories }: HabitListProps) {
  
  const handleToggleCompletion = (habitId: string) => {
    setHabits(prevHabits =>
      prevHabits.map(h =>
        h.id === habitId ? { ...h, completed: !h.completed } : h
      )
    );
  };
  
  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
  }, [habits]);

  const editTrigger = (habit: Habit) => (
    <AddHabitDialog
        habitToEdit={habit}
        onHabitUpdate={onHabitUpdate}
        onHabitDelete={onHabitDelete}
        onHabitAdd={onHabitAdd}
        trigger={
            <Button variant="ghost" size="icon" className="h-8 w-8">
                <Pencil className="h-4 w-4" />
            </Button>
        }
        openManageCategories={openManageCategories}
    />
  );


  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-headline">Habits</CardTitle>
        <AddHabitDialog onHabitAdd={onHabitAdd} openManageCategories={openManageCategories}/>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[70vh] overflow-y-auto">
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
                id={`list-${habit.id}`} 
                checked={habit.completed}
                onCheckedChange={() => handleToggleCompletion(habit.id)}
              />
              <div className="flex-1">
                <Label 
                  htmlFor={`list-${habit.id}`} 
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
              {editTrigger(habit)}
            </div>
          );
        })}
         {sortedHabits.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <p>No habits found.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
