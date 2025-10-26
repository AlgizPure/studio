'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Dumbbell, Target } from 'lucide-react';
import { useCollection, useUser } from '@/firebase';
import type { Exercise, Habit, Day } from '@/lib/types';

export function TodaySchedule() {
  const [today, setToday] = useState('');
  const { user } = useUser();
  const { data: exercises } = useCollection<Exercise>(user ? `users/${user.uid}/exercises` : null);
  const { data: habits } = useCollection<Habit>(user ? `users/${user.uid}/habits` : null);

  useEffect(() => {
    setToday(new Date().toLocaleString('en-US', { weekday: 'long' }));
  }, []);
  
  const dailyHabits = (habits || []).filter(habit => habit.days?.includes(today as Day));
  const dailyExercises = (exercises || []).filter(ex => ex.days?.includes(today as Day));

  const allItems = [
    ...dailyHabits.map(habit => ({
      id: habit.id,
      time: 'Any time',
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
        duration: 'Exercise',
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


  if (!today) {
    return (
        <Card className="glass">
            <CardHeader>
                <CardTitle className="font-headline">Today's Activities</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground">Loading schedule...</p>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="font-headline">Today's Activities</CardTitle>
      </CardHeader>
      <CardContent>
        {allItems.length > 0 ? (
          <div className="space-y-4">
            {allItems.map((item) => {
              const Icon = item.icon as LucideIcon;
              const itemId = `today-${item.id}`;
              return (
                <div key={item.id} className="flex items-center p-3 rounded-lg hover:bg-accent/50 transition-colors">
                  <Checkbox id={itemId} className="mr-4" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 mr-4">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={itemId} className="font-semibold cursor-pointer">{item.activityName}</Label>
                    <p className="text-sm text-muted-foreground">{item.time} &middot; {item.duration}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground">Rest day. Well deserved!</p>
        )}
      </CardContent>
    </Card>
  );
}
