'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';
import type { HabitLog } from '@/lib/types';

function buildHeatmap(logs: HabitLog[]) {
  const map = new Map<string, number>();
  for (const l of logs) {
    if (l.status !== 'done') continue;
    const key = l.date;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

export function HeatmapDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const logsQuery = useMemoFirebase(
    () => (user ? collection(firestore, `users/${user.uid}/habitLogs`) : null),
    [user, firestore]
  );
  const { data: logs = [] } = useCollection<HabitLog>(logsQuery);

  const heatmap = useMemo(() => buildHeatmap(logs), [logs]);

  const today = new Date();
  const start = new Date(today);
  start.setFullYear(start.getFullYear() - 1);

  const days: string[] = [];
  for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
    days.push(new Date(d).toISOString().slice(0, 10));
  }

  const intensity = (count: number) => (count >= 5 ? 'bg-emerald-600' : count >= 3 ? 'bg-emerald-400' : count >= 1 ? 'bg-emerald-200' : 'bg-muted');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Heatmap</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Heatmap</DialogTitle>
          <DialogDescription>Daily completion intensity over the last year.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-14 gap-1 text-[10px]">
          {days.map((d) => (
            <div key={d} className={`h-4 w-4 rounded ${intensity(heatmap.get(d) || 0)}`} title={`${d}: ${heatmap.get(d) || 0}`} />
          ))}
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => setOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


