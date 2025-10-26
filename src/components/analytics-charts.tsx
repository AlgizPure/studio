'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { Exercise, Habit, Day } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWithinInterval, isToday, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';

export function AnalyticsCharts() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [today, setToday] = useState<Day | null>(null);

  useEffect(() => {
    const date = new Date();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }) as Day;
    setToday(dayOfWeek);
  }, []);

  const exercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: exercises, loading: exercisesLoading } = useCollection<Exercise>(exercisesQuery);

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: habits, loading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const weeklyWorkoutData = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dailyCounts = weekDays.map(day => ({
        day: format(day, 'E'),
        workouts: 0,
    }));
    
    (exercises || []).forEach(ex => {
        if(ex.lastCompleted) {
            const completedDate = parseISO(ex.lastCompleted);
            if (isWithinInterval(completedDate, { start: weekStart, end: weekEnd })) {
                const dayStr = format(completedDate, 'E');
                const dayData = dailyCounts.find(d => d.day === dayStr);
                if (dayData) {
                    dayData.workouts++;
                }
            }
        }
    });

    return dailyCounts;
  }, [exercises]);

  const todaysHabitData = useMemo(() => {
    if (!today || !habits) return [];
    return habits
      .filter(habit => !habit.days || habit.days.length === 0 || habit.days.includes(today))
      .map(habit => ({
        name: habit.name,
        completed: habit.completed ? 1 : 0,
        total: 1, // For a daily habit, the total is always 1
      }));
  }, [habits, today]);
  
  const isLoading = exercisesLoading || habitsLoading;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-headline">Weekly Workout Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="w-full h-[300px]" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyWorkoutData}>
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="font-headline">Today's Habit Completion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : todaysHabitData.length > 0 ? (
            todaysHabitData.map((habit) => (
              <div key={habit.name}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{habit.name}</span>
                  <span className="text-sm text-muted-foreground">{habit.completed}/{habit.total}</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${(habit.completed / habit.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-10">No habits scheduled for today.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
