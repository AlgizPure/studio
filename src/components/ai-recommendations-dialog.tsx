'use client'

import { useState } from 'react'
import { Check, X, AlertTriangle, Sparkles, Undo2 } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ZTLProgram, ZTLPatch } from '@/lib/ztl/types'
import { applyZTLPatch, generatePatchSummary, validatePatch } from '@/lib/ztl/apply-patch'

export interface AIRecommendation {
  id: string
  title: string
  description: string
  patch: ZTLPatch
  rationale?: string
  confidence: 'high' | 'medium' | 'low'
}

interface AIRecommendationsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  program: ZTLProgram
  recommendations: AIRecommendation[]
  onApply: (programId: string, updatedProgram: ZTLProgram, rollback: ZTLProgram) => Promise<void>
}

/**
 * AI Recommendations Dialog
 *
 * Shows AI-generated program modifications with:
 * - Diff preview of changes
 * - One-click apply button
 * - Validation before apply
 * - Rollback support
 *
 * Usage:
 * ```tsx
 * <AIRecommendationsDialog
 *   open={showDialog}
 *   onOpenChange={setShowDialog}
 *   program={currentProgram}
 *   recommendations={aiRecommendations}
 *   onApply={handleApply}
 * />
 * ```
 */
export function AIRecommendationsDialog({
  open,
  onOpenChange,
  program,
  recommendations,
  onApply,
}: AIRecommendationsDialogProps) {
  const [selectedRec, setSelectedRec] = useState<AIRecommendation | null>(null)
  const [applying, setApplying] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleApplyRecommendation = async (rec: AIRecommendation) => {
    setApplying(true)
    setError(null)

    try {
      // Validate patch
      const validation = validatePatch(program, rec.patch)
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Apply patch
      const result = applyZTLPatch(program, rec.patch)
      if (!result.success) {
        throw new Error(result.error)
      }

      // Call onApply callback
      await onApply(program.meta.id, result.program, result.rollback)

      // Success
      onOpenChange(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to apply recommendation')
    } finally {
      setApplying(false)
    }
  }

  const confidenceColor = (confidence: AIRecommendation['confidence']) => {
    switch (confidence) {
      case 'high':
        return 'bg-green-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-orange-500'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Recommendations
          </DialogTitle>
          <DialogDescription>
            Review and apply AI-suggested modifications to your program
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          {recommendations.length === 0 && (
            <Alert>
              <AlertDescription>No recommendations available</AlertDescription>
            </Alert>
          )}

          {recommendations.map((rec) => {
            const patchSummary = generatePatchSummary(rec.patch)
            const isSelected = selectedRec?.id === rec.id

            return (
              <Card
                key={rec.id}
                className={`cursor-pointer transition-colors ${
                  isSelected ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                }`}
                onClick={() => setSelectedRec(isSelected ? null : rec)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        {rec.title}
                        <Badge
                          variant="outline"
                          className={`${confidenceColor(rec.confidence)} text-white border-none`}
                        >
                          {rec.confidence} confidence
                        </Badge>
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                    {isSelected && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </CardHeader>

                {isSelected && (
                  <CardContent className="space-y-4">
                    {rec.rationale && (
                      <div className="text-sm">
                        <p className="font-medium mb-1">Rationale:</p>
                        <p className="text-muted-foreground">{rec.rationale}</p>
                      </div>
                    )}

                    <Separator />

                    <div>
                      <p className="font-medium text-sm mb-2">Changes:</p>
                      <ul className="space-y-1">
                        {patchSummary.map((change, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary">•</span>
                            <span>{change}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Separator />

                    <div className="flex gap-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleApplyRecommendation(rec)
                        }}
                        disabled={applying}
                        className="flex-1"
                      >
                        {applying ? (
                          <>Applying...</>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Apply Changes
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedRec(null)
                        }}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
