/**
 * Firestore type converters with Zod validation
 *
 * Provides type-safe read/write operations for Firestore collections
 * with runtime validation using Zod schemas.
 *
 * Usage:
 * ```typescript
 * const exercisesRef = collection(firestore, 'exercises').withConverter(exerciseConverter);
 * const docSnap = await getDoc(doc(exercisesRef, 'id'));
 * const exercise = docSnap.data(); // Typed as Exercise, validated by Zod
 * ```
 */

import {
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
  type DocumentData,
  type Firestore,
} from 'firebase/firestore';
import { z } from 'zod';
import type { Exercise, Habit, WorkoutExtended, Program, HabitLog, HabitCategory, ExerciseCategory } from './types';
import { logger } from './logger';

// ============================================================================
// ZOD SCHEMAS FOR FIRESTORE COLLECTIONS
// ============================================================================

/**
 * Exercise schema for Firestore validation
 */
const exerciseSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  categoryId: z.string(),
  description: z.string(),
  image: z.string().url(),
  custom: z.boolean().optional(),
  authorId: z.string().optional(),
  lastCompleted: z.string().optional(),
  distance: z.number().optional(),
  parameters: z.array(z.object({
    id: z.string(),
    name: z.string(),
    unit: z.string(),
    defaultValue: z.number(),
  })).optional(),
  plannedDuration: z.object({
    minutes: z.number(),
    seconds: z.number(),
  }).optional(),
  trackDuration: z.boolean().optional(),
  actualDuration: z.number().optional(),
});

/**
 * Habit schema (supports both legacy and v2)
 */
const habitSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  categoryId: z.string().optional(),
  // Legacy fields
  goal: z.string().optional(),
  completed: z.boolean().optional(),
  days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])).optional(),
  pomodoro: z.object({
    cycles: z.number(),
  }).optional(),
  // V2 fields
  type: z.enum(['boolean', 'quantity', 'duration', 'range']).optional(),
  authorId: z.string().optional(),
  schemaVersion: z.number().optional(),
}).passthrough(); // Allow additional fields for v2

/**
 * Category schemas (Habit & Exercise)
 */
const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  authorId: z.string().optional(),
});

/**
 * HabitLog schema
 */
const habitLogSchema = z.object({
  id: z.string(),
  habitId: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(['done', 'partial', 'skipped', 'missed']),
  note: z.string().optional(),
  extractedFrom: z.enum(['manual', 'reflection', 'system']),
  value: z.number().optional(),
  durationMin: z.number().optional(),
  contextData: z.record(z.any()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
}).passthrough();

/**
 * Program schema
 */
const programSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  startDate: z.string(),
  endDate: z.string().optional(),
  durationType: z.enum(['fixed', 'infinite']),
  status: z.enum(['draft', 'active', 'paused', 'completed']),
  goal: z.string().optional(),
  tags: z.array(z.string()),
  workouts: z.array(z.any()), // Complex nested structure
  createdAt: z.string(),
  updatedAt: z.string(),
  userId: z.string(),
  isTemplate: z.boolean().optional(),
}).passthrough();

/**
 * WorkoutExtended schema
 */
const workoutSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive']).optional(),
  cycles: z.array(z.any()).optional(), // Complex nested structure
  estimatedDuration: z.number().optional(),
  authorId: z.string().optional(),
  isStandalone: z.boolean().optional(),
  standaloneSchedule: z.object({
    days: z.array(z.enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])),
    time: z.string().optional(),
  }).optional(),
}).passthrough();

// ============================================================================
// CONVERTER FACTORY
// ============================================================================

/**
 * Creates a type-safe Firestore converter with Zod validation
 */
function createConverter<T>(
  schema: z.ZodType<any>, // Relaxed to avoid strict type issues
  collectionName: string
): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T): DocumentData {
      try {
        // Validate before writing
        const validated = schema.parse(data) as T & { id?: string };

        // Remove 'id' field as Firestore stores it separately
        const { id, ...firestoreData } = validated;

        return firestoreData as DocumentData;
      } catch (error) {
        logger.error(`Firestore converter (${collectionName}): Validation error on write`, error instanceof Error ? error : new Error(String(error)));
        throw error;
      }
    },

    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): T {
      const data = snapshot.data(options);

      try {
        // Add document ID to data
        const dataWithId = { ...data, id: snapshot.id };

        // Validate after reading
        const validated = schema.parse(dataWithId);

        return validated;
      } catch (error) {
        logger.error(`Firestore converter (${collectionName}): Validation error on read`, error instanceof Error ? error : new Error(String(error)), { docId: snapshot.id });

        // Return data with ID even if validation fails (graceful degradation)
        return { ...data, id: snapshot.id } as T;
      }
    },
  };
}

// ============================================================================
// EXPORTED CONVERTERS
// ============================================================================

/**
 * Exercise collection converter
 *
 * @example
 * ```typescript
 * const exercisesRef = collection(firestore, 'exercises').withConverter(exerciseConverter);
 * const docSnap = await getDoc(doc(exercisesRef, 'id'));
 * const exercise = docSnap.data(); // Typed as Exercise
 * ```
 */
export const exerciseConverter = createConverter<Exercise>(exerciseSchema, 'exercises');

/**
 * Habit collection converter (supports both legacy and v2)
 */
export const habitConverter = createConverter<Habit>(habitSchema, 'habits');

/**
 * HabitCategory collection converter
 */
export const habitCategoryConverter = createConverter<HabitCategory>(categorySchema, 'habitCategories');

/**
 * ExerciseCategory collection converter
 */
export const exerciseCategoryConverter = createConverter<ExerciseCategory>(categorySchema, 'exerciseCategories');

/**
 * HabitLog collection converter
 */
export const habitLogConverter = createConverter<HabitLog>(habitLogSchema, 'habitLogs');

/**
 * Program collection converter
 */
export const programConverter = createConverter<Program>(programSchema, 'programs');

/**
 * WorkoutExtended collection converter
 */
export const workoutConverter = createConverter<WorkoutExtended>(workoutSchema, 'workouts');

// ============================================================================
// HELPER FUNCTION FOR USER COLLECTIONS
// ============================================================================

/**
 * Helper to get a user-specific collection reference with converter
 *
 * @example
 * ```typescript
 * const exercisesRef = getUserCollection(firestore, user.uid, 'exercises', exerciseConverter);
 * const snapshot = await getDocs(exercisesRef);
 * snapshot.docs.forEach(doc => {
 *   const exercise = doc.data(); // Typed as Exercise
 * });
 * ```
 */
export function getUserCollection<T>(
  firestore: Firestore,
  userId: string,
  collectionName: string,
  converter: FirestoreDataConverter<T>
) {
  const { collection } = require('firebase/firestore');
  return collection(firestore, `users/${userId}/${collectionName}`).withConverter(converter);
}
