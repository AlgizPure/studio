'use server';

import { aiRoutineOptimizer, AIRoutineOptimizerInput, AIRoutineOptimizerOutput, ScheduledActivity } from '@/ai/flows/ai-routine-optimizer';
import { getFirestore, collection, doc, getDoc, getDocs, writeBatch } from 'firebase-admin/firestore';
import { getFirebaseAdminApp } from '@/firebase/admin';

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

export async function addTemplateProgramToUser(programId: string, userId: string): Promise<{ success: boolean; error?: string; newProgramId?: string }> {
  if (!userId) {
    return { success: false, error: 'User is not authenticated.' };
  }
  
  try {
    const adminDb = getFirestore(getFirebaseAdminApp());
    const batch = adminDb.batch();

    // 1. Get the template program
    const templateProgramRef = adminDb.doc(`programs/${programId}`);
    const templateProgramSnap = await getDoc(templateProgramRef);

    if (!templateProgramSnap.exists) {
      return { success: false, error: 'Program template not found.' };
    }
    const templateProgramData = templateProgramSnap.data();

    // 2. Create a new program for the user
    const userProgramsRef = adminDb.collection(`users/${userId}/programs`);
    const newUserProgramRef = doc(userProgramsRef);
    batch.set(newUserProgramRef, {
      ...templateProgramData,
      isTemplate: false,
      authorId: userId,
    });

    // 3. Get the workouts from the template's subcollection
    const templateWorkoutsRef = collection(templateProgramRef, 'workouts');
    const templateWorkoutsSnap = await getDocs(templateWorkoutsRef);

    // 4. Add each workout to the new user program's subcollection
    if (!templateWorkoutsSnap.empty) {
      const newUserProgramWorkoutsRef = collection(newUserProgramRef, 'workouts');
      templateWorkoutsSnap.forEach(workoutDoc => {
        const newWorkoutRef = doc(newUserProgramWorkoutsRef);
        batch.set(newWorkoutRef, workoutDoc.data());
      });
    }

    // 5. Commit the batch
    await batch.commit();

    return { success: true, newProgramId: newUserProgramRef.id };
  } catch (error) {
    console.error('Error adding template program to user:', error);
    return { success: false, error: 'An unexpected error occurred while adding the program.' };
  }
}
