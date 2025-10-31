'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { isHabitDueToday, formatHabitTarget, computeStreakFromLogs, computeCompletionRate, computeConsistencyScore, calculateHabitStrengthScore } from '@/lib/habits';
import {
  isHabitV2,
  getHabitTags,
  getHabitPriority,
  getHabitDifficulty,
  getHabitTarget,
  getHabitReminders,
  getHabitStackingRule,
  isQuantityHabit,
  isDurationHabit,
} from '@/lib/habits-guards';
import type { HabitLog } from '@/lib/types';
import { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { AddHabitDialog } from './add-habit-dialog';
import { ManageCategoriesDialog } from './manage-categories-dialog';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { doc, updateDoc, addDoc, deleteDoc, collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { Skeleton } from './ui/skeleton';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { HabitLogModal } from './habit-log-modal';
import { DailyReflectionDialog } from './daily-reflection-dialog';
import { DailyReflectionReview } from './daily-reflection-review';
import { SystemLibraryDialog } from './system-library-dialog';
import { AnalyticsDialog } from './analytics-dialog';
import { ExportDialog } from './export-dialog';
import { InsightsDialog } from './insights-dialog';
import { ImportClaudeDialog } from './import-claude-dialog';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HeatmapDialog } from './heatmap-dialog';

export function HabitTracker() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: trackedHabits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: categoriesLoading } = useCollection<HabitCategory>(categoriesQuery);

  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: habitLogs } = useCollection<HabitLog>(logsQuery);

  const [today, setToday] = useState<Day | null>(null);
  const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);
  const [logModal, setLogModal] = useState<{ open: boolean; habit: Habit | null }>(() => ({ open: false, habit: null }));
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'completion' | 'priority' | 'name'>('completion');

  useEffect(() => {
    const date = new Date();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }) as Day;
    setToday(dayOfWeek);
  }, []);

  const commitToggleCompletion = (habit: Habit) => {
    if (!user || !firestore || !habit.id) return;
    const habitDoc = doc(firestore, `users/${user.uid}/habits`, habit.id);
    const updatedData = { completed: !habit.completed };
    updateDoc(habitDoc, updatedData).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: habitDoc.path,
        requestResourceData: updatedData,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const promptStackingIfAny = (trigger: Habit) => {
    if (!trackedHabits) return;
    const dependents = trackedHabits.filter((h) => {
      const rule = getHabitStackingRule(h);
      if (!rule) return false;
      return rule.triggerId === trigger.id;
    });
    for (const dep of dependents) {
      // Check legacy completed field
      if (!isHabitV2(dep) && dep.completed) continue;
      if (!isHabitDueToday(dep)) continue;
      const proceed = typeof window !== 'undefined' ? window.confirm(`Start next habit: ${dep.name}?`) : false;
      if (!proceed) continue;
      if (isQuantityHabit(dep) || isDurationHabit(dep)) {
        setLogModal({ open: true, habit: dep });
      } else {
        commitToggleCompletion(dep);
      }
    }
  };

  const handleToggleCompletion = (habit: Habit) => {
    if (isQuantityHabit(habit) || isDurationHabit(habit)) {
      setLogModal({ open: true, habit });
      return;
    }
    commitToggleCompletion(habit);
    promptStackingIfAny(habit);
  };

  const createHabitLog = async (habit: Habit, value?: number, unit?: string) => {
    if (!user || !firestore) return;
    try {
      const logsCol = collection(firestore, `users/${user.uid}/habitLogs`);
      const today = format(new Date(), 'yyyy-MM-dd');
      const payload: {
        habitId: string;
        date: string;
        status: 'done';
        note?: string;
        extractedFrom: 'manual';
        value?: number;
        durationMin?: number;
        contextData?: Record<string, any>;
        createdAt: string;
        updatedAt: string;
      } = {
        habitId: habit.id,
        date: today,
        status: 'done',
        extractedFrom: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (isHabitV2(habit) && habit.contextParams) {
        payload.contextData = habit.contextParams;
      }
      if (isDurationHabit(habit) && typeof value === 'number') {
        payload.durationMin = value;
        if (unit && unit !== 'min') payload.note = `unit: ${unit}`;
      } else if (isQuantityHabit(habit) && typeof value === 'number') {
        payload.value = value;
        if (unit) payload.note = unit;
      }
      
      // Validate before writing
      const { validateAndCreateHabitLog } = await import('@/lib/habits-validators');
      const validated = validateAndCreateHabitLog(payload);
      
      await addDoc(logsCol, validated);
      toast({
        title: 'Habit logged',
        description: `Successfully logged ${habit.name}`,
      });
    } catch (err: any) {
      // Handle validation errors
      if (err && typeof err === 'object' && 'issues' in err) {
        const zodErr = err as { issues: Array<{ message: string; path: (string | number)[] }> };
        const firstIssue = zodErr.issues[0];
        toast({
          title: 'Validation error',
          description: firstIssue ? `${firstIssue.path.join('.')}: ${firstIssue.message}` : 'Invalid habit log data',
          variant: 'destructive',
        });
        return;
      }
      // Handle permission errors
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: `users/${user?.uid}/habitLogs`,
        requestResourceData: {},
      });
      errorEmitter.emit('permission-error', permissionError);
      toast({
        title: 'Error',
        description: 'Failed to create habit log',
        variant: 'destructive',
      });
    }
  };

  const handleAddHabit = (newHabit: Omit<Habit, 'id'>) => {
    if (!user || !firestore) return;
    const habitsCollection = collection(firestore, `users/${user.uid}/habits`);
    addDoc(habitsCollection, newHabit).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: habitsCollection.path,
        requestResourceData: newHabit,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleAddCategory = (name: string) => {
    if (!user || !firestore) return;
    const catCollection = collection(firestore, `users/${user.uid}/habitCategories`);
    addDoc(catCollection, { name }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: catCollection.path,
        requestResourceData: { name },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleUpdateCategory = (category: HabitCategory) => {
    if (!user || !firestore || !category.id) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, category.id);
    updateDoc(catDoc, { name: category.name }).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'update',
        path: catDoc.path,
        requestResourceData: { name: category.name },
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    if (!user || !firestore) return;
    const catDoc = doc(firestore, `users/${user.uid}/habitCategories`, categoryId);
    deleteDoc(catDoc).catch(async (err) => {
      const permissionError = new FirestorePermissionError({
        operation: 'delete',
        path: catDoc.path,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
  };

  const todaysHabits = useMemo(() => {
    if (!trackedHabits) return [];
    let filtered = trackedHabits.filter(h => isHabitDueToday(h));
    if (selectedTag) {
      filtered = filtered.filter(h => {
        const tags = getHabitTags(h);
        return tags.includes(selectedTag);
      });
    }
    return filtered;
  }, [trackedHabits, selectedTag]);

  const allTags = useMemo(() => {
    if (!trackedHabits) return [];
    const tagSet = new Set<string>();
    for (const h of trackedHabits) {
      const tags = getHabitTags(h);
      tags.forEach(t => tagSet.add(t));
    }
    return Array.from(tagSet).sort();
  }, [trackedHabits]);

  const sortedHabits = useMemo(() => {
    return [...todaysHabits].sort((a, b) => {
      if (sortBy === 'priority') {
        const aP = getHabitPriority(a);
        const bP = getHabitPriority(b);
        if (aP && bP) return bP - aP;
        if (aP) return -1;
        if (bP) return 1;
      }
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      // default: completion
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
  }, [todaysHabits, sortBy]);
  
  const isLoading = habitsLoading || categoriesLoading;

  const streaksMap = useMemo(() => {
    if (!trackedHabits || !habitLogs) return new Map<string, { current: number; longest: number; hss: number }>();
    const byHabit = new Map<string, HabitLog[]>();
    for (const log of habitLogs) {
      if (!log.habitId) continue;
      const arr = byHabit.get(log.habitId) || [];
      arr.push(log);
      byHabit.set(log.habitId, arr);
    }
    const result = new Map<string, { current: number; longest: number; hss: number }>();
    const now = new Date();
    const from90 = new Date(now.getTime());
    from90.setDate(from90.getDate() - 90);
    for (const h of trackedHabits) {
      const logs = byHabit.get(h.id) || [];
      const { current, longest } = computeStreakFromLogs(logs);
      const completion = computeCompletionRate(logs, from90, now);
      const consistency = computeConsistencyScore(logs, from90, now);
      const hss = calculateHabitStrengthScore({ currentStreak: current, longestStreak: longest, completionRate90d: completion, consistencyScore: consistency });
      result.set(h.id, { current, longest, hss });
    }
    return result;
  }, [trackedHabits, habitLogs]);

  // Today's progress map for quantity/duration
  const todaysProgress = useMemo(() => {
    if (!habitLogs) return new Map<string, { value?: number; durationMin?: number }>();
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const map = new Map<string, { value?: number; durationMin?: number }>();
    for (const log of habitLogs) {
      if (log.date !== todayStr || log.status !== 'done') continue;
      const cur = map.get(log.habitId) || {};
      if (typeof log.value === 'number') cur.value = (cur.value || 0) + log.value;
      if (typeof log.durationMin === 'number') cur.durationMin = (cur.durationMin || 0) + log.durationMin;
      map.set(log.habitId, cur);
    }
    return map;
  }, [habitLogs]);

  // Dev-only reminder simulator (checks every minute)
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_REMINDER_SIMULATOR !== '1') return;
    if (!trackedHabits) return;
    const shown = new Set<string>();
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const keyTime = `${hh}:${mm}`;
      for (const habit of trackedHabits) {
        const reminders = getHabitReminders(habit);
        const firstReminder = reminders[0];
        const times: string[] = firstReminder?.times || [];
        if (!times.includes(keyTime)) continue;
        // Check legacy completed field
        if (!isHabitV2(habit) && habit.completed) continue;
        if (!isHabitDueToday(habit, now)) continue;
        const key = `${habit.id}:${keyTime}:${now.toDateString()}`;
        if (shown.has(key)) continue;
        shown.add(key);
        toast({
          title: 'Reminder',
          description: `Time for: ${habit.name}`,
        });
      }
    };
    tick();
    const id = setInterval(tick, 60 * 1000);
    return () => clearInterval(id);
  }, [trackedHabits, toast]);

  return (
      <>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Daily Habits</CardTitle>
            <div className="flex items-center gap-2" aria-label="Header actions">
              <HeatmapDialog habits={trackedHabits || []} />
              <SystemLibraryDialog />
              <AnalyticsDialog />
              <ExportDialog />
              <InsightsDialog />
              <ImportClaudeDialog />
              <DailyReflectionDialog habits={trackedHabits || []} />
              <DailyReflectionReview habits={trackedHabits || []} />
              <AddHabitDialog onHabitAdd={handleAddHabit} openManageCategories={() => setIsManageCategoriesOpen(true)} categories={habitCategories || []} habits={trackedHabits || []} />
            </div>
          </CardHeader>
          {(allTags.length > 0 || true) && (
            <div className="px-6 pb-2 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Filter:</span>
              <Button
                variant={selectedTag === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(null)}
                className="h-6 text-xs"
              >
                All
              </Button>
              {allTags.map(tag => (
                <Button
                  key={tag}
                  variant={selectedTag === tag ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className="h-6 text-xs"
                >
                  #{tag}
                </Button>
              ))}
              <span className="ml-auto text-xs text-muted-foreground">Sort:</span>
              <Select value={sortBy} onValueChange={(v: 'completion' | 'priority' | 'name') => setSortBy(v)}>
                <SelectTrigger className="h-6 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completion">Completion</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : sortedHabits.map((habit) => {
              const isCompleted = !isHabitV2(habit) ? habit.completed : false;
              const target = getHabitTarget(habit);
              const tags = getHabitTags(habit);
              const priority = getHabitPriority(habit);
              const difficulty = getHabitDifficulty(habit);
              const reminders = getHabitReminders(habit);
              const firstReminder = reminders[0];
              const reminderTimes = firstReminder?.times || [];
              const pomodoro = !isHabitV2(habit) ? habit.pomodoro : undefined;
              
              // Calculate streak display
              const streakInfo = streaksMap.get(habit.id);
              const streakDisplay = streakInfo ? `🔥 ${streakInfo.current} / 🏆 ${streakInfo.longest}` : null;

              // Progress display for quantity/duration habits
              let progressText = formatHabitTarget(habit) || (!isHabitV2(habit) ? habit.goal : undefined);
              if (isHabitV2(habit) && target && (isQuantityHabit(habit) || isDurationHabit(habit))) {
                const targetValue = target.value;
                const targetUnit = target.unit;
                if (typeof targetValue === 'number') {
                  const prog = todaysProgress.get(habit.id);
                  const val = isDurationHabit(habit) ? prog?.durationMin : prog?.value;
                  if (typeof val === 'number') {
                    progressText = `${val}/${targetValue}${targetUnit ? ' ' + targetUnit : isDurationHabit(habit) ? ' min' : ''}`;
                  }
                }
              }

              return (
                <div 
                  key={habit.id} 
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-all",
                    isCompleted && "opacity-50"
                  )}
                >
                  <Checkbox 
                    id={habit.id} 
                    checked={!!isCompleted}
                    onCheckedChange={() => handleToggleCompletion(habit)}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={habit.id} 
                      className={cn(
                        "font-medium cursor-pointer",
                        isCompleted && "line-through"
                      )}
                    >
                      {habit.name}
                    </Label>
                    {progressText && (
                      <p className="text-xs text-muted-foreground">
                        {progressText}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {streakDisplay && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-orange-100 text-orange-800">{streakDisplay}</span>
                      )}
                      {tags.map((t: string) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">#{t}</span>
                      ))}
                      {priority && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">P{priority}</span>
                      )}
                      {difficulty && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">{difficulty}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {reminderTimes.length > 0 && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">⏰ {reminderTimes.length}</span>
                    )}
                    {pomodoro && <PomodoroTimer cycles={pomodoro.cycles} disabled={!!isCompleted} />}
                  </div>
                </div>
              );
            })}
             {!isLoading && sortedHabits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No habits scheduled for today.</p>
              </div>
            )}
          </CardContent>
        </Card>
      <HabitLogModal 
        open={logModal.open}
        onOpenChange={(open) => setLogModal(s => ({ ...s, open }))}
        habitName={logModal.habit?.name || ''}
        type={logModal.habit ? (isDurationHabit(logModal.habit) ? 'duration' : 'quantity') : 'quantity'}
        unitPlaceholder={logModal.habit ? (getHabitTarget(logModal.habit)?.unit) : undefined}
        onSubmit={async (val, unit) => {
          if (logModal.habit) {
            await createHabitLog(logModal.habit, val, unit);
            commitToggleCompletion(logModal.habit);
            promptStackingIfAny(logModal.habit);
          }
          setLogModal({ open: false, habit: null });
        }}
      />
        <ManageCategoriesDialog 
            open={isManageCategoriesOpen} 
            onOpenChange={setIsManageCategoriesOpen} 
            categories={habitCategories || []}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
            categoryType="Habit"
        />
    </>
  );
}
