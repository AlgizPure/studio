'use client';

import { 
    type Auth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    signInWithRedirect
} from 'firebase/auth';

/**
 * @fileoverview Функции для аутентификации пользователей Firebase.
 */

/**
 * Регистрирует нового пользователя с помощью email и пароля.
 * @param {Auth} auth - Экземпляр Firebase Auth.
 * @param {string} email - Email пользователя.
 * @param {string} password - Пароль пользователя.
 * @returns {Promise<UserCredential>} - Учетные данные пользователя.
 */
export const signUpWithEmail = async (auth: Auth, email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Выполняет вход пользователя с помощью email и пароля.
 * @param {Auth} auth - Экземпляр Firebase Auth.
 * @param {string} email - Email пользователя.
 * @param {string} password - Пароль пользователя.
 * @returns {Promise<UserCredential>} - Учетные данные пользователя.
 */
export const signInWithEmail = async (auth: Auth, email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

/**
 * Выполняет вход пользователя с помощью Google.
 * @param {Auth} auth - Экземпляр Firebase Auth.
 * @returns {Promise<UserCredential | void>} - Учетные данные пользователя или ничего, если используется перенаправление.
 * @throws {Error} - Если произошла ошибка, не связанная с блокировкой всплывающего окна.
 */
export const signInWithGoogle = async (auth: Auth) => {
    const provider = new GoogleAuthProvider();
    try {
        return await signInWithPopup(auth, provider);
    } catch (e: any) {
        if (e?.code === 'auth/popup-blocked' || e?.code === 'auth/popup-closed-by-user') {
            await signInWithRedirect(auth, provider);
            return;
        }
        throw e;
    }
};

/**
 * Выполняет выход пользователя.
 * @param {Auth} auth - Экземпляр Firebase Auth.
 * @returns {Promise<void>}
 */
export const signOut = async (auth: Auth) => {
    return await firebaseSignOut(auth);
};
