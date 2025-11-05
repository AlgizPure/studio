'use client';

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
import { Plus } from 'lucide-react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Habit, Day, HabitCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from './ui/select';
import { useFirestore, useMemoFirebase, useUser } from '@/firebase/provider';
import { collection } from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';

/**
 * @fileoverview Диалоговое окно для добавления и редактирования привычек.
 */

const daysOfWeek: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * @description Схема валидации для формы привычки с использованием Zod.
 */
const habitSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  categoryId: z.string().min(1, 'Категория обязательна'),
  goal: z.string().optional(),
  days: z.array(z.string()).optional(),
  usePomodoro: z.boolean().default(false).optional(),
  // Поля V2 (опциональные, для обратной совместимости)
  type: z.enum(['boolean', 'quantity', 'duration']).default('boolean').optional(),
  targetValue: z.number().min(0).optional(),
  targetUnit: z.string().optional(),
  reminderTimes: z.array(z.string()).default([]).optional(),
  stackingEnabled: z.boolean().default(false).optional(),
  stackingTriggerId: z.string().optional(),
  stackingPosition: z.enum(['before', 'after']).optional(),
  stackingDelay: z.number().min(0).optional(),
  // теги/приоритет/сложность
  tags: z.array(z.string()).default([]).optional(),
  priority: z.number().min(1).max(5).optional(),
  difficulty: z.enum(['easy','medium','hard']).optional(),
});

/**
 * @typedef {z.infer<typeof habitSchema>} HabitFormValues
 * @description Тип, представляющий значения формы привычки, выведенный из схемы Zod.
 */
type HabitFormValues = z.infer<typeof habitSchema>;

/**
 * @interface AddHabitDialogProps
 * @description Свойства для компонента AddHabitDialog.
 */
interface AddHabitDialogProps {
  /** Callback-функция, вызываемая при добавлении новой привычки. */
  onHabitAdd: (habit: Omit<Habit, 'id'>) => void;
  /** Callback-функция, вызываемая при обновлении существующей привычки. */
  onHabitUpdate?: (habit: Habit) => void;
  /** Callback-функция, вызываемая при удалении привычки. */
  onHabitDelete?: (habitId: string) => void;
  /** Объект привычки для редактирования. Если он предоставлен, компонент работает в режиме редактирования. */
  habitToEdit?: Habit;
  /** Пользовательский триггер для открытия диалогового окна. */
  trigger?: React.ReactNode;
  /** Функция для открытия диалогового окна управления категориями. */
  openManageCategories: () => void;
  /** Список доступных категорий привычек. */
  categories: HabitCategory[];
  /** Список существующих привычек (для настройки стекинга). */
  habits?: Habit[];
}

/**
 * Компонент диалогового окна для создания новой или редактирования существующей привычки.
 * @param {AddHabitDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function AddHabitDialog({ onHabitAdd, onHabitUpdate, onHabitDelete, habitToEdit, trigger, openManageCategories, categories, habits = [] }: AddHabitDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!habitToEdit;
  const { user } = useUser();
  const firestore = useFirestore();
  const activeQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/activeSystems`) : null),
    [user, firestore]
  );
  const { data: activeSystems } = useCollection<any>(activeQuery);

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<HabitFormValues>({
    resolver: zodResolver(habitSchema),
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && habitToEdit) {
        setValue('name', habitToEdit.name);
        setValue('categoryId', habitToEdit.categoryId || '');
        setValue('goal', habitToEdit.goal);
        setValue('days', habitToEdit.days || []);
        setValue('usePomodoro', !!habitToEdit.pomodoro);
      } else {
          reset({
              name: '',
              categoryId: '',
              goal: '',
              days: [],
              usePomodoro: false,
              type: 'boolean',
              targetValue: undefined,
              targetUnit: undefined,
              reminderTimes: [],
              stackingEnabled: false,
              stackingTriggerId: undefined,
              stackingPosition: undefined,
              stackingDelay: undefined,
              tags: [],
              priority: 3,
              difficulty: 'medium',
          });
      }
    }
  }, [isEditMode, habitToEdit, setValue, reset, isOpen]);


  const watchedDays = watch('days') || [];

  /**
   * Обрабатывает изменение состояния чекбокса "Все дни".
   * @param {boolean | 'indeterminate'} checked - Состояние чекбокса.
   */
  const handleAllDaysChange = (checked: boolean | 'indeterminate') => {
    if (checked === true) {
      setValue('days', daysOfWeek, { shouldValidate: true });
    } else {
      setValue('days', [], { shouldValidate: true });
    }
  };

  /**
   * Обрабатывает отправку формы.
   * @param {HabitFormValues} data - Данные формы.
   */
  const onSubmit: SubmitHandler<HabitFormValues> = (data) => {
    try {
      const contextParams: Record<string, Record<string, any>> = {};
      (activeSystems || []).forEach((sys) => {
        const sysParams: Record<string, any> = {};
        Object.keys((data as any) || {}).forEach((k) => {
          const prefix = `sys_${sys.systemId}_`;
          if (k.startsWith(prefix)) {
            const pid = k.substring(prefix.length);
            (sysParams as any)[pid] = (data as any)[k];
          }
        });
        if (Object.keys(sysParams).length > 0) {
          contextParams[sys.systemId] = sysParams;
        }
      });
      if(isEditMode && habitToEdit && onHabitUpdate) {
          const updatedHabit: Habit = {
              ...habitToEdit,
              name: data.name,
              categoryId: data.categoryId,
              goal: data.goal,
              days: data.days as Day[],
              pomodoro: data.usePomodoro ? (habitToEdit.pomodoro || { cycles: 1 }) : undefined,
          };
          const updatedWithV2 = {
            ...updatedHabit,
            ...(data.type && { type: data.type }),
            ...(data.type === 'quantity' && data.targetValue != null && {
              target: { type: 'quantity', value: data.targetValue, unit: data.targetUnit || undefined },
            }),
            ...(data.type === 'duration' && data.targetValue != null && {
              target: { type: 'duration', value: data.targetValue, unit: data.targetUnit || 'min' },
            }),
            ...(data.reminderTimes && data.reminderTimes.length > 0 && {
              reminders: [{ id: 'default', times: data.reminderTimes }],
            }),
            ...((data.stackingEnabled && data.stackingTriggerId && data.stackingPosition) && {
              stackingRule: {
                triggerId: data.stackingTriggerId,
                position: data.stackingPosition,
                ...(typeof data.stackingDelay === 'number' ? { delay: data.stackingDelay } : {}),
              },
            }),
            ...(Object.keys(contextParams).length > 0 && { contextParams }),
            ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
            ...(typeof data.priority === 'number' && { priority: data.priority }),
            ...(data.difficulty && { difficulty: data.difficulty }),
          } as any;
          onHabitUpdate(updatedWithV2 as Habit);
          toast({
              title: 'Привычка обновлена',
              description: `${data.name} была обновлена.`,
          });
      } else {
          const newHabit: Omit<Habit, 'id'> = {
            name: data.name,
            categoryId: data.categoryId,
            goal: data.goal,
            completed: false,
            days: data.days as Day[],
            ...(data.usePomodoro && { pomodoro: { cycles: 1 } }),
          };
          const newWithV2 = {
            ...newHabit,
            ...(data.type && { type: data.type }),
            ...(data.type === 'quantity' && data.targetValue != null && {
              target: { type: 'quantity', value: data.targetValue, unit: data.targetUnit || undefined },
            }),
            ...(data.type === 'duration' && data.targetValue != null && {
              target: { type: 'duration', value: data.targetValue, unit: data.targetUnit || 'min' },
            }),
            ...(data.reminderTimes && data.reminderTimes.length > 0 && {
              reminders: [{ id: 'default', times: data.reminderTimes }],
            }),
            ...((data.stackingEnabled && data.stackingTriggerId && data.stackingPosition) && {
              stackingRule: {
                triggerId: data.stackingTriggerId,
                position: data.stackingPosition,
                ...(typeof data.stackingDelay === 'number' ? { delay: data.stackingDelay } : {}),
              },
            }),
            ...(Object.keys(contextParams).length > 0 && { contextParams }),
            ...(data.tags && data.tags.length > 0 && { tags: data.tags }),
            ...(typeof data.priority === 'number' && { priority: data.priority }),
            ...(data.difficulty && { difficulty: data.difficulty }),
          } as any;
          onHabitAdd(newWithV2 as Omit<Habit, 'id'>);
          toast({
            title: 'Привычка добавлена',
            description: `${data.name} была добавлена в ваш список.`,
          });
      }
      setIsOpen(false);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Произошла ошибка при сохранении привычки.'
      });
    }
  };

  /**
   * Обрабатывает удаление привычки.
   */
  const handleDelete = () => {
    if(isEditMode && habitToEdit && onHabitDelete) {
      try {
        onHabitDelete(habitToEdit.id);
        toast({
            title: 'Привычка удалена',
            description: `${habitToEdit.name} была удалена.`,
            variant: 'destructive',
        });
        setIsOpen(false);
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'Ошибка',
          description: 'Произошла ошибка при удалении привычки.'
        });
      }
    }
  };

  /**
   * Обрабатывает изменение категории.
   * @param {string} value - Новое значение категории.
   */
  const handleCategoryChange = (value: string) => {
    if (value === 'add-new') {
        setIsOpen(false);
        openManageCategories();
    } else {
        setValue('categoryId', value, { shouldValidate: true });
    }
  }

  const dialogTrigger = trigger ? trigger : (
    <Button variant="ghost" size="sm">
      <Plus className="mr-2 h-4 w-4" />
      Новая
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Редактировать привычку' : 'Добавить привычку'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Обновите детали вашей привычки.' : "Добавьте новую привычку в ваш список. Нажмите 'Сохранить', когда закончите."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Название
              </Label>
              <Input id="name" placeholder="например, Пить воду" className="col-span-3" {...register('name')} />
            </div>
            {errors.name && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.name.message}</p>}
            
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="categoryId" className="text-right">
                    Категория
                </Label>
                <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                        <Select onValueChange={handleCategoryChange} value={field.value}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Выберите категорию" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Категории привычек</SelectLabel>
                                    <SelectItem value="add-new">
                                        <span className="flex items-center"><Plus className="mr-2 h-4 w-4" /> Добавить новую категорию...</span>
                                    </SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    )}
                />
            </div>
            {errors.categoryId && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.categoryId.message}</p>}


            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="goal" className="text-right">
                Цель
              </Label>
              <Input id="goal" placeholder="например, 8 стаканов" className="col-span-3" {...register('goal')} />
            </div>
            {errors.goal && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.goal.message}</p>}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="type" className="text-right">
              Тип
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(v) => field.onChange(v)} value={field.value || 'boolean'}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Выберите тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Тип привычки</SelectLabel>
                      <SelectItem value="boolean">Да/Нет</SelectItem>
                      <SelectItem value="quantity">Количество</SelectItem>
                      <SelectItem value="duration">Длительность</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <Controller
            name="type"
            control={control}
            render={({ field }) => {
              const t = field.value || 'boolean';
              if (t === 'quantity' || t === 'duration') {
                return (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="targetValue" className="text-right">
                      {t === 'quantity' ? 'Цель' : 'Минуты'}
                    </Label>
                    <div className="col-span-3 grid grid-cols-3 gap-2">
                      <Input type="number" step="1" id="targetValue" placeholder={t === 'quantity' ? 'например, 2000' : 'например, 20'} {...register('targetValue', { valueAsNumber: true })} />
                      <div className="col-span-2">
                        <Input id="targetUnit" placeholder={t === 'quantity' ? 'например, мл, км, шаги' : 'мин'} {...register('targetUnit')} />
                      </div>
                    </div>
                  </div>
                );
              }
              return <div className="hidden" />;
            }}
          />

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Напоминания</Label>
            <div className="col-span-3 space-y-2">
              <Controller
                name="reminderTimes"
                control={control}
                render={({ field }) => (
                  <div className="space-y-2">
                    {(field.value || []).map((t: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          value={t}
                          placeholder="HH:MM"
                          onChange={(e) => {
                            const next = [...(field.value || [])];
                            next[idx] = e.target.value;
                            field.onChange(next);
                          }}
                        />
                        <Button type="button" variant="ghost" onClick={() => {
                          const next = [...(field.value || [])];
                          next.splice(idx, 1);
                          field.onChange(next);
                        }}>Удалить</Button>
                      </div>
                    ))}
                    <Button type="button" variant="secondary" onClick={() => field.onChange([...(field.value || []), '08:00'])}>+ Добавить время</Button>
                  </div>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Теги</Label>
            <Controller
              name="tags"
              control={control}
              render={({ field }) => (
                <div className="col-span-3 space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {(field.value || []).map((t: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 px-2 py-1 rounded bg-muted text-xs">
                        <span>#{t}</span>
                        <Button type="button" size="sm" variant="ghost" onClick={() => {
                          const next = [...(field.value || [])];
                          next.splice(idx,1);
                          field.onChange(next);
                        }}>x</Button>
                      </div>
                    ))}
                  </div>
                  <Input placeholder="добавьте тег и нажмите Enter" onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = (e.target as HTMLInputElement).value.trim();
                      if (!val) return;
                      field.onChange([...(field.value || []), val]);
                      (e.target as HTMLInputElement).value = '';
                    }
                  }} />
                </div>
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Приоритет</Label>
            <Input className="col-span-3" type="number" step="1" min={1} max={5} {...register('priority', { valueAsNumber: true })} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Сложность</Label>
            <Controller
              name="difficulty"
              control={control}
              render={({ field }) => (
                <Select onValueChange={(v)=>field.onChange(v)} value={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Выберите сложность" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="easy">Легко</SelectItem>
                      <SelectItem value="medium">Средне</SelectItem>
                      <SelectItem value="hard">Сложно</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">Стекинг</Label>
            <div className="col-span-3 space-y-2">
              <div className="flex items-center gap-2">
                <Controller
                  name="stackingEnabled"
                  control={control}
                  render={({ field }) => (
                    <Checkbox id="stackingEnabled" checked={!!field.value} onCheckedChange={field.onChange} />
                  )}
                />
                <Label htmlFor="stackingEnabled" className="text-sm font-normal">Включить стекинг привычек</Label>
              </div>
              <Controller
                name="stackingTriggerId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите триггер-привычку" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Привычки</SelectLabel>
                        {habits.map(h => (
                          <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <Controller
                name="stackingPosition"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="До или После" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="before">До</SelectItem>
                        <SelectItem value="after">После</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stackingDelay" className="text-right">Задержка (мин)</Label>
                <Input id="stackingDelay" className="col-span-3" type="number" step="1" placeholder="например, 5" {...register('stackingDelay', { valueAsNumber: true })} />
              </div>
            </div>
          </div>

          {(activeSystems || []).length > 0 && (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">Системы анализа</div>
              {(activeSystems || []).map((sys) => (
                <div key={sys.systemId} className="space-y-2 p-2 rounded border">
                  <div className="text-sm font-medium">{sys.systemId}</div>
                  {(sys.parameters || sys.habitParameters || []).map((p: any) => (
                    <div key={p.id} className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">{p.label || p.id}</Label>
                      <div className="col-span-3">
                        {p.type === 'select' ? (
                          <Controller
                            name={`sys_${sys.systemId}_${p.id}` as any}
                            control={control}
                            render={({ field }) => (
                              <Select onValueChange={(v) => field.onChange(v)} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue placeholder="Выберите" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectGroup>
                                    {(p.options || []).map((opt: any) => (
                                      <SelectItem key={opt.value} value={opt.value}>{opt.label || opt.value}</SelectItem>
                                    ))}
                                  </SelectGroup>
                                </SelectContent>
                              </Select>
                            )}
                          />
                        ) : p.type === 'number' || p.type === 'slider' ? (
                          <Input type="number" step="1" {...register(`sys_${sys.systemId}_${p.id}` as any, { valueAsNumber: true })} />
                        ) : p.type === 'checkbox' ? (
                          <Controller
                            name={`sys_${sys.systemId}_${p.id}` as any}
                            control={control}
                            render={({ field }) => (
                              <Checkbox checked={!!field.value} onCheckedChange={field.onChange} />
                            )}
                          />
                        ) : (
                          <Input {...register(`sys_${sys.systemId}_${p.id}` as any)} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Дни
              </Label>
              <Controller
                name="days"
                control={control}
                render={({ field }) => (
                  <div className="col-span-3 grid grid-cols-4 items-center gap-y-2">
                    {daysOfWeek.map((day) => (
                      <div key={day} className="flex items-center gap-2">
                        <Checkbox
                          id={`day-habit-${day}-${habitToEdit?.id || 'new'}`}
                          checked={field.value?.includes(day)}
                          onCheckedChange={(checked) => {
                            const currentDays = field.value || [];
                            if (checked) {
                              field.onChange([...currentDays, day]);
                            } else {
                              field.onChange(currentDays.filter(d => d !== day));
                            }
                          }}
                        />
                        <Label htmlFor={`day-habit-${day}-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">{day.substring(0,3)}</Label>
                      </div>
                    ))}
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`all-days-habit-${habitToEdit?.id || 'new'}`}
                        checked={watchedDays.length === daysOfWeek.length}
                        onCheckedChange={handleAllDaysChange}
                      />
                      <Label htmlFor={`all-days-habit-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">Все</Label>
                    </div>
                  </div>
                )}
              />
            </div>
             {errors.days && <p className="col-start-2 col-span-3 text-sm text-destructive">{errors.days.message}</p>}

            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usePomodoro" className="text-right">Pomodoro</Label>
                <Controller
                    name="usePomodoro"
                    control={control}
                    render={({ field }) => (
                        <div className="col-span-3 flex items-center gap-2">
                            <Checkbox
                                id={`usePomodoro-${habitToEdit?.id || 'new'}`}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                            <Label htmlFor={`usePomodoro-${habitToEdit?.id || 'new'}`} className="text-sm font-normal">Включить таймер Pomodoro</Label>
                        </div>
                    )}
                />
            </div>
          </div>
          <DialogFooter>
            {isEditMode && (
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button type="button" variant="destructive">Удалить</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Это действие нельзя будет отменить. Это навсегда удалит вашу привычку.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                        <AlertDialogCancel>Отмена</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Продолжить</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
            <Button type="submit">{isEditMode ? 'Сохранить изменения' : 'Сохранить привычку'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
