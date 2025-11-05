'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import type { Habit, HabitLog, HabitStreak } from '@/lib/types';
import { HabitStreakCard } from './habit-streak-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { freezeStreak } from '@/lib/habits';

/**
 * @fileoverview Диалоговое окно для просмотра и управления сериями выполнения привычек.
 */

/**
 * @interface StreaksDialogProps
 * @description Свойства для компонента StreaksDialog.
 */
interface StreaksDialogProps {
  /** Массив всех привычек пользователя. */
  habits: Habit[];
  /** Массив всех логов привычек пользователя. */
  habitLogs: HabitLog[];
  /** Карта, содержащая данные о сериях для каждой привычки. */
  streaks: Map<string, HabitStreak>;
}

/**
 * Компонент-диалог, позволяющий пользователю выбрать привычку и просмотреть
 * подробную статистику по ее серии выполнения, включая возможность "заморозки"
 * и использования токенов пропуска.
 * @param {StreaksDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function StreaksDialog({ habits, habitLogs, streaks }: StreaksDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string>('');

  const selectedHabit = habits.find(h => h.id === selectedHabitId);
  const selectedStreak = selectedHabitId ? streaks.get(selectedHabitId) : undefined;
  const selectedLogs = selectedHabitId ? habitLogs.filter(l => l.habitId === selectedHabitId) : [];

  /**
   * Обрабатывает "заморозку" серии для выбранной привычки.
   * @param {string} habitId - ID привычки.
   * @param {string} untilDate - Дата, до которой серия будет заморожена.
   */
  const handleFreeze = async (habitId: string, untilDate: string) => {
    if (!user || !firestore) return;
    try {
      const streakDoc = doc(firestore, `users/${user.uid}/habitStreaks/${habitId}`);
      const currentStreak = streaks.get(habitId);
      if (!currentStreak) throw new Error('Серия не найдена');
      const frozen = freezeStreak(currentStreak, untilDate);
      await updateDoc(streakDoc, { frozenUntil: frozen.frozenUntil });
      toast({ title: 'Серия заморожена' });
    } catch (error) {
      console.error('Ошибка заморозки серии:', error);
      throw error;
    }
  };

  /**
   * Обрабатывает использование токена пропуска для привычки.
   * @param {string} habitId - ID привычки.
   */
  const handleUseSkipToken = async (habitId: string) => {
    if (!user || !firestore) return;
    try {
      const streakDoc = doc(firestore, `users/${user.uid}/habitStreaks/${habitId}`);
      const currentStreak = streaks.get(habitId);
      if (!currentStreak || (currentStreak.skipTokens ?? 0) === 0) {
        toast({ title: 'Нет токенов пропуска', variant: 'destructive' });
        return;
      }
      await updateDoc(streakDoc, { skipTokens: (currentStreak.skipTokens ?? 0) - 1 });
      toast({ title: 'Токен пропуска использован' });
    } catch (error) {
      console.error('Ошибка использования токена:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          <Flame className="h-4 w-4 mr-1" />
          Серии
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Серии привычек</DialogTitle>
          <DialogDescription>
            Просмотр и управление сериями, токенами и заморозками.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Выберите привычку</label>
            <Select value={selectedHabitId} onValueChange={setSelectedHabitId}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите привычку..." />
              </SelectTrigger>
              <SelectContent>
                {habits.map(h => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedHabit && selectedStreak && (
            <HabitStreakCard
              habit={selectedHabit}
              streak={selectedStreak}
              logs={selectedLogs}
              onFreeze={(untilDate) => handleFreeze(selectedHabit.id, untilDate)}
              onUseSkipToken={() => handleUseSkipToken(selectedHabit.id)}
            />
          )}

          {!selectedHabitId && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Выберите привычку для просмотра деталей серии.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
