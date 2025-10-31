'use client';

import { useEffect, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { useStorage } from '../provider';

/**
 * Hook for getting a download URL from Firebase Storage.
 * @param path - The storage path to get URL for
 * @returns The download URL, loading state, and error
 */
export function useDownloadUrl(path: string | null) {
  const storage = useStorage();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!path) {
      setUrl(null);
      return;
    }

    setLoading(true);
    setError(null);

    const storageRef = ref(storage, path);
    getDownloadURL(storageRef)
      .then((downloadUrl) => {
        setUrl(downloadUrl);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [path, storage]);

  return { url, loading, error };
}

