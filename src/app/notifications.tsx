import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  NotificationDetailModal,
  NotificationItem,
} from "../../components/NotificationViews";
import ProtectedAccess from "../../components/ProtectedAccess";
import {
  campusNotifications,
  type CampusNotification,
} from "../data/notifications";

export default function NotificationsScreen() {
  const [selectedNotification, setSelectedNotification] =
    useState<CampusNotification>();

  return (
    <ProtectedAccess>
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>All Notifications</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close notifications"
          onPress={() => router.back()}
        >
          <Text style={styles.closeText}>x</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {campusNotifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onPress={setSelectedNotification}
          />
        ))}
      </ScrollView>

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(undefined)}
      />
      </View>
    </ProtectedAccess>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8fafc",
    flex: 1,
  },

  header: {
    alignItems: "center",
    backgroundColor: "#111827",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 16,
    paddingHorizontal: 18,
    paddingTop: 64,
  },

  title: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },

  closeText: {
    color: "white",
    fontSize: 22,
    fontWeight: "900",
  },

  content: {
    gap: 10,
    padding: 14,
    paddingBottom: 34,
  },
});
