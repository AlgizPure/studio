'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase/auth/use-user';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { HabitInsightItem, HabitInsightsOutput } from '@/ai/flows/habit-insights';
import {
  Sparkles,
  Loader2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Clock,
  Trophy,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface HabitInsightsPanelProps {
  className?: string;
  autoLoad?: boolean; // Auto-load insights on mount
  weeksBack?: number; // Number of weeks to analyze (default 8)
}

/**
 * Habit Insights Panel Component
 *
 * Displays AI-powered insights from habits, reflections, and life balance data.
 *
 * Insight types:
 * - correlation: Correlations between habits and well-being
 * - weak_spot: Areas needing attention
 * - suggestion: New habit recommendations
 * - timing: Optimal timing for habits
 * - achievement: Positive milestones
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.8 - AI Insights (Stage 5)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */
export function HabitInsightsPanel({
  className,
  autoLoad = true,
  weeksBack = 8,
}: HabitInsightsPanelProps) {
  const { user } = useUser();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<HabitInsightsOutput | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(false);

  const loadInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/habit-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, weeksBack }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to load insights');
      }

      const data = await response.json();
      setInsights({ insights: data.insights, summary: data.summary });
      setGeneratedAt(data.generatedAt);
      setFromCache(data.fromCache);

      if (!data.fromCache) {
        toast({
          title: 'Insights Generated',
          description: `Found ${data.insights.length} insights from your habits and life balance.`,
        });
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad && user) {
      loadInsights();
    }
  }, [autoLoad, user]);

  const getInsightIcon = (type: HabitInsightItem['type']) => {
    switch (type) {
      case 'correlation':
        return <TrendingUp className="h-5 w-5" />;
      case 'weak_spot':
        return <AlertTriangle className="h-5 w-5" />;
      case 'suggestion':
        return <Lightbulb className="h-5 w-5" />;
      case 'timing':
        return <Clock className="h-5 w-5" />;
      case 'achievement':
        return <Trophy className="h-5 w-5" />;
    }
  };

  const getInsightColor = (type: HabitInsightItem['type']) => {
    switch (type) {
      case 'correlation':
        return 'text-blue-600 dark:text-blue-400';
      case 'weak_spot':
        return 'text-orange-600 dark:text-orange-400';
      case 'suggestion':
        return 'text-purple-600 dark:text-purple-400';
      case 'timing':
        return 'text-cyan-600 dark:text-cyan-400';
      case 'achievement':
        return 'text-green-600 dark:text-green-400';
    }
  };

  const getPriorityBadge = (priority: HabitInsightItem['priority']) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    } as const;

    return (
      <Badge variant={variants[priority]} className="ml-2">
        {priority}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Personalized patterns and recommendations from your habits
            </CardDescription>
            {generatedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                {fromCache ? 'Cached' : 'Generated'} {new Date(generatedAt).toLocaleString()}
              </p>
            )}
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={loadInsights}
            disabled={loading || !user}
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Analyzing your habits...</p>
          </div>
        ) : insights ? (
          <div className="space-y-4">
            {/* Summary */}
            {insights.summary && (
              <div className="p-4 bg-muted/50 rounded-md border-l-4 border-primary">
                <p className="text-sm font-medium">{insights.summary}</p>
              </div>
            )}

            {/* Insights List */}
            {insights.insights.length > 0 ? (
              <div className="space-y-3">
                {insights.insights.map((insight, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-md border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 ${getInsightColor(insight.type)}`}>
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold flex items-center">
                            {insight.title}
                            {getPriorityBadge(insight.priority)}
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {insight.description}
                        </p>
                        {insight.metric && (
                          <p className="text-xs font-mono bg-muted px-2 py-1 rounded inline-block">
                            {insight.metric}
                          </p>
                        )}
                        {insight.actionable && (
                          <div className="mt-2 p-2 bg-primary/10 rounded-md">
                            <p className="text-xs font-medium text-primary">
                              💡 {insight.actionable}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No insights available yet.</p>
                <p className="text-xs">Keep tracking your habits to unlock insights!</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm mb-2">Ready to analyze your habits</p>
            <Button size="sm" onClick={loadInsights} disabled={!user}>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
