'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Trophy } from 'lucide-react';
import type { WorkoutLog } from '@/lib/types';
import { calculatePersonalRecords, formatVolume } from '@/lib/analytics-utils';

interface PRTrackerProps {
  workouts: WorkoutLog[];
}

export const PRTracker = React.memo(function PRTracker({ workouts }: PRTrackerProps) {
  const records = useMemo(() => {
    return calculatePersonalRecords(workouts);
  }, [workouts]);

  const getProgressIcon = (progress: 'improving' | 'stable' | 'declining') => {
    switch (progress) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getProgressBadge = (progress: 'improving' | 'stable' | 'declining') => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      improving: 'default',
      stable: 'secondary',
      declining: 'destructive',
    };
    const labels = {
      improving: 'Improving',
      stable: 'Stable',
      declining: 'Declining',
    };
    return (
      <Badge variant={variants[progress]} className="gap-1">
        {getProgressIcon(progress)}
        <span className="text-xs">{labels[progress]}</span>
      </Badge>
    );
  };

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Personal Records
          </CardTitle>
          <CardDescription>Track your best performances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>No workout data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Personal Records
        </CardTitle>
        <CardDescription>
          Your best performances and recent progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {records.slice(0, 10).map((record) => (
            <div
              key={record.exerciseId}
              className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate">{record.exerciseName}</h4>
                <div className="flex flex-wrap gap-3 mt-1 text-xs text-muted-foreground">
                  <span>Max: <span className="font-medium text-foreground">{record.maxWeight} kg</span></span>
                  <span>Vol: <span className="font-medium text-foreground">{formatVolume(record.maxVolume)}</span></span>
                  <span>Reps: <span className="font-medium text-foreground">{record.maxReps}</span></span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(record.date).toLocaleDateString()}
                </p>
              </div>
              <div className="ml-3">
                {getProgressBadge(record.recentProgress)}
              </div>
            </div>
          ))}
        </div>
        {records.length > 10 && (
          <p className="text-xs text-muted-foreground text-center mt-3">
            Showing top 10 of {records.length} personal records
          </p>
        )}
      </CardContent>
    </Card>
  );
});
