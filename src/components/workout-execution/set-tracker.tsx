'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X } from 'lucide-react';
import type { SetLog } from '@/lib/types';

interface SetTrackerProps {
  setNumber: number;
  targetReps: string;
  targetWeight?: number;
  onComplete: (set: Omit<SetLog, 'timestamp'>) => void;
  onSkip: () => void;
}

export function SetTracker({
  setNumber,
  targetReps,
  targetWeight,
  onComplete,
  onSkip,
}: SetTrackerProps) {
  const [reps, setReps] = useState(parseInt(targetReps.split('-')[0]) || 0);
  const [weight, setWeight] = useState(targetWeight || 0);
  const [rpe, setRpe] = useState<number>();

  const handleComplete = () => {
    const set: Omit<SetLog, 'timestamp'> = {
      setNumber,
      reps,
      weight: weight || undefined,
      rpe,
      completed: true,
    };
    onComplete(set);
  };

  return (
    <Card className="glass border-2 border-primary">
      <CardHeader>
        <CardTitle className="text-xl">Set {setNumber}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="reps">Reps (Target: {targetReps})</Label>
            <Input
              id="reps"
              type="number"
              value={reps}
              onChange={(e) => setReps(parseInt(e.target.value) || 0)}
              placeholder={targetReps}
            />
          </div>
          <div>
            <Label htmlFor="weight">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(parseFloat(e.target.value) || 0)}
              placeholder={targetWeight?.toString()}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="rpe">RPE (1-10)</Label>
          <Input
            id="rpe"
            type="number"
            min="1"
            max="10"
            value={rpe || ''}
            onChange={(e) => setRpe(parseInt(e.target.value) || undefined)}
            placeholder="Optional"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleComplete} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Complete Set
          </Button>
          <Button onClick={onSkip} variant="outline">
            <X className="mr-2 h-4 w-4" />
            Skip
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
