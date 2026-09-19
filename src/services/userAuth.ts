import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithCredential,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";

import { firebaseAuth, isFirebaseConfigured } from "./firebase";
import { getUserRole, syncUserProfile } from "./firestoreData";

export const ALLOWED_USER_EMAIL_DOMAIN = "umindanao.edu.ph";

export type AppUserSession = {
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  uid: string;
};

export function canUseFirebaseUserAuth() {
  return isFirebaseConfigured && Boolean(firebaseAuth);
}

export async function registerUserWithEmailPassword(
  username: string,
  email: string,
  password: string,
) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured.");
  }

  const displayName = username.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!displayName) {
    const error = new Error("Username is required.") as Error & {
      code: string;
    };
    error.code = "auth/missing-username";
    throw error;
  }

  enforceAllowedEmailValue(normalizedEmail);

  const userCredential = await createUserWithEmailAndPassword(
    firebaseAuth,
    normalizedEmail,
    password,
  );

  if (userCredential.user.displayName !== displayName) {
    await updateProfile(userCredential.user, { displayName });
  }

  await enforceAllowedUserEmail(userCredential.user);
  await syncAllowedUserProfile(userCredential.user, displayName);

  return toAppUserSession(userCredential.user, displayName);
}

export async function signInUserWithEmailPassword(
  email: string,
  password: string,
) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured.");
  }

  const normalizedEmail = email.trim().toLowerCase();
  enforceAllowedEmailValue(normalizedEmail);

  const userCredential = await signInWithEmailAndPassword(
    firebaseAuth,
    normalizedEmail,
    password,
  );

  await enforceAllowedUserEmail(userCredential.user);
  await syncAllowedUserProfile(userCredential.user);

  return toAppUserSession(userCredential.user);
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

  await enforceAllowedUserEmail(userCredential.user);
  await syncAllowedUserProfile(userCredential.user);

  return toAppUserSession(userCredential.user);
}

export async function signInUserWithGooglePopup() {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not configured.");
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: "select_account",
  });

  const userCredential = await signInWithPopup(firebaseAuth, provider);

  await enforceAllowedUserEmail(userCredential.user);
  await syncAllowedUserProfile(userCredential.user);

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

  const auth = firebaseAuth;

  return onAuthStateChanged(auth, (user) => {
    if (!user) {
      onSession(null);
      return;
    }

    if (!isAllowedUserEmail(user.email)) {
      void getUserRole(user.uid)
        .then((role) => {
          onSession(null);

          if (role !== "admin") {
            void signOut(auth);
          }
        })
        .catch(() => {
          onSession(null);
          void signOut(auth);
        });
      return;
    }

    onSession(toAppUserSession(user));
  });
}

export function isAllowedUserEmail(email?: string | null) {
  return Boolean(
    email?.toLowerCase().endsWith(`@${ALLOWED_USER_EMAIL_DOMAIN}`),
  );
}

function enforceAllowedEmailValue(email: string) {
  if (isAllowedUserEmail(email)) {
    return;
  }

  const error = new Error(
    `Only @${ALLOWED_USER_EMAIL_DOMAIN} accounts can log in.`,
  ) as Error & { code: string };
  error.code = "auth/unauthorized-school-domain";
  throw error;
}

async function enforceAllowedUserEmail(user: User) {
  if (isAllowedUserEmail(user.email)) {
    return;
  }

  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }

  const error = new Error(
    `Only @${ALLOWED_USER_EMAIL_DOMAIN} accounts can log in.`,
  ) as Error & { code: string };
  error.code = "auth/unauthorized-school-domain";
  throw error;
}

function toAppUserSession(
  user: User,
  displayName = user.displayName,
): AppUserSession {
  return {
    displayName,
    email: user.email,
    photoUrl: user.photoURL,
    uid: user.uid,
  };
}

async function syncAllowedUserProfile(
  user: User,
  displayName = user.displayName,
) {
  try {
    await syncUserProfile({
      displayName,
      email: user.email,
      photoUrl: user.photoURL,
      uid: user.uid,
    });
  } catch (error) {
    console.warn("Failed to sync signed-in user profile", error);
  }
}
