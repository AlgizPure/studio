# AI Recommendations Feature

**Status:** ✅ UI Complete | 🟡 Gemini Integration Pending
**Stage:** 4.2.2
**Story Points:** 8 SP

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

🟡 **Pending:**
- Gemini AI integration for auto-generation
- Firestore persistence
- Rollback UI (undo button)

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

```typescript
async function handleApply(programId: string, updatedProgram: ZTLProgram, rollback: ZTLProgram) {
  // 1. Save to Firestore
  await updateDoc(doc(db, 'programs', programId), {
    ...convertProgramToFirestore(updatedProgram),
    rollback: convertProgramToFirestore(rollback), // Store for undo
    lastModified: serverTimestamp(),
    modifiedBy: 'ai-recommendations',
  })

  // 2. Update local state
  setProgramData(updatedProgram)

  // 3. Show success toast
  toast.success('AI recommendations applied!')
}
```

---

## 🤖 Gemini AI Integration (TODO)

### Step 1: Create AI Flow

**File:** `src/ai/flows/ai-program-recommendations.ts`

```typescript
import { defineFlow, runFlow } from 'genkit'
import { gemini15Flash } from '@genkit-ai/google-genai'

export const aiProgramRecommendations = defineFlow(
  {
    name: 'aiProgramRecommendations',
    inputSchema: z.object({
      program: ZTLProgramSchema,
      logs: z.array(WorkoutLogSchema),
    }),
    outputSchema: z.object({
      recommendations: z.array(AIRecommendationSchema),
    }),
  },
  async (input) => {
    const prompt = `
      You are an elite strength & conditioning coach. Analyze this training program and recent workout logs.

      PROGRAM (ZTL):
      ${toYAML(input.program)}

      RECENT LOGS (JSON):
      ${JSON.stringify(input.logs, null, 2)}

      INSTRUCTIONS:
      1. Analyze volume trends, RPE patterns, progressive overload
      2. Identify opportunities for improvement
      3. Generate 2-3 specific recommendations as ZTL patches

      OUTPUT FORMAT (JSON):
      {
        "recommendations": [
          {
            "title": "Increase Upper Body Volume",
            "description": "Based on your progression, you can handle 10% more volume",
            "rationale": "Your RPE has been consistently 6-7 for 3 weeks...",
            "confidence": "high",
            "patch": {
              "patch": [
                {
                  "op": "update-exercise",
                  "program_id": "${input.program.meta.id}",
                  "workout_id": "...",
                  "exercise_id": "...",
                  "set_target": { "sets": 4, "target_rpe": 7.5 }
                }
              ]
            }
          }
        ]
      }
    `

    const response = await runFlow(gemini15Flash, prompt)
    const parsed = JSON.parse(response.text)

    return { recommendations: parsed.recommendations }
  }
)
```

### Step 2: Call from UI

```typescript
import { aiProgramRecommendations } from '@/ai/flows/ai-program-recommendations'

async function generateRecommendations(program: ZTLProgram, logs: WorkoutLog[]) {
  const result = await aiProgramRecommendations({ program, logs })
  return result.recommendations.map((rec) => ({
    id: generateId(),
    ...rec,
  }))
}
```

### Step 3: Add to Programs Page

```typescript
const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
const [loading, setLoading] = useState(false)

const handleGetRecommendations = async () => {
  setLoading(true)
  try {
    const logs = await fetchRecentLogs(userId, 90) // Last 90 days
    const recs = await generateRecommendations(program, logs)
    setRecommendations(recs)
    setShowDialog(true)
  } catch (error) {
    toast.error('Failed to generate recommendations')
  } finally {
    setLoading(false)
  }
}

<Button onClick={handleGetRecommendations} disabled={loading}>
  {loading ? 'Generating...' : 'Get AI Recommendations'}
</Button>
```

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
