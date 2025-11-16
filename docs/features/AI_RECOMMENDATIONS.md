# AI Recommendations Feature

**Status:** ✅ COMPLETE (UI + Gemini AI Integration)
**Stage:** 4.2.2
**Story Points:** 8 SP
**Completion Date:** 2025-11-15

---

## 📖 Overview

AI Recommendations system allows users to receive AI-generated program modifications with one-click apply functionality.

### Key Features

✅ **Implemented:**
- ZTL Patch apply logic with validation
- AI Recommendations Dialog UI
- Diff viewer for change preview
- Rollback support
- Mock recommendations for testing
- **Gemini AI integration** (complete flow + API endpoint)
- **Firestore integration** (program/logs fetching, caching, usage limits)
- **Production-ready UI component** (AIRecommendationsComponent)

🟡 **Optional Enhancements:**
- Rollback UI (undo button)
- Recommendation history tracking
- A/B testing for recommendations

---

## 🏗️ Architecture

### Core Components

#### 1. Apply Logic (`src/lib/ztl/apply-patch.ts`)

```typescript
import { applyZTLPatch, validatePatch, generatePatchSummary } from '@/lib/ztl/apply-patch'

// Apply a patch with validation
const result = applyZTLPatch(program, patch)
if (result.success) {
  // result.program - updated program
  // result.rollback - snapshot for undo
} else {
  console.error(result.error)
}

// Validate before apply
const validation = validatePatch(program, patch)
if (!validation.valid) {
  console.error(validation.errors)
}

// Generate human-readable summary
const summary = generatePatchSummary(patch)
// ["Update exercise: sets, target_rpe"]
```

**Functions:**
- `applyZTLPatch(program, patch)` - Apply patch with rollback snapshot
- `validatePatch(program, patch)` - Validate all IDs exist
- `generatePatchSummary(patch)` - Human-readable change summary

**Features:**
- Deep cloning (no mutations)
- Rollback snapshots
- Type-safe operations
- Error handling

---

#### 2. AI Recommendations Dialog (`src/components/ai-recommendations-dialog.tsx`)

```typescript
import { AIRecommendationsDialog, type AIRecommendation } from '@/components/ai-recommendations-dialog'

const recommendations: AIRecommendation[] = [
  {
    id: '1',
    title: 'Increase Upper Body Volume',
    description: 'You can handle 10% more volume',
    rationale: 'Your RPE has been consistently low...',
    confidence: 'high',
    patch: {
      patch: [
        {
          op: 'update-exercise',
          program_id: program.meta.id,
          workout_id: 'workout-1',
          exercise_id: 'exercise-1',
          set_target: { sets: 4, target_rpe: 7.5 },
        },
      ],
    },
  },
]

<AIRecommendationsDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  program={currentProgram}
  recommendations={recommendations}
  onApply={handleApply}
/>
```

**Props:**
- `open` - Dialog visibility
- `program` - Current program (ZTLProgram)
- `recommendations` - AI-generated recommendations
- `onApply` - Callback with (programId, updatedProgram, rollback)

**Features:**
- Confidence badges (high/medium/low)
- Expandable cards with rationale
- Change summary preview
- One-click apply button
- Validation before apply
- Error handling

---

#### 3. ZTL Diff Viewer (`src/components/ztl-diff-viewer.tsx`)

```typescript
import { ZTLDiffViewer } from '@/components/ztl-diff-viewer'

<ZTLDiffViewer program={program} patch={patch} />
```

**Features:**
- Before/After comparison
- Color-coded changes (blue=modified, red=removed, green=added)
- Highlighted changed fields
- Exercise target comparison
- Program metadata changes

---

## 🚀 Usage

### Example Integration

```typescript
// src/app/programs/[programId]/page.tsx
import { AIRecommendationsExample } from '@/components/ai-recommendations-example'

export default function ProgramPage({ params }: { params: { programId: string } }) {
  const program = useProgramData(params.programId)

  return (
    <div>
      <h1>{program.name}</h1>

      {/* Add AI Recommendations button */}
      <AIRecommendationsExample program={program} />
    </div>
  )
}
```

### Production Implementation

**File:** `src/app/programs/[programId]/page.tsx`

```typescript
import { AIRecommendationsComponent } from '@/components/ai-recommendations-example'
import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import type { ZTLProgram } from '@/lib/ztl/types'

export default function ProgramPage({ params }: { params: { programId: string } }) {
  const { user } = useUser()
  const firestore = useFirestore()
  const program = useProgramData(params.programId) // Assumes ZTL format

  // Check if program has ZTL structure
  const isZTLProgram = program?.meta && program?.workouts?.some(w => w.cycles)

  const handleProgramUpdate = async (updatedProgram: ZTLProgram) => {
    if (!user || !firestore) throw new Error('Not authenticated')

    // Save to Firestore
    await updateDoc(doc(firestore, `users/${user.uid}/programs/${params.programId}`), {
      ...updatedProgram,
      // Store rollback for undo (optional)
      updatedAt: serverTimestamp(),
      modifiedBy: 'ai-recommendations',
    })

    // Update local state
    setProgramData(updatedProgram)
  }

  return (
    <div>
      <h1>{program.meta.name}</h1>

      {/* Show AI Recommendations only for ZTL programs */}
      {isZTLProgram && user && (
        <AIRecommendationsComponent
          program={program}
          userId={user.uid}
          onProgramUpdate={handleProgramUpdate}
        />
      )}
    </div>
  )
}
```

**Important Notes:**
- AI Recommendations **only work with ZTL-formatted programs** (programs with `meta`, `workouts[].cycles[].exercises[]` structure)
- Regular app programs need to be converted to ZTL format first
- Check for ZTL structure before showing the recommendations button

---

## 🤖 Gemini AI Integration (✅ IMPLEMENTED)

### Step 1: ✅ AI Flow Created

**File:** `src/ai/flows/ai-program-recommendations.ts` (IMPLEMENTED)

Key features:
- **Input:** ZTL program + workout logs (last 30-90 days)
- **Output:** 2-5 recommendations with ZTL patches
- **Prompt:** Analyzes progressive overload, RPE patterns, completion rates, recovery indicators
- **Fallback:** Mock generator if API key missing or `NEXT_PUBLIC_AI_MOCK=1`
- **Retry logic:** 3 attempts with exponential backoff

```typescript
import { getAIProgramRecommendations } from '@/ai/flows/ai-program-recommendations'

const result = await getAIProgramRecommendations(program, recentLogs)
// result.recommendations: AIRecommendation[]
// result.summary: string (program health overview)
```

### Step 2: ✅ API Endpoint Created

**File:** `src/app/api/ai/recommendations/route.ts` (IMPLEMENTED)

**Endpoint:** `POST /api/ai/recommendations`

**Request:**
```json
{
  "userId": "user-123",
  "programId": "program-456",
  "daysBack": 90
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "id": "rec-1",
      "title": "Increase Upper Body Volume",
      "description": "...",
      "rationale": "...",
      "confidence": "high",
      "patch": { "patch": [...] }
    }
  ],
  "summary": "Program is progressing well...",
  "generatedAt": "2025-01-15T12:00:00Z",
  "cacheUntil": "2025-01-16T12:00:00Z",
  "fromCache": false
}
```

**Features:**
- ✅ Firestore integration (fetches program + logs)
- ✅ 24h caching
- ✅ Usage limits (daily quotas)
- ✅ Error handling with fallback to expired cache

### Step 3: ✅ UI Component Created

**File:** `src/components/ai-recommendations-example.tsx` (IMPLEMENTED)

**Component:** `AIRecommendationsComponent`

```typescript
import { AIRecommendationsComponent } from '@/components/ai-recommendations-example'

<AIRecommendationsComponent
  program={ztlProgram}
  userId={user.uid}
  onProgramUpdate={handleProgramUpdate}
/>
```

**Features:**
- ✅ Fetches recommendations from API
- ✅ Loading states ("Generating...")
- ✅ Error handling with toast notifications
- ✅ Integrates with AIRecommendationsDialog
- ✅ One-click apply with Firestore persistence

**Props:**
- `program: ZTLProgram` - Program to analyze
- `userId: string` - User ID for Firestore queries
- `onProgramUpdate?: (updatedProgram: ZTLProgram) => Promise<void>` - Callback to save updated program

---

## 📝 ZTL Patch Format

### Supported Operations

#### 1. Update Exercise

```yaml
patch:
  - op: update-exercise
    program_id: "program-123"
    workout_id: "workout-1"
    exercise_id: "exercise-1"
    set_target:
      sets: 4
      target_reps: "8-10"
      target_weight_kg: 100
      target_rpe: 7.5
```

#### 2. Update Program

```yaml
patch:
  - op: update-program
    program_id: "program-123"
    program:
      meta:
        goal: hypertrophy
      progression:
        deload:
          week: 5
          volume_reduction: "40%"
```

#### 3. Remove Exercise

```yaml
patch:
  - op: remove-exercise
    program_id: "program-123"
    workout_id: "workout-1"
    exercise_id: "exercise-1"
```

#### 4. Add Program

```yaml
patch:
  - op: add-program
    program:
      meta:
        version: "1.0"
        id: "new-program-123"
        name: "AI-Generated Program"
      # ... full program structure
```

---

## 🔄 Rollback Mechanism

### Store Rollback Snapshot

```typescript
// When applying patch
const result = applyZTLPatch(program, patch)
if (result.success) {
  // Save rollback to Firestore
  await updateDoc(doc(db, 'programs', programId), {
    current: result.program,
    rollback: result.rollback, // Snapshot before changes
    rollbackTimestamp: serverTimestamp(),
  })
}
```

### Undo Changes

```typescript
async function handleUndo(programId: string) {
  const programDoc = await getDoc(doc(db, 'programs', programId))
  const rollback = programDoc.data()?.rollback

  if (!rollback) {
    toast.error('No rollback available')
    return
  }

  // Restore rollback snapshot
  await updateDoc(doc(db, 'programs', programId), {
    current: rollback,
    rollback: null, // Clear rollback
  })

  toast.success('Changes reverted!')
}
```

---

## ✅ Testing

### Unit Tests

```typescript
import { applyZTLPatch, validatePatch } from '@/lib/ztl/apply-patch'

describe('applyZTLPatch', () => {
  it('should apply update-exercise patch', () => {
    const program: ZTLProgram = { /* ... */ }
    const patch: ZTLPatch = {
      patch: [
        {
          op: 'update-exercise',
          program_id: program.meta.id,
          workout_id: 'workout-1',
          exercise_id: 'exercise-1',
          set_target: { sets: 4 },
        },
      ],
    }

    const result = applyZTLPatch(program, patch)

    expect(result.success).toBe(true)
    expect(result.program.workouts[0].cycles[0].exercises[0].sets).toBe(4)
    expect(result.rollback).toEqual(program) // Original unchanged
  })

  it('should validate patch before apply', () => {
    const program: ZTLProgram = { /* ... */ }
    const invalidPatch: ZTLPatch = {
      patch: [{ op: 'update-exercise', workout_id: 'nonexistent', /* ... */ }],
    }

    const validation = validatePatch(program, invalidPatch)

    expect(validation.valid).toBe(false)
    expect(validation.errors).toContain('Workout not found: nonexistent')
  })
})
```

---

## 🐛 Troubleshooting

### Error: "Workout not found"

**Cause:** Patch references non-existent workout ID
**Solution:** Validate patch with `validatePatch()` before applying

### Error: "Exercise not found"

**Cause:** Exercise ID not found in any cycle
**Solution:** Check exercise exists in workout, verify ID matches

### Error: "Program ID mismatch"

**Cause:** Patch program_id doesn't match actual program
**Solution:** Ensure patch is generated for correct program

---

## 📚 Related Documentation

- [ZTL DSL Specification](../core/ZTL_DSL.md)
- [AI Integration Guide](../core/AI_INTEGRATION.md)
- [Genkit Flows](../backend/GENKIT_FLOWS.md)

---

## 🚧 Future Enhancements

- [ ] Gemini AI integration (auto-generate recommendations)
- [ ] Rollback UI (undo button with history)
- [ ] Batch apply (apply multiple recommendations at once)
- [ ] Recommendation history (show past AI suggestions)
- [ ] Confidence scoring improvements
- [ ] A/B testing recommendations
- [ ] User feedback on recommendations (helpful/not helpful)
- [ ] Recommendation explanations with citations

---

**Last Updated:** 2025-11-15
**Author:** Claude (AI Integration Stage 4.2.2)
