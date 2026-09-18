import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import type { CampusNotification } from "../src/data/notifications";

type NotificationItemProps = {
  notification: CampusNotification;
  onPress: (notification: CampusNotification) => void;
};

type NotificationDetailModalProps = {
  notification?: CampusNotification;
  onClose: () => void;
};

const categoryIcon: Record<CampusNotification["category"], string> = {
  announcement: "A",
  building: "B",
  maintenance: "M",
  room: "R",
};

export function NotificationItem({
  notification,
  onPress,
}: NotificationItemProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open notification: ${notification.title}`}
      style={styles.notificationItem}
      onPress={() => onPress(notification)}
    >
      <View style={styles.iconCircle}>
        <Text style={styles.iconText}>{categoryIcon[notification.category]}</Text>
      </View>

      <View style={styles.notificationCopy}>
        <Text numberOfLines={1} style={styles.notificationTitle}>
          {notification.title}
        </Text>
        <Text numberOfLines={2} style={styles.notificationMessage}>
          {notification.message}
        </Text>
        <Text style={styles.notificationTime}>{notification.timeLabel}</Text>
      </View>

      <Text style={styles.chevron}>{">"}</Text>
    </Pressable>
  );
}

export function NotificationDetailModal({
  notification,
  onClose,
}: NotificationDetailModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(notification)}
      onRequestClose={onClose}
    >
      <View style={styles.detailOverlay}>
        <Pressable style={styles.detailBackdrop} onPress={onClose} />

        {notification ? (
          <View style={styles.detailCard}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close notification details"
              style={styles.detailCloseButton}
              onPress={onClose}
            >
              <Text style={styles.detailCloseText}>x</Text>
            </Pressable>

            <View style={styles.detailIcon}>
              <Text style={styles.detailIconText}>
                {categoryIcon[notification.category]}
              </Text>
            </View>

            <Text style={styles.detailTitle}>{notification.title}</Text>
            <Text style={styles.detailMessage}>{notification.message}</Text>

            <View style={styles.detailInfoBox}>
              {notification.locationName ? (
                <View style={styles.detailInfoRow}>
                  <Text style={styles.detailInfoIcon}>L</Text>
                  <View style={styles.detailInfoCopy}>
                    <Text style={styles.detailInfoTitle}>
                      {notification.locationName}
                    </Text>
                    {notification.locationSubtitle ? (
                      <Text style={styles.detailInfoText}>
                        {notification.locationSubtitle}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : null}

              <View style={styles.detailInfoRow}>
                <Text style={styles.detailInfoIcon}>T</Text>
                <Text style={styles.detailInfoTitle}>
                  {notification.timeLabel}
                </Text>
              </View>
            </View>

            <Pressable style={styles.detailAction} onPress={onClose}>
              <Text style={styles.detailActionText}>Got it</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  notificationItem: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 78,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  iconCircle: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    marginRight: 12,
    width: 36,
  },

  iconText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "900",
  },

  notificationCopy: {
    flex: 1,
  },

  notificationTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 3,
  },

  notificationMessage: {
    color: "#374151",
    fontSize: 12,
    lineHeight: 17,
  },

  notificationTime: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "700",
    marginTop: 4,
  },

  chevron: {
    color: "#9ca3af",
    fontSize: 22,
    fontWeight: "900",
    marginLeft: 10,
  },

  detailOverlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },

  detailBackdrop: {
    backgroundColor: "rgba(17, 24, 39, 0.58)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },

  detailCard: {
    backgroundColor: "white",
    borderRadius: 8,
    maxWidth: 380,
    padding: 20,
    width: "100%",
  },

  detailCloseButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 32,
    zIndex: 2,
  },

  detailCloseText: {
    color: "#9ca3af",
    fontSize: 20,
    fontWeight: "900",
  },

  detailIcon: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 30,
    height: 60,
    justifyContent: "center",
    marginBottom: 14,
    width: 60,
  },

  detailIconText: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
  },

  detailTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },

  detailMessage: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 18,
    textAlign: "center",
  },

  detailInfoBox: {
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    gap: 12,
    marginBottom: 18,
    padding: 14,
  },

  detailInfoRow: {
    alignItems: "center",
    flexDirection: "row",
  },

  detailInfoIcon: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900",
    marginRight: 12,
    width: 20,
  },

  detailInfoCopy: {
    flex: 1,
  },

  detailInfoTitle: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
  },

  detailInfoText: {
    color: "#4b5563",
    fontSize: 12,
    marginTop: 2,
  },

  detailAction: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 13,
  },

  detailActionText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
  },
});
