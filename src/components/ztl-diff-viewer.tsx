'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { ZTLProgram, ZTLPatch, ZTLExercise } from '@/lib/ztl/types'

interface ZTLDiffViewerProps {
  program: ZTLProgram
  patch: ZTLPatch
}

type DiffItem = {
  type: 'exercise-update' | 'program-update' | 'exercise-remove' | 'program-add'
  workoutName?: string
  exerciseName?: string
  before?: Partial<ZTLExercise>
  after?: Partial<ZTLExercise>
  field?: string
}

/**
 * ZTL Diff Viewer
 *
 * Shows before/after comparison for ZTL patch changes.
 *
 * Displays:
 * - Exercise target changes (weight, reps, RPE, etc.)
 * - Program metadata changes
 * - Added/removed exercises
 */
export function ZTLDiffViewer({ program, patch }: ZTLDiffViewerProps) {
  const diffs: DiffItem[] = []

  // Parse patch operations into diff items
  for (const op of patch.patch) {
    switch (op.op) {
      case 'update-exercise': {
        const workout = program.workouts.find((w) => w.id === op.workout_id)
        if (!workout) continue

        let exercise: ZTLExercise | undefined
        for (const cycle of workout.cycles) {
          exercise = cycle.exercises.find((e) => e.id === op.exercise_id)
          if (exercise) break
        }

        if (exercise && op.set_target) {
          diffs.push({
            type: 'exercise-update',
            workoutName: workout.name,
            exerciseName: exercise.name,
            before: exercise,
            after: { ...exercise, ...op.set_target },
          })
        }
        break
      }

      case 'update-program':
        diffs.push({
          type: 'program-update',
          before: program.meta as unknown as Partial<ZTLExercise>,
          after: { ...(program.meta as unknown as Partial<ZTLExercise>), ...(op.program.meta as unknown as Partial<ZTLExercise> || {}) },
        })
        break

      case 'remove-exercise': {
        const workout = program.workouts.find((w) => w.id === op.workout_id)
        if (!workout) continue

        let exercise: ZTLExercise | undefined
        for (const cycle of workout.cycles) {
          exercise = cycle.exercises.find((e) => e.id === op.exercise_id)
          if (exercise) break
        }

        if (exercise) {
          diffs.push({
            type: 'exercise-remove',
            workoutName: workout.name,
            exerciseName: exercise.name,
          })
        }
        break
      }

      case 'add-program':
        diffs.push({
          type: 'program-add',
        })
        break
    }
  }

  if (diffs.length === 0) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">No changes to display</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {diffs.map((diff, idx) => (
        <DiffItemCard key={idx} diff={diff} />
      ))}
    </div>
  )
}

function DiffItemCard({ diff }: { diff: DiffItem }) {
  if (diff.type === 'exercise-update') {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge variant="outline" className="bg-blue-500 text-white border-none">
              MODIFIED
            </Badge>
            {diff.workoutName} → {diff.exerciseName}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {diff.before && diff.after && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground mb-2">Before:</p>
                <ExerciseTargets exercise={diff.before} />
              </div>
              <div>
                <p className="font-medium text-green-600 mb-2">After:</p>
                <ExerciseTargets exercise={diff.after} highlight={getChangedFields(diff.before, diff.after)} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (diff.type === 'exercise-remove') {
    return (
      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge variant="outline" className="bg-red-500 text-white border-none">
              REMOVED
            </Badge>
            {diff.workoutName} → {diff.exerciseName}
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (diff.type === 'program-add') {
    return (
      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500 text-white border-none">
              NEW PROGRAM
            </Badge>
            Complete program replacement
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  return null
}

function ExerciseTargets({ exercise, highlight = [] }: { exercise: Partial<ZTLExercise>; highlight?: string[] }) {
  const fields = [
    { key: 'sets', label: 'Sets', value: exercise.sets },
    { key: 'target_reps', label: 'Reps', value: exercise.target_reps },
    { key: 'target_weight_kg', label: 'Weight', value: exercise.target_weight_kg ? `${exercise.target_weight_kg} kg` : undefined },
    { key: 'target_rpe', label: 'RPE', value: exercise.target_rpe },
    { key: 'rest_s', label: 'Rest', value: exercise.rest_s ? `${exercise.rest_s}s` : undefined },
  ].filter((f) => f.value !== undefined)

  return (
    <div className="space-y-1">
      {fields.map((field) => (
        <div
          key={field.key}
          className={`flex justify-between ${
            highlight.includes(field.key) ? 'font-bold text-green-600' : 'text-muted-foreground'
          }`}
        >
          <span>{field.label}:</span>
          <span>{field.value}</span>
        </div>
      ))}
    </div>
  )
}

function getChangedFields(before: Partial<ZTLExercise>, after: Partial<ZTLExercise>): string[] {
  const changed: string[] = []
  const keys = Object.keys(after) as Array<keyof ZTLExercise>

  for (const key of keys) {
    if (before[key] !== after[key]) {
      changed.push(key)
    }
  }

  return changed
}
