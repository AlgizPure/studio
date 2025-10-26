import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Exercise } from '@/lib/types';

interface ExerciseCardProps {
  exercise: Exercise;
}

export function ExerciseCard({ exercise }: ExerciseCardProps) {
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
          <Badge variant="secondary" className="mb-2">{exercise.category}</Badge>
          <h3 className="font-semibold text-lg truncate">{exercise.name}</h3>
          <p className="text-sm text-muted-foreground h-10 overflow-hidden text-ellipsis">
            {exercise.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
