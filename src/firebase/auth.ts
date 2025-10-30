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

export const signUpWithEmail = async (auth: Auth, email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (auth: Auth, email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

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

export const signOut = async (auth: Auth) => {
    return await firebaseSignOut(auth);
};

    