'use client';

import { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser, useFirestore } from '@/firebase/provider';
import { buildHabitExport } from '@/lib/export';

export function ExportDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const data = await buildHabitExport({ firestore, userId: user.uid, dateRange: (from && to) ? { from, to } : undefined });
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `habit_export_${new Date().toISOString().slice(0,10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Export</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Export for AI analysis</DialogTitle>
          <DialogDescription>Download HabitExportV1 JSON. Optionally set date range.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3">
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">From</Label>
            <Input type="date" className="col-span-3" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-2">
            <Label className="text-right">To</Label>
            <Input type="date" className="col-span-3" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleExport} disabled={busy}>{busy ? 'Building…' : 'Download JSON'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


