'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';

const TAGS = [
  { id: 'strong', label: '💪 Strong' },
  { id: 'tired', label: '😰 Tired' },
  { id: 'pain', label: '⚠️ Pain' },
  { id: 'poor_sleep', label: '😴 Poor Sleep' },
  { id: 'great_pump', label: '🔥 Great Pump' },
  { id: 'low_motivation', label: '😕 Low Motivation' },
] as const;

export function WorkoutFeedbackDialog({
  open,
  onOpenChange,
  onSubmit,
  workoutName,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSubmit: (feedback: string, tags: string[]) => void;
  workoutName?: string;
}) {
  const [text, setText] = useState('');
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  };

  const handleSave = () => {
    onSubmit(text.trim(), selected);
    setText('');
    setSelected([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>How was your workout?</DialogTitle>
          <DialogDescription>
            Optional feedback helps improve recommendations{workoutName ? ` for ${workoutName}` : ''}.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <button key={t.id} type="button" onClick={() => toggle(t.id)}>
              <Badge variant={selected.includes(t.id) ? 'default' : 'secondary'}>{t.label}</Badge>
            </button>
          ))}
        </div>

        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="E.g., Felt strong today, bench moved easily..."
        />

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Skip</Button>
          <Button onClick={handleSave}>Save Feedback</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



