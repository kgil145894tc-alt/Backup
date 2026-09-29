import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  canUseFirestore,
  getUserReadNotificationIds,
  markUserNotificationRead,
} from "../services/firestoreData";
import { getStoredUserSession } from "./appSession";

const NOTIFICATION_READ_KEY_PREFIX = "umvcfind:read-notifications:";

export async function getReadNotificationIds() {
  const userSession = await getStoredUserSession();
  const storageKey = getReadNotificationStorageKey(userSession?.uid);

  if (!storageKey) {
    return new Set<string>();
  }

  const localReadIds = await getLocalReadNotificationIds(storageKey);

  if (!userSession?.uid || !canUseFirestore()) {
    return localReadIds;
  }

  try {
    const firestoreReadIds = await getUserReadNotificationIds(
      userSession.uid,
    );
    const mergedReadIds = new Set([
      ...localReadIds,
      ...firestoreReadIds,
    ]);
    const localOnlyReadIds = [...localReadIds].filter(
      (id) => !firestoreReadIds.has(id),
    );

    if (mergedReadIds.size !== localReadIds.size) {
      await AsyncStorage.setItem(
        storageKey,
        JSON.stringify([...mergedReadIds]),
      );
    }

    await syncReadNotificationIds(userSession.uid, localOnlyReadIds);

    return mergedReadIds;
  } catch {
    return localReadIds;
  }
}

export async function markNotificationRead(notificationId: string) {
  const userSession = await getStoredUserSession();
  const storageKey = getReadNotificationStorageKey(userSession?.uid);

  if (!storageKey) {
    return new Set<string>();
  }

  const readIds = await getLocalReadNotificationIds(storageKey);
  readIds.add(notificationId);

  await AsyncStorage.setItem(storageKey, JSON.stringify([...readIds]));

  if (userSession?.uid && canUseFirestore()) {
    try {
      await markUserNotificationRead(userSession.uid, notificationId);
    } catch {
      return readIds;
    }
  }

  return readIds;
}

async function syncReadNotificationIds(
  userId: string,
  notificationIds: string[],
) {
  await Promise.all(
    notificationIds.map((notificationId) =>
      markUserNotificationRead(userId, notificationId),
    ),
  );
}

async function getLocalReadNotificationIds(storageKey: string) {
  const rawIds = await AsyncStorage.getItem(storageKey);

  if (!rawIds) {
    return new Set<string>();
  }

  try {
    const parsedIds = JSON.parse(rawIds) as unknown;

    if (!Array.isArray(parsedIds)) {
      return new Set<string>();
    }

    return new Set(
      parsedIds.filter((id): id is string => typeof id === "string"),
    );
  } catch {
    return new Set<string>();
  }
}

function getReadNotificationStorageKey(userId?: string) {
  return userId ? `${NOTIFICATION_READ_KEY_PREFIX}${userId}` : null;
}
