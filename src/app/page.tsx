'use client'

import { Activity, Dumbbell, HeartPulse, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TodaySchedule } from '@/components/today-schedule';
import { HabitTracker } from '@/components/habit-tracker';
import { AiOptimizerDialog } from '@/components/ai-optimizer-dialog';
import { PlanTomorrowDialog } from '@/components/plan-tomorrow-dialog';
import { useUser, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { startOfWeek, isWithinInterval, isToday } from 'date-fns';
import type { Exercise, Habit } from '@/lib/types';
import { useMemo } from 'react';
import { collection } from 'firebase/firestore';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const exercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: exercises } = useCollection<Exercise>(exercisesQuery);
  
  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: habits } = useCollection<Habit>(habitsQuery);


  const weeklyStats = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(endOfThisWeek.getDate() + 6);

    const scheduledWorkoutsThisWeek = (exercises || []).filter(ex => 
      (ex.days || []).length > 0
    );

    const completedWorkoutsThisWeek = (exercises || []).filter(ex => 
      ex.lastCompleted && isWithinInterval(new Date(ex.lastCompleted), { start: startOfThisWeek, end: endOfThisWeek })
    );

    const totalHabits = (habits || []).length;
    let completedHabits = 0;
    if (habits) {
        completedHabits = habits.filter(h => h.completed).length;
    }
    const habitCompletionPercentage = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;


    return {
      workoutsCompleted: completedWorkoutsThisWeek.length,
      workoutsScheduled: scheduledWorkoutsThisWeek.length,
      habitCompletion: habitCompletionPercentage,
    }
  }, [exercises, habits]);

  if (isUserLoading) {
    return (
       <div className="flex items-center justify-center h-full">
          <div className="text-center">
              <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
              <p className="text-muted-foreground">Preparing your dashboard.</p>
          </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
          <div className="text-center p-8 border rounded-lg glass">
              <h2 className="text-2xl font-headline font-bold mb-2">Welcome to Zenith Trainer</h2>
              <p className="text-muted-foreground mb-6">Your personal AI-powered fitness and habit tracker.</p>
              <div className="flex gap-4 justify-center">
                <Button asChild>
                    <Link href="/login">Login</Link>
                </Button>
                 <Button asChild variant="outline">
                    <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
          </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h1 className="text-3xl font-headline font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Here's your weekly overview. Stay strong!
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <PlanTomorrowDialog />
          <AiOptimizerDialog />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workouts This Week</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.workoutsCompleted}/{weeklyStats.workoutsScheduled}</div>
            <p className="text-xs text-muted-foreground">
              Completed vs. Scheduled
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habits Completed</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyStats.habitCompletion}%</div>
            <p className="text-xs text-muted-foreground">
              This week's average
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running Distance</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0km</div>
            <p className="text-xs text-muted-foreground">
              This week's total
            </p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Streak</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 Days</div>
            <p className="text-xs text-muted-foreground">
              Let's get started!
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-10">
        <div className="lg:col-span-6">
          <TodaySchedule />
        </div>
        <div className="lg:col-span-4">
          <HabitTracker />
        </div>
      </div>
    </div>
  );
}
