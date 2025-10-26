'use client';

import {
  onSnapshot,
  query,
  collection,
  where,
  type DocumentData,
  type Query,
  type FirestoreError,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export const useCollection = <T,>(
  path: string | null | undefined,
  queryConstraints: any[] = []
) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const pathSegments = useMemo(
    () => (path ? path.split('/').filter(Boolean) : []),
    [path]
  );

  const collectionQuery = useMemo(() => {
    if (!firestore || !path) return null;

    let q: Query<DocumentData> = collection(firestore, path);

    try {
      if (queryConstraints.length > 0) {
        const constraints = queryConstraints.map((c) =>
          c.type === 'where' ? where(c.field, c.op, c.value) : c
        );
        q = query(q, ...constraints);
      }
    } catch (e) {
      console.error('Error applying query constraints', e);
      setError(e as FirestoreError);
      return null;
    }
    return q;
  }, [firestore, path, queryConstraints]);

  useEffect(() => {
    if (!collectionQuery) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      collectionQuery,
      (snapshot) => {
        const docs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[];
        setData(docs);
        setLoading(false);
      },
      async (err) => {
        console.error('Error fetching collection:', err);
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: path || 'unknown',
          operation: 'list',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [collectionQuery, path]);

  return { data, loading, error };
};
