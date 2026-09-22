import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

import {
  firebaseAuth,
  firestoreDb,
  isFirebaseConfigured,
} from "./firebase";
import { getUserRole } from "./firestoreData";

export type AdminSession = {
  email: string;
  source: "firebase";
  uid?: string;
};

export type AdminLoginResult =
  | {
      ok: true;
      session: AdminSession;
    }
  | {
      ok: false;
      message: string;
    };

async function hasAdminRole(user: User) {
  if (!firestoreDb) {
    return false;
  }

  return (await getUserRole(user.uid)) === "admin";
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isFirebaseConfigured || !firebaseAuth || !firestoreDb) {
    return {
      ok: false,
      message:
        "Firebase is not configured. Admin access requires Firebase Authentication.",
    };
  }

  try {
    const credential = await signInWithEmailAndPassword(
      firebaseAuth,
      normalizedEmail,
      password,
    );

    if (!(await hasAdminRole(credential.user))) {
      await signOut(firebaseAuth);
      return {
        ok: false,
        message: "This account is not allowed to access admin.",
      };
    }

    return {
      ok: true,
      session: {
        email: credential.user.email ?? normalizedEmail,
        source: "firebase",
        uid: credential.user.uid,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Invalid Firebase admin email or password.",
    };
  }
}

export async function logoutAdmin() {
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
}

export function watchFirebaseAdminSession(
  onSession: (session: AdminSession | null) => void,
) {
  if (!isFirebaseConfigured || !firebaseAuth || !firestoreDb) {
    onSession(null);
    return () => {};
  }

  return onAuthStateChanged(firebaseAuth, (user) => {
    if (!user) {
      onSession(null);
      return;
    }

    void hasAdminRole(user)
      .then((isAdmin) => {
        onSession(
          isAdmin
            ? {
                email: user.email ?? "Admin User",
                source: "firebase",
                uid: user.uid,
              }
            : null,
        );
      })
      .catch((error) => {
        console.warn("Failed to verify Firebase admin session", error);
        onSession(null);
      });
  });
}
