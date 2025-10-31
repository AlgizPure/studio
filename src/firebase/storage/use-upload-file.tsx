'use client';

import { useState } from 'react';
import { ref, uploadBytesResumable, type UploadTask } from 'firebase/storage';
import { useStorage } from '../provider';

/**
 * Hook for uploading a file to Firebase Storage.
 * Returns upload function, progress, and upload task.
 */
export function useUploadFile() {
  const storage = useStorage();
  const [progress, setProgress] = useState<number>(0);
  const [uploadTask, setUploadTask] = useState<UploadTask | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = (path: string, file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);
      
      setUploadTask(task);
      setIsUploading(true);
      setError(null);

      task.on(
        'state_changed',
        (snapshot) => {
          const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(pct);
        },
        (err) => {
          setError(err);
          setIsUploading(false);
          reject(err);
        },
        () => {
          setIsUploading(false);
          setProgress(100);
          resolve();
        }
      );
    });
  };

  return { uploadFile, progress, uploadTask, error, isUploading };
}

