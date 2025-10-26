'use server';

import { aiRoutineOptimizer, AIRoutineOptimizerInput, AIRoutineOptimizerOutput, ScheduledActivity } from '@/ai/flows/ai-routine-optimizer';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, getApps } from 'firebase-admin/app';

// This is a workaround to initialize the Firebase Admin SDK on the server.
// In a real application, you would secure this differently.
if (!getApps().length) {
    initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'studio-7515813066-b6860',
    });
}

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

export async function applySchedule(
    schedule: ScheduledActivity[],
    userId: string
): Promise<{ success: boolean; error?: string }> {
    if (!userId) {
        return { success: false, error: "User not authenticated." };
    }

    const db = getFirestore();
    const batch = db.batch();

    try {
        // Fetch all existing exercises and habits for the user
        const exercisesSnapshot = await db.collection(`users/${userId}/exercises`).get();
        const habitsSnapshot = await db.collection(`users/${userId}/habits`).get();
        
        const allUserActivities = [
            ...exercisesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Workout' })),
            ...habitsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), type: 'Habit' }))
        ];

        // Group the AI-suggested schedule by activity name
        const activitiesToUpdate: { [key: string]: { days: string[], time: string, type: 'Workout' | 'Habit' } } = {};

        for (const item of schedule) {
            if (!activitiesToUpdate[item.activityName]) {
                activitiesToUpdate[item.activityName] = { days: [], time: item.time, type: item.activityType };
            }
            activitiesToUpdate[item.activityName].days.push(item.day);
        }
        
        // Find existing documents and update them
        for (const activityName in activitiesToUpdate) {
            const details = activitiesToUpdate[activityName];
            const existingActivity = allUserActivities.find(act => act.name === activityName);

            if (existingActivity) {
                const collectionName = existingActivity.type === 'Workout' ? 'exercises' : 'habits';
                const docRef = db.collection(`users/${userId}/${collectionName}`).doc(existingActivity.id);
                batch.update(docRef, { days: details.days, time: details.time });
            } else {
                // If the activity doesn't exist, we could create it, but for now we'll only update existing ones
                // to prevent creating lots of new, potentially incomplete, items.
                console.log(`Activity "${activityName}" not found in user's library. Skipping.`);
            }
        }
        
        await batch.commit();

        return { success: true };

    } catch (error) {
        console.error('Failed to apply schedule:', error);
        return { success: false, error: 'There was an error applying the schedule.' };
    }
}
