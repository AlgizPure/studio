'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AIRecommendationsDialog, type AIRecommendation } from './ai-recommendations-dialog'
import type { ZTLProgram, ZTLPatch } from '@/lib/ztl/types'

/**
 * Example Usage of AI Recommendations Dialog
 *
 * This demonstrates how to integrate AI recommendations into your program page.
 *
 * To use in production:
 * 1. Replace mock recommendations with actual Gemini AI calls
 * 2. Implement onApply to save to Firestore
 * 3. Add error handling and loading states
 * 4. Add rollback UI (undo button)
 *
 * Usage:
 * ```tsx
 * import { AIRecommendationsExample } from '@/components/ai-recommendations-example'
 *
 * // In your program page:
 * <AIRecommendationsExample program={currentProgram} />
 * ```
 */
export function AIRecommendationsExample({ program }: { program: ZTLProgram }) {
  const [showDialog, setShowDialog] = useState(false)

  // Mock recommendations (replace with actual Gemini AI call)
  const mockRecommendations: AIRecommendation[] = [
    {
      id: '1',
      title: 'Increase Upper Body Volume',
      description: 'Based on your progression, you can handle 10% more volume on bench press',
      rationale:
        'Your RPE has been consistently 6-7 for the last 3 weeks, indicating you have capacity for more volume. Research shows 10-20% volume increases are well-tolerated when RPE < 8.',
      confidence: 'high',
      patch: {
        patch: [
          {
            op: 'update-exercise',
            program_id: program.meta.id,
            workout_id: program.workouts[0]?.id || '',
            exercise_id: program.workouts[0]?.cycles[0]?.exercises[0]?.id || '',
            set_target: {
              sets: 4, // from 3
              target_rpe: 7.5, // from 7
            },
          },
        ],
      },
    },
    {
      id: '2',
      title: 'Add Deload Week',
      description: 'Schedule a deload after 4 weeks of progressive overload',
      rationale:
        'You have been progressing for 4 consecutive weeks. A deload week (40% volume reduction) will optimize recovery and prevent overtraining.',
      confidence: 'medium',
      patch: {
        patch: [
          {
            op: 'update-program',
            program_id: program.meta.id,
            program: {
              progression: {
                rules: [],
                deload: {
                  week: 5,
                  volume_reduction: '40%',
                },
              },
            },
          },
        ],
      },
    },
  ]

  const handleApply = async (programId: string, updatedProgram: ZTLProgram, rollback: ZTLProgram) => {
    // TODO: Implement actual save to Firestore
    console.log('Applying program update:', {
      programId,
      updatedProgram,
      rollback,
    })

    // Example Firestore update:
    // await updateDoc(doc(db, 'programs', programId), {
    //   ...convertProgramToFirestore(updatedProgram),
    //   rollback: convertProgramToFirestore(rollback), // Store for undo
    //   lastModified: serverTimestamp(),
    //   modifiedBy: 'ai-recommendations',
    // })

    alert('AI recommendations applied! (Mock - not saved to database)')
  }

  return (
    <>
      <Button onClick={() => setShowDialog(true)} className="gap-2">
        <Sparkles className="h-4 w-4" />
        Get AI Recommendations
      </Button>

      <AIRecommendationsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        program={program}
        recommendations={mockRecommendations}
        onApply={handleApply}
      />
    </>
  )
}

/**
 * TODO: Gemini AI Integration
 *
 * Replace mock recommendations with actual Gemini API call:
 *
 * ```ts
 * async function generateAIRecommendations(program: ZTLProgram, logs: WorkoutLog[]): Promise<AIRecommendation[]> {
 *   // 1. Export program + logs as ZTL
 *   const ztlExport = toYAML(program)
 *   const logsJson = JSON.stringify(logs)
 *
 *   // 2. Call Gemini AI
 *   const prompt = `
 *     You are an elite strength coach. Analyze this program and recent workout logs.
 *     Return recommendations as ZTL patches (JSON array).
 *
 *     Program:
 *     ${ztlExport}
 *
 *     Recent Logs:
 *     ${logsJson}
 *
 *     Return format:
 *     {
 *       "recommendations": [
 *         {
 *           "title": "...",
 *           "description": "...",
 *           "rationale": "...",
 *           "confidence": "high" | "medium" | "low",
 *           "patch": { "patch": [...] }
 *         }
 *       ]
 *     }
 *   `
 *
 *   const response = await callGemini(prompt)
 *   const parsed = JSON.parse(response)
 *
 *   return parsed.recommendations.map(rec => ({
 *     id: generateId(),
 *     ...rec,
 *   }))
 * }
 * ```
 *
 * Integration points:
 * - src/ai/flows/ - Create new flow: ai-program-recommendations.ts
 * - src/app/programs/[programId]/page.tsx - Add "Get AI Recommendations" button
 * - src/lib/ztl/apply-patch.ts - Already implemented!
 */
