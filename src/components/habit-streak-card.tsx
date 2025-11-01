'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Habit, HabitStreak, HabitLog } from '@/lib/types';
import { Flame, Trophy, Snowflake, Ticket, TrendingUp, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FreezeStreakDialog } from './freeze-streak-dialog';
import { computeCompletionRate, computeConsistencyScore, calculateHabitStrengthScore } from '@/lib/habits';

interface HabitStreakCardProps {
  habit: Habit;
  streak: HabitStreak;
  logs: HabitLog[];
  onFreeze: (untilDate: string) => Promise<void>;
  onUseSkipToken: () => Promise<void>;
}

export function HabitStreakCard({
  habit,
  streak,
  logs,
  onFreeze,
  onUseSkipToken,
}: HabitStreakCardProps) {
  const [freezeDialogOpen, setFreezeDialogOpen] = useState(false);

  // Calculate stats
  const now = new Date();
  const from90 = new Date(now);
  from90.setDate(from90.getDate() - 90);
  
  const completionRate = computeCompletionRate(logs, from90, now);
  const consistencyScore = computeConsistencyScore(logs, from90, now);
  const hss = calculateHabitStrengthScore({
    currentStreak: streak.current,
    longestStreak: streak.longest,
    completionRate90d: completionRate,
    consistencyScore,
  });

  const last90Days = logs.filter(l => {
    const d = new Date(l.date);
    return d >= from90 && d <= now;
  });
  const completedIn90 = last90Days.filter(l => l.status === 'done').length;

  const isFrozen = !!(streak.frozenUntil && new Date(streak.frozenUntil) > now);
  const skipTokens = streak.skipTokens ?? 0;
  const maxSkipTokens = streak.maxSkipTokens ?? 2;

  return (
    <Card className="border-2">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{habit.name}</CardTitle>
          {isFrozen && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Snowflake className="h-3 w-3 mr-1" />
              Frozen
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-orange-50 border border-orange-200">
            <Flame className="h-5 w-5 mx-auto mb-1 text-orange-600" />
            <div className="text-2xl font-bold text-orange-900">{streak.current}</div>
            <div className="text-[10px] text-orange-700 font-medium">Current</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-amber-50 border border-amber-200">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-amber-600" />
            <div className="text-2xl font-bold text-amber-900">{streak.longest}</div>
            <div className="text-[10px] text-amber-700 font-medium">Best</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-emerald-50 border border-emerald-200">
            <TrendingUp className="h-5 w-5 mx-auto mb-1 text-emerald-600" />
            <div className="text-2xl font-bold text-emerald-900">{hss}</div>
            <div className="text-[10px] text-emerald-700 font-medium">HSS</div>
          </div>
        </div>

        {/* Habit Strength Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Habit Strength</span>
            <span className="text-sm font-bold">{hss}%</span>
          </div>
          <Progress value={hss} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            Based on streak, completion rate, and consistency
          </p>
        </div>

        {/* 90-day stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1 text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Last 90 days
            </span>
            <span className="font-medium">
              {completedIn90}/{last90Days.length} ({Math.round(completionRate)}%)
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Consistency</span>
            <span className="font-medium">{Math.round(consistencyScore)}%</span>
          </div>
        </div>

        {/* Skip tokens */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium flex items-center gap-1">
              <Ticket className="h-4 w-4" />
              Skip Tokens
            </span>
            <span className="text-sm font-bold">
              {skipTokens}/{maxSkipTokens}
            </span>
          </div>
          <Progress value={(skipTokens / maxSkipTokens) * 100} className="h-1.5 mb-2" />
          <p className="text-xs text-muted-foreground">
            Use tokens to skip without breaking your streak
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-2"
            disabled={skipTokens === 0}
            onClick={onUseSkipToken}
          >
            Use Skip Token ({skipTokens} left)
          </Button>
        </div>

        {/* Freeze streak */}
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => setFreezeDialogOpen(true)}
          disabled={isFrozen}
        >
          <Snowflake className="h-4 w-4 mr-2" />
          {isFrozen ? `Frozen until ${new Date(streak.frozenUntil!).toLocaleDateString()}` : 'Freeze Streak'}
        </Button>

        {isFrozen && (
          <p className="text-xs text-center text-muted-foreground">
            Streak is frozen until {new Date(streak.frozenUntil!).toLocaleDateString()}
          </p>
        )}
      </CardContent>

      <FreezeStreakDialog
        open={freezeDialogOpen}
        onOpenChange={setFreezeDialogOpen}
        habitName={habit.name}
        currentStreak={streak.current}
        onConfirm={onFreeze}
      />
    </Card>
  );
}

