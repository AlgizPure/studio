'use client';

import { useEffect, useState } from 'react';
import { ref, getDownloadURL } from 'firebase/storage';
import { useStorage } from '../provider';

/**
 * @fileoverview Хук React для получения URL для скачивания из Firebase Storage.
 */

/**
 * Хук для получения URL для скачивания из Firebase Storage.
 * @param {string | null} path - Путь в хранилище, для которого нужно получить URL.
 * @returns {{ url: string | null, loading: boolean, error: Error | null }} - URL для скачивания, состояние загрузки и ошибка.
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
