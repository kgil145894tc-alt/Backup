import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppAccessMode = "guest" | "user";

export type StoredUserSession = {
  displayName?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  uid: string;
};

const APP_ACCESS_MODE_KEY = "umvcfind:access-mode";
const APP_USER_SESSION_KEY = "umvcfind:user-session";

export async function getAppAccessMode(): Promise<AppAccessMode> {
  const mode = await AsyncStorage.getItem(APP_ACCESS_MODE_KEY);

  return mode === "user" ? "user" : "guest";
}

export async function setAppAccessMode(mode: AppAccessMode) {
  await AsyncStorage.setItem(APP_ACCESS_MODE_KEY, mode);
}

export async function getStoredUserSession() {
  const rawSession = await AsyncStorage.getItem(APP_USER_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(rawSession) as unknown;

    if (
      parsedSession &&
      typeof parsedSession === "object" &&
      typeof (parsedSession as StoredUserSession).uid === "string"
    ) {
      return parsedSession as StoredUserSession;
    }
  } catch {
    return null;
  }

  return null;
}

export async function setStoredUserSession(session: StoredUserSession) {
  await AsyncStorage.setItem(
    APP_USER_SESSION_KEY,
    JSON.stringify(session),
  );
}

export async function clearStoredUserSession() {
  await AsyncStorage.removeItem(APP_USER_SESSION_KEY);
}

export function isGuestMode(mode: AppAccessMode) {
  return mode === "guest";
}
