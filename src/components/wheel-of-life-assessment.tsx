'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/firebase/provider';
import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore';
import { useFirestore } from '@/hooks/use-firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DimensionSliderInput } from './dimension-slider-input';
import type { WeeklyContext } from '@/lib/types';
import { LIFE_DIMENSIONS, getWeekStart } from '@/lib/wheel-of-life';
import { Loader2, Target } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface WheelOfLifeAssessmentProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialWeek?: string; // ISO date string (Monday), defaults to current week
}

/**
 * Wheel of Life Assessment Dialog Component
 *
 * Weekly self-assessment across 8 life dimensions (1-10 scale).
 * Includes optional notes per dimension for context.
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.6 - Context Systems (Stage 4)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */
export function WheelOfLifeAssessment({
  open,
  onOpenChange,
  initialWeek,
}: WheelOfLifeAssessmentProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const currentWeek = initialWeek || getWeekStart(new Date());

  // Form state - all 8 dimensions
  const [dimensions, setDimensions] = useState<WeeklyContext['contexts']>({
    fitness: 5,
    career: 5,
    relationships: 5,
    growth: 5,
    environment: 5,
    fun: 5,
    contribution: 5,
    spirituality: 5,
  });

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [existingAssessment, setExistingAssessment] = useState<WeeklyContext | null>(null);

  // Load existing assessment for the week
  useEffect(() => {
    if (!open || !user || !firestore) return;

    const loadAssessment = async () => {
      setLoadingExisting(true);
      try {
        const assessmentsRef = collection(firestore, `users/${user.uid}/weeklyContexts`);
        const q = query(assessmentsRef, where('weekStart', '==', currentWeek));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as WeeklyContext;
          setExistingAssessment(data);
          setDimensions(data.contexts);
          setNotes(data.notes || {});
        } else {
          // Reset to defaults for new assessment
          setDimensions({
            fitness: 5,
            career: 5,
            relationships: 5,
            growth: 5,
            environment: 5,
            fun: 5,
            contribution: 5,
            spirituality: 5,
          });
          setNotes({});
          setExistingAssessment(null);
        }
      } catch (error) {
        console.error('Failed to load assessment:', error);
      } finally {
        setLoadingExisting(false);
      }
    };

    loadAssessment();
  }, [open, user, firestore, currentWeek]);

  const handleSave = async () => {
    if (!user || !firestore) return;

    setLoading(true);
    try {
      const assessmentData: Omit<WeeklyContext, 'id'> = {
        userId: user.uid,
        weekStart: currentWeek,
        contexts: dimensions,
        notes: Object.keys(notes).length > 0 ? notes : undefined,
        createdAt: existingAssessment?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const assessmentId = existingAssessment?.id || `${user.uid}_${currentWeek}`;
      const assessmentRef = doc(firestore, `users/${user.uid}/weeklyContexts/${assessmentId}`);

      await setDoc(assessmentRef, { ...assessmentData, id: assessmentId }, { merge: true });

      toast({
        title: existingAssessment ? 'Assessment Updated' : 'Assessment Saved',
        description: `Your Wheel of Life assessment for week of ${new Date(currentWeek).toLocaleDateString()} has been saved.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save assessment:', error);
      toast({
        title: 'Error',
        description: 'Failed to save assessment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDimensionChange = (dimension: keyof WeeklyContext['contexts'], value: number) => {
    setDimensions(prev => ({ ...prev, [dimension]: value }));
  };

  const handleNoteChange = (dimension: string, value: string) => {
    setNotes(prev => {
      const updated = { ...prev };
      if (value.trim()) {
        updated[dimension] = value;
      } else {
        delete updated[dimension];
      }
      return updated;
    });
  };

  const isModified = existingAssessment
    ? JSON.stringify(dimensions) !== JSON.stringify(existingAssessment.contexts) ||
      JSON.stringify(notes) !== JSON.stringify(existingAssessment.notes || {})
    : Object.values(dimensions).some(v => v !== 5) || Object.keys(notes).length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Wheel of Life Assessment
          </DialogTitle>
          <DialogDescription>
            Rate each area of your life for the week of {new Date(currentWeek).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        {loadingExisting ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* 8 Life Dimensions */}
            {LIFE_DIMENSIONS.map((dimension) => (
              <div key={dimension} className="space-y-2">
                <DimensionSliderInput
                  dimension={dimension}
                  value={dimensions[dimension]}
                  onChange={(value) => handleDimensionChange(dimension, value)}
                />

                {/* Optional Notes Accordion */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={dimension} className="border-none">
                    <AccordionTrigger className="py-2 text-xs text-muted-foreground hover:text-foreground">
                      {notes[dimension] ? '📝 Edit notes' : '+ Add notes (optional)'}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Textarea
                        placeholder={`Notes about your ${dimension}...`}
                        value={notes[dimension] || ''}
                        onChange={(e) => handleNoteChange(dimension, e.target.value)}
                        rows={2}
                        className="text-sm resize-none"
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            ))}

            {/* Guidance Text */}
            <div className="mt-6 p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-2">Assessment Tips:</p>
              <ul className="space-y-1 text-xs list-disc list-inside">
                <li>Rate each dimension honestly (1 = very poor, 10 = excellent)</li>
                <li>Consider your satisfaction, not just activity level</li>
                <li>Add notes to remember specific wins or challenges</li>
                <li>Aim for balance across all dimensions, not perfection in one</li>
              </ul>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading || loadingExisting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || loadingExisting || !isModified}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {existingAssessment ? 'Update Assessment' : 'Save Assessment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
