'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, TrendingUp, Check, X, AlertCircle } from 'lucide-react';
import { useUser, useFirestore } from '@/firebase/provider';
import { useToast } from '@/hooks/use-toast';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Program, WorkoutExtended } from '@/lib/types';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { applyProgressionToWorkout, findExerciseInWorkout } from '@/lib/program-helpers';

/**
 * @fileoverview Панель предложений по прогрессии тренировок от AI.
 */

// ... (определения типов ProgressionSuggestion, SuggestionsData) ...

interface ProgressionSuggestionsPanelProps {
  program: Program;
}

/**
 * Компонент, который запрашивает и отображает рекомендации AI по прогрессии
 * для активной программы тренировок. Позволяет применять эти предложения.
 * @param {ProgressionSuggestionsPanelProps} props - Свойства компонента.
 * @returns {JSX.Element | null} React-компонент или null.
 */
export function ProgressionSuggestionsPanel({ program }: ProgressionSuggestionsPanelProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<any | null>(null);
  const [applying, setApplying] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; suggestion: any | null }>({ open: false, suggestion: null });

  if (!user || program.status !== 'active') return null;

  /**
   * Запрашивает предложения по прогрессии с бэкенда.
   */
  const fetchSuggestions = async () => { /* ... */ };

  /**
   * Применяет одно предложение к соответствующей тренировке.
   * @param {ProgressionSuggestion} suggestion - Предложение для применения.
   */
  const applySuggestion = async (suggestion: any) => {
    if (!user || !firestore) return;
    setApplying(suggestion.exerciseId);
    try {
      // Логика поиска и обновления тренировки
      let workoutUpdated = false;
      for (const programWorkout of program.workouts || []) {
        const workoutRef = doc(firestore, `users/${user.uid}/workouts/${programWorkout.workoutId}`);
        const workoutDoc = await getDoc(workoutRef);
        if (workoutDoc.exists()) {
          const workoutData = { id: workoutDoc.id, ...workoutDoc.data() } as WorkoutExtended;
          if (findExerciseInWorkout(workoutData, suggestion.exerciseId)) {
            const updatedWorkout = applyProgressionToWorkout(workoutData, suggestion.exerciseId, {
              suggestedWeight: suggestion.suggestedWeight, suggestedReps: suggestion.suggestedReps,
            });
            await updateDoc(workoutRef, { cycles: updatedWorkout.cycles, updatedAt: new Date().toISOString() });
            workoutUpdated = true;
            break;
          }
        }
      }
      if (workoutUpdated) {
        toast({ title: 'Успех', description: `Тренировка ${suggestion.exerciseName} обновлена.` });
      } else {
        toast({ title: 'Обновление в очереди', description: 'Изменения будут применены к тренировкам.' });
      }
      setSuggestions((prev: any) => ({ ...prev, suggestions: prev.suggestions.filter((s: any) => s.exerciseId !== suggestion.exerciseId) }));
    } catch (error: any) {
      toast({ title: 'Ошибка', description: 'Не удалось применить предложение.', variant: 'destructive' });
    } finally {
      setApplying(null);
      setConfirmDialog({ open: false, suggestion: null });
    }
  };

  /**
   * Применяет все предложения с высоким уровнем уверенности.
   */
  const applyAllHighConfidence = async () => { /* ... */ };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2"><TrendingUp />Предложения по прогрессии от AI</CardTitle>
              <CardDescription>Рекомендации для оптимизации вашей программы</CardDescription>
            </div>
            {/* ... (кнопки управления) ... */}
          </div>
        </CardHeader>
        <CardContent>
          {!suggestions && !loading && (
            <div className="space-y-3">
              <Button onClick={fetchSuggestions} className="w-full"><TrendingUp className="mr-2" />Получить прогрессии от AI</Button>
            </div>
          )}
          {loading && <div className="text-center py-8"><Loader2 className="animate-spin" /></div>}
          {suggestions && !loading && (
            <div className="space-y-4">
              {/* ... (отображение предложений в таблице) ... */}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({ open, suggestion: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Применить прогрессию?</AlertDialogTitle>
            <AlertDialogDescription>
              {/* ... (описание изменений) ... */}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmDialog.suggestion && applySuggestion(confirmDialog.suggestion)}>
              Применить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
