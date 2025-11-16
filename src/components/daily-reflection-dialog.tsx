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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { EmojiScaleInput } from './emoji-scale-input';
import type { DailyReflection } from '@/lib/types';
import { Loader2, Sparkles } from 'lucide-react';

interface DailyReflectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string; // YYYY-MM-DD, defaults to today
}

/**
 * Daily Reflection Dialog Component
 *
 * End-of-day reflection modal for holistic life tracking.
 * Captures mood, energy, stress, sleep quality, gratitude, and notes.
 *
 * Module: Habit Tracker 2.0 (Module 13)
 * Function: 13.5 - Daily Reflection System (Stage 3)
 * Reference: docs/requirements/13_habit_tracker_requirements.md
 */
export function DailyReflectionDialog({
  open,
  onOpenChange,
  initialDate,
}: DailyReflectionDialogProps) {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const today = initialDate || new Date().toISOString().split('T')[0];

  // Form state
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [sleepQuality, setSleepQuality] = useState(5);
  const [gratitude, setGratitude] = useState<[string, string, string]>(['', '', '']);
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [existingReflection, setExistingReflection] = useState<DailyReflection | null>(null);

  // Load existing reflection for the date
  useEffect(() => {
    if (!open || !user || !firestore) return;

    const loadReflection = async () => {
      setLoadingExisting(true);
      try {
        const reflectionsRef = collection(firestore, `users/${user.uid}/dailyReflections`);
        const q = query(reflectionsRef, where('date', '==', today));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
          const data = snapshot.docs[0].data() as DailyReflection;
          setExistingReflection(data);
          setMood(data.mood);
          setEnergy(data.energy);
          setStress(data.stress);
          setSleepQuality(data.sleepQuality);
          setGratitude((data.gratitude || ['', '', '']) as [string, string, string]);
          setNotes(data.notes || '');
        } else {
          // Reset to defaults for new reflection
          setMood(5);
          setEnergy(5);
          setStress(5);
          setSleepQuality(5);
          setGratitude(['', '', '']);
          setNotes('');
          setExistingReflection(null);
        }
      } catch (error) {
        console.error('Failed to load reflection:', error);
      } finally {
        setLoadingExisting(false);
      }
    };

    loadReflection();
  }, [open, user, firestore, today]);

  const handleSave = async () => {
    if (!user || !firestore) return;

    setLoading(true);
    try {
      const reflectionData: Omit<DailyReflection, 'id'> = {
        userId: user.uid,
        date: today,
        mood,
        energy,
        stress,
        sleepQuality,
        gratitude: gratitude.filter(g => g.trim() !== ''),
        notes: notes.trim() || undefined,
        createdAt: existingReflection?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const reflectionId = existingReflection?.id || `${user.uid}_${today}`;
      const reflectionRef = doc(firestore, `users/${user.uid}/dailyReflections/${reflectionId}`);

      await setDoc(reflectionRef, { ...reflectionData, id: reflectionId }, { merge: true });

      toast({
        title: existingReflection ? 'Reflection Updated' : 'Reflection Saved',
        description: `Your daily reflection for ${new Date(today).toLocaleDateString()} has been saved.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Failed to save reflection:', error);
      toast({
        title: 'Error',
        description: 'Failed to save reflection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGratitudeChange = (index: number, value: string) => {
    const newGratitude = [...gratitude] as [string, string, string];
    newGratitude[index] = value;
    setGratitude(newGratitude);
  };

  const isModified = existingReflection
    ? mood !== existingReflection.mood ||
      energy !== existingReflection.energy ||
      stress !== existingReflection.stress ||
      sleepQuality !== existingReflection.sleepQuality ||
      JSON.stringify(gratitude) !== JSON.stringify(existingReflection.gratitude || ['', '', '']) ||
      notes !== (existingReflection.notes || '')
    : mood !== 5 || energy !== 5 || stress !== 5 || sleepQuality !== 5 || gratitude.some(g => g.trim()) || notes.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Daily Reflection
          </DialogTitle>
          <DialogDescription>
            Take a moment to reflect on your day ({new Date(today).toLocaleDateString()})
          </DialogDescription>
        </DialogHeader>

        {loadingExisting ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Mood, Energy, Stress, Sleep */}
            <div className="space-y-4">
              <EmojiScaleInput
                label="How was your mood today?"
                value={mood}
                onChange={setMood}
                emojiType="mood"
              />

              <EmojiScaleInput
                label="How was your energy level?"
                value={energy}
                onChange={setEnergy}
                emojiType="energy"
              />

              <EmojiScaleInput
                label="How stressed did you feel?"
                value={stress}
                onChange={setStress}
                emojiType="stress"
              />

              <EmojiScaleInput
                label="How was your sleep quality?"
                value={sleepQuality}
                onChange={setSleepQuality}
                emojiType="sleep"
              />
            </div>

            {/* Gratitude */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                What are you grateful for today? (optional)
              </Label>
              {[0, 1, 2].map((index) => (
                <Input
                  key={index}
                  placeholder={`Thing ${index + 1}...`}
                  value={gratitude[index]}
                  onChange={(e) => handleGratitudeChange(index, e.target.value)}
                  className="text-sm"
                />
              ))}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Daily Notes (optional)
              </Label>
              <Textarea
                id="notes"
                placeholder="Anything else you want to remember about today..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="resize-none"
              />
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
            {existingReflection ? 'Update Reflection' : 'Save Reflection'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
