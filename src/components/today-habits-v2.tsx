'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import type { Habit, HabitLog, HabitStreak } from '@/lib/types';
import { isHabitDueToday, isHabitDueNow } from '@/lib/habits';
import { cn } from '@/lib/utils';
import { Sunrise, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { SwipeableHabitCard } from './swipeable-habit-card';

interface TodayHabitsV2Props {
  habits: Habit[];
  habitLogs: HabitLog[];
  streaksMap: Map<string, HabitStreak>;
  todaysProgress: Map<string, { value?: number; durationMin?: number }>;
  onComplete: (habit: Habit) => void;
  onSkip: (habit: Habit) => void;
  onOpenLog: (habit: Habit) => void;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

interface TimeSection {
  id: TimeOfDay;
  title: string;
  icon: React.ReactNode;
  timeRange: { start: string; end: string };
  color: string;
}

const timeSections: TimeSection[] = [
  {
    id: 'morning',
    title: 'Morning',
    icon: <Sunrise className="h-4 w-4" />,
    timeRange: { start: '04:00', end: '12:00' },
    color: 'border-amber-200 bg-amber-50/50',
  },
  {
    id: 'afternoon',
    title: 'Afternoon',
    icon: <Sun className="h-4 w-4" />,
    timeRange: { start: '12:00', end: '18:00' },
    color: 'border-orange-200 bg-orange-50/50',
  },
  {
    id: 'evening',
    title: 'Evening',
    icon: <Moon className="h-4 w-4" />,
    timeRange: { start: '18:00', end: '23:59' },
    color: 'border-indigo-200 bg-indigo-50/50',
  },
];

function getTimeOfDay(habit: Habit): TimeOfDay {
  const schedule = 'schedule' in habit ? habit.schedule : undefined;
  const timeWindow = schedule?.timeWindow;
  
  if (!timeWindow) return 'anytime';

  const startHour = parseInt(timeWindow.start.split(':')[0]);
  
  if (startHour >= 4 && startHour < 12) return 'morning';
  if (startHour >= 12 && startHour < 18) return 'afternoon';
  if (startHour >= 18 || startHour < 4) return 'evening';
  
  return 'anytime';
}

function TimeSectionCard({
  section,
  habits,
  habitLogs,
  streaksMap,
  todaysProgress,
  onComplete,
  onSkip,
  onOpenLog,
}: {
  section: TimeSection;
  habits: Habit[];
  habitLogs: HabitLog[];
  streaksMap: Map<string, HabitStreak>;
  todaysProgress: Map<string, { value?: number; durationMin?: number }>;
  onComplete: (habit: Habit) => void;
  onSkip: (habit: Habit) => void;
  onOpenLog: (habit: Habit) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  const completed = habits.filter(h => {
    const log = habitLogs.find(l => l.habitId === h.id && l.status === 'done');
    return !!log;
  }).length;

  const total = habits.length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (habits.length === 0) return null;

  return (
    <Card className={cn('border-2', section.color)}>
      <CardHeader 
        className="pb-3 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {section.icon}
            <CardTitle className="text-lg">{section.title}</CardTitle>
            <span className="text-xs text-muted-foreground">
              ({completed}/{total})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium">{completionRate}%</span>
            {collapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </div>
        </div>
        <Progress value={completionRate} className="h-1.5 mt-2" />
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-2 pt-0">
          {habits.map((habit) => (
            <SwipeableHabitCard
              key={habit.id}
              habit={habit}
              streak={streaksMap.get(habit.id)}
              progress={todaysProgress.get(habit.id)}
              isCompleted={!!habitLogs.find(l => l.habitId === habit.id && l.status === 'done')}
              onComplete={() => onComplete(habit)}
              onSkip={() => onSkip(habit)}
              onOpenLog={() => onOpenLog(habit)}
            />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

export function TodayHabitsV2({
  habits,
  habitLogs,
  streaksMap,
  todaysProgress,
  onComplete,
  onSkip,
  onOpenLog,
}: TodayHabitsV2Props) {
  const todaysHabits = useMemo(() => {
    return habits.filter(h => isHabitDueToday(h));
  }, [habits]);

  const groupedHabits = useMemo(() => {
    const groups: Record<TimeOfDay, Habit[]> = {
      morning: [],
      afternoon: [],
      evening: [],
      anytime: [],
    };

    for (const habit of todaysHabits) {
      const timeOfDay = getTimeOfDay(habit);
      groups[timeOfDay].push(habit);
    }

    return groups;
  }, [todaysHabits]);

  const overallStats = useMemo(() => {
    const total = todaysHabits.length;
    const completed = todaysHabits.filter(h => {
      return habitLogs.some(l => l.habitId === h.id && l.status === 'done');
    }).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, completionRate };
  }, [todaysHabits, habitLogs]);

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <Card className="glass border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Today's Progress</CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold">{overallStats.completionRate}%</div>
              <div className="text-xs text-muted-foreground">
                {overallStats.completed} / {overallStats.total} habits
              </div>
            </div>
          </div>
          <Progress value={overallStats.completionRate} className="h-2 mt-2" />
        </CardHeader>
      </Card>

      {/* Time-based sections */}
      {timeSections.map((section) => (
        <TimeSectionCard
          key={section.id}
          section={section}
          habits={groupedHabits[section.id]}
          habitLogs={habitLogs}
          streaksMap={streaksMap}
          todaysProgress={todaysProgress}
          onComplete={onComplete}
          onSkip={onSkip}
          onOpenLog={onOpenLog}
        />
      ))}

      {/* Anytime habits */}
      {groupedHabits.anytime.length > 0 && (
        <Card className="border-2 border-slate-200 bg-slate-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Anytime</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {groupedHabits.anytime.map((habit) => (
              <SwipeableHabitCard
                key={habit.id}
                habit={habit}
                streak={streaksMap.get(habit.id)}
                progress={todaysProgress.get(habit.id)}
                isCompleted={!!habitLogs.find(l => l.habitId === habit.id && l.status === 'done')}
                onComplete={() => onComplete(habit)}
                onSkip={() => onSkip(habit)}
                onOpenLog={() => onOpenLog(habit)}
              />
            ))}
          </CardContent>
        </Card>
      )}

      {todaysHabits.length === 0 && (
        <Card className="glass">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">No habits scheduled for today</p>
            <p className="text-xs text-muted-foreground mt-1">Enjoy your day off! 🎉</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

