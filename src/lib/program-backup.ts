import type { Firestore } from 'firebase/firestore';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import type { ZTLProgram } from '@/lib/ztl/types';
import type { Program } from '@/lib/types';

/**
 * Program Backup Utilities
 *
 * Creates backups before applying AI patches for rollback support.
 *
 * Module: AI Integration (Module 12)
 * Function: 12.6 - One-Click Apply Recommendations
 * Reference: docs/requirements/12_ai_integration_requirements.md
 */

/**
 * Create backup of program before applying AI patch
 *
 * @param programId - ID of program to backup
 * @param userId - User ID
 * @param firestore - Firestore instance
 * @returns Backup document ID
 *
 * Usage:
 * ```typescript
 * const backupId = await createProgramBackup('prog123', user.uid, firestore);
 * // Apply changes...
 * // If error, restore from backup
 * ```
 */
export async function createProgramBackup(
  programId: string,
  userId: string,
  firestore: Firestore
): Promise<string> {
  // Fetch current program
  const programRef = doc(firestore, `users/${userId}/programs/${programId}`);
  const programSnap = await getDoc(programRef);

  if (!programSnap.exists()) {
    throw new Error(`Program not found: ${programId}`);
  }

  const programData = { id: programSnap.id, ...programSnap.data() } as Program;

  // Create backup with timestamp
  const timestamp = new Date().toISOString();
  const backupData = {
    ...programData,
    originalId: programId,
    backupTimestamp: timestamp,
    isBackup: true,
  };

  // Save backup to special collection
  const backupsCol = collection(firestore, `users/${userId}/program_backups`);
  const backupDoc = await addDoc(backupsCol, backupData);

  return backupDoc.id;
}

/**
 * Restore program from backup
 *
 * @param backupId - Backup document ID
 * @param userId - User ID
 * @param firestore - Firestore instance
 *
 * Usage:
 * ```typescript
 * await restoreProgramFromBackup(backupId, user.uid, firestore);
 * ```
 */
export async function restoreProgramFromBackup(
  backupId: string,
  userId: string,
  firestore: Firestore
): Promise<void> {
  const backupRef = doc(firestore, `users/${userId}/program_backups/${backupId}`);
  const backupSnap = await getDoc(backupRef);

  if (!backupSnap.exists()) {
    throw new Error(`Backup not found: ${backupId}`);
  }

  const backupData = backupSnap.data();
  const originalId = backupData.originalId as string;

  if (!originalId) {
    throw new Error('Backup missing originalId');
  }

  // Restore to original location
  const programRef = doc(firestore, `users/${userId}/programs/${originalId}`);

  // Remove backup metadata
  const { isBackup, backupTimestamp, originalId: _, ...programData } = backupData;

  // Update with backup data
  await programRef.set(programData);
}

/**
 * Format backup timestamp for display
 */
export function formatBackupTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
