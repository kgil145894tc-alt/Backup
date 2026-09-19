import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  canUseFirestore,
  getUserRecentLocations,
  saveUserRecentLocation,
} from "../services/firestoreData";
import {
  getAppAccessMode,
  getStoredUserSession,
  isGuestMode,
  type StoredUserSession,
} from "./appSession";

const GUEST_HISTORY_KEY = "umvcfind:guest-history";
const USER_HISTORY_KEY_PREFIX = "umvcfind:user-history:";
const MAX_HISTORY_ITEMS = 25;

export type GuestHistoryItem = {
  featureId: string;
  featureType: string;
  name: string;
  category: string;
  type: string;
  viewedAt: number;
};

export type SaveGuestHistoryItem = Omit<
  GuestHistoryItem,
  "viewedAt"
>;

function isGuestHistoryItem(value: unknown): value is GuestHistoryItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.featureId === "string" &&
    typeof item.featureType === "string" &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    typeof item.type === "string" &&
    typeof item.viewedAt === "number"
  );
}

export async function getGuestHistory() {
  return getHistoryByStorageKey(GUEST_HISTORY_KEY);
}

export async function getCurrentHistory() {
  const context = await getCurrentHistoryContext();
  const localHistory = await getHistoryByStorageKey(context.storageKey);

  if (!context.userSession?.uid || !canUseFirestore()) {
    return localHistory;
  }

  try {
    const firestoreHistory = await getUserRecentLocations(
      context.userSession.uid,
      MAX_HISTORY_ITEMS,
    );
    const mergedHistory = mergeHistoryItems([
      ...firestoreHistory,
      ...localHistory,
    ]);

    await AsyncStorage.setItem(
      context.storageKey,
      JSON.stringify(mergedHistory),
    );

    return mergedHistory;
  } catch {
    return localHistory;
  }
}

async function getHistoryByStorageKey(storageKey: string) {
  const rawHistory = await AsyncStorage.getItem(storageKey);

  if (!rawHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(rawHistory) as unknown;

    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory
      .filter(isGuestHistoryItem)
      .sort((a, b) => b.viewedAt - a.viewedAt);
  } catch {
    return [];
  }
}

export async function saveGuestHistoryItem(
  historyItem: SaveGuestHistoryItem,
) {
  return saveHistoryItem(GUEST_HISTORY_KEY, historyItem);
}

export async function saveCurrentHistoryItem(
  historyItem: SaveGuestHistoryItem,
) {
  const context = await getCurrentHistoryContext();
  const nextHistory = await saveHistoryItem(
    context.storageKey,
    historyItem,
  );

  if (context.userSession?.uid && canUseFirestore()) {
    try {
      await saveUserRecentLocation(context.userSession.uid, {
        ...nextHistory[0],
      });
    } catch {
      return nextHistory;
    }
  }

  return nextHistory;
}

async function saveHistoryItem(
  storageKey: string,
  historyItem: SaveGuestHistoryItem,
) {
  const currentHistory = await getHistoryByStorageKey(storageKey);
  const nextItem: GuestHistoryItem = {
    ...historyItem,
    viewedAt: Date.now(),
  };
  const nextHistory = [
    nextItem,
    ...currentHistory.filter(
      (item) =>
        item.featureId !== historyItem.featureId ||
        item.featureType !== historyItem.featureType,
    ),
  ].slice(0, MAX_HISTORY_ITEMS);

  await AsyncStorage.setItem(
    storageKey,
    JSON.stringify(nextHistory),
  );

  return nextHistory;
}

function mergeHistoryItems(historyItems: GuestHistoryItem[]) {
  const dedupedHistory = new Map<string, GuestHistoryItem>();

  historyItems
    .filter(isGuestHistoryItem)
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .forEach((item) => {
      const historyKey = `${item.featureType}:${item.featureId}`;

      if (!dedupedHistory.has(historyKey)) {
        dedupedHistory.set(historyKey, item);
      }
    });

  return [...dedupedHistory.values()].slice(0, MAX_HISTORY_ITEMS);
}

async function getCurrentHistoryContext(): Promise<{
  storageKey: string;
  userSession: StoredUserSession | null;
}> {
  const [mode, userSession] = await Promise.all([
    getAppAccessMode(),
    getStoredUserSession(),
  ]);

  if (!isGuestMode(mode) && userSession?.uid) {
    return {
      storageKey: `${USER_HISTORY_KEY_PREFIX}${userSession.uid}`,
      userSession,
    };
  }

  return {
    storageKey: GUEST_HISTORY_KEY,
    userSession: null,
  };
}
