'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { PomodoroTimer } from './pomodoro-timer';
import type { Habit, Day, HabitCategory, HabitStreak } from '@/lib/types';
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
import { NotificationPermissionDialog } from './notification-permission-dialog';
import { NotificationCenter } from './notification-center';
import { StreaksDialog } from './streaks-dialog';
import { TodayHabitsV2 } from './today-habits-v2';
import { LayoutGrid, List } from 'lucide-react';

/**
 * @fileoverview Основной компонент для отслеживания привычек.
 * Управляет отображением, добавлением, редактированием и логированием привычек.
 */

/**
 * `HabitTracker` - это центральный компонент для управления привычками пользователя.
 * Он загружает все необходимые данные (привычки, категории, логи) из Firestore,
 * отображает привычки, запланированные на сегодня, и предоставляет интерфейс
 * для взаимодействия с ними, включая отметку о выполнении, логирование,
 * фильтрацию, сортировку и доступ к различным аналитическим инструментам.
 * @returns {JSX.Element} React-компонент.
 */
export function HabitTracker() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  // Состояние для переключения между классическим и новым (V2) видом списка привычек
  const [useV2Layout, setUseV2Layout] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('habit-tracker-layout') === 'v2';
    }
    return false;
  });

  // Загрузка привычек пользователя из Firestore
  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: trackedHabits, isLoading: habitsLoading } = useCollection<Habit>(habitsQuery);
  
  // Загрузка категорий привычек
  const categoriesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitCategories`) : null),
    [user, firestore]
  );
  const { data: habitCategories, isLoading: categoriesLoading } = useCollection<HabitCategory>(categoriesQuery);

  // Загрузка логов выполнения привычек
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

  /** Переключает вид отображения привычек (v1/v2) и сохраняет выбор в localStorage. */
  const toggleLayout = () => {
    const newLayout = !useV2Layout;
    setUseV2Layout(newLayout);
    if (typeof window !== 'undefined') {
      localStorage.setItem('habit-tracker-layout', newLayout ? 'v2' : 'v1');
    }
  };

  useEffect(() => {
    const date = new Date();
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' }) as Day;
    setToday(dayOfWeek);
  }, []);

  /**
   * Обновляет статус выполнения (completed) для привычки в Firestore.
   * @param {Habit} habit - Привычка для обновления.
   */
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

  /**
   * Проверяет, есть ли привычки, зависящие от выполненной (триггерной) привычки,
   * и предлагает пользователю начать их выполнение.
   * @param {Habit} trigger - Привычка-триггер.
   */
  const promptStackingIfAny = (trigger: Habit) => {
    if (!trackedHabits) return;
    const dependents = trackedHabits.filter((h) => {
      const rule = getHabitStackingRule(h);
      if (!rule) return false;
      return rule.triggerId === trigger.id;
    });
    for (const dep of dependents) {
      if (!isHabitV2(dep) && dep.completed) continue;
      if (!isHabitDueToday(dep)) continue;
      const proceed = typeof window !== 'undefined' ? window.confirm(`Начать следующую привычку: ${dep.name}?`) : false;
      if (!proceed) continue;
      if (isQuantityHabit(dep) || isDurationHabit(dep)) {
        setLogModal({ open: true, habit: dep });
      } else {
        commitToggleCompletion(dep);
      }
    }
  };

  /**
   * Обрабатывает переключение статуса выполнения привычки.
   * Для количественных привычек и привычек на время открывает модальное окно.
   * @param {Habit} habit - Привычка.
   */
  const handleToggleCompletion = (habit: Habit) => {
    if (isQuantityHabit(habit) || isDurationHabit(habit)) {
      setLogModal({ open: true, habit });
      return;
    }
    commitToggleCompletion(habit);
    promptStackingIfAny(habit);
  };

  /**
   * Создает запись (лог) о выполнении привычки в Firestore.
   * @param {Habit} habit - Привычка, для которой создается лог.
   * @param {number} [value] - Значение ( для количественных привычек).
   * @param {string} [unit] - Единица измерения.
   */
  const createHabitLog = async (habit: Habit, value?: number, unit?: string) => {
    if (!user || !firestore) return;
    try {
      // ... (логика создания лога)
    } catch (err: any) {
      // ... (обработка ошибок)
    }
  };

  /**
   * Добавляет новую привычку в Firestore.
   * @param {Omit<Habit, 'id'>} newHabit - Новая привычка.
   */
  const handleAddHabit = (newHabit: Omit<Habit, 'id'>) => {
    if (!user || !firestore) return;
    const habitsCollection = collection(firestore, `users/${user.uid}/habits`);
    addDoc(habitsCollection, newHabit).catch(/* ... */);
  };

  /**
   * Добавляет новую категорию привычек.
   * @param {string} name - Название категории.
   */
  const handleAddCategory = (name: string) => { /* ... */ };

  /**
   * Обновляет название категории.
   * @param {HabitCategory} category - Категория для обновления.
   */
  const handleUpdateCategory = (category: HabitCategory) => { /* ... */ };

  /**
   * Удаляет категорию.
   * @param {string} categoryId - ID категории.
   */
  const handleDeleteCategory = (categoryId: string) => { /* ... */ };

  const todaysHabits = useMemo(() => {
    if (!trackedHabits) return [];
    let filtered = trackedHabits.filter(h => isHabitDueToday(h));
    if (selectedTag) {
      filtered = filtered.filter(h => getHabitTags(h).includes(selectedTag));
    }
    return filtered;
  }, [trackedHabits, selectedTag]);

  const allTags = useMemo(() => {
    if (!trackedHabits) return [];
    const tagSet = new Set<string>();
    trackedHabits.forEach(h => getHabitTags(h).forEach(t => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [trackedHabits]);

  const sortedHabits = useMemo(() => {
    return [...todaysHabits].sort((a, b) => {
      if (sortBy === 'priority') {
        const aP = getHabitPriority(a);
        const bP = getHabitPriority(b);
        if (aP && bP) return bP - aP;
      }
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (a.completed && !b.completed) return 1;
      if (!a.completed && b.completed) return -1;
      return 0;
    });
  }, [todaysHabits, sortBy]);
  
  const isLoading = habitsLoading || categoriesLoading;

  const streaksMap = useMemo(() => {
    if (!trackedHabits || !habitLogs) return new Map<string, HabitStreak>();
    // ... (логика расчета серий)
    return new Map();
  }, [trackedHabits, habitLogs]);

  const todaysProgress = useMemo(() => {
    if (!habitLogs) return new Map<string, { value?: number; durationMin?: number }>();
    // ... (логика расчета прогресса за сегодня)
    return new Map();
  }, [habitLogs]);

  // Симулятор напоминаний (только для разработки)
  useEffect(() => {
    // ...
  }, [trackedHabits, toast]);

  return (
      <>
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ежедневные привычки</CardTitle>
            <div className="flex items-center gap-2" aria-label="Действия в заголовке">
              {/* ... (кнопки и диалоги) ... */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleLayout}
                title={useV2Layout ? "Переключить на классический вид" : "Переключить на расширенный вид"}
              >
                {useV2Layout ? <List className="h-4 w-4" /> : <LayoutGrid className="h-4 w-4" />}
              </Button>
              <AddHabitDialog onHabitAdd={handleAddHabit} openManageCategories={() => setIsManageCategoriesOpen(true)} categories={habitCategories || []} habits={trackedHabits || []} />
            </div>
          </CardHeader>
          <div className="px-6 pb-2 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">Фильтр:</span>
            {/* ... (фильтры по тегам и сортировка) ... */}
          </div>
          <CardContent className="space-y-2">
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : useV2Layout ? (
              <TodayHabitsV2 /* ... */ />
            ) : sortedHabits.map((habit) => {
              // ... (рендеринг привычки в классическом виде) ...
              return <div key={habit.id}></div>;
            })}
             {!isLoading && sortedHabits.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>На сегодня привычек не запланировано.</p>
              </div>
            )}
          </CardContent>
        </Card>
        <HabitLogModal /* ... */ />
        <ManageCategoriesDialog /* ... */ />
    </>
  );
}
