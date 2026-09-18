import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import LimitedAccessModal from "../../../components/LimitedAccessModal";
import {
  NotificationDetailModal,
  NotificationItem,
} from "../../../components/NotificationViews";
import {
  campusNotifications,
  type CampusNotification,
} from "../../data/notifications";
import { loadCampusData } from "../../services/campusDataStore";
import {
  getAppAccessMode,
  isGuestMode,
  type AppAccessMode,
} from "../../utils/appSession";
import type { AdminLocation } from "../../utils/adminLocations";
import {
  getGuestHistory,
  type GuestHistoryItem,
} from "../../utils/guestHistory";

type CategoryShortcut = {
  title: string;
  icon: string;
};

const categoryShortcuts: CategoryShortcut[] = [
  { title: "Academic", icon: "A" },
  { title: "Offices", icon: "O" },
  { title: "Facilities", icon: "F" },
  { title: "Food", icon: "D" },
  { title: "Services", icon: "S" },
];

const classroomEssentials: CategoryShortcut[] = [
  { title: "Main Entrance", icon: "E" },
  { title: "Administration", icon: "A" },
  { title: "Cafeteria", icon: "C" },
  { title: "Security Office", icon: "S" },
];

function formatViewedAt(viewedAt: number) {
  const elapsedMs = Date.now() - viewedAt;
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

export default function Home() {
  const [recentItems, setRecentItems] = useState<GuestHistoryItem[]>([]);
  const [adminLocations, setAdminLocations] = useState<AdminLocation[]>(
    [],
  );
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<CampusNotification>();
  const [accessMode, setAccessMode] = useState<AppAccessMode>("guest");
  const [isLimitedAccessOpen, setIsLimitedAccessOpen] = useState(false);
  const isGuest = isGuestMode(accessMode);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void Promise.all([
        getGuestHistory(),
        loadCampusData(),
        getAppAccessMode(),
      ]).then(
        ([history, campusData, mode]) => {
        if (isActive) {
          setAccessMode(mode);
          const visibleLocationKeys = new Set(
            campusData.visibleLocations.map(
              (location) => `${location.type}:${location.id}`,
            ),
          );

          setRecentItems(
            history
              .filter((item) =>
                visibleLocationKeys.has(
                  `${item.featureType}:${item.featureId}`,
                ),
              )
              .slice(0, 3),
          );
          setAdminLocations(campusData.visibleLocations);
        }
        },
      );

      return () => {
        isActive = false;
      };
    }, []),
  );

  const openLimitedAccess = () => {
    setIsLimitedAccessOpen(true);
  };

  const openLogin = () => {
    setIsLimitedAccessOpen(false);
    router.push("/login");
  };

  const openNotifications = () => {
    if (isGuest) {
      openLimitedAccess();
      return;
    }

    setIsNotificationsOpen(true);
  };

  const openLockedRoute = (pathname: "/(tabs)/search" | "/(tabs)/categories") => {
    if (isGuest) {
      openLimitedAccess();
      return;
    }

    router.push(pathname);
  };

  const openDetails = (item: GuestHistoryItem) => {
    router.push({
      pathname: "/(tabs)/location-details",
      params: {
        featureId: item.featureId,
        featureType: item.featureType,
      },
    });
  };

  const getRecentDisplayItem = (item: GuestHistoryItem) =>
    adminLocations.find(
      (location) =>
        location.id === item.featureId &&
        location.type === item.featureType,
    );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>UM</Text>
        </View>

        <View style={styles.brandBlock}>
          <Text style={styles.brand}>UMVC FIND</Text>
          <Text style={styles.tagline}>Explore the campus now</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open notifications"
          style={styles.notificationButton}
          onPress={openNotifications}
        >
          <Text style={styles.notificationText}>!</Text>
        </Pressable>
      </View>

      <View style={styles.main}>
        <View style={styles.welcomeBlock}>
          <Text style={styles.title}>
            {isGuest ? "Welcome Back, Guest!" : "Welcome Back, User!"}
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          style={styles.searchCard}
          onPress={() => openLockedRoute("/(tabs)/search")}
        >
          <Text style={styles.searchIcon}>Q</Text>
          <View style={styles.searchCopy}>
            <Text style={styles.searchTitle}>Where do you want to go?</Text>
            <Text style={styles.searchSubtitle}>
              Search buildings, offices, rooms...
            </Text>
          </View>
          <Text style={styles.chevron}>{">"}</Text>
        </Pressable>

        {isGuest ? (
          <Pressable
            accessibilityRole="button"
            style={styles.mapCard}
            onPress={() => router.push("/(tabs)/map")}
          >
            <View style={styles.mapIconBox}>
              <Text style={styles.mapIcon}>M</Text>
            </View>
            <View style={styles.mapCopy}>
              <Text style={styles.mapTitle}>Explore Campus Map</Text>
              <Text style={styles.mapSubtitle}>
                View the interactive map and find your destination
              </Text>
            </View>
            <Text style={styles.mapArrow}>{">"}</Text>
          </Pressable>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recently Viewed</Text>
              <Pressable onPress={() => openLockedRoute("/(tabs)/search")}>
                <Text style={styles.sectionAction}>See all</Text>
              </Pressable>
            </View>

            {recentItems.length > 0 ? (
              <ScrollView
                contentContainerStyle={styles.recentList}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {recentItems.map((item) => (
                  <RecentCard
                    key={`${item.featureType}-${item.featureId}`}
                    item={item}
                    location={getRecentDisplayItem(item)}
                    onPress={() => openDetails(item)}
                  />
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyRecentCard}>
                <Text style={styles.emptyRecentTitle}>No recent places yet</Text>
                <Text style={styles.emptyRecentText}>
                  Open a building or room to see it here.
                </Text>
              </View>
            )}
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isGuest ? "Browse by Category" : "Explore Campus"}
          </Text>
          <Pressable onPress={() => openLockedRoute("/(tabs)/categories")}>
            <Text style={styles.sectionAction}>
              {isGuest ? "See all" : "Browse by category"}
            </Text>
          </Pressable>
        </View>

        <View style={styles.categoryGrid}>
          {(isGuest ? categoryShortcuts.slice(0, 3) : categoryShortcuts).map(
            (category) => (
              <Pressable
                key={category.title}
                style={styles.categoryCard}
                onPress={() => openLockedRoute("/(tabs)/categories")}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryArrow}>{">"}</Text>
              </Pressable>
            ),
          )}
        </View>

        {isGuest ? (
          <View style={styles.guestEssentials}>
            <Text style={styles.guestEssentialsTitle}>
              Classroom Essentials
            </Text>
            <Text style={styles.guestEssentialsText}>
              Quick access to commonly used campus locations
            </Text>
            <View style={styles.essentialsGrid}>
              {classroomEssentials.map((item) => (
                <Pressable
                  key={item.title}
                  style={styles.essentialCard}
                  onPress={openLimitedAccess}
                >
                  <Text style={styles.essentialIcon}>{item.icon}</Text>
                  <Text style={styles.essentialTitle}>{item.title}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}

        {!isGuest ? (
          <Pressable
            accessibilityRole="button"
            style={styles.mapCard}
            onPress={() => router.push("/(tabs)/map")}
          >
            <View style={styles.mapIconBox}>
              <Text style={styles.mapIcon}>M</Text>
            </View>
            <View style={styles.mapCopy}>
              <Text style={styles.mapTitle}>Explore Campus Map</Text>
              <Text style={styles.mapSubtitle}>
                View the interactive map and find your destination
              </Text>
            </View>
            <Text style={styles.mapArrow}>{">"}</Text>
          </Pressable>
        ) : null}
      </View>

      <Modal
        animationType="slide"
        transparent
        visible={isNotificationsOpen}
        onRequestClose={() => setIsNotificationsOpen(false)}
      >
        <View style={styles.notificationOverlay}>
          <Pressable
            style={styles.notificationBackdrop}
            onPress={() => setIsNotificationsOpen(false)}
          />

          <View style={styles.notificationSheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.notificationHeader}>
              <Text style={styles.notificationTitle}>Notifications</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close notifications"
                onPress={() => setIsNotificationsOpen(false)}
              >
                <Text style={styles.notificationClose}>x</Text>
              </Pressable>
            </View>

            <View style={styles.notificationList}>
              {campusNotifications.slice(0, 4).map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onPress={setSelectedNotification}
                />
              ))}
            </View>

            <Pressable
              style={styles.viewAllButton}
              onPress={() => {
                setIsNotificationsOpen(false);
                if (isGuest) {
                  openLimitedAccess();
                  return;
                }

                router.push("/notifications");
              }}
            >
              <Text style={styles.viewAllButtonText}>
                View all Notifications
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <NotificationDetailModal
        notification={selectedNotification}
        onClose={() => setSelectedNotification(undefined)}
      />

      <LimitedAccessModal
        visible={isLimitedAccessOpen}
        onClose={() => setIsLimitedAccessOpen(false)}
        onLogin={openLogin}
      />
    </ScrollView>
  );
}

function RecentCard({
  item,
  location,
  onPress,
}: {
  item: GuestHistoryItem;
  location?: AdminLocation;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.recentCard} onPress={onPress}>
      <View style={styles.recentImagePlaceholder} />
      <Text style={styles.recentTime}>
        {formatViewedAt(item.viewedAt)}
      </Text>
      <Text numberOfLines={2} style={styles.recentName}>
        {location?.name ?? item.name}
      </Text>
      <Text numberOfLines={1} style={styles.recentMeta}>
        {location?.status === "Maintenance"
          ? `${location.category} - Maintenance`
          : location?.category ?? item.category}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    paddingBottom: 36,
  },

  header: {
    alignItems: "center",
    backgroundColor: "#1f2937",
    flexDirection: "row",
    paddingBottom: 42,
    paddingHorizontal: 20,
    paddingTop: 34,
  },

  logoMark: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    height: 64,
    justifyContent: "center",
    marginRight: 14,
    width: 64,
  },

  logoText: {
    color: "#111827",
    fontSize: 19,
    fontWeight: "900",
  },

  brandBlock: {
    flex: 1,
  },

  brand: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },

  tagline: {
    color: "#e5e7eb",
    fontSize: 15,
    fontWeight: "600",
    marginTop: 4,
  },

  notificationButton: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },

  notificationText: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },

  notificationOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  notificationBackdrop: {
    backgroundColor: "rgba(17, 24, 39, 0.48)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },

  notificationSheet: {
    backgroundColor: "#f9fafb",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    maxHeight: "78%",
    paddingBottom: 20,
  },

  sheetHandle: {
    alignSelf: "center",
    backgroundColor: "#d1d5db",
    borderRadius: 2,
    height: 4,
    marginTop: 10,
    width: 54,
  },

  notificationHeader: {
    alignItems: "center",
    backgroundColor: "#111827",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 14,
    paddingTop: 22,
  },

  notificationTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "900",
  },

  notificationClose: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },

  notificationList: {
    gap: 10,
    padding: 14,
  },

  viewAllButton: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    marginTop: 2,
    paddingHorizontal: 24,
    paddingVertical: 13,
    width: "84%",
  },

  viewAllButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
  },

  main: {
    marginTop: -18,
    paddingHorizontal: 18,
  },

  welcomeBlock: {
    backgroundColor: "#f8fafc",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 14,
    paddingTop: 28,
  },

  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
    lineHeight: 36,
  },

  searchCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 78,
    paddingHorizontal: 18,
    shadowColor: "#111827",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 2,
  },

  searchIcon: {
    color: "#374151",
    fontSize: 36,
    fontWeight: "900",
    marginRight: 16,
  },

  searchCopy: {
    flex: 1,
  },

  searchTitle: {
    color: "#374151",
    fontSize: 19,
    fontWeight: "800",
  },

  searchSubtitle: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  chevron: {
    color: "#6b7280",
    fontSize: 34,
    fontWeight: "800",
    marginLeft: 12,
  },

  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 28,
  },

  sectionTitle: {
    color: "#111827",
    flex: 1,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 31,
  },

  sectionAction: {
    color: "#4b5563",
    fontSize: 14,
    fontWeight: "800",
    marginLeft: 12,
  },

  recentList: {
    gap: 12,
    paddingRight: 18,
    paddingTop: 14,
  },

  recentCard: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 176,
    overflow: "hidden",
    width: 150,
  },

  recentImagePlaceholder: {
    backgroundColor: "#d1d5db",
    height: 74,
  },

  recentTime: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    marginHorizontal: 12,
    marginTop: 12,
  },

  recentName: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
    marginHorizontal: 12,
    marginTop: 8,
  },

  recentMeta: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    marginHorizontal: 12,
    marginTop: 6,
  },

  emptyRecentCard: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 18,
  },

  emptyRecentTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
  },

  emptyRecentText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 14,
  },

  categoryCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexDirection: "row",
    flexGrow: 1,
    minHeight: 72,
    minWidth: 138,
    paddingHorizontal: 14,
  },

  categoryIcon: {
    color: "#374151",
    fontSize: 24,
    fontWeight: "900",
    marginRight: 12,
    width: 24,
  },

  categoryTitle: {
    color: "#111827",
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
  },

  categoryArrow: {
    color: "#6b7280",
    fontSize: 26,
    fontWeight: "900",
  },

  guestEssentials: {
    marginTop: 24,
  },

  guestEssentialsTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },

  guestEssentialsText: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 3,
  },

  essentialsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12,
  },

  essentialCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 76,
    minWidth: 120,
    padding: 12,
  },

  essentialIcon: {
    color: "#374151",
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 8,
  },

  essentialTitle: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "800",
    textAlign: "center",
  },

  mapCard: {
    alignItems: "center",
    backgroundColor: "#1f2937",
    borderRadius: 8,
    flexDirection: "row",
    marginTop: 26,
    minHeight: 104,
    padding: 18,
  },

  mapIconBox: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    height: 56,
    justifyContent: "center",
    marginRight: 16,
    width: 56,
  },

  mapIcon: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
  },

  mapCopy: {
    flex: 1,
  },

  mapTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "900",
  },

  mapSubtitle: {
    color: "#e5e7eb",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 5,
  },

  mapArrow: {
    color: "white",
    fontSize: 36,
    fontWeight: "900",
    marginLeft: 12,
  },
});
