import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
  type User,
} from "firebase/auth";

import { firebaseAuth, isFirebaseConfigured } from "./firebase";

export type AppUserSession = {
  displayName?: string | null;
  email?: string | null;
  uid: string;
};

export function canUseFirebaseUserAuth() {
  return isFirebaseConfigured && Boolean(firebaseAuth);
}

export async function signInUserWithGoogleIdToken(idToken: string) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured.");
  }

  const credential = GoogleAuthProvider.credential(idToken);
  const userCredential = await signInWithCredential(
    firebaseAuth,
    credential,
  );

  return toAppUserSession(userCredential.user);
}

export async function signOutUser() {
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
}

export function watchUserSession(
  onSession: (session: AppUserSession | null) => void,
) {
  if (!firebaseAuth) {
    onSession(null);
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, (user) => {
    onSession(user ? toAppUserSession(user) : null);
  });
}

function toAppUserSession(user: User): AppUserSession {
  return {
    displayName: user.displayName,
    email: user.email,
    uid: user.uid,
  };
}

