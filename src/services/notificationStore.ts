import {
  campusNotifications,
  type CampusNotification,
} from "../data/notifications";
import {
  canUseFirestore,
  getNotifications,
  type FirestoreNotification,
} from "./firestoreData";

export async function loadNotifications() {
  if (!canUseFirestore()) {
    return campusNotifications;
  }

  try {
    const firestoreNotifications = await getNotifications();

    return firestoreNotifications.length
      ? dedupeNotifications(
          firestoreNotifications.map(
            firestoreNotificationToCampusNotification,
          ),
        )
      : campusNotifications;
  } catch (error) {
    console.warn("Failed to load notifications from Firestore", error);
    return campusNotifications;
  }
}

function dedupeNotifications(notifications: CampusNotification[]) {
  const seenNotificationKeys = new Set<string>();
  const uniqueNotifications: CampusNotification[] = [];

  notifications.forEach((notification) => {
    const notificationKey = [
      notification.category,
      normalizeNotificationText(notification.title),
      normalizeNotificationText(notification.message),
      normalizeNotificationText(notification.locationName ?? ""),
      normalizeNotificationText(notification.locationSubtitle ?? ""),
    ].join("|");

    if (seenNotificationKeys.has(notificationKey)) {
      return;
    }

    seenNotificationKeys.add(notificationKey);
    uniqueNotifications.push(notification);
  });

  return uniqueNotifications;
}

function normalizeNotificationText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function firestoreNotificationToCampusNotification(
  notification: FirestoreNotification,
): CampusNotification {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    timeLabel:
      notification.timeLabel ||
      formatNotificationTime(notification.createdAtMs),
    category: notification.category,
    locationName: notification.locationName,
    locationSubtitle: notification.locationSubtitle,
  };
}

function formatNotificationTime(createdAtMs?: number) {
  if (!createdAtMs) {
    return "Recently";
  }

  const elapsedMs = Date.now() - createdAtMs;
  const elapsedMinutes = Math.max(1, Math.round(elapsedMs / 60000));

  if (elapsedMinutes < 60) {
    return `${elapsedMinutes} min ago`;
  }

  const elapsedHours = Math.round(elapsedMinutes / 60);

  if (elapsedHours < 24) {
    return `${elapsedHours} hour${elapsedHours === 1 ? "" : "s"} ago`;
  }

  const elapsedDays = Math.round(elapsedHours / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
}
