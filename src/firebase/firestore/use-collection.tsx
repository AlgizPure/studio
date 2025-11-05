'use client';

import { useState, useEffect } from 'react';
import {
  Query,
  onSnapshot,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  CollectionReference,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * @fileoverview Хук React для подписки на коллекцию или запрос Firestore в реальном времени.
 */

/** Вспомогательный тип для добавления поля 'id' к заданному типу T. */
export type WithId<T> = T & { id: string };

/**
 * Интерфейс для возвращаемого значения хука useCollection.
 * @template T Тип данных документа.
 */
export interface UseCollectionResult<T> {
  data: WithId<T>[] | null; // Данные документа с ID или null.
  isLoading: boolean;       // true, если идет загрузка.
  error: FirestoreError | Error | null; // Объект ошибки или null.
}

/* Внутренняя реализация Query:
  https://github.com/firebase/firebase-js-sdk/blob/c5f08a9bc5da0d2b0207802c972d53724ccef055/packages/firestore/src/lite-api/reference.ts#L143
*/
export interface InternalQuery extends Query<DocumentData> {
  _query: {
    path: {
      canonicalString(): string;
      toString(): string;
    }
  }
}

/**
 * Хук React для подписки на коллекцию или запрос Firestore в реальном времени.
 * Обрабатывает nullable ссылки/запросы.
 * 
 *
 * ВАЖНО! ВЫ ДОЛЖНЫ МЕМОИЗИРОВАТЬ входной memoizedTargetRefOrQuery, иначе ПРОИЗОЙДУТ ПЛОХИЕ ВЕЩИ
 * используйте useMemo для его мемоизации согласно руководству React. Также убедитесь, что его зависимости являются стабильными
 * ссылками
 *  
 * @template T Необязательный тип для данных документа. По умолчанию any.
 * @param {CollectionReference<DocumentData> | Query<DocumentData> | null | undefined} memoizedTargetRefOrQuery -
 * Ссылка на коллекцию или запрос Firestore. Ожидает, если null/undefined.
 * @returns {UseCollectionResult<T>} Объект с данными, isLoading, error.
 */
export function useCollection<T = any>(
    memoizedTargetRefOrQuery: ((CollectionReference<DocumentData> | Query<DocumentData>))  | null | undefined,
): UseCollectionResult<T> {
  type ResultItemType = WithId<T>;
  type StateDataType = ResultItemType[] | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    
    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ResultItemType[] = snapshot.docs.map(doc => ({ ...(doc.data() as T), id: doc.id }));
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        const path: string =
        memoizedTargetRefOrQuery.type === 'collection'
          ? (memoizedTargetRefOrQuery as CollectionReference).path
          : (memoizedTargetRefOrQuery as unknown as InternalQuery)._query.path.canonicalString();

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        });

        setError(contextualError);
        setData(null);
        setIsLoading(false);

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);
  
  return { data, isLoading, error };
}
