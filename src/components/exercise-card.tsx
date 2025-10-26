import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Exercise, ExerciseCategory } from '@/lib/types';

interface ExerciseCardProps {
  exercise: Exercise;
  categories: ExerciseCategory[];
}

export function ExerciseCard({ exercise, categories }: ExerciseCardProps) {
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
