'use client';

import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileoverview Компонент для отслеживания глобальных ошибок Firebase.
 */

/**
 * Невидимый компонент, который отслеживает глобально генерируемые события 'permission-error'.
 * Он "пробрасывает" любую полученную ошибку, чтобы ее мог перехватить Next.js's global-error.tsx.
 * @returns {null} Этот компонент ничего не рендерит.
 */
export function FirebaseErrorListener() {
  // Используем конкретный тип ошибки для состояния для типобезопасности.
  const [error, setError] = useState<FirestorePermissionError | null>(null);

  useEffect(() => {
    // Коллбэк теперь ожидает строго типизированную ошибку, соответствующую данным события.
    const handleError = (error: FirestorePermissionError) => {
      // Устанавливаем ошибку в состояние, чтобы вызвать повторный рендеринг.
      setError(error);
    };

    // Типизированный эмиттер гарантирует, что коллбэк для 'permission-error'
    // соответствует ожидаемому типу данных (FirestorePermissionError).
    errorEmitter.on('permission-error', handleError);

    // Отписываемся при размонтировании, чтобы предотвратить утечки памяти.
    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  // При повторном рендеринге, если в состоянии есть ошибка, пробрасываем ее.
  if (error) {
    throw error;
  }

  // Этот компонент ничего не рендерит.
  return null;
}
