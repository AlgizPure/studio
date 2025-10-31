'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { isHabitDueToday, formatHabitTarget, computeStreakFromLogs, computeCompletionRate, computeConsistencyScore, calculateHabitStrengthScore } from '@/lib/habits';
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
      const anyH = h as any;
      const rule = anyH?.stackingRule as { triggerId: string; position: 'before'|'after'; delay?: number } | undefined;
      if (!rule) return false;
      return rule.triggerId === trigger.id;
    });
    for (const dep of dependents) {
      if (dep.completed) continue;
      if (!isHabitDueToday(dep)) continue;
      const anyDep = dep as any;
      const t = anyDep?.type as string | undefined;
      const proceed = typeof window !== 'undefined' ? window.confirm(`Start next habit: ${dep.name}?`) : false;
      if (!proceed) continue;
      if (t === 'quantity' || t === 'duration') {
        setLogModal({ open: true, habit: dep });
      } else {
        commitToggleCompletion(dep);
      }
    }
  };

  const handleToggleCompletion = (habit: Habit) => {
    const anyHabit = habit as any;
    const type = anyHabit?.type as string | undefined;
    if (type === 'quantity' || type === 'duration') {
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
      const anyHabit = habit as any;
      const type = anyHabit?.type as string | undefined;
      const payload: any = {
        habitId: habit.id,
        date: today,
        status: 'done',
        note: undefined,
        extractedFrom: 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (anyHabit?.contextParams) {
        payload.contextData = anyHabit.contextParams;
      }
      if (type === 'duration' && typeof value === 'number') {
        payload.durationMin = value;
        if (unit && unit !== 'min') payload.note = `unit: ${unit}`;
      } else if (type === 'quantity' && typeof value === 'number') {
        payload.value = value;
        if (unit) payload.note = unit;
      }
      await addDoc(logsCol, payload);
    } catch (err) {
      const permissionError = new FirestorePermissionError({
        operation: 'create',
        path: `users/${user?.uid}/habitLogs`,
        requestResourceData: {},
      });
      errorEmitter.emit('permission-error', permissionError);
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
    return trackedHabits.filter(h => isHabitDueToday(h));
  }, [trackedHabits]);

  const sortedHabits = useMemo(() => {
    return [...todaysHabits].sort((a, b) => {
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
  }, [todaysHabits]);
  
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
        const anyHabit = habit as any;
        const times: string[] = (anyHabit?.reminders?.[0]?.times as string[] | undefined) || [];
        if (!times.includes(keyTime)) continue;
        if (habit.completed) continue;
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
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : sortedHabits.map((habit) => {
              return (
                <div 
                  key={habit.id} 
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-all",
                    habit.completed && "opacity-50"
                  )}
                >
                  <Checkbox 
                    id={habit.id} 
                    checked={!!habit.completed}
                    onCheckedChange={() => handleToggleCompletion(habit)}
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor={habit.id} 
                      className={cn(
                        "font-medium cursor-pointer",
                        habit.completed && "line-through"
                      )}
                    >
                      {habit.name}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {(() => {
                        const anyHabit = habit as any;
                        const t = anyHabit?.type as string | undefined;
                        const target = (anyHabit?.target?.value as number | undefined) || undefined;
                        const unit = (anyHabit?.target?.unit as string | undefined) || undefined;
                        if ((t === 'quantity' || t === 'duration') && typeof target === 'number') {
                          const prog = todaysProgress.get(habit.id);
                          const val = t === 'duration' ? prog?.durationMin : prog?.value;
                          if (typeof val === 'number') {
                            return `${val}/${target}${unit ? ' ' + unit : t === 'duration' ? ' min' : ''}`;
                          }
                        }
                        return formatHabitTarget(habit) || habit.goal;
                      })()}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {Array.isArray((habit as any)?.tags) && (habit as any).tags.map((t: string) => (
                        <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground">#{t}</span>
                      ))}
                      {(habit as any)?.priority && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800">P{(habit as any).priority}</span>
                      )}
                      {(habit as any)?.difficulty && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">{(habit as any).difficulty}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const anyHabit = habit as any;
                      const reminders = (anyHabit?.reminders?.[0]?.times as string[] | undefined) || [];
                      if (reminders.length > 0) {
                        return (
                          <span className="text-[10px] px-2 py-1 rounded-full bg-muted text-muted-foreground">⏰ {reminders.length}</span>
                        );
                      }
                      return null;
                    })()}
                    {habit.pomodoro && <PomodoroTimer cycles={habit.pomodoro.cycles} disabled={!!habit.completed} />}
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
        type={(logModal.habit as any)?.type === 'duration' ? 'duration' : 'quantity'}
        unitPlaceholder={(logModal.habit as any)?.target?.unit}
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
