'use client';

import React, { useState } from 'react';
import { useUser } from '@/firebase/provider';
import { useUserCollection } from '@/hooks/use-user-collection';
import { orderBy } from 'firebase/firestore';
import type { WorkoutLog } from '@/lib/types';
import type { TimeRange } from '@/lib/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatsCards } from '@/components/analytics/stats-cards';
import { VolumeChart } from '@/components/analytics/volume-chart';
import { ExerciseProgressChart } from '@/components/analytics/exercise-progress-chart';
import { FrequencyHeatmap } from '@/components/analytics/frequency-heatmap';
import { PRTracker } from '@/components/analytics/pr-tracker';
import { RPEDistributionChart } from '@/components/analytics/rpe-distribution-chart';
import { PeriodComparison } from '@/components/analytics/period-comparison';
import { MuscleGroupVolumeHeatmap } from '@/components/analytics/muscle-group-volume-heatmap';
import { TrainingBalanceRadar } from '@/components/analytics/training-balance-radar';
import { VolumeDistributionChart } from '@/components/analytics/volume-distribution-chart';

export function AnalyticsCharts() {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'exercises' | 'advanced'>('overview');

  const { data: workoutLogs, isLoading } = useUserCollection<WorkoutLog>('workoutLogs', orderBy('startTime', 'desc'));

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
        </div>
        <Skeleton className="h-[350px]" />
        <Skeleton className="h-[350px]" />
      </div>
    );
  }

  if (!workoutLogs || workoutLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 py-12">
        <div className="text-center">
          <h3 className="text-lg font-semibold">No Workout Data Yet</h3>
          <p className="text-muted-foreground">
            Complete your first workout to start tracking your progress
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'overview' | 'exercises' | 'advanced')}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="exercises">Exercise Details</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <StatsCards workouts={workoutLogs} timeRange={timeRange} />

      {/* Tab Content */}
      <TabsContent value="overview" className="space-y-6">
        <VolumeChart workouts={workoutLogs} timeRange={timeRange} />
      </TabsContent>

      <TabsContent value="exercises" className="space-y-6">
        <ExerciseProgressChart workouts={workoutLogs} timeRange={timeRange} />
      </TabsContent>

      <TabsContent value="advanced" className="space-y-6">
        {/* Muscle Group Analytics */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Muscle Group Analytics</h3>
          <MuscleGroupVolumeHeatmap workouts={workoutLogs} weeksToShow={8} />
          <div className="grid gap-6 md:grid-cols-2">
            <TrainingBalanceRadar workouts={workoutLogs} />
            <VolumeDistributionChart workouts={workoutLogs} />
          </div>
        </div>

        {/* Training Patterns */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold">Training Patterns</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <FrequencyHeatmap workouts={workoutLogs} />
            <RPEDistributionChart workouts={workoutLogs} />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <PRTracker workouts={workoutLogs} />
            <PeriodComparison workouts={workoutLogs} />
          </div>
        </div>
      </TabsContent>
    </div>
  );
}
