'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

/**
 * @fileoverview Диалоговое окно для сбора обратной связи после тренировки.
 */

const TAGS = [
  { id: 'strong', label: '💪 Сильный' },
  { id: 'tired', label: '😰 Устал' },
  { id: 'pain', label: '⚠️ Боль' },
  { id: 'poor_sleep', label: '😴 Плохой сон' },
  { id: 'great_pump', label: '🔥 Отличный памп' },
  { id: 'low_motivation', label: '😕 Низкая мотивация' },
] as const;

/**
 * Свойства для компонента WorkoutFeedbackDialog.
 * @interface WorkoutFeedbackDialogProps
 * @property {boolean} open - Определяет, открыто ли диалоговое окно.
 * @property {(v: boolean) => void} onOpenChange - Функция обратного вызова при изменении состояния открытости.
 * @property {(feedback: string, tags: string[]) => void} onSubmit - Функция обратного вызова при отправке данных.
 * @property {string} [workoutName] - Название тренировки.
 */
interface WorkoutFeedbackDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (feedback: string, tags: string[]) => void;
  workoutName?: string;
}

/**
 * Компонент диалогового окна для обратной связи по тренировке.
 * @param {WorkoutFeedbackDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} - Диалоговое окно для обратной связи по тренировке.
 */
export function WorkoutFeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  workoutName,
}: WorkoutFeedbackDialogProps) {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSave = () => {
    onSubmit(text.trim(), selected);
    setText('');
    setSelected([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Как прошла ваша тренировка?</DialogTitle>
          <DialogDescription>
            Необязательная обратная связь помогает улучшить рекомендации{workoutName ? ` для ${workoutName}` : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button key={t.id} type="button" onClick={() => toggle(t.id)}>
              <Badge variant={selected.includes(t.id) ? 'default' : 'secondary'}>{t.label}</Badge>
            </button>
          ))}
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Например, сегодня чувствовал себя сильным, жим лежа шел легко..."
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Пропустить</Button>
          <Button onClick={handleSave}>Сохранить отзыв</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
