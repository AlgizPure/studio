'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getOptimizedRoutine } from '@/app/actions';
import { ScrollArea } from './ui/scroll-area';
import type { AIRoutineOptimizerOutput } from '@/ai/flows/ai-routine-optimizer';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { writeBatch, doc, collection } from 'firebase/firestore';
import type { Exercise, Habit } from '@/lib/types';
import { errorEmitter, FirestorePermissionError } from '@/firebase';

/**
 * @fileoverview Диалоговое окно для оптимизации расписания тренировок с помощью AI.
 */

/**
 * @description Схема валидации для формы AI-оптимизатора с использованием Zod.
 */
const schema = z.object({
  goals: z.string().min(10, 'Пожалуйста, опишите ваши цели более подробно.'),
  availability: z.string().min(10, 'Пожалуйста, опишите вашу доступность более подробно.'),
  preferredExercises: z.string().min(10, 'Пожалуйста, перечислите несколько предпочитаемых упражнений.'),
  customExercises: z.string().optional(),
});

/**
 * @typedef {z.infer<typeof schema>} FormFields
 * @description Тип, представляющий поля формы, выведенный из схемы Zod.
 */
type FormFields = z.infer<typeof schema>;

/**
 * Компонент диалогового окна AI-оптимизатора расписания.
 * Позволяет пользователю описать свои цели и предпочтения, на основе которых AI создает
 * и предлагает сбалансированное недельное расписание тренировок и привычек.
 * @returns {JSX.Element} React-компонент.
 */
export function AiOptimizerDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [suggestion, setSuggestion] = useState<AIRoutineOptimizerOutput | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const exercisesQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/exercises`) : null),
    [user, firestore]
  );
  const { data: exercises } = useCollection<Exercise>(exercisesQuery);
  
  const habitsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habits`) : null),
    [user, firestore]
  );
  const { data: habits } = useCollection<Habit>(habitsQuery);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      goals: 'Развить скорость и рельеф мышц, уменьшить жир на животе.',
      availability: '6 раз в неделю, обычно в первой половине дня.',
      preferredExercises: 'Силовые тренировки (Пн, Ср, Пт), биодинамика/функциональные паттерны (Вт, Чт, Сб), бег по пересеченной местности, статические упражнения (цикл Александра Засса).',
      customExercises: 'Упражнения с TRX, упражнения с собственным весом для путешествий.'
    }
  });

  /**
   * Обрабатывает отправку формы для получения оптимизированного расписания.
   * @param {FormFields} data - Данные из формы.
   */
  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    setIsLoading(true);
    setSuggestion(null);
    const result = await getOptimizedRoutine(data);
    setIsLoading(false);

    if (result.success && result.data) {
      setSuggestion(result.data);
    } else {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: result.error || 'Произошла неизвестная ошибка.',
      });
    }
  };
  
  /**
   * Применяет предложенное AI расписание, обновляя дни занятий для существующих
   * упражнений и привычек пользователя.
   */
  const handleApplySchedule = async () => {
    if (!suggestion || !suggestion.structuredSchedule || !user || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Нет расписания для применения или пользователь не авторизован.',
      });
      return;
    }
    setIsApplying(true);
    
    try {
        const batch = writeBatch(firestore);
        const allUserActivities = [
            ...(exercises || []).map(ex => ({...ex, type: 'Workout'})),
            ...(habits || []).map(h => ({...h, type: 'Habit'}))
        ];

        const activitiesToUpdate: { [key: string]: { days: string[], time?: string, type: 'Workout' | 'Habit', data: any } } = {};

        for (const item of suggestion.structuredSchedule) {
            if (!activitiesToUpdate[item.activityName]) {
                activitiesToUpdate[item.activityName] = { days: [], time: item.time, type: item.activityType, data: {} };
            }
            activitiesToUpdate[item.activityName].days.push(item.day);
            const updateData: any = { days: activitiesToUpdate[item.activityName].days };
            if(item.activityType === 'Workout') {
                updateData.time = item.time;
            }
            activitiesToUpdate[item.activityName].data = updateData;
        }
        
        for (const activityName in activitiesToUpdate) {
            const details = activitiesToUpdate[activityName];
            const existingActivity = allUserActivities.find(act => act.name === activityName);

            if (existingActivity && existingActivity.id) {
                const collectionName = existingActivity.type === 'Workout' ? 'exercises' : 'habits';
                const docRef = doc(firestore, `users/${user.uid}/${collectionName}`, existingActivity.id);
                batch.update(docRef, details.data);
            }
        }

        await batch.commit().catch(e => {
            const permissionError = new FirestorePermissionError({
                path: `users/${user.uid}`,
                operation: 'write',
                requestResourceData: activitiesToUpdate
            });
            errorEmitter.emit('permission-error', permissionError);
            throw e; // Пробрасываем ошибку для внешнего catch
        });

        toast({ title: "Расписание применено!", description: "Ваше новое расписание теперь активно."});
        handleOpenChange(false);

    } catch (error) {
        toast({
            variant: 'destructive',
            title: 'Ошибка применения расписания',
            description: 'Произошла непредвиденная ошибка при обновлении вашего расписания.',
        });
    } finally {
        setIsApplying(false);
    }
  }

  /**
   * Управляет состоянием открытия/закрытия диалогового окна.
   * @param {boolean} open - Новое состояние.
   */
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      reset();
      setSuggestion(null);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Wand2 className="mr-2 h-4 w-4" />
          AI-оптимизатор
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="text-primary"/>
            AI-оптимизатор расписания
            </DialogTitle>
          <DialogDescription>
            Опишите ваши фитнес-предпочтения, и AI создаст для вас сбалансированное недельное расписание.
          </DialogDescription>
        </DialogHeader>

        {suggestion ? (
           <div className="space-y-4">
            <h3 className="font-semibold">Предложенное недельное расписание:</h3>
            <ScrollArea className="h-72 w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap font-body">{suggestion.textualDescription}</pre>
            </ScrollArea>
            <DialogFooter>
                <Button variant="outline" onClick={() => setSuggestion(null)}>Назад к форме</Button>
                <Button onClick={handleApplySchedule} disabled={isApplying}>
                  {isApplying ? 'Применение...' : 'Применить расписание'}
                </Button>
            </DialogFooter>
           </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goals">Основные цели</Label>
              <Textarea id="goals" {...register('goals')} rows={3} />
              {errors.goals && <p className="text-sm text-destructive">{errors.goals.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Доступность</Label>
              <Textarea id="availability" {...register('availability')} rows={2} />
              {errors.availability && <p className="text-sm text-destructive">{errors.availability.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredExercises">Предпочтительные и пользовательские упражнения</Label>
              <Textarea id="preferredExercises" {...register('preferredExercises')} rows={4} />
              {errors.preferredExercises && <p className="text-sm text-destructive">{errors.preferredExercises.message}</p>}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Генерация...' : 'Сгенерировать расписание'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
