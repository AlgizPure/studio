'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { parseZTLOrPatch, toYAML, toJSON } from '@/lib/ztl/parser';
import { ZTLProgram, ZTLPatch } from '@/lib/ztl/schema';
import { applyZTLPatch, validatePatch, generatePatchSummary } from '@/lib/ztl/apply-patch';
import { ZTLDiffViewer } from '@/components/ztl-diff-viewer';
import { createProgramBackup } from '@/lib/program-backup';
import { useUser, useFirestore } from '@/firebase/provider';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { z } from 'zod';
import type { ZTLProgram as ZTLProgramType, ZTLPatch as ZTLPatchType } from '@/lib/ztl/types';

type ProgramImportData = z.infer<typeof ZTLProgram> | z.infer<typeof ZTLPatch>;
type ParsedResult = { kind: 'program'; value: z.infer<typeof ZTLProgram> } | { kind: 'patch'; value: z.infer<typeof ZTLPatch> };

export function ImportProgramDialog({
  open,
  onOpenChange,
  onImport,
  currentProgram,
  currentProgramId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onImport: (data: ProgramImportData) => Promise<void> | void;
  currentProgram?: ZTLProgramType | null;
  currentProgramId?: string;
}) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [raw, setRaw] = useState('');
  const [parsed, setParsed] = useState<ParsedResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewAs, setPreviewAs] = useState<'yaml' | 'json'>('yaml');
  const [applying, setApplying] = useState(false);
  const [patchValidation, setPatchValidation] = useState<{ valid: boolean; errors: string[] } | null>(null);
  const [patchSummary, setPatchSummary] = useState<string[] | null>(null);

  const handleParse = () => {
    setError(null);
    setPatchValidation(null);
    setPatchSummary(null);

    try {
      const res = parseZTLOrPatch(raw);
      setParsed(res);

      // If it's a patch, validate against current program
      if (res.kind === 'patch' && currentProgram) {
        const validation = validatePatch(currentProgram, res.value);
        setPatchValidation(validation);

        if (validation.valid) {
          const summary = generatePatchSummary(res.value);
          setPatchSummary(summary);
        }
      }
    } catch (e: unknown) {
      setParsed(null);
      setError(e instanceof Error ? e.message : 'Parse error');
    }
  };

  const handleImport = async () => {
    if (!parsed) return;
    await onImport(parsed.value);
    setRaw('');
    setParsed(null);
    setPatchValidation(null);
    setPatchSummary(null);
    onOpenChange(false);
  };

  const handleApplyPatch = async () => {
    if (!parsed || parsed.kind !== 'patch' || !currentProgram || !currentProgramId || !user || !firestore) {
      return;
    }

    setApplying(true);
    try {
      // 1. Create backup
      const backupId = await createProgramBackup(currentProgramId, user.uid, firestore);

      // 2. Apply patch
      const result = applyZTLPatch(currentProgram, parsed.value);

      if (!result.success) {
        throw new Error(result.error);
      }

      // 3. Save updated program to Firestore
      const programRef = doc(firestore, `users/${user.uid}/programs/${currentProgramId}`);

      // Convert ZTLProgram back to Program format for Firestore
      // (simplified - you may need more sophisticated conversion)
      await updateDoc(programRef, {
        // Store updated data - adapt based on your Program schema
        ztlData: result.program,
        updatedAt: new Date().toISOString(),
        lastAIUpdate: new Date().toISOString(),
      });

      toast({
        title: 'Success',
        description: `AI recommendations applied successfully. Backup created (ID: ${backupId.slice(0, 8)}...)`,
      });

      // Close dialog and refresh
      setRaw('');
      setParsed(null);
      setPatchValidation(null);
      setPatchSummary(null);
      onOpenChange(false);

      // Call onImport callback for parent component to refresh
      await onImport(result.program);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply patch';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setApplying(false);
    }
  };

  const isPatch = parsed?.kind === 'patch';
  const canApplyPatch = isPatch && currentProgram && patchValidation?.valid;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isPatch ? 'Import AI Recommendations (Patch)' : 'Import Program (ZTL)'}
          </DialogTitle>
          <DialogDescription>
            {isPatch
              ? 'Review AI-recommended changes before applying to your program'
              : 'Paste YAML or JSON program data to import'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Textarea
            rows={10}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            placeholder="Paste YAML or JSON here..."
            className="font-mono text-sm"
          />

          <div className="flex gap-2">
            <Button onClick={handleParse} disabled={!raw.trim()}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Validate
            </Button>
            {parsed && (
              <Button variant="secondary" onClick={() => setPreviewAs(previewAs === 'yaml' ? 'json' : 'yaml')}>
                Preview as {previewAs === 'yaml' ? 'JSON' : 'YAML'}
              </Button>
            )}
          </div>

          {/* Error display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Patch validation errors */}
          {isPatch && patchValidation && !patchValidation.valid && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Validation Errors:</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {patchValidation.errors.map((err, idx) => (
                    <li key={idx} className="text-sm">{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Patch summary */}
          {isPatch && patchSummary && patchValidation?.valid && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Changes Summary ({patchSummary.length} operations):</strong>
                <ul className="mt-2 list-disc list-inside space-y-1">
                  {patchSummary.map((summary, idx) => (
                    <li key={idx} className="text-sm">{summary}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Diff Viewer for patches */}
          {isPatch && parsed && currentProgram && patchValidation?.valid && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <Badge>Preview Changes</Badge>
              </h3>
              <ZTLDiffViewer program={currentProgram} patch={parsed.value} />
            </div>
          )}

          {/* Raw preview for programs */}
          {!isPatch && parsed && (
            <div className="rounded-md border p-3 bg-muted text-sm whitespace-pre-wrap overflow-auto max-h-64 font-mono">
              {parsed.kind.toUpperCase()} PREVIEW\n\n
              {previewAs === 'yaml' ? toYAML(parsed.value) : toJSON(parsed.value)}
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={applying}>
            Cancel
          </Button>

          {isPatch ? (
            <Button
              onClick={handleApplyPatch}
              disabled={!canApplyPatch || applying}
            >
              {applying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Apply AI Recommendations
                </>
              )}
            </Button>
          ) : (
            <Button disabled={!parsed} onClick={handleImport}>
              Import & Activate
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}



