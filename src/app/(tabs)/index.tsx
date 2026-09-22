import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { type ComponentProps, type ComponentType, useCallback, useRef, useState } from "react";
import { Keyboard, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LimitedAccessModal from "@/components/LimitedAccessModal";
import {
  OfficialBottomNavigation,
  OfficialNotificationDetailSheet,
  OfficialNotificationSheet,
  OfficialRecentLocations,
  type OfficialNotificationItem,
  type OfficialRecentItem,
} from "@/components/OfficialDesign";
import AcademicIcon from "../../../assets/design/icons/academic.svg";
import Arrow from "../../../assets/design/icons/proceed-arrow.svg";
import Background from "../../../assets/design/backgrounds/thirdBg.svg";
import Bell from "../../../assets/design/icons/notification.svg";
import CampusMap from "../../../assets/design/icons/campusMap.svg";
import FacilitiesIcon from "../../../assets/design/icons/facilities.svg";
import FoodIcon from "../../../assets/design/icons/food.svg";
import MoreIcon from "../../../assets/design/icons/more.svg";
import OfficesIcon from "../../../assets/design/icons/offices.svg";
import Search from "../../../assets/design/icons/seacrch.svg";
import ServicesIcon from "../../../assets/design/icons/services.svg";
import { type CampusNotification } from "../../data/notifications";
import { loadCampusData } from "../../services/campusDataStore";
import { loadNotifications } from "../../services/notificationStore";
import {
  getAppAccessMode,
  getStoredUserSession,
  isGuestMode,
  type AppAccessMode,
  type StoredUserSession,
} from "../../utils/appSession";
import type { AdminLocation } from "../../utils/adminLocations";
import { getCurrentHistory, type GuestHistoryItem } from "../../utils/guestHistory";
import { getReadNotificationIds, markNotificationRead } from "../../utils/notificationReadState";
import { navigateToTab } from "@/utils/navigation";
import { styles } from "../../styles/official/homeScreen.styles";

const universitySeal = require("../../../assets/design/logos/UM.png");

type CategoryShortcut = {
  Icon: ComponentType<ComponentProps<typeof AcademicIcon>>;
  light?: boolean;
  style: "academic" | "offices" | "pink" | "cream";
  title: string;
};

const categoryShortcuts: CategoryShortcut[] = [
  { title: "Academic", Icon: AcademicIcon, style: "academic", light: true },
  { title: "Offices", Icon: OfficesIcon, style: "offices" },
  { title: "Facilities", Icon: FacilitiesIcon, style: "pink" },
  { title: "Food", Icon: FoodIcon, style: "cream" },
  { title: "Services", Icon: ServicesIcon, style: "pink" },
  { title: "More", Icon: MoreIcon, style: "cream" },
];

const locationImages = {
  academic: require("../../../assets/design/locations/category-academic.png"),
  admin: require("../../../assets/design/locations/category-admin.png"),
  cafeteria: require("../../../assets/design/locations/cafeteria.png"),
  clinic: require("../../../assets/design/locations/clinic.png"),
  default: require("../../../assets/design/locations/old-building.png"),
  facilities: require("../../../assets/design/locations/category-facilities.png"),
  library: require("../../../assets/design/locations/library.png"),
  newBuilding: require("../../../assets/design/locations/new-building.png"),
};

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

function getLocationImage(location?: AdminLocation, item?: GuestHistoryItem) {
  const name = `${location?.name ?? item?.name ?? ""}`.toLowerCase();
  const category = `${location?.category ?? item?.category ?? ""}`.toLowerCase();

  if (name.includes("cafeteria")) return locationImages.cafeteria;
  if (name.includes("clinic")) return locationImages.clinic;
  if (name.includes("library")) return locationImages.library;
  if (name.includes("new") || name.includes("building 2")) return locationImages.newBuilding;
  if (category.includes("academic")) return locationImages.academic;
  if (category.includes("office") || category.includes("admin")) return locationImages.admin;
  if (category.includes("facilit")) return locationImages.facilities;
  return locationImages.default;
}

function toOfficialNotification(notification: CampusNotification): OfficialNotificationItem {
  return {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    time: notification.timeLabel,
    buildingName: notification.locationName,
    locationName: notification.locationSubtitle,
  };
}

export default function Home() {
  const scrollRef = useRef<ScrollView>(null);
  const openAllAfterClose = useRef(false);
  const pendingNotification = useRef<CampusNotification | null>(null);
  const [recentItems, setRecentItems] = useState<GuestHistoryItem[]>([]);
  const [adminLocations, setAdminLocations] = useState<AdminLocation[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<CampusNotification>();
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());
  const [accessMode, setAccessMode] = useState<AppAccessMode>("guest");
  const [userSession, setUserSession] = useState<StoredUserSession | null>(null);
  const [isLimitedAccessOpen, setIsLimitedAccessOpen] = useState(false);
  const isGuest = isGuestMode(accessMode);
  const displayName =
    userSession?.displayName?.split(" ")[0] ?? userSession?.email?.split("@")[0] ?? "User";

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void Promise.all([
        getCurrentHistory(),
        loadCampusData(),
        getAppAccessMode(),
        getStoredUserSession(),
        loadNotifications(),
        getReadNotificationIds(),
      ]).then(([history, campusData, mode, session, nextNotifications, nextReadIds]) => {
        if (!isActive) return;
        setAccessMode(mode);
        setUserSession(session);
        setNotifications(nextNotifications);
        setReadNotificationIds(nextReadIds);

        const visibleLocationKeys = new Set(
          campusData.visibleLocations.map((location) => `${location.type}:${location.id}`),
        );
        setRecentItems(
          history
            .filter((item) => visibleLocationKeys.has(`${item.featureType}:${item.featureId}`))
            .slice(0, 6),
        );
        setAdminLocations(campusData.visibleLocations);
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const openLimitedAccess = () => setIsLimitedAccessOpen(true);

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

  const openNotificationDetails = (notification: CampusNotification) => {
    setSelectedNotification(notification);
    void markNotificationRead(notification.id).then(setReadNotificationIds);
  };

  const handleNotificationsClosed = useCallback(() => {
    if (pendingNotification.current) {
      openNotificationDetails(pendingNotification.current);
      pendingNotification.current = null;
      return;
    }

    if (openAllAfterClose.current) {
      openAllAfterClose.current = false;
      router.push("/notifications");
    }
  }, []);

  const openLockedRoute = (pathname: "/(tabs)/search" | "/(tabs)/categories") => {
    if (isGuest) {
      openLimitedAccess();
      return;
    }
    router.navigate(pathname);
  };

  const getRecentDisplayItem = (item: GuestHistoryItem) =>
    adminLocations.find(
      (location) => location.id === item.featureId && location.type === item.featureType,
    );

  const recentCards: OfficialRecentItem[] = recentItems.map((item) => ({
    id: `${item.featureType}-${item.featureId}`,
    image: getLocationImage(getRecentDisplayItem(item), item),
    name: getRecentDisplayItem(item)?.name ?? item.name,
    time: formatViewedAt(item.viewedAt),
  }));

  const openRecentItem = (item: OfficialRecentItem) => {
    const historyItem = recentItems.find(
      (recent) => `${recent.featureType}-${recent.featureId}` === item.id,
    );

    if (!historyItem) return;

    router.push({
      pathname: "/(tabs)/location-details",
      params: {
        featureId: historyItem.featureId,
        featureType: historyItem.featureType,
      },
    });
  };

  const navigate = (name: string) => {
    Keyboard.dismiss();
    navigateToTab(name, {
      currentTab: "Home",
      isGuest,
      onOpenLimitedAccess: openLimitedAccess,
      onSameTab: () => scrollRef.current?.scrollTo({ y: 0, animated: true }),
    });
  };

  return (
    <View style={styles.screen}>
      <StatusBar hidden={false} style="light" />
      <View style={styles.background} pointerEvents="none">
        <Background width="100%" height="100%" preserveAspectRatio="none" />
      </View>

      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Image
            source={universitySeal}
            style={styles.seal}
            contentFit="contain"
            accessibilityLabel="University of Mindanao seal"
          />
          <View style={styles.brand}>
            <Text style={styles.brandTitle} numberOfLines={1} adjustsFontSizeToFit>
              UMVC
              <Text style={styles.gold}>FIND</Text>
            </Text>
            <Text style={styles.brandSubtitle}>Explore the campus now!</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            style={styles.iconButton}
            onPress={openNotifications}
          >
            <Bell width={28} height={28} accessible={false} />
          </Pressable>
        </View>

        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.welcome} numberOfLines={1} adjustsFontSizeToFit>
            {isGuest ? "Welcome Back, Guest!" : `Welcome Back, ${displayName}!`}
          </Text>
          <Text style={styles.prompt}>Where do you want to go?</Text>

          <Pressable
            accessibilityRole="button"
            style={styles.searchBox}
            onPress={() => openLockedRoute("/(tabs)/search")}
          >
            <Search width={26} height={26} accessible={false} />
            <Text style={styles.input}>Search a building or location...</Text>
          </Pressable>

          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Recently Viewed</Text>
            {recentItems.length > 0 ? (
              <Pressable
                accessibilityRole="button"
                style={styles.seeAll}
                onPress={() => openLockedRoute("/(tabs)/search")}
              >
                <Text style={styles.link}>See all</Text>
                <Arrow width={14} height={16} color="#AF2532" accessible={false} />
              </Pressable>
            ) : null}
          </View>

          <OfficialRecentLocations items={recentCards} onSelect={openRecentItem} />

          <View>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Explore Campus</Text>
              <Text style={styles.browse}>Browse by category</Text>
            </View>
            <View style={styles.grid}>
              {categoryShortcuts.map(({ title, Icon, style, light }) => (
                <Pressable
                  key={title}
                  accessibilityRole="button"
                  accessibilityLabel={title}
                  onPress={() => openLockedRoute("/(tabs)/categories")}
                  style={({ pressed }) => [
                    styles.tile,
                    styles[style],
                    pressed && styles.pressed,
                  ]}
                >
                  <Icon width={30} height={30} accessible={false} />
                  <Text
                    style={[styles.tileText, light && styles.white]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Explore Campus Map"
            onPress={() => router.navigate("/(tabs)/map")}
            style={({ pressed }) => [styles.mapButton, pressed && styles.pressed]}
          >
            <CampusMap width={43} height={43} accessible={false} />
            <View style={styles.mapCopy}>
              <Text style={styles.mapTitle}>Explore Campus Map</Text>
              <Text style={styles.mapSubtitle}>
                View the interactive map and start exploring!
              </Text>
            </View>
            <Arrow width={21} height={25} color="white" accessible={false} />
          </Pressable>
        </ScrollView>

        <OfficialBottomNavigation activeItem="Home" onSelect={navigate} />
      </SafeAreaView>

      <OfficialNotificationSheet
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        items={notifications.slice(0, 4).map(toOfficialNotification)}
        onSelect={(item) => {
          const notification = notifications.find((candidate) => candidate.id === item.id);
          if (notification) {
            pendingNotification.current = notification;
          }
          setIsNotificationsOpen(false);
        }}
        onClosed={handleNotificationsClosed}
        onViewAll={() => {
          openAllAfterClose.current = true;
          setIsNotificationsOpen(false);
        }}
      />

      {selectedNotification ? (
        <OfficialNotificationDetailSheet
          item={toOfficialNotification(selectedNotification)}
          onClosed={() => {
            setSelectedNotification(undefined);
            setIsNotificationsOpen(true);
          }}
        />
      ) : null}

      <LimitedAccessModal
        visible={isLimitedAccessOpen}
        onClose={() => setIsLimitedAccessOpen(false)}
        onLogin={openLogin}
      />
    </View>
  );
}
