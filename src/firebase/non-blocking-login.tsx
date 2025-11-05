'use client';
import {
  Auth, // Импортируем тип Auth для типизации
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Предполагается, что getAuth и app инициализированы в другом месте
} from 'firebase/auth';

/**
 * @fileoverview Функции для неблокирующей аутентификации в Firebase.
 * Эти функции инициируют процесс входа, но не ожидают его завершения,
 * позволяя приложению продолжать работу. Изменение состояния аутентификации
 * обрабатывается глобальным слушателем onAuthStateChanged.
 */

/**
 * Инициирует анонимный вход (неблокирующий).
 * @param {Auth} authInstance - Экземпляр Firebase Auth.
 */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // КРИТИЧЕСКИ: Вызывайте signInAnonymously напрямую. НЕ используйте 'await signInAnonymously(...)'.
  signInAnonymously(authInstance);
  // Код продолжает выполняться немедленно. Изменение состояния аутентификации обрабатывается слушателем onAuthStateChanged.
}

/**
 * Инициирует регистрацию по email/паролю (неблокирующую).
 * @param {Auth} authInstance - Экземпляр Firebase Auth.
 * @param {string} email - Email пользователя.
 * @param {string} password - Пароль пользователя.
 */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  // КРИТИЧЕСКИ: Вызывайте createUserWithEmailAndPassword напрямую. НЕ используйте 'await createUserWithEmailAndPassword(...)'.
  createUserWithEmailAndPassword(authInstance, email, password);
  // Код продолжает выполняться немедленно. Изменение состояния аутентификации обрабатывается слушателем onAuthStateChanged.
}

/**
 * Инициирует вход по email/паролю (неблокирующий).
 * @param {Auth} authInstance - Экземпляр Firebase Auth.
 * @param {string} email - Email пользователя.
 * @param {string} password - Пароль пользователя.
 */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  // КРИТИЧЕСКИ: Вызывайте signInWithEmailAndPassword напрямую. НЕ используйте 'await signInWithEmailAndPassword(...)'.
  signInWithEmailAndPassword(authInstance, email, password);
  // Код продолжает выполняться немедленно. Изменение состояния аутентификации обрабатывается слушателем onAuthStateChanged.
}
