'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, RefreshCw, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '@/lib/logger';

type QuickInsight = {
  type: 'positive' | 'warning' | 'recommendation';
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  actionable: boolean;
  relatedProgram?: string;
};

type InsightsData = {
  insights: QuickInsight[];
  summary: string;
  confidence: number;
  generatedAt?: string;
  cacheUntil?: string;
  fromCache?: boolean;
};

export function AIInsightsCard() {
  const { user } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [timeframe, setTimeframe] = useState<'2weeks' | '4weeks'>('2weeks');

  const fetchInsights = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, timeframe }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (error: unknown) {
      logger.error('AI Insights Card: Failed to generate insights', error instanceof Error ? error : new Error(String(error)));
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate insights',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: QuickInsight['type']) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'recommendation':
        return <Lightbulb className="h-4 w-4 text-blue-500" />;
    }
  };

  const getVariant = (type: QuickInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'default';
      case 'warning':
        return 'destructive';
      case 'recommendation':
        return 'secondary';
    }
  };

  const canRefresh = insights && insights.generatedAt && insights.cacheUntil
    ? new Date(insights.cacheUntil).getTime() - Date.now() < 24 * 60 * 60 * 1000
    : true;

  // Don't render if user is not authenticated
  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Insights
            </CardTitle>
            <CardDescription>
              Quick analysis of your training patterns
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTimeframe(timeframe === '2weeks' ? '4weeks' : '2weeks')}
              disabled={!insights && !loading}
            >
              {timeframe === '2weeks' ? '2W' : '4W'}
            </Button>
            {insights && canRefresh && (
              <Button
                variant="ghost"
                size="icon"
                onClick={fetchInsights}
                disabled={loading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !loading && (
          <div className="space-y-3">
            <Button onClick={fetchInsights} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              Get AI Insights
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Analyze your recent workouts to get personalized recommendations
            </p>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Analyzing your data...</p>
          </div>
        )}

        {insights && !loading && (
          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              {insights.summary}
            </div>

            {insights.insights.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                <p className="text-sm">No insights available yet.</p>
                <p className="text-xs mt-1">Complete more workouts to get AI recommendations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.insights
                  .sort((a, b) => a.priority - b.priority)
                  .map((insight, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border p-3 space-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1">
                          {getIcon(insight.type)}
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{insight.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {insight.description}
                            </p>
                            {insight.relatedProgram && (
                              <Badge variant="outline" className="mt-2">
                                {insight.relatedProgram}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Badge variant={getVariant(insight.type)}>
                          P{insight.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            )}

            {insights.generatedAt && (
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Updated {formatDistanceToNow(new Date(insights.generatedAt), { addSuffix: true })}
                {insights.fromCache && ' (cached)'}
                {insights.confidence && ` • Confidence: ${Math.round(insights.confidence * 100)}%`}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
