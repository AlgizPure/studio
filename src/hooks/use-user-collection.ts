/**
 * Custom hook for accessing user-specific Firestore collections
 *
 * Eliminates the repetitive pattern of:
 * ```
 * const query = useMemoFirebase(
 *   () => (user ? collection(firestore, `users/${user.uid}/collection`) : null),
 *   [user, firestore]
 * );
 * const { data } = useCollection<T>(query);
 * ```
 *
 * Now just:
 * ```
 * const { data } = useUserCollection<T>('collection');
 * ```
 */

import { useMemo } from 'react';
import { collection, query as firestoreQuery, type Query, type QueryConstraint } from 'firebase/firestore';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';

/**
 * Hook to access a user-specific Firestore collection
 *
 * @param collectionName - Name of the collection under users/{uid}/
 * @param constraints - Optional Firestore query constraints (orderBy, where, limit, etc.)
 * @returns The same return value as useCollection<T>
 *
 * @example
 * // Simple usage
 * const { data: habits } = useUserCollection<Habit>('habits');
 *
 * @example
 * // With query constraints
 * const { data: workouts } = useUserCollection<WorkoutLog>(
 *   'workoutLogs',
 *   orderBy('startTime', 'desc'),
 *   limit(10)
 * );
 *
 * @example
 * // With multiple constraints
 * const { data: activePrograms } = useUserCollection<Program>(
 *   'programs',
 *   where('status', '==', 'active'),
 *   orderBy('createdAt', 'desc')
 * );
 */
export function useUserCollection<T = unknown>(
  collectionName: string,
  ...constraints: QueryConstraint[]
) {
  const { user } = useUser();
  const firestore = useFirestore();

  // Memoize the query to prevent unnecessary re-renders
  const q = useMemoFirebase(
    () => {
      if (!user) return null;

      const col = collection(firestore, `users/${user.uid}/${collectionName}`);

      // If no constraints, return the collection reference
      if (constraints.length === 0) {
        return col;
      }

      // Apply constraints
      return firestoreQuery(col, ...constraints);
    },
    // Dependencies: user, firestore, collectionName, and all constraints
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, firestore, collectionName, ...constraints]
  );

  // Use the existing useCollection hook
  return useCollection<T>(q);
}

/**
 * Hook to access multiple user-specific collections
 *
 * @param collections - Array of collection names
 * @returns Object with collection data keyed by collection name
 *
 * @example
 * const { habits, programs, workouts } = useUserCollections<{
 *   habits: Habit[];
 *   programs: Program[];
 *   workouts: WorkoutLog[];
 * }>(['habits', 'programs', 'workouts']);
 */
export function useUserCollections<T extends Record<string, unknown>>(
  collections: (keyof T)[]
): Record<keyof T, { data: T[keyof T][] | undefined; isLoading: boolean; error: Error | null }> {
  const results: any = {};

  collections.forEach(collectionName => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[collectionName] = useUserCollection(collectionName as string);
  });

  return results;
}
