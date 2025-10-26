'use client'

import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Exercise, ExerciseCategory } from '@/lib/types';
import { AddExerciseDialog } from './add-exercise-dialog';
import { Pencil } from 'lucide-react';
import { Button } from './ui/button';

interface ExerciseCardProps {
  exercise: Exercise;
  categories: ExerciseCategory[];
  onUpdate: (exercise: Exercise) => Promise<void>;
  onDelete: (exerciseId: string) => Promise<void>;
  openManageCategories: () => void;
}

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
            data-ai-hint="fitness exercise"
          />
           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
           <div className="absolute top-2 right-2">
            <AddExerciseDialog
                exerciseToEdit={exercise}
                onExerciseUpdate={onUpdate}
                onExerciseDelete={onDelete}
                onExerciseAdd={async () => {}} // Not used in edit mode
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
          <Badge variant="secondary" className="mb-2">{category?.name || 'Uncategorized'}</Badge>
          <h3 className="font-semibold text-lg truncate">{exercise.name}</h3>
          <p className="text-sm text-muted-foreground h-10 overflow-hidden text-ellipsis">
            {exercise.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
