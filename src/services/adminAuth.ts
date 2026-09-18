import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import {
  firebaseAuth,
  firestoreDb,
  isFirebaseConfigured,
} from "./firebase";

export const PROTOTYPE_ADMIN_EMAIL = "admin@umvcfind.local";
export const PROTOTYPE_ADMIN_PASSWORD = "admin123";

export type AdminSession = {
  email: string;
  source: "firebase" | "prototype";
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

function isPrototypeAdminCredentials(email: string, password: string) {
  return (
    email.trim().toLowerCase() === PROTOTYPE_ADMIN_EMAIL &&
    password === PROTOTYPE_ADMIN_PASSWORD
  );
}

async function hasAdminRole(user: User) {
  if (!firestoreDb) {
    return false;
  }

  const userSnapshot = await getDoc(doc(firestoreDb, "users", user.uid));

  if (!userSnapshot.exists()) {
    return false;
  }

  return userSnapshot.data().role === "admin";
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<AdminLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isFirebaseConfigured || !firebaseAuth || !firestoreDb) {
    if (isPrototypeAdminCredentials(normalizedEmail, password)) {
      return {
        ok: true,
        session: {
          email: PROTOTYPE_ADMIN_EMAIL,
          source: "prototype",
        },
      };
    }

    return {
      ok: false,
      message:
        "Invalid prototype admin login. Firebase is not configured yet.",
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
