'use client';

import {
  doc,
  onSnapshot,
  type DocumentReference,
  type FirestoreError,
} from 'firebase/firestore';
import { useEffect, useMemo, useState } from 'react';
import { useFirestore } from '../provider';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export const useDoc = <T,>(path: string | null | undefined) => {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const docRef = useMemo(() => {
    if (!firestore || !path) return null;
    try {
      return doc(firestore, path) as DocumentReference<T>;
    } catch (e) {
      console.error('Error creating document reference', e);
      setError(e as FirestoreError);
      return null;
    }
  }, [firestore, path]);

  useEffect(() => {
    if (!docRef) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData({ id: snapshot.id, ...snapshot.data() } as T);
        } else {
          setData(null);
        }
        setLoading(false);
      },
      async (err) => {
        console.error('Error fetching document:', err);
        setError(err);
        setLoading(false);
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  return { data, loading, error };
};
