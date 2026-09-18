import AsyncStorage from "@react-native-async-storage/async-storage";

export type AppAccessMode = "guest" | "user";

const APP_ACCESS_MODE_KEY = "umvcfind:access-mode";

export async function getAppAccessMode(): Promise<AppAccessMode> {
  const mode = await AsyncStorage.getItem(APP_ACCESS_MODE_KEY);

  return mode === "user" ? "user" : "guest";
}

export async function setAppAccessMode(mode: AppAccessMode) {
  await AsyncStorage.setItem(APP_ACCESS_MODE_KEY, mode);
}

export function isGuestMode(mode: AppAccessMode) {
  return mode === "guest";
}

