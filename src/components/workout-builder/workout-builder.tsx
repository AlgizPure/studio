'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus } from 'lucide-react';
import type { WorkoutExtended, Cycle } from '@/lib/types';
import { CycleBuilder } from './cycle-builder';

interface WorkoutBuilderProps {
  workout?: WorkoutExtended;
  onSave: (workout: Omit<WorkoutExtended, 'id'>) => void;
  onCancel: () => void;
}

export function WorkoutBuilder({ workout, onSave, onCancel }: WorkoutBuilderProps) {
  const [name, setName] = useState(workout?.name || '');
  const [description, setDescription] = useState(workout?.description || '');
  const [cycles, setCycles] = useState<Cycle[]>(workout?.cycles || []);

  const handleSave = () => {
    const workoutData: Omit<WorkoutExtended, 'id'> = {
      name,
      description,
      cycles,
      targetMuscles: [],
      estimatedDuration: 60,
    };
    
    onSave(workoutData);
  };

  const handleAddCycle = () => {
    const newCycle: Cycle = {
      id: `cycle_${Date.now()}`,
      order: cycles.length,
      type: 'normal',
      repetitions: 1,
      restAfter: 120,
      exercises: [],
    };
    
    setCycles([...cycles, newCycle]);
  };

  return (
    <div className="space-y-6">
      {/* Workout Details */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Workout Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="workout-name">Name *</Label>
            <Input
              id="workout-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Upper Body Push"
            />
          </div>
          
          <div>
            <Label htmlFor="workout-description">Description</Label>
            <Textarea
              id="workout-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the workout..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cycles */}
      <Card className="glass">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Cycles</CardTitle>
            <Button onClick={handleAddCycle} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Cycle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No cycles yet</p>
              <p className="text-sm mt-2">Add a cycle to start building your workout</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cycles.map((cycle, index) => (
                <CycleBuilder
                    key={cycle.id}
                    cycle={cycle}
                    onUpdate={(updatedCycle) => {
                    const newCycles = [...cycles];
                    newCycles[index] = updatedCycle;
                    setCycles(newCycles);
                    }}
                    onDelete={() => {
                    setCycles(cycles.filter((_, i) => i !== index));
                    }}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4 sticky bottom-0 bg-background/90 py-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={!name}>
          Next: Setup Schedule
        </Button>
      </div>
    </div>
  );
}
