'use client';
import React, { useState, useEffect, useMemo } from 'react';

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
import { PlusCircle, Plus, Trash2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from '@/components/ui/select';
import { useForm, SubmitHandler, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Exercise, ExerciseCategory } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from './ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { nanoid } from 'nanoid';
import { Separator } from './ui/separator';

/**
 * @fileoverview Диалоговое окно для добавления и редактирования упражнений.
 */

/**
 * @description Схема валидации для одного параметра упражнения с использованием Zod.
 */
const parameterSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Имя параметра не может быть пустым"),
  unit: z.string().min(1, "Единица измерения параметра не может быть пустой"),
  defaultValue: z.preprocess((val) => Number(val), z.number()),
});

/**
 * @description Схема валидации для формы упражнения с использованием Zod.
 */
const exerciseSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  categoryId: z.string().min(1, 'Категория обязательна'),
  description: z.string().min(1, 'Описание обязательно'),
  image: z.string().url().optional().or(z.literal('')),
  plannedDuration: z.object({
    minutes: z.number().min(0).max(59),
    seconds: z.number().min(0).max(59),
  }).optional(),
  trackDuration: z.boolean().optional(),
  parameters: z.array(parameterSchema).optional(),
});

/**
 * @typedef {z.infer<typeof exerciseSchema>} ExerciseFormValues
 * @description Тип, представляющий значения формы упражнения, выведенный из схемы Zod.
 */
type ExerciseFormValues = z.infer<typeof exerciseSchema>;

/**
 * @interface AddExerciseDialogProps
 * @description Свойства для компонента AddExerciseDialog.
 */
interface AddExerciseDialogProps {
  /** Callback-функция, вызываемая при добавлении нового упражнения. */
  onExerciseAdd: (exercise: Omit<Exercise, 'id'>) => void;
  /** Callback-функция, вызываемая при обновлении существующего упражнения. */
  onExerciseUpdate?: (exercise: Exercise) => void;
  /** Callback-функция, вызываемая при удалении упражнения. */
  onExerciseDelete?: (exerciseId: string) => void;
  /** Объект упражнения для редактирования. Если он предоставлен, компонент работает в режиме редактирования. */
  exerciseToEdit?: Exercise;
  /** Пользовательский триггер для открытия диалогового окна. */
  trigger?: React.ReactNode;
  /** Функция для открытия диалогового окна управления категориями. */
  openManageCategories?: () => void;
  /** Список доступных категорий упражнений. */
  categories: ExerciseCategory[];
}

/**
 * Компонент диалогового окна для создания нового или редактирования существующего упражнения.
 * @param {AddExerciseDialogProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function AddExerciseDialog({ onExerciseAdd, onExerciseUpdate, onExerciseDelete, exerciseToEdit, trigger, openManageCategories, categories }: AddExerciseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const isEditMode = !!exerciseToEdit;
  const customImage = PlaceHolderImages.find(p => p.id === 'custom')?.imageUrl || 'https://picsum.photos/seed/custom/600/400';
  
  // Создаем стабильный ключ для Select, чтобы принудительно обновить его при изменении категорий
  const categoriesKey = useMemo(() => categories.map(c => c.id).join(','), [categories]);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm<ExerciseFormValues>({
    resolver: zodResolver(exerciseSchema),
    defaultValues: {
      parameters: [],
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'parameters',
  });

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && exerciseToEdit) {
        reset({
            name: exerciseToEdit.name,
            categoryId: exerciseToEdit.categoryId,
            description: exerciseToEdit.description,
            image: exerciseToEdit.image,
            plannedDuration: exerciseToEdit.plannedDuration || undefined,
            trackDuration: exerciseToEdit.trackDuration || false,
            parameters: exerciseToEdit.parameters || [],
        });
      } else {
        reset({
          name: '',
          categoryId: '',
          description: '',
          image: customImage,
          plannedDuration: undefined,
          trackDuration: false,
          parameters: [],
        });
      }
    }
  }, [isEditMode, exerciseToEdit, reset, isOpen, customImage]);


  const onSubmit: SubmitHandler<ExerciseFormValues> = (data) => {
    try {
      const finalData = {
        ...data,
        image: data.image || customImage,
        parameters: data.parameters && data.parameters.length > 0 ? data.parameters : undefined,
      };
      if (isEditMode && exerciseToEdit && onExerciseUpdate) {
          const updatedExercise: Exercise = {
              ...exerciseToEdit,
              ...finalData,
          };
          onExerciseUpdate(updatedExercise);
          toast({
              title: 'Упражнение обновлено',
              description: `${data.name} было обновлено.`,
          });
      } else {
          const newExercise: Omit<Exercise, 'id'> = {
              ...finalData,
              custom: true,
          };
          onExerciseAdd(newExercise);
          toast({
              title: 'Упражнение добавлено',
              description: `${data.name} было добавлено в вашу библиотеку.`,
          });
      }
      setIsOpen(false);
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Ошибка',
            description: 'Произошла ошибка при сохранении упражнения.'
        });
    }
  };

  const handleDelete = () => {
    if (isEditMode && exerciseToEdit && onExerciseDelete) {
        try {
            onExerciseDelete(exerciseToEdit.id);
            toast({
                title: 'Упражнение удалено',
                description: `${exerciseToEdit.name} было удалено.`,
                variant: 'destructive'
            });
            setIsOpen(false);
        } catch (e) {
            toast({
                variant: 'destructive',
                title: 'Ошибка',
                description: 'Произошла ошибка при удалении упражнения.'
            })
        }
    }
  }

  const handleCategoryChange = (value: string) => {
    if (value === 'add-new' && openManageCategories) {
        openManageCategories();
    } else {
        setValue('categoryId', value, { shouldValidate: true });
    }
  }
  
  const [currentPath, setCurrentPath] = useState('');
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const isLibraryPage = currentPath.includes('/library');

  const dialogTrigger = useMemo(() => {
    if (trigger) return trigger;
    if (isLibraryPage) {
      return (
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Добавить упражнение
        </Button>
      );
    }
    return (
      <Button variant="ghost" size="sm">
        <Plus className="mr-2 h-4 w-4" />
        Новое
      </Button>
    );
  }, [trigger, isLibraryPage]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {dialogTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
          <DialogHeader className="sticky top-0 z-20 bg-background px-6 pt-6 pb-4 border-b flex-shrink-0">
            <DialogTitle className="font-headline pr-8">{isEditMode ? 'Редактировать упражнение' : 'Добавить пользовательское упражнение'}</DialogTitle>
            <DialogDescription>
              {isEditMode ? 'Обновите детали вашего упражнения.' : "Добавьте новое упражнение в вашу личную библиотеку. Нажмите 'Сохранить', когда закончите."}
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto overflow-x-hidden" style={{ height: 'calc(90vh - 280px)', minHeight: 0 }}>
            <div className="grid gap-4 py-4 pr-4 pl-6">
            <div className="space-y-2">
              <Label htmlFor="name">Название</Label>
              <Input id="name" placeholder="например, Махи гирей" {...register('name')} />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="categoryId">Категория</Label>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={handleCategoryChange} value={field.value} key={categoriesKey}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите категорию" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Категории упражнений</SelectLabel>
                        {openManageCategories && (
                          <SelectItem value="add-new">
                              <span className="flex items-center"><Plus className="mr-2 h-4 w-4" /> Добавить новую категорию...</span>
                          </SelectItem>
                        )}
                        {categories.map(cat => (
                            <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Описание</Label>
              <Textarea id="description" placeholder="Кратко опишите упражнение." {...register('description')} />
              {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedDuration">Планируемая длительность (необязательно)</Label>
              <Controller
                name="plannedDuration"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="plannedMinutes" className="text-xs text-muted-foreground">Минуты</Label>
                      <Input
                        id="plannedMinutes"
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        value={field.value?.minutes ?? ''}
                        onChange={(e) => {
                          const minutes = parseInt(e.target.value) || 0;
                          field.onChange({
                            minutes: Math.min(59, Math.max(0, minutes)),
                            seconds: field.value?.seconds ?? 0,
                          });
                        }}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="plannedSeconds" className="text-xs text-muted-foreground">Секунды</Label>
                      <Input
                        id="plannedSeconds"
                        type="number"
                        min="0"
                        max="59"
                        placeholder="0"
                        value={field.value?.seconds ?? ''}
                        onChange={(e) => {
                          const seconds = parseInt(e.target.value) || 0;
                          field.onChange({
                            minutes: field.value?.minutes ?? 0,
                            seconds: Math.min(59, Math.max(0, seconds)),
                          });
                        }}
                      />
                    </div>
                  </div>
                )}
              />
            </div>

            <div className="space-y-2">
              <Controller
                name="trackDuration"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="trackDuration"
                      checked={field.value || false}
                      onCheckedChange={(checked) => field.onChange(checked)}
                    />
                    <Label htmlFor="trackDuration" className="text-sm font-normal cursor-pointer">
                      Отслеживать длительность упражнения
                    </Label>
                  </div>
                )}
              />
            </div>

            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Отслеживаемые параметры</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  className="h-7 border border-input hover:border-primary hover:bg-transparent hover:text-foreground"
                  onClick={() => append({ id: nanoid(5), name: '', unit: '', defaultValue: 0 })}
                >
                  <Plus className="mr-2 h-4 w-4" /> Добавить параметр
                </Button>
              </div>
               {fields.map((field, index) => (
                <div key={field.id} className="p-2 border rounded-md space-y-2">
                    <div className="grid grid-cols-10 gap-2">
                        <Input
                            {...register(`parameters.${index}.name`)}
                            placeholder="Название"
                            className="col-span-4 h-8"
                        />
                         <Input
                            {...register(`parameters.${index}.unit`)}
                            placeholder="Ед. изм."
                            className="col-span-2 h-8"
                        />
                        <Input
                            {...register(`parameters.${index}.defaultValue`)}
                            type="number"
                            placeholder="По умолч."
                            className="col-span-3 h-8"
                        />
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => remove(index)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                     {errors.parameters?.[index]?.name && <p className="text-sm text-destructive">{errors.parameters[index]?.name?.message}</p>}
                     {errors.parameters?.[index]?.unit && <p className="text-sm text-destructive">{errors.parameters[index]?.unit?.message}</p>}
                </div>
              ))}
            </div>
            </div>
          </div>
          <DialogFooter className="px-6 pb-6 pt-4 border-t bg-background shrink-0">
            {isEditMode && onExerciseDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button type="button" variant="destructive" className="mr-auto">Удалить</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Это действие нельзя будет отменить. Упражнение будет удалено навсегда.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Продолжить</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button type="submit">{isEditMode ? 'Сохранить изменения' : 'Сохранить упражнение'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
