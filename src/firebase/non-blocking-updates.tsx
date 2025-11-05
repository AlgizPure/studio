'use client';
    
import {
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  CollectionReference,
  DocumentReference,
  SetOptions,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import {FirestorePermissionError} from '@/firebase/errors';

/**
 * @fileoverview Функции для неблокирующих операций записи в Firestore.
 * Эти функции инициируют операции, но не ожидают их завершения,
 * а вместо этого отлавливают ошибки разрешений и передают их в `errorEmitter`.
 */

/**
 * Инициирует операцию setDoc для ссылки на документ.
 * НЕ ожидает завершения операции записи внутри.
 * @param {DocumentReference} docRef - Ссылка на документ.
 * @param {any} data - Данные для записи.
 * @param {SetOptions} options - Опции для операции set.
 */
export function setDocumentNonBlocking(docRef: DocumentReference, data: any, options: SetOptions) {
  setDoc(docRef, data, options).catch(error => {
    errorEmitter.emit(
      'permission-error',
      new FirestorePermissionError({
        path: docRef.path,
        operation: 'write', // или 'create'/'update' в зависимости от опций
        requestResourceData: data,
      })
    )
  })
  // Выполнение продолжается немедленно
}

/**
 * Инициирует операцию addDoc для ссылки на коллекцию.
 * НЕ ожидает завершения операции записи внутри.
 * Возвращает Promise для новой ссылки на документ, но обычно не ожидается вызывающей стороной.
 * @param {CollectionReference} colRef - Ссылка на коллекцию.
 * @param {any} data - Данные для добавления.
 * @returns {Promise<DocumentReference | void>} - Promise, который разрешается ссылкой на новый документ.
 */
export function addDocumentNonBlocking(colRef: CollectionReference, data: any) {
  const promise = addDoc(colRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: colRef.path,
          operation: 'create',
          requestResourceData: data,
        })
      )
    });
  return promise;
}

/**
 * Инициирует операцию updateDoc для ссылки на документ.
 * НЕ ожидает завершения операции записи внутри.
 * @param {DocumentReference} docRef - Ссылка на документ.
 * @param {any} data - Данные для обновления.
 */
export function updateDocumentNonBlocking(docRef: DocumentReference, data: any) {
  updateDoc(docRef, data)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'update',
          requestResourceData: data,
        })
      )
    });
}

/**
 * Инициирует операцию deleteDoc для ссылки на документ.
 * НЕ ожидает завершения операции записи внутри.
 * @param {DocumentReference} docRef - Ссылка на документ.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference) {
  deleteDoc(docRef)
    .catch(error => {
      errorEmitter.emit(
        'permission-error',
        new FirestorePermissionError({
          path: docRef.path,
          operation: 'delete',
        })
      )
    });
}
