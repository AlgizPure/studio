'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

/**
 * @fileoverview Модальное окно для логирования количественных привычек или привычек, измеряемых по времени.
 */

/**
 * Свойства для компонента HabitLogModal.
 * @interface HabitLogModalProps
 * @property {boolean} open - Определяет, открыто ли модальное окно.
 * @property {(open: boolean) => void} onOpenChange - Функция обратного вызова при изменении состояния открытости.
 * @property {string} habitName - Название привычки.
 * @property {('quantity'|'duration')} type - Тип привычки.
 * @property {string} [unitPlaceholder] - Заполнитель для единицы измерения.
 * @property {(value: number, unit?: string) => void} onSubmit - Функция обратного вызова при отправке данных.
 */
interface HabitLogModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  habitName: string;
  type: 'quantity' | 'duration';
  unitPlaceholder?: string;
  onSubmit: (value: number, unit?: string) => void;
}

/**
 * Компонент модального окна для логирования привычек.
 * @param {HabitLogModalProps} props - Свойства компонента.
 * @returns {JSX.Element} - Модальное окно для логирования привычек.
 */
export function HabitLogModal({ open, onOpenChange, habitName, type, unitPlaceholder, onSubmit }: HabitLogModalProps) {
  const [value, setValue] = useState<string>('');
  const [unit, setUnit] = useState<string>('');

  const handleSubmit = () => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed < 0) return;
    onSubmit(parsed, unit || undefined);
    setValue('');
    setUnit('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Записать {habitName}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="log-value" className="text-right">
              {type === 'quantity' ? 'Значение' : 'Минуты'}
            </Label>
            <div className="col-span-3 grid grid-cols-3 gap-2">
              <Input id="log-value" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder={type === 'quantity' ? 'например, 2000' : 'например, 20'} />
              <div className="col-span-2">
                <Input id="log-unit" value={unit} onChange={(e) => setUnit(e.target.value)} placeholder={unitPlaceholder || (type === 'quantity' ? 'мл, км, шаги' : 'мин')} />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Отмена</Button>
          <Button type="button" onClick={handleSubmit}>Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
