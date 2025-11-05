'use client';
    
import { useState, useEffect } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileoverview Хук React для подписки на один документ Firestore в реальном времени.
 */

/** Вспомогательный тип для добавления поля 'id' к заданному типу T. */
type WithId<T> = T & { id: string };

/**
 * Интерфейс для возвращаемого значения хука useDoc.
 * @template T Тип данных документа.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Данные документа с ID или null.
  isLoading: boolean;       // true, если идет загрузка.
  error: FirestoreError | Error | null; // Объект ошибки или null.
}

/**
 * Хук React для подписки на один документ Firestore в реальном времени.
 * Обрабатывает nullable ссылки.
 * 
 * ВАЖНО! ВЫ ДОЛЖНЫ МЕМОИЗИРОВАТЬ входной memoizedTargetRefOrQuery, иначе ПРОИЗОЙДУТ ПЛОХИЕ ВЕЩИ
 * используйте useMemo для его мемоизации согласно руководству React. Также убедитесь, что его зависимости являются стабильными
 * ссылками
 *
 *
 * @template T Необязательный тип для данных документа. По умолчанию any.
 * @param {DocumentReference<DocumentData> | null | undefined} memoizedDocRef -
 * Ссылка на документ Firestore. Ожидает, если null/undefined.
 * @returns {UseDocResult<T>} Объект с данными, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: DocumentReference<DocumentData> | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedDocRef) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          setData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          setData(null);
        }
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef]);

  return { data, isLoading, error };
}
