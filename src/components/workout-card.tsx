'use client'

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { WorkoutExtended } from '@/lib/types';
import { Pencil, Copy, Trash2, Power } from 'lucide-react';
import { WorkoutSettingsDialog } from './workout-settings-dialog';
import { EditWorkoutDialog } from './edit-workout-dialog';

interface WorkoutCardProps {
  workout: WorkoutExtended;
  onUpdate: (workout: WorkoutExtended) => Promise<void>;
  onDelete: (workoutId: string) => Promise<void>;
  onDuplicate: (workout: WorkoutExtended) => Promise<void>;
}

export function WorkoutCard({ workout, onUpdate, onDelete, onDuplicate }: WorkoutCardProps) {
  const handleDuplicate = async () => {
    const duplicated: WorkoutExtended = {
      ...workout,
      id: `workout_${Date.now()}`,
      name: `${workout.name} (Copy)`,
    };
    await onDuplicate(duplicated);
  };

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300 glass">
      <CardContent className="p-0">
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-lg">{workout.name}</h3>
                {workout.status === 'active' && (
                  <Badge variant="default" className="bg-green-600">
                    <Power className="mr-1 h-3 w-3" />
                    Active
                  </Badge>
                )}
                {workout.isStandalone && (
                  <Badge variant="outline">Standalone</Badge>
                )}
                {workout.isHabit && (
                  <Badge variant="secondary">Habit</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground h-10 overflow-hidden text-ellipsis mb-2">
                {workout.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {workout.estimatedDuration && (
                  <span>{workout.estimatedDuration} min</span>
                )}
                {workout.cycles && workout.cycles.length > 0 && (
                  <span>{workout.cycles.length} cycle{workout.cycles.length > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              <WorkoutSettingsDialog
                workout={workout}
                onUpdate={onUpdate}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Power className="h-4 w-4" />
                  </Button>
                }
              />
              <EditWorkoutDialog
                workout={workout}
                onUpdate={onUpdate}
                onDelete={onDelete}
                trigger={
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Pencil className="h-4 w-4" />
                  </Button>
                }
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleDuplicate}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

