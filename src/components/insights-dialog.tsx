'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc } from 'firebase/firestore';
import type { HabitLog, HabitInsight } from '@/lib/types';
import { generateInsightsFromLogs } from '@/lib/insights';

export function InsightsDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: logs = [] } = useCollection<HabitLog>(logsQuery);

  const handleGenerate = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const insights = generateInsightsFromLogs(logs);
      const col = collection(firestore, `users/${user.uid}/habitInsights`);
      for (const ins of insights) {
        await addDoc(col, ins as any);
      }
      setOpen(false);
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
          <DialogTitle>AI Insights (basic)</DialogTitle>
          <DialogDescription>Create recommendations based on current logs and active systems.</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-muted-foreground">
          This will analyze your logs and store insights in your account.
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleGenerate} disabled={busy}>{busy ? 'Generating…' : 'Generate'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


