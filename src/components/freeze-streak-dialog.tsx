'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Snowflake, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addDays, format } from 'date-fns';

/**
 * @fileoverview Диалоговое окно для "заморозки" серии выполнения привычки.
 */

/**
 * @interface FreezeStreakDialogProps
 * @description Свойства для компонента FreezeStreakDialog.
 */
interface FreezeStreakDialogProps {
  /** Определяет, открыто ли диалоговое окно. */
  open: boolean;
  /** Callback-функция при изменении состояния открытости. */
  onOpenChange: (open: boolean) => void;
  /** Название привычки, серию которой нужно заморозить. */
  habitName: string;
  /** Текущая длина серии. */
  currentStreak: number;
  /** Callback-функция, вызываемая при подтверждении заморозки. */
  onConfirm: (untilDate: string) => Promise<void>;
}

/**
 * Компонент диалогового окна, позволяющий пользователю временно "заморозить"
 * серию выполнения привычки, чтобы не прерывать ее во время отпуска или болезни.
 * @param {FreezeStreakDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function FreezeStreakDialog({
  open,
  onOpenChange,
  habitName,
  currentStreak,
  onConfirm,
}: FreezeStreakDialogProps) {
  const { toast } = useToast();
  const [preset, setPreset] = useState<string>('3');
  const [customDate, setCustomDate] = useState('');
  const [busy, setBusy] = useState(false);

  /**
   * Рассчитывает дату окончания заморозки на основе выбора пользователя.
   * @returns {string} - Дата в формате 'yyyy-MM-dd'.
   */
  const calculateUntilDate = (): string => {
    if (preset === 'custom') {
      return customDate;
    }
    const days = parseInt(preset);
    return format(addDays(new Date(), days), 'yyyy-MM-dd');
  };

  /**
   * Обрабатывает подтверждение заморозки серии.
   * Валидирует дату и вызывает onConfirm callback.
   */
  const handleConfirm = async () => {
    const untilDate = calculateUntilDate();
    if (!untilDate) {
      toast({
        title: 'Неверная дата',
        description: 'Пожалуйста, выберите действительный период заморозки',
        variant: 'destructive',
      });
      return;
    }

    const until = new Date(untilDate);
    const now = new Date();
    if (until <= now) {
      toast({
        title: 'Неверная дата',
        description: 'Дата заморозки должна быть в будущем',
        variant: 'destructive',
      });
      return;
    }

    const diffDays = Math.ceil((until.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays > 14) {
      toast({
        title: 'Максимальный период заморозки',
        description: 'Вы можете заморозить серию максимум на 14 дней',
        variant: 'destructive',
      });
      return;
    }

    setBusy(true);
    try {
      await onConfirm(untilDate);
      toast({
        title: 'Серия заморожена',
        description: `Серия для "${habitName}" заморожена до ${format(until, 'd MMM, yyyy')}`,
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось заморозить серию',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  const untilDate = calculateUntilDate();
  const daysCount = untilDate 
    ? Math.ceil((new Date(untilDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-blue-600" />
            Заморозить серию
          </DialogTitle>
          <DialogDescription>
            Приостановите отслеживание для <strong>{habitName}</strong>, не прерывая вашу серию
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Заморозка идеальна для отпуска, болезни или запланированных перерывов. Ваша серия из {currentStreak} дней будет сохранена.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <Label>Период заморозки</Label>
            <RadioGroup value={preset} onValueChange={setPreset}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3" id="3days" />
                <Label htmlFor="3days" className="cursor-pointer font-normal">
                  3 дня (Выходные)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7" id="7days" />
                <Label htmlFor="7days" className="cursor-pointer font-normal">
                  7 дней (Неделя)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="14" id="14days" />
                <Label htmlFor="14days" className="cursor-pointer font-normal">
                  14 дней (Максимум)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom" className="cursor-pointer font-normal">
                  Выбрать дату
                </Label>
              </div>
            </RadioGroup>

            {preset === 'custom' && (
              <div className="ml-6">
                <Label htmlFor="customDate" className="text-xs">
                  Заморозить до
                </Label>
                <Input
                  id="customDate"
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  min={format(addDays(new Date(), 1), 'yyyy-MM-dd')}
                  max={format(addDays(new Date(), 14), 'yyyy-MM-dd')}
                  className="mt-1"
                />
              </div>
            )}
          </div>

          {untilDate && daysCount > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm font-medium text-blue-900">
                Серия будет заморожена на {daysCount} {daysCount > 1 ? 'дней' : 'день'}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                До {format(new Date(untilDate), 'EEEE, d MMMM, yyyy г.')}
              </p>
            </div>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>• Замороженные дни не будут ни засчитываться, ни прерывать серию</p>
            <p>• Вы можете использовать заморозку один раз в квартал</p>
            <p>• Максимальный период заморозки составляет 14 дней</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={busy || !untilDate || daysCount <= 0}>
            {busy ? 'Заморозка...' : 'Заморозить серию'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
