'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import type { WorkoutLog } from '@/lib/types';
import { calculatePeriodStats, comparePeriods } from '@/lib/analytics';

interface PeriodComparisonProps {
  workouts: WorkoutLog[];
}

export const PeriodComparison = React.memo(function PeriodComparison({ workouts }: PeriodComparisonProps) {
  const [periodDays, setPeriodDays] = useState(30);

  const comparison = useMemo(() => {
    const now = new Date();
    const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousStart = new Date(currentStart.getTime() - periodDays * 24 * 60 * 60 * 1000);
    const previousEnd = new Date(currentStart.getTime() - 1);

    const currentStats = calculatePeriodStats(workouts, currentStart, now);
    const previousStats = calculatePeriodStats(workouts, previousStart, previousEnd);

    return comparePeriods(currentStats, previousStats);
  }, [workouts, periodDays]);

  const getChangeIcon = (changeType: 'positive' | 'negative' | 'neutral') => {
    if (changeType === 'positive') {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (changeType === 'negative') {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getChangeColor = (changeType: 'positive' | 'negative' | 'neutral') => {
    if (changeType === 'positive') return 'text-green-600';
    if (changeType === 'negative') return 'text-red-600';
    return 'text-muted-foreground';
  };

  const formatValue = (metric: string, value: number) => {
    if (metric.includes('Duration')) {
      return `${value.toFixed(0)} min`;
    }
    if (metric.includes('RPE')) {
      return value.toFixed(1);
    }
    if (metric.includes('Volume')) {
      return `${(value / 1000).toFixed(1)}k kg`;
    }
    return value.toFixed(0);
  };

  if (comparison.length === 0 || comparison.every(c => c.current === 0 && c.previous === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Period Comparison
          </CardTitle>
          <CardDescription>Compare your progress across time periods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-[300px] items-center justify-center text-muted-foreground">
            <p>Not enough data to compare periods</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Period Comparison
            </CardTitle>
            <CardDescription>
              Last {periodDays} days vs previous {periodDays} days
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={periodDays === 7 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodDays(7)}
            >
              7d
            </Button>
            <Button
              variant={periodDays === 30 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodDays(30)}
            >
              30d
            </Button>
            <Button
              variant={periodDays === 90 ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPeriodDays(90)}
            >
              90d
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {comparison.map((item) => (
            <div
              key={item.metric}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{item.metric}</h4>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">
                    Current: <span className="font-medium text-foreground">{formatValue(item.metric, item.current)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Previous: <span className="font-medium text-foreground">{formatValue(item.metric, item.previous)}</span>
                  </span>
                </div>
              </div>
              <div className={`flex items-center gap-2 font-medium ${getChangeColor(item.changeType)}`}>
                {getChangeIcon(item.changeType)}
                <span className="text-lg">
                  {item.change > 0 ? '+' : ''}{item.change.toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});
