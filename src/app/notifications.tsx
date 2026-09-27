import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  OfficialNotificationCard,
  OfficialNotificationDetailSheet,
  type OfficialNotificationItem,
} from "@/components/OfficialDesign";
import Background from "../../assets/design/backgrounds/eightBg.svg";
import CloseIcon from "../../assets/design/icons/close.svg";
import ProtectedAccess from "@/components/ProtectedAccess";
import { type CampusNotification } from "../data/notifications";
import { subscribeToNotifications } from "../services/notificationStore";
import { getReadNotificationIds, markNotificationRead } from "../utils/notificationReadState";
import { styles } from "../styles/official/notificationsScreen.styles";

function toOfficialNotification(
  notification: CampusNotification,
  readNotificationIds?: Set<string>,
): OfficialNotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: notification.timeLabel,
    buildingName: notification.locationName,
    locationName: notification.locationSubtitle,
    unread: readNotificationIds
      ? !readNotificationIds.has(notification.id)
      : false,
  };
}

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<CampusNotification>();
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void getReadNotificationIds().then(
        (nextReadNotificationIds) => {
          if (isActive) {
            setReadNotificationIds(nextReadNotificationIds);
          }
        },
      );

      return () => {
        isActive = false;
      };
    }, []),
  );

  useEffect(() => subscribeToNotifications(setNotifications), []);

  const openNotificationDetails = (item: OfficialNotificationItem) => {
    const notification = notifications.find((candidate) => candidate.id === item.id);
    if (!notification) return;
    setSelectedNotification(notification);
    void markNotificationRead(notification.id).then(setReadNotificationIds);
  };

  const close = () => (router.canGoBack() ? router.back() : router.replace("/(tabs)"));

  return (
    <ProtectedAccess>
      <View style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.background} pointerEvents="none">
          <Background width="100%" height="100%" preserveAspectRatio="none" />
        </View>
        <SafeAreaView edges={["top", "left", "right"]} style={styles.headerSafe}>
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              All Notifications
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close all notifications"
              onPress={close}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
            >
              <CloseIcon width={30} height={30} accessible={false} />
            </Pressable>
          </View>
        </SafeAreaView>
        <SafeAreaView edges={["left", "right", "bottom"]} style={styles.body}>
          <FlatList
            data={notifications.map((notification) =>
              toOfficialNotification(notification, readNotificationIds),
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <OfficialNotificationCard item={item} onPress={openNotificationDetails} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
          />
        </SafeAreaView>
        {selectedNotification ? (
          <OfficialNotificationDetailSheet
            item={toOfficialNotification(selectedNotification, readNotificationIds)}
            onClosed={() => setSelectedNotification(undefined)}
          />
        ) : null}
      </View>
    </ProtectedAccess>
  );
}
