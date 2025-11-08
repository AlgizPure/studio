'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useFirestore } from '@/firebase/provider';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import type { Habit, HabitTarget, HabitType } from '@/lib/types';

type Recommendation = {
  action: 'add' | 'modify' | 'pause';
  name?: string;
  habitId?: string;
  params?: Record<string, unknown>;
};

type HabitImportPayload = {
  name: string;
  categoryId: string;
  completed: boolean;
  type?: HabitType;
  target?: HabitTarget;
};

type HabitUpdatePayload = {
  target?: HabitTarget;
};

function parseRecommendations(markdown: string): Recommendation[] {
  const lines = markdown.split(/\r?\n/);
  const recs: Recommendation[] = [];
  for (const l of lines) {
    const s = l.trim();
    // Examples:
    // - add: habit "Drink Water" type=quantity target=2000 unit=ml
    // - modify: habitId=abc target=duration value=25 unit=min
    // - pause: habitId=xyz
    if (s.startsWith('- add:')) {
      const nameMatch = s.match(/"([^"]+)"/);
      const name = nameMatch?.[1];
      const targetMatch = s.match(/target=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/type=(\w+)/);
      recs.push({ action: 'add', name, params: { type: typeMatch?.[1], target: targetMatch ? Number(targetMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- modify:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      const valMatch = s.match(/value=(\d+)/);
      const unitMatch = s.match(/unit=([a-zA-Z]+)/);
      const typeMatch = s.match(/target=(duration|quantity)/);
      if (idMatch) recs.push({ action: 'modify', habitId: idMatch[1], params: { targetType: typeMatch?.[1], value: valMatch ? Number(valMatch[1]) : undefined, unit: unitMatch?.[1] } });
    } else if (s.startsWith('- pause:')) {
      const idMatch = s.match(/habitId=([a-zA-Z0-9_-]+)/);
      if (idMatch) recs.push({ action: 'pause', habitId: idMatch[1] });
    }
  }
  return recs;
}

export function ImportClaudeDialog() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [open, setOpen] = useState(false);
  const [md, setMd] = useState('');
  const [busy, setBusy] = useState(false);

  const handleApply = async () => {
    if (!user || !firestore) return;
    setBusy(true);
    try {
      const recs = parseRecommendations(md);
      const habitsCol = collection(firestore, `users/${user.uid}/habits`);
      for (const r of recs) {
        if (r.action === 'add' && r.name) {
          const payload: HabitImportPayload = { name: r.name, categoryId: '', completed: false };
          if (r.params?.type) payload.type = r.params.type as HabitType;
          if (r.params?.target) payload.target = { type: (r.params?.type as HabitType) || 'quantity', value: r.params.target as number, unit: r.params?.unit as string | undefined };
          await addDoc(habitsCol, payload);
        } else if (r.action === 'modify' && r.habitId) {
          const ref = doc(firestore, `users/${user.uid}/habits/${r.habitId}`);
          const update: HabitUpdatePayload = {};
          if (r.params?.targetType === 'duration' && typeof r.params.value === 'number') update.target = { type: 'duration', value: r.params.value, unit: (r.params?.unit as string | undefined) || 'min' };
          if (r.params?.targetType === 'quantity' && typeof r.params.value === 'number') update.target = { type: 'quantity', value: r.params.value, unit: r.params?.unit as string | undefined };
          await updateDoc(ref, update);
        } else if (r.action === 'pause' && r.habitId) {
          const ref = doc(firestore, `users/${user.uid}/habits/${r.habitId}`);
          await updateDoc(ref, { archived: true });
        }
      }
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Import Claude report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle>Import recommendations</DialogTitle>
          <DialogDescription>Paste key bullet points from Claude report. Basic parser will extract add/modify/pause actions.</DialogDescription>
        </DialogHeader>
        <Textarea rows={12} value={md} onChange={(e) => setMd(e.target.value)} />
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button type="button" onClick={handleApply} disabled={busy || !md.trim()}>{busy ? 'Applying…' : 'Apply'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


