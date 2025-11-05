'use client'

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Exercise, ExerciseCategory } from '@/lib/types';
import { AddExerciseDialog } from './add-exercise-dialog';
import { Pencil } from 'lucide-react';
import { Button } from './ui/button';

/**
 * @fileoverview Компонент карточки для отображения информации об упражнении.
 */

/**
 * @interface ExerciseCardProps
 * @description Свойства для компонента ExerciseCard.
 */
interface ExerciseCardProps {
  /** Объект упражнения для отображения. */
  exercise: Exercise;
  /** Список всех доступных категорий упражнений. */
  categories: ExerciseCategory[];
  /** Callback-функция, вызываемая при обновлении упражнения. */
  onUpdate: (exercise: Exercise) => Promise<void>;
  /** Callback-функция, вызываемая при удалении упражнения. */
  onDelete: (exerciseId: string) => Promise<void>;
  /** Функция для открытия диалогового окна управления категориями. */
  openManageCategories: () => void;
}

/**
 * Компонент-карточка, отображающий основную информацию об упражнении,
 * включая изображение, название, категорию и описание.
 * Также содержит кнопку для редактирования упражнения.
 * @param {ExerciseCardProps} props - Свойства компонента.
 * @returns {JSX.Element} React-компонент.
 */
export function ExerciseCard({ exercise, categories, onUpdate, onDelete, openManageCategories }: ExerciseCardProps) {
  const category = categories.find(cat => cat.id === exercise.categoryId);

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 glass">
      <CardContent className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={exercise.image}
            alt={exercise.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="фитнес-упражнение"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           <div className="absolute top-2 right-2">
            <AddExerciseDialog
                exerciseToEdit={exercise}
                onExerciseUpdate={onUpdate}
                onExerciseDelete={onDelete}
                onExerciseAdd={async () => {}} // Не используется в режиме редактирования
                categories={categories}
                openManageCategories={openManageCategories}
                trigger={
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20 hover:text-white">
                        <Pencil className="h-4 w-4" />
                    </Button>
                }
            />
           </div>
        </div>
        <div className="p-4">
          <Badge variant="secondary" className="mb-2">{category?.name || 'Без категории'}</Badge>
          <h3 className="font-semibold text-lg truncate">{exercise.name}</h3>
          <p className="text-sm text-muted-foreground h-10 overflow-hidden text-ellipsis">
            {exercise.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
