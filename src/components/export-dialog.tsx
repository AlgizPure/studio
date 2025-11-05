'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore } from '@/firebase/provider';
import { CLAUDE_INSTRUCTIONS_MD } from '@/lib/claude';
import { buildHabitExport } from '@/lib/export';

/**
 * @fileoverview Диалоговое окно для экспорта данных о привычках для AI-анализа.
 */

/**
 * Компонент диалогового окна, который позволяет пользователю экспортировать свои данные
 * о привычках в формате JSON. Предоставляет опцию фильтрации данных по дате.
 * Также включает кнопку для копирования инструкций для использования с Claude AI.
 * @returns {JSX.Element} React-компонент.
 */
export function ExportDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  /**
   * Обрабатывает экспорт данных о привычках в JSON файл.
   */
  const handleExport = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const data = await buildHabitExport({ firestore, userId: user.uid, dateRange: (from && to) ? { from, to } : undefined });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit_export_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  /**
   * Копирует инструкции для Claude AI в буфер обмена.
   */
  const handleCopyClaude = async () => {
    try {
      await navigator.clipboard.writeText(CLAUDE_INSTRUCTIONS_MD);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (error) {
      console.error('Не удалось скопировать в буфер обмена:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Экспорт</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Экспорт для AI-анализа</DialogTitle>
          <DialogDescription>Загрузите JSON HabitExportV1. При необходимости установите диапазон дат.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">С</Label>
            <Input type="date" className="col-span-3" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">По</Label>
            <Input type="date" className="col-span-3" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Отмена</Button>
          <Button type="button" variant="secondary" onClick={handleCopyClaude}>{copied ? 'Скопировано!' : 'Инструкции для Claude'}</Button>
          <Button type="button" onClick={handleExport} disabled={busy}>{busy ? 'Создание...' : 'Загрузить JSON'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
