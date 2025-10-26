'use server';

import { aiRoutineOptimizer, AIRoutineOptimizerInput, AIRoutineOptimizerOutput, ScheduledActivity } from '@/ai/flows/ai-routine-optimizer';
import { getFirestore, collection, doc, getDoc, getDocs, writeBatch } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/firebase/admin';
import type { Program, Workout } from '@/lib/types';


export async function getOptimizedRoutine(
  input: AIRoutineOptimizerInput
): Promise<{ success: boolean; data?: AIRoutineOptimizerOutput; error?: string }> {
  try {
    const result = await aiRoutineOptimizer(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI Routine Optimizer Error:', error);
    return { success: false, error: 'Failed to generate a new routine. Please try again.' };
  }
}

export async function getTemplateProgramData(programId: string): Promise<{ success: boolean; error?: string; programData?: Program, workouts?: Omit<Workout, 'id'>[] }> {
  try {
    const adminDb = getFirestore(getFirebaseAdminApp());
    
    // 1. Get the template program
    const templateProgramRef = adminDb.doc(`programs/${programId}`);
    const templateProgramSnap = await getDoc(templateProgramRef);

    if (!templateProgramSnap.exists()) {
      return { success: false, error: 'Program template not found.' };
    }
    const programData = templateProgramSnap.data() as Program;
    
    // 2. Get the workouts from the template's subcollection
    const templateWorkoutsRef = collection(templateProgramRef, 'workouts');
    const templateWorkoutsSnap = await getDocs(templateWorkoutsRef);
    
    const workouts: Omit<Workout, 'id'>[] = [];
    if (!templateWorkoutsSnap.empty) {
      templateWorkoutsSnap.forEach(workoutDoc => {
        workouts.push(workoutDoc.data() as Omit<Workout, 'id'>);
      });
    }
    
    return { success: true, programData, workouts };

  } catch (error) {
    console.error('Error fetching template program data:', error);
    return { success: false, error: 'An unexpected error occurred while fetching the program template.' };
  }
}
