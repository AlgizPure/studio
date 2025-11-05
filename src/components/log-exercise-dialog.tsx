'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Exercise } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

/**
 * @fileoverview Диалоговое окно для логирования выполнения упражнения с параметрами.
 */

/**
 * @interface LogExerciseDialogProps
 * @description Свойства для компонента LogExerciseDialog.
 */
interface LogExerciseDialogProps {
  /** Упражнение, для которого ведется лог. */
  exercise: Exercise;
  /** Callback-функция, вызываемая при сохранении лога. */
  onLog: (exercise: Exercise, values: { [key: string]: number }) => void;
  /** Флаг, указывающий, завершено ли уже упражнение. */
  isCompleted: boolean;
}

/**
 * Компонент диалогового окна для записи результатов выполнения упражнения.
 * Динамически создает поля ввода на основе параметров, определенных для упражнения.
 * @param {LogExerciseDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function LogExerciseDialog({ exercise, onLog, isCompleted }: LogExerciseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Динамическое создание схемы валидации на основе параметров упражнения
  const schema = z.object(
    (exercise.parameters || []).reduce((acc, param) => {
      acc[param.id] = z.preprocess((val) => Number(val), z.number().min(0, 'Значение не может быть отрицательным'));
      return acc;
    }, {} as { [key: string]: z.ZodType<any, any> })
  );

  type FormValues = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: (exercise.parameters || []).reduce((acc, param) => {
      acc[param.id] = param.defaultValue;
      return acc;
    }, {} as any),
  });

  /**
   * Обрабатывает отправку формы с данными лога.
   * @param {FormValues} data - Данные из формы.
   */
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    try {
      onLog(exercise, data);
      toast({
        title: 'Упражнение записано!',
        description: `${exercise.name} было отмечено как выполненное.`,
      });
      setIsOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Произошла ошибка при записи упражнения.',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {isCompleted ? (
            <Button variant="ghost" size="icon" className="mr-4 text-green-500 cursor-not-allowed">
              <CheckCircle2 />
            </Button>
        ) : (
            <Button variant="ghost" size="icon" className="mr-4">
              <BookOpenCheck />
            </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="font-headline">Запись: {exercise.name}</DialogTitle>
            <DialogDescription>Введите значения для сегодняшней тренировки. Ваши изменения будут сохранены.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {(exercise.parameters || []).map((param) => (
              <div key={param.id} className="space-y-2">
                <Label htmlFor={param.id}>
                  {param.name} ({param.unit})
                </Label>
                <Input
                  id={param.id}
                  type="number"
                  step="any"
                  {...register(param.id)}
                />
                {errors[param.id] && <p className="text-sm text-destructive">{errors[param.id]?.message as string}</p>}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Отмена</Button>
            <Button type="submit">Записать и завершить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
