'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import type { Exercise, Habit, Day, ExerciseLog } from '@/lib/types';
import { useMemo, useState, useEffect } from 'react';
import { collection } from 'firebase/firestore';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWithinInterval, parseISO } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export function AnalyticsCharts() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [today, setToday] = useState<Day | null>(null);
  
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [selectedParameterId, setSelectedParameterId] = useState<string | null>(null);

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
  
  const exerciseLogsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exerciseLogs`) : null),
    [user, firestore]
  );
  const { data: exerciseLogs, loading: logsLoading } = useCollection<ExerciseLog>(exerciseLogsQuery);
  
  // Set default selected exercise if not set
  useEffect(() => {
    if (!selectedExerciseId && exercises && exercises.length > 0) {
      const firstExerciseWithParams = exercises.find(ex => ex.parameters && ex.parameters.length > 0);
      if (firstExerciseWithParams) {
        setSelectedExerciseId(firstExerciseWithParams.id);
      }
    }
  }, [exercises, selectedExerciseId]);
  
  // Set default parameter if exercise changes or on initial load
  useEffect(() => {
    if (selectedExerciseId) {
      const exercise = exercises?.find(ex => ex.id === selectedExerciseId);
      if (exercise?.parameters && exercise.parameters.length > 0) {
        setSelectedParameterId(exercise.parameters[0].id);
      } else {
        setSelectedParameterId(null);
      }
    }
  }, [selectedExerciseId, exercises]);


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
            try {
              const completedDate = parseISO(ex.lastCompleted);
              if (isWithinInterval(completedDate, { start: weekStart, end: weekEnd })) {
                  const dayStr = format(completedDate, 'E');
                  const dayData = dailyCounts.find(d => d.day === dayStr);
                  if (dayData) {
                      dayData.workouts++;
                  }
              }
            } catch(e) {
                console.error("Invalid date format for lastCompleted:", ex.lastCompleted);
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
        total: 1,
      }));
  }, [habits, today]);

  const exerciseProgressData = useMemo(() => {
    if (!selectedExerciseId || !selectedParameterId || !exerciseLogs) return [];
    
    return exerciseLogs
      .filter(log => log.exerciseId === selectedExerciseId && log.values[selectedParameterId] !== undefined)
      .map(log => ({
        date: format(parseISO(log.date), 'MMM d'),
        value: log.values[selectedParameterId],
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [selectedExerciseId, selectedParameterId, exerciseLogs]);
  
  const selectedExercise = exercises?.find(ex => ex.id === selectedExerciseId);
  const selectedParameter = selectedExercise?.parameters?.find(p => p.id === selectedParameterId);

  const isLoading = exercisesLoading || habitsLoading || logsLoading;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Weekly Workout Frequency</CardTitle>
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
            <CardTitle>Today's Habit Completion</CardTitle>
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

       <Card className="glass">
        <CardHeader>
          <CardTitle>Exercise Progress</CardTitle>
          <div className="flex gap-4 pt-4">
              <Select value={selectedExerciseId || ''} onValueChange={setSelectedExerciseId}>
                  <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select Exercise" />
                  </SelectTrigger>
                  <SelectContent>
                      {(exercises || []).filter(ex => ex.parameters && ex.parameters.length > 0).map(ex => (
                          <SelectItem key={ex.id} value={ex.id}>{ex.name}</SelectItem>
                      ))}
                  </SelectContent>
              </Select>

              {selectedExercise && (
                  <Select value={selectedParameterId || ''} onValueChange={setSelectedParameterId}>
                      <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Select Parameter" />
                      </SelectTrigger>
                      <SelectContent>
                          {selectedExercise.parameters?.map(p => (
                              <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                      </SelectContent>
                  </Select>
              )}
          </div>
        </CardHeader>
        <CardContent>
            {isLoading ? <Skeleton className="w-full h-[300px]" /> : (
                exerciseProgressData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={exerciseProgressData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                            <YAxis 
                                label={{ value: selectedParameter?.unit, angle: -90, position: 'insideLeft', style:{fill: 'hsl(var(--muted-foreground))'} }}
                                stroke="hsl(var(--muted-foreground))" fontSize={12} 
                            />
                            <Tooltip
                                contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                                }}
                            />
                            <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" name={selectedParameter?.name} />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[300px] flex items-center justify-center">
                        <p className="text-muted-foreground text-center">
                            No logs found for this exercise and parameter.
                            <br/>
                            Complete the exercise to start tracking your progress.
                        </p>
                    </div>
                )
            )}
        </CardContent>
      </Card>
    </div>
  );
}
