'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AIRecommendationsDialog, type AIRecommendation } from './ai-recommendations-dialog'
import type { ZTLProgram } from '@/lib/ztl/types'
import { useToast } from '@/hooks/use-toast'

/**
 * AI Recommendations Component (Production-Ready)
 *
 * Integrates with Gemini AI to generate program recommendations based on:
 * - Program structure (ZTL format)
 * - Recent workout logs (last 90 days)
 * - RPE patterns, volume trends, progressive overload analysis
 *
 * Usage:
 * ```tsx
 * import { AIRecommendationsComponent } from '@/components/ai-recommendations-example'
 *
 * // In your program page:
 * <AIRecommendationsComponent
 *   program={currentProgram}
 *   userId={userId}
 *   onProgramUpdate={handleProgramUpdate}
 * />
 * ```
 */
export function AIRecommendationsComponent({
  program,
  userId,
  onProgramUpdate,
}: {
  program: ZTLProgram
  userId: string
  onProgramUpdate?: (updatedProgram: ZTLProgram) => Promise<void>
}) {
  const [showDialog, setShowDialog] = useState(false)
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  /**
   * Fetch AI recommendations from the API
   */
  const handleGetRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          programId: program.meta.id,
          daysBack: 90, // Analyze last 90 days of workout logs
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.recommendations || data.recommendations.length === 0) {
        setError('No recommendations available at this time.')
        toast({
          title: 'No Recommendations',
          description: 'Complete a few more workouts to get AI recommendations.',
          variant: 'default',
        })
        return
      }

      setRecommendations(data.recommendations)
      setShowDialog(true)

      toast({
        title: 'Recommendations Generated',
        description: `Generated ${data.recommendations.length} recommendation${data.recommendations.length > 1 ? 's' : ''}`,
        variant: 'default',
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate recommendations'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  /**
   * Apply recommendation patch to program and save to Firestore
   */
  const handleApply = async (programId: string, updatedProgram: ZTLProgram, rollback: ZTLProgram) => {
    try {
      // Call parent component's update handler (should save to Firestore)
      if (onProgramUpdate) {
        await onProgramUpdate(updatedProgram)
      }

      // Store rollback in Firestore for undo functionality
      // TODO: Implement rollback storage
      // await updateDoc(doc(db, `users/${userId}/programs/${programId}`), {
      //   rollback: rollback,
      //   rollbackTimestamp: serverTimestamp(),
      // })

      toast({
        title: 'Recommendation Applied',
        description: 'Program has been updated successfully!',
        variant: 'default',
      })

      setShowDialog(false)
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to apply recommendation',
        variant: 'destructive',
      })
      throw err
    }
  }

  return (
    <>
      <Button
        onClick={handleGetRecommendations}
        disabled={loading}
        className="gap-2"
      >
        <Sparkles className="h-4 w-4" />
        {loading ? 'Generating...' : 'Get AI Recommendations'}
      </Button>

      {error && (
        <p className="text-sm text-destructive mt-2">{error}</p>
      )}

      <AIRecommendationsDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        program={program}
        recommendations={recommendations}
        onApply={handleApply}
      />
    </>
  )
}

/**
 * Legacy mock example component (for reference/testing)
 * @deprecated Use AIRecommendationsComponent instead
 */
export function AIRecommendationsExample({ program }: { program: ZTLProgram }) {
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
              sets: 4,
              target_rpe: 7.5,
            },
          },
        ],
      },
    },
  ]

  return (
    <AIRecommendationsDialog
      open={true}
      onOpenChange={() => {}}
      program={program}
      recommendations={mockRecommendations}
      onApply={async () => {
        alert('Mock: Recommendation applied')
      }}
    />
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
