/**
 * Integration Example: Import AI Recommendations
 *
 * This file demonstrates how to integrate the ImportProgramDialog
 * with AI recommendation workflow in the programs page.
 *
 * Module: AI Integration (Module 12)
 * Function: 12.6 - One-Click Apply Recommendations
 * Reference: docs/requirements/12_ai_integration_requirements.md
 */

/*
===========================================
INTEGRATION EXAMPLE FOR PROGRAMS PAGE
===========================================

Step 1: Import required components and hooks
-------------------------------------------
import { ImportProgramDialog } from '@/components/import-program-dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, FileUp } from 'lucide-react';
import type { ZTLProgram } from '@/lib/ztl/types';


Step 2: Add state for dialog
-------------------------------------------
const [importDialogOpen, setImportDialogOpen] = useState(false);
const [currentProgramZTL, setCurrentProgramZTL] = useState<ZTLProgram | null>(null);


Step 3: Load current program as ZTL (when needed)
-------------------------------------------
// This should be done when user clicks "Import AI Recommendations" button
// Convert your Program to ZTLProgram format
const loadProgramAsZTL = async () => {
  // Example: Use ZTL export logic
  const { exportProgramToZTL } = await import('@/lib/ztl/export');
  const ztlData = exportProgramToZTL(currentProgram);
  setCurrentProgramZTL(ztlData);
  setImportDialogOpen(true);
};


Step 4: Add buttons to UI
-------------------------------------------
<div className="flex gap-2">
  {/* Export for AI Analysis */}
  <Button variant="outline" onClick={handleExportForAI}>
    <FileDown className="mr-2 h-4 w-4" />
    Export for AI Analysis
  </Button>

  {/* Import AI Recommendations */}
  <Button onClick={loadProgramAsZTL}>
    <FileUp className="mr-2 h-4 w-4" />
    Import AI Recommendations
  </Button>
</div>


Step 5: Render ImportProgramDialog
-------------------------------------------
<ImportProgramDialog
  open={importDialogOpen}
  onOpenChange={setImportDialogOpen}
  currentProgram={currentProgramZTL}
  currentProgramId={currentProgram?.id}
  onImport={async (data) => {
    // This is called after successful import/apply
    // Refresh program data
    await refreshProgram();
  }}
/>


===========================================
COMPLETE WORKFLOW
===========================================

User Journey:
1. User clicks "Export for AI Analysis" button
2. ZTL YAML is generated with program + performance data + AI prompt
3. User sends YAML to Claude/Gemini for analysis
4. AI returns modified YAML with recommendations (as ZTL Patch)
5. User clicks "Import AI Recommendations" button
6. ImportProgramDialog opens with current program loaded
7. User pastes AI-modified YAML (patch) into dialog
8. User clicks "Validate" - shows diff preview
9. User reviews changes in ZTLDiffViewer
10. User clicks "Apply AI Recommendations"
11. System creates backup, applies patch, saves to Firestore
12. Success toast shown, program auto-refreshes

===========================================
FILE LOCATIONS
===========================================

Components:
- ImportProgramDialog: src/components/import-program-dialog.tsx
- ZTLDiffViewer: src/components/ztl-diff-viewer.tsx

Libraries:
- Patch Logic: src/lib/ztl/apply-patch.ts
- Backup Logic: src/lib/program-backup.ts
- ZTL Export: src/lib/ztl/export-full-analysis.ts

Types:
- ZTLProgram: src/lib/ztl/types.ts
- ZTLPatch: src/lib/ztl/types.ts

===========================================
EXAMPLE AI PATCH (YAML)
===========================================

# AI-recommended changes
patch_version: "1.0"
target_program_id: "prog_abc123"
patch:
  - op: "update-exercise"
    workout_id: "workout_monday"
    exercise_id: "bench_press_001"
    set_target:
      target_weight_kg: 102.5  # AI: Progression from 100kg (2.5% increase)
      sets: 3                  # AI: Reduced from 4 to manage fatigue
      target_rpe: 7            # AI: Lowered from 8 for recovery

  - op: "update-program"
    program_id: "prog_abc123"
    program:
      meta:
        notes: "AI Optimization: Reduced volume week 3 due to RPE >9 trend"

===========================================
*/

export {};
