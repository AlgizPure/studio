'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc } from 'firebase/firestore';
import type { HabitLog, AnalysisSystem } from '@/lib/types';
import { generateInsightsFromLogs } from '@/lib/insights';

/**
 * @fileoverview Диалоговое окно для генерации инсайтов на основе данных о привычках с помощью AI.
 */

/**
 * Компонент диалогового окна, который инициирует процесс генерации инсайтов.
 * Он использует данные из логов привычек и активных аналитических систем пользователя
 * для создания полезных наблюдений и рекомендаций, которые затем сохраняются в Firestore.
 * @returns {JSX.Element} React-компонент.
 */
export function InsightsDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  // Запрос на получение логов привычек
  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: logs } = useCollection<HabitLog>(logsQuery);

  // Запрос на получение активных аналитических систем
  const activeSystemsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/activeSystems`) : null),
    [user, firestore]
  );
  const { data: activeSystems } = useCollection<AnalysisSystem>(activeSystemsQuery);

  const safeLogs: HabitLog[] = (logs ?? []) as unknown as HabitLog[];
  const safeActiveSystems: AnalysisSystem[] = (activeSystems ?? []) as unknown as AnalysisSystem[];

  /**
   * Обрабатывает запрос на генерацию инсайтов.
   * Вызывает AI-функцию и сохраняет результаты в Firestore.
   */
  const handleGenerate = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const insights = await generateInsightsFromLogs(safeLogs, safeActiveSystems);
      
      if (insights.length === 0) {
        toast({
          title: 'Нет инсайтов',
          description: 'На данный момент в ваших логах не найдено полезных инсайтов.',
        });
        return;
      }

      // Сохранение в Firestore
      const col = collection(firestore, `users/${user.uid}/habitInsights`);
      for (const ins of insights) {
        await addDoc(col, {
          date: ins.date,
          systemId: ins.systemId,
          type: ins.type,
          priority: ins.priority,
          title: ins.title,
          description: ins.description,
          data: ins.data || {},
          createdAt: ins.createdAt,
        });
      }
      
      toast({
        title: 'Инсайты сгенерированы',
        description: `Создано ${insights.length} инсайт(ов) на основе ваших логов.`,
      });
      setOpen(false);
    } catch (error: any) {
      console.error('[InsightsDialog] Ошибка генерации:', error);
      toast({
        title: 'Ошибка',
        description: error?.message || 'Не удалось сгенерировать инсайты',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Сгенерировать инсайты</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>AI Инсайты</DialogTitle>
          <DialogDescription>
            Сгенерируйте полезные инсайты на основе ваших логов привычек и активных систем анализа.
            {process.env.NEXT_PUBLIC_AI_MOCK === '1' && (
              <span className="block mt-1 text-xs text-muted-foreground">Включен режим имитации</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>Будет проанализировано {safeLogs.length} лог(ов) и {safeActiveSystems.length} активная(ых) система(ы).</p>
          <p>Инсайты будут сохранены в вашем аккаунте и могут быть просмотрены позже.</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
          <Button type="button" onClick={handleGenerate} disabled={busy}>{busy ? 'Генерация...' : 'Сгенерировать'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
