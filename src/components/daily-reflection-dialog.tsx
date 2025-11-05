'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, doc, setDoc } from 'firebase/firestore';
import type { Habit, Day } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

/**
 * @fileoverview Диалоговое окно для ежедневных заметок.
 * Позволяет пользователю записывать свои мысли и отмечать выполнение привычек.
 */

/**
 * Свойства для компонента DailyReflectionDialog.
 * @interface DailyReflectionDialogProps
 * @property {Habit[]} habits - Список привычек пользователя.
 * @property {React.ReactNode} [trigger] - Триггер для открытия диалогового окна.
 */
interface DailyReflectionDialogProps {
  habits: Habit[];
  trigger?: React.ReactNode;
}

/**
 * Компонент диалогового окна для ежедневных заметок.
 * @param {DailyReflectionDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} - Диалоговое окно для ежедневных заметок.
 */
export function DailyReflectionDialog({ habits, trigger }: DailyReflectionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  const template = useMemo(() => {
    const today = new Date();
    const weekday = today.toLocaleString('ru-RU', { weekday: 'long' }) as Day;
    const todaysHabits = (habits || []).filter(h => !h.days || h.days.length === 0 || h.days.includes(weekday));
    const completed = todaysHabits.filter(h => !!h.completed);
    const notCompleted = todaysHabits.filter(h => !h.completed);
    let t = `📅 Заметка за ${format(today, 'yyyy-MM-dd')}\n`;
    if (completed.length) {
      t += `\n✅ ВЫПОЛНЕНО:\n\n`;
      for (const h of completed) {
        t += `${h.name}\n________________________________\n\n`;
      }
    }
    if (notCompleted.length) {
      t += `\n❌ НЕ ВЫПОЛНЕНО:\n\n`;
      for (const h of notCompleted) {
        t += `${h.name}\n________________________________\n\n`;
      }
    }
    return t.trim();
  }, [habits]);

  useEffect(() => {
    if (open) setText(template);
  }, [open, template]);

  /**
   * Сохраняет ежедневную заметку.
   */
  const handleSave = async () => {
    if (!user || !firestore) return;
    const dateStr = format(new Date(), 'yyyy-MM-dd');
    try {
      setBusy(true);
      const col = collection(firestore, `users/${user.uid}/dailyReflections`);
      await setDoc(doc(col, dateStr), {
        date: dateStr,
        rawText: text,
        parsedEntries: [],
        manualCorrections: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      toast({ title: 'Заметка сохранена', description: 'Ваша ежедневная заметка была сохранена.' });
      setOpen(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Ошибка', description: 'Не удалось сохранить заметку' });
    } finally {
      setBusy(false);
    }
  };

  const dialogTrigger = trigger ?? (
    <Button variant="secondary" size="sm">Вечерняя заметка</Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{dialogTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Ежедневная заметка</DialogTitle>
          <DialogDescription>Напишите свои заметки за сегодня. Мы разберем их позже с помощью AI.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={14} />
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)} aria-label="Отменить заметку" aria-disabled={busy}>Отмена</Button>
          <Button type="button" onClick={handleSave} disabled={busy} aria-busy={busy} aria-label="Сохранить заметку">{busy ? 'Сохранение…' : 'Сохранить'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
