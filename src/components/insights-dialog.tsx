'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { collection, addDoc } from 'firebase/firestore';
import { useUserCollection } from '@/hooks/use-user-collection';
import type { HabitLog, HabitInsight, AnalysisSystem } from '@/lib/types';
import { generateInsightsFromLogs } from '@/lib/insights';
import { logger } from '@/lib/logger';

export function InsightsDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const { data: logs } = useUserCollection<HabitLog>('habitLogs');
  const { data: activeSystems } = useUserCollection<AnalysisSystem>('activeSystems');

  const safeLogs: HabitLog[] = (logs ?? []) as unknown as HabitLog[];
  const safeActiveSystems: AnalysisSystem[] = (activeSystems ?? []) as unknown as AnalysisSystem[];

  const handleGenerate = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      // Use real AI generation with fallback to mock
      const insights = await generateInsightsFromLogs(safeLogs, safeActiveSystems);
      
      if (insights.length === 0) {
        toast({
          title: 'No insights',
          description: 'No actionable insights found in your logs at this time.',
        });
        return;
      }

      // Save to Firestore
      const col = collection(firestore, `users/${user.uid}/habitInsights`);
      for (const ins of insights) {
        await addDoc(col, {
          date: ins.date,
          systemId: ins.systemId,
          type: ins.type,
          priority: ins.priority,
          title: ins.title,
          description: ins.description,
          data: ins.data || {},
          createdAt: ins.createdAt,
        });
      }
      
      toast({
        title: 'Insights generated',
        description: `Created ${insights.length} insight(s) based on your logs.`,
      });
      setOpen(false);
    } catch (error: unknown) {
      logger.error('[InsightsDialog] Generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate insights',
        variant: 'destructive',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Generate insights</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>AI Insights</DialogTitle>
          <DialogDescription>
            Generate actionable insights based on your habit logs and active analysis systems.
            {process.env.NEXT_PUBLIC_AI_MOCK === '1' && (
              <span className="block mt-1 text-xs text-muted-foreground">Mock mode enabled</span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground space-y-2">
          <p>This will analyze {safeLogs.length} log(s) and {safeActiveSystems.length} active system(s).</p>
          <p>Insights will be stored in your account and can be reviewed later.</p>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleGenerate} disabled={busy}>{busy ? 'Generating…' : 'Generate'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


