import {
  campusNotifications,
  type CampusNotification,
} from "../data/notifications";
import {
  canUseFirestore,
  getNotifications,
  type FirestoreNotification,
  watchNotifications,
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

export function subscribeToNotifications(
  onChange: (notifications: CampusNotification[]) => void,
) {
  if (!canUseFirestore()) {
    onChange(campusNotifications);
    return () => {};
  }

  try {
    return watchNotifications(
      (firestoreNotifications) => {
        onChange(
          firestoreNotifications.length
            ? dedupeNotifications(
                firestoreNotifications.map(
                  firestoreNotificationToCampusNotification,
                ),
              )
            : campusNotifications,
        );
      },
      (error) => {
        console.warn("Failed to subscribe to notifications", error);
        onChange(campusNotifications);
      },
    );
  } catch (error) {
    console.warn("Failed to start notification subscription", error);
    onChange(campusNotifications);
    return () => {};
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
      formatNotificationTime(notification.createdAtMs) ||
      notification.timeLabel,
    category: notification.category,
    locationName: notification.locationName,
    locationSubtitle: notification.locationSubtitle,
  };
}

function formatNotificationTime(createdAtMs?: number) {
  if (!createdAtMs) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAtMs));
}
