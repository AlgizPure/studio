'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { parseZTLOrPatch, toYAML, toJSON } from '@/lib/ztl/parser';

export function ImportProgramDialog({
  open,
  onOpenChange,
  onImport,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (data: any) => Promise<void> | void;
}) {
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewAs, setPreviewAs] = useState<'yaml' | 'json'>('yaml');

  const handleParse = () => {
    setError(null);
    try {
      const res = parseZTLOrPatch(raw);
      setParsed(res);
    } catch (e: any) {
      setParsed(null);
      setError(e?.message || 'Parse error');
    }
  };

  const handleImport = async () => {
    if (!parsed) return;
    await onImport(parsed.value);
    setRaw('');
    setParsed(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Program or Patch (ZTL)</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Textarea rows={10} value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Paste YAML or JSON here" />
          <div className="flex gap-2">
            <Button onClick={handleParse}>Validate</Button>
            <Button variant="secondary" onClick={() => setPreviewAs(previewAs === 'yaml' ? 'json' : 'yaml')}>
              Preview as {previewAs === 'yaml' ? 'JSON' : 'YAML'}
            </Button>
          </div>
          {error && <div className="text-sm text-destructive">{error}</div>}
          {parsed && (
            <div className="rounded-md border p-3 bg-muted text-sm whitespace-pre-wrap overflow-auto max-h-64">
              {parsed.kind.toUpperCase()} PREVIEW\n\n
              {previewAs === 'yaml' ? toYAML(parsed.value) : toJSON(parsed.value)}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!parsed} onClick={handleImport}>Import & Activate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



