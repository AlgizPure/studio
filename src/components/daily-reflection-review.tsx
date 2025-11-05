'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, doc, getDoc, addDoc, updateDoc } from 'firebase/firestore';
import type { Habit, HabitLogStatus } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { parseReflectionMock } from '@/lib/reflection';
import { parseDailyReflection } from '@/ai/flows/parse-reflection';
import { isHabitV2 } from '@/lib/habits-guards';
import { validateAndCreateHabitLog } from '@/lib/habits-validators';

/**
 * @fileoverview Диалоговое окно для просмотра и корректировки результатов парсинга ежедневной заметки.
 */

/**
 * @interface DailyReflectionReviewProps
 * @description Свойства для компонента DailyReflectionReview.
 */
interface DailyReflectionReviewProps {
  /** Список привычек пользователя для сопоставления. */
  habits: Habit[];
  /** Пользовательский триггер для открытия диалогового окна. */
  trigger?: React.ReactNode;
}

/**
 * @typedef {object} EditableEntry
 * @description Тип для редактируемой записи, полученной из заметки.
 */
type EditableEntry = {
  habitId: string;
  habitName: string;
  status: HabitLogStatus;
  value?: string;
  durationMin?: string;
};

/**
 * Компонент для просмотра и редактирования записей, извлеченных AI из ежедневной заметки.
 * Позволяет пользователю скорректировать данные перед их сохранением в виде логов привычек.
 * @param {DailyReflectionReviewProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function DailyReflectionReview({ habits, trigger }: DailyReflectionReviewProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [entries, setEntries] = useState<EditableEntry[]>([]);
  const [busy, setBusy] = useState(false);

  /**
   * Загружает заметку за сегодняшний день и парсит ее с помощью AI.
   */
  const loadAndParse = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    const ref = doc(firestore, `users/${user.uid}/dailyReflections/${dateStr}`);
    const snap = await getDoc(ref);
    const rawText = snap.exists() ? (snap.data()?.rawText as string) : '';
    if (!rawText) {
      setEntries([]);
      return;
    }
    
    try {
      const parsed = await parseDailyReflection(rawText, habits || []);
      setEntries(parsed.map(p => ({
        habitId: p.habitId,
        habitName: p.habitName,
        status: p.suggestedStatus,
        value: p.extractedValue != null ? String(p.extractedValue) : '',
        durationMin: p.extractedDuration != null ? String(p.extractedDuration) : '',
      })));
    } catch (error) {
      console.error('[DailyReflectionReview] Ошибка парсинга:', error);
      // Запасной вариант с моком
      const parsed = parseReflectionMock(rawText, habits || []);
      setEntries(parsed.map(p => ({
        habitId: p.habitId,
        habitName: p.habitName,
        status: p.suggestedStatus,
        value: p.extractedValue != null ? String(p.extractedValue) : '',
        durationMin: p.extractedDuration != null ? String(p.extractedDuration) : '',
      })));
    }
  };

  useEffect(() => {
    if (open) {
      loadAndParse();
    }
  }, [open]);

  /**
   * Сохраняет скорректированные записи как логи привычек.
   */
  const handleSave = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      setBusy(true);
      const logsCol = collection(firestore, `users/${user.uid}/habitLogs`);
      for (const e of entries) {
        const matched = (habits || []).find(h => h.id === e.habitId);
        const contextData = matched && isHabitV2(matched) && matched.contextParams ? matched.contextParams : undefined;
        
        const logData = {
          habitId: e.habitId,
          date: dateStr,
          status: e.status,
          value: e.value ? Number(e.value) : undefined,
          durationMin: e.durationMin ? Number(e.durationMin) : undefined,
          ...(contextData && { contextData }),
          extractedFrom: 'reflection' as const,
          aiConfidence: 0.7,
          manuallyEdited: true,
        };
        
        const validated = validateAndCreateHabitLog(logData);
        await addDoc(logsCol, validated);
      }
      const ref = doc(firestore, `users/${user.uid}/dailyReflections/${dateStr}`);
      await updateDoc(ref, {
        parsedEntries: entries.map(e => ({
          habitId: e.habitId,
          habitName: e.habitName,
          extractedValue: e.value ? Number(e.value) : undefined,
          extractedDuration: e.durationMin ? Number(e.durationMin) : undefined,
          extractedNote: undefined,
          suggestedStatus: e.status,
          confidence: 0.7,
        })),
        manualCorrections: true,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Заметка обработана', description: 'Логи созданы из заметки.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось обработать заметку' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ?? (
    <Button variant="secondary" size="sm">Обработать заметку</Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Просмотр извлеченных записей</DialogTitle>
          <DialogDescription>Скорректируйте значения или статус, затем сохраните для создания логов.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {entries.map((e, idx) => (
            <div key={e.habitId} className="grid grid-cols-6 items-center gap-2 p-2 border rounded">
              <div className="col-span-2 text-sm font-medium truncate">{e.habitName}</div>
              <div className="col-span-2 flex items-center gap-2">
                <Input placeholder="значение" value={e.value} onChange={(ev) => {
                  const next = [...entries];
                  next[idx] = { ...next[idx], value: ev.target.value };
                  setEntries(next);
                }} />
                <Input placeholder="минуты" value={e.durationMin} onChange={(ev) => {
                  const next = [...entries];
                  next[idx] = { ...next[idx], durationMin: ev.target.value };
                  setEntries(next);
                }} />
              </div>
              <div className="col-span-2">
                <Select value={e.status} onValueChange={(v) => {
                  const next = [...entries] as EditableEntry[];
                  next[idx] = { ...next[idx], status: v as HabitLogStatus };
                  setEntries(next);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Статус" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="done">Выполнено</SelectItem>
                      <SelectItem value="partial">Частично</SelectItem>
                      <SelectItem value="skipped">Пропущено</SelectItem>
                      <SelectItem value="missed">Не выполнено</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
          {entries.length === 0 && (
            <div className="text-sm text-muted-foreground">Из сегодняшней заметки не извлечено ни одной записи.</div>
          )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} aria-disabled={busy}>Отмена</Button>
          <Button type="button" onClick={handleSave} disabled={entries.length === 0 || busy} aria-busy={busy}>{busy ? 'Сохранение...' : 'Сохранить логи'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
