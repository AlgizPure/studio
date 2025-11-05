'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { Habit, HabitLog, HabitStreak } from '@/lib/types';
import { isHabitDueToday } from '@/lib/habits';
import { cn } from '@/lib/utils';
import { Sunrise, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { SwipeableHabitCard } from './swipeable-habit-card';

/**
 * @fileoverview Компонент V2 для отображения списка привычек на сегодня, сгруппированных по времени суток.
 */

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
  color: string;
}

const timeSections: TimeSection[] = [
  { id: 'morning', title: 'Утро', icon: <Sunrise className="h-4 w-4" />, color: 'border-amber-200 bg-amber-50/50' },
  { id: 'afternoon', title: 'День', icon: <Sun className="h-4 w-4" />, color: 'border-orange-200 bg-orange-50/50' },
  { id: 'evening', title: 'Вечер', icon: <Moon className="h-4 w-4" />, color: 'border-indigo-200 bg-indigo-50/50' },
];

/**
 * Определяет время суток для привычки на основе ее расписания.
 * @param {Habit} habit - Привычка.
 * @returns {TimeOfDay} - Время суток ('morning', 'afternoon', 'evening', 'anytime').
 */
function getTimeOfDay(habit: Habit): TimeOfDay {
  const schedule = 'schedule' in habit ? habit.schedule : undefined;
  if (!schedule?.timeWindow) return 'anytime';
  const startHour = parseInt(schedule.timeWindow.start.split(':')[0]);
  if (startHour >= 4 && startHour < 12) return 'morning';
  if (startHour >= 12 && startHour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Компонент карточки для секции времени суток (утро, день, вечер).
 * @param {object} props - Свойства компонента.
 * @returns {JSX.Element | null} - React-компонент или null, если нет привычек.
 */
function TimeSectionCard({ section, habits, habitLogs, ...rest }: any) {
  const [collapsed, setCollapsed] = useState(false);
  const total = habits.length;
  const completed = habits.filter((h: Habit) => habitLogs.some((l: HabitLog) => l.habitId === h.id && l.status === 'done')).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  if (total === 0) return null;

  return (
    <Card className={cn('border-2', section.color)}>
      <CardHeader className="pb-3 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {section.icon}
            <CardTitle className="text-lg">{section.title}</CardTitle>
            <span className="text-xs text-muted-foreground">({completed}/{total})</span>
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
          {habits.map((habit: Habit) => (
            <SwipeableHabitCard key={habit.id} habit={habit} isCompleted={habitLogs.some((l: HabitLog) => l.habitId === habit.id && l.status === 'done')} {...rest} />
          ))}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Основной компонент для отображения привычек на сегодня в виде V2.
 * @param {TodayHabitsV2Props} props - Свойства компонента.
 * @returns {JSX.Element} - React-компонент.
 */
export function TodayHabitsV2({ habits, habitLogs, ...rest }: TodayHabitsV2Props) {
  const todaysHabits = useMemo(() => habits.filter(isHabitDueToday), [habits]);

  const groupedHabits = useMemo(() => {
    const groups: Record<TimeOfDay, Habit[]> = { morning: [], afternoon: [], evening: [], anytime: [] };
    todaysHabits.forEach(habit => groups[getTimeOfDay(habit)].push(habit));
    return groups;
  }, [todaysHabits]);

  const { total, completed, completionRate } = useMemo(() => {
    const total = todaysHabits.length;
    const completed = todaysHabits.filter(h => habitLogs.some(l => l.habitId === h.id && l.status === 'done')).length;
    return { total, completed, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [todaysHabits, habitLogs]);

  return (
    <div className="space-y-4">
      <Card className="glass border-primary/20">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Прогресс за сегодня</CardTitle>
            <div className="text-right">
              <div className="text-2xl font-bold">{completionRate}%</div>
              <div className="text-xs text-muted-foreground">{completed} / {total} привычек</div>
            </div>
          </div>
          <Progress value={completionRate} className="h-2 mt-2" />
        </CardHeader>
      </Card>

      {timeSections.map((section) => (
        <TimeSectionCard key={section.id} section={section} habits={groupedHabits[section.id]} habitLogs={habitLogs} {...rest} />
      ))}

      {groupedHabits.anytime.length > 0 && (
        <Card className="border-2 border-slate-200 bg-slate-50/50">
          <CardHeader className="pb-3"><CardTitle className="text-lg">В любое время</CardTitle></CardHeader>
          <CardContent className="space-y-2 pt-0">
            {groupedHabits.anytime.map((habit) => (
              <SwipeableHabitCard key={habit.id} habit={habit} isCompleted={habitLogs.some(l => l.habitId === habit.id && l.status === 'done')} {...rest} />
            ))}
          </CardContent>
        </Card>
      )}

      {todaysHabits.length === 0 && (
        <Card className="glass">
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground">На сегодня привычек не запланировано</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
