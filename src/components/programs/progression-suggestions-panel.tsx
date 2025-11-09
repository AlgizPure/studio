'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, TrendingUp, Check, X, AlertCircle } from 'lucide-react';
import { useUser } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Program } from '@/lib/types';
import { doc, updateDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useFirestore } from '@/firebase/provider';
import { applyProgressionToWorkout, findExerciseInWorkout } from '@/lib/program-helpers';
import type { WorkoutExtended } from '@/lib/types';
import { logger } from '@/lib/logger';

// Extended Program type with optional AI progression fields
type ProgramWithProgressionData = Program & {
  detailedWorkouts?: WorkoutExtended[];
  exerciseUpdates?: Record<string, {
    exerciseId: string;
    exerciseName: string;
    targetWeight?: number;
    targetReps?: number;
    updatedAt: string;
  }>;
};

type ProgressionSuggestion = {
  exerciseId: string;
  exerciseName: string;
  currentWeight?: number;
  currentReps?: number;
  suggestedWeight?: number;
  suggestedReps?: number;
  reasoning: string;
  confidence: number;
  applyImmediately: boolean;
};

type SuggestionsData = {
  suggestions: ProgressionSuggestion[];
  globalRecommendation?: string;
  lastAnalyzed?: string;
  fromCache?: boolean;
};

interface ProgressionSuggestionsPanelProps {
  program: ProgramWithProgressionData;
}

export function ProgressionSuggestionsPanel({ program }: ProgressionSuggestionsPanelProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionsData | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; suggestion: ProgressionSuggestion | null }>({
    open: false,
    suggestion: null,
  });

  // Don't render if user is not authenticated or program is invalid
  if (!user || !firestore || !program || program.status !== 'active' || !program.workouts || program.workouts.length === 0) {
    return null;
  }

  const fetchSuggestions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch('/api/ai/progressions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, programId: program.id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch suggestions');
      }

      const data = await response.json();
      setSuggestions(data);
    } catch (error: unknown) {
      logger.error('[ProgressionSuggestionsPanel] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate suggestions';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const applySuggestion = async (suggestion: ProgressionSuggestion) => {
    if (!user || !firestore) return;

    setApplying(suggestion.exerciseId);
    try {
      // Find which workout in the program contains this exercise
      // We need to load the WorkoutExtended documents to find the exercise
      let workoutFound = false;
      let workoutUpdated: WorkoutExtended | null = null;
      let workoutIdToUpdate: string | null = null;

      // Try to find the exercise in workouts stored in the program or fetch them
      for (const programWorkout of program.workouts) {
        // Option 1: Check if workout is stored inline (for template programs)
        const inlineWorkout = program.detailedWorkouts?.find(
          (w) => w.id === programWorkout.workoutId
        );

        if (inlineWorkout) {
          const found = findExerciseInWorkout(inlineWorkout, suggestion.exerciseId);
          if (found) {
            workoutUpdated = applyProgressionToWorkout(inlineWorkout, suggestion.exerciseId, {
              suggestedWeight: suggestion.suggestedWeight,
              suggestedReps: suggestion.suggestedReps,
            });
            workoutIdToUpdate = inlineWorkout.id;
            workoutFound = true;
            break;
          }
        }

        // Option 2: Fetch workout from Firestore
        try {
          const workoutRef = doc(firestore, `users/${user.uid}/workouts/${programWorkout.workoutId}`);
          const workoutDoc = await getDoc(workoutRef);
          
          if (workoutDoc.exists()) {
            const workoutData = { id: workoutDoc.id, ...workoutDoc.data() } as WorkoutExtended;
            const found = findExerciseInWorkout(workoutData, suggestion.exerciseId);
            
            if (found) {
              workoutUpdated = applyProgressionToWorkout(workoutData, suggestion.exerciseId, {
                suggestedWeight: suggestion.suggestedWeight,
                suggestedReps: suggestion.suggestedReps,
              });
              workoutIdToUpdate = workoutData.id;
              workoutFound = true;
              
              // Save updated workout back to Firestore
              await updateDoc(workoutRef, {
                cycles: workoutUpdated.cycles,
                updatedAt: new Date().toISOString(),
              });
              break;
            }
          }
        } catch (err) {
          // Workout might be in a different location, continue searching
          logger.error(`[ProgressionSuggestionsPanel] Could not fetch workout ${programWorkout.workoutId}`, err);
        }
      }

      if (!workoutFound || !workoutUpdated) {
        // Fallback: Store update metadata in Program document
        const programRef = doc(firestore, `users/${user.uid}/programs/${program.id}`);
        const existingUpdates = program.exerciseUpdates || {};
        await updateDoc(programRef, {
          exerciseUpdates: {
            ...existingUpdates,
            [`${suggestion.exerciseId}_${Date.now()}`]: {
              exerciseId: suggestion.exerciseId,
              exerciseName: suggestion.exerciseName,
              targetWeight: suggestion.suggestedWeight,
              targetReps: suggestion.suggestedReps,
              updatedAt: new Date().toISOString(),
            },
          },
          updatedAt: new Date().toISOString(),
        });

        toast({
          title: 'Update Queued',
          description: `Progression update for ${suggestion.exerciseName} saved. Will be applied to workouts.`,
        });
      } else {
        toast({
          title: 'Success',
          description: `Updated ${suggestion.exerciseName} to ${suggestion.suggestedWeight}kg${suggestion.suggestedReps ? ` × ${suggestion.suggestedReps}` : ''}`,
        });
      }

      // Remove applied suggestion from list
      setSuggestions(prev => prev ? {
        ...prev,
        suggestions: prev.suggestions.filter(s => s.exerciseId !== suggestion.exerciseId),
      } : null);
    } catch (error: unknown) {
      logger.error('[ProgressionSuggestionsPanel] Apply error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply suggestion';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setApplying(null);
      setConfirmDialog({ open: false, suggestion: null });
    }
  };

  const applyAllHighConfidence = async () => {
    if (!suggestions || !user) return;

    const highConfidence = suggestions.suggestions.filter(s => s.confidence >= 85);
    if (highConfidence.length === 0) {
      toast({
        title: 'No suggestions',
        description: 'No high-confidence suggestions to apply',
      });
      return;
    }

    for (const suggestion of highConfidence) {
      await applySuggestion(suggestion);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return 'text-green-600';
    if (confidence >= 70) return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                AI Progression Suggestions
              </CardTitle>
              <CardDescription>
                AI-powered recommendations to optimize your program
              </CardDescription>
            </div>
            {suggestions && suggestions.suggestions.length > 0 && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={applyAllHighConfidence}
                >
                  Apply All High Confidence (≥85%)
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSuggestions(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {!suggestions && !loading && (
            <div className="space-y-3">
              <Button onClick={fetchSuggestions} className="w-full">
                <TrendingUp className="mr-2 h-4 w-4" />
                Get AI Progressions
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Analyze your program and recent workouts to get personalized progression recommendations
              </p>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Analyzing program...</p>
            </div>
          )}

          {suggestions && !loading && (
            <div className="space-y-4">
              {suggestions.globalRecommendation && (
                <div className="rounded-lg bg-muted p-3 text-sm">
                  {suggestions.globalRecommendation}
                </div>
              )}

              {suggestions.suggestions.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                  <p className="text-sm">No progression suggestions available.</p>
                  <p className="text-xs mt-1">Complete more workouts to get AI recommendations.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exercise</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>Suggested</TableHead>
                      <TableHead>Confidence</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {suggestions.suggestions.map((suggestion) => (
                      <TableRow key={suggestion.exerciseId}>
                        <TableCell className="font-medium">
                          {suggestion.exerciseName}
                          {suggestion.reasoning && (
                            <div className="text-xs text-muted-foreground mt-1" title={suggestion.reasoning}>
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              {suggestion.reasoning.substring(0, 50)}...
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {suggestion.currentWeight && suggestion.currentReps
                            ? `${suggestion.currentWeight}kg × ${suggestion.currentReps}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {suggestion.suggestedWeight && suggestion.suggestedReps
                            ? `${suggestion.suggestedWeight}kg × ${suggestion.suggestedReps}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={suggestion.confidence >= 85 ? 'default' : 'secondary'}
                            className={getConfidenceColor(suggestion.confidence)}
                          >
                            {suggestion.confidence}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setConfirmDialog({ open: true, suggestion })}
                            disabled={applying === suggestion.exerciseId}
                          >
                            {applying === suggestion.exerciseId ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Apply
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {suggestions.lastAnalyzed && (
                <div className="text-xs text-muted-foreground pt-2 border-t">
                  Last analyzed: {new Date(suggestions.lastAnalyzed).toLocaleString()}
                  {suggestions.fromCache && ' (cached)'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, suggestion: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Progression?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.suggestion && (
                <>
                  Update <strong>{confirmDialog.suggestion.exerciseName}</strong> from{' '}
                  {confirmDialog.suggestion.currentWeight && confirmDialog.suggestion.currentReps
                    ? `${confirmDialog.suggestion.currentWeight}kg × ${confirmDialog.suggestion.currentReps}`
                    : 'N/A'}{' '}
                  to{' '}
                  {confirmDialog.suggestion.suggestedWeight && confirmDialog.suggestion.suggestedReps
                    ? `${confirmDialog.suggestion.suggestedWeight}kg × ${confirmDialog.suggestion.suggestedReps}`
                    : 'N/A'}
                  ?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmDialog.suggestion && applySuggestion(confirmDialog.suggestion!)}
            >
              Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
