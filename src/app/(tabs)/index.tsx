import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  Animated,
  Easing,
  Keyboard,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import LimitedAccessModal from "@/components/LimitedAccessModal";
import {
  OfficialBottomNavigation,
  OfficialNotificationDetailSheet,
  OfficialNotificationSheet,
  OfficialRecentLocations,
  type OfficialNotificationItem,
  type OfficialRecentItem,
} from "@/components/OfficialDesign";
import { navigateToTab } from "@/utils/navigation";
import Background from "../../../assets/design/backgrounds/thirdBg.svg";
import CampusMap from "../../../assets/design/icons/campusMap.svg";
import MoreIcon from "../../../assets/design/icons/more.svg";
import Bell from "../../../assets/design/icons/notification.svg";
import Arrow from "../../../assets/design/icons/proceed-arrow.svg";
import Search from "../../../assets/design/icons/seacrch.svg";
import {
  fallbackHomeCategoryPresentation,
  homeCategoryPresentation,
  sortCategoriesByPreferredOrder,
} from "../../constants/campusPresentation";
import { type CampusNotification } from "../../data/notifications";
import { loadCampusData } from "../../services/campusDataStore";
import { subscribeToNotifications } from "../../services/notificationStore";
import { styles } from "../../styles/official/homeScreen.styles";
import type { AdminLocation } from "../../utils/adminLocations";
import {
  getAppAccessMode,
  getStoredUserSession,
  isGuestMode,
  type AppAccessMode,
  type StoredUserSession,
} from "../../utils/appSession";
import {
  getCurrentHistory,
  type GuestHistoryItem,
} from "../../utils/guestHistory";
import {
  getReadNotificationIds,
  markNotificationRead,
} from "../../utils/notificationReadState";

const universitySeal = require("../../../assets/design/logos/UM.png");

type CategoryShortcut = {
  Icon: ComponentType<SvgProps>;
  color: string;
  count: number;
  isMore?: boolean;
  light?: boolean;
  title: string;
  mapCategory: string;
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

export default function Home() {
  const scrollRef = useRef<ScrollView>(null);
  const openAllAfterClose = useRef(false);
  const pendingNotification = useRef<CampusNotification | null>(null);
  const [mapPulsePrimary] = useState(() => new Animated.Value(0));
  const [mapPulseSecondary] = useState(() => new Animated.Value(0));
  const [mapPulseTertiary] = useState(() => new Animated.Value(0));
  const [searchPressProgress] = useState(() => new Animated.Value(0));
  const [recentItems, setRecentItems] = useState<GuestHistoryItem[]>([]);
  const [adminLocations, setAdminLocations] = useState<AdminLocation[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<CampusNotification>();
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(
    new Set(),
  );
  const [accessMode, setAccessMode] = useState<AppAccessMode>("guest");
  const [userSession, setUserSession] = useState<StoredUserSession | null>(
    null,
  );
  const [isLimitedAccessOpen, setIsLimitedAccessOpen] = useState(false);
  const isGuest = isGuestMode(accessMode);
  const displayName =
    userSession?.displayName?.split(" ")[0] ??
    userSession?.email?.split("@")[0] ??
    "User";
  const unreadNotificationCount = notifications.filter(
    (notification) => !readNotificationIds.has(notification.id),
  ).length;

  useEffect(() => {
    const createPulse = (pulse: Animated.Value) =>
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
          isInteraction: false,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
          isInteraction: false,
        }),
      ]);

    const animation = Animated.loop(
      Animated.stagger(420, [
        createPulse(mapPulsePrimary),
        createPulse(mapPulseSecondary),
        createPulse(mapPulseTertiary),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [mapPulsePrimary, mapPulseSecondary, mapPulseTertiary]);

  const createMapPulseStyle = useCallback(
    (pulse: Animated.Value) => ({
      opacity: pulse.interpolate({
        inputRange: [0, 1],
        outputRange: [0.7, 0],
      }),
      transform: [
        {
          scale: pulse.interpolate({
            inputRange: [0, 1],
            outputRange: [0.72, 1.85],
          }),
        },
      ],
    }),
    [],
  );
  const mapPulsePrimaryStyle = useMemo(
    () => createMapPulseStyle(mapPulsePrimary),
    [createMapPulseStyle, mapPulsePrimary],
  );
  const mapPulseSecondaryStyle = useMemo(
    () => createMapPulseStyle(mapPulseSecondary),
    [createMapPulseStyle, mapPulseSecondary],
  );
  const mapPulseTertiaryStyle = useMemo(
    () => createMapPulseStyle(mapPulseTertiary),
    [createMapPulseStyle, mapPulseTertiary],
  );
  const searchPressStyle = useMemo(
    () => ({
      transform: [
        {
          translateY: searchPressProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -3],
          }),
        },
        {
          scale: searchPressProgress.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.025],
          }),
        },
      ],
    }),
    [searchPressProgress],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void Promise.all([
        getCurrentHistory(),
        loadCampusData(),
        getAppAccessMode(),
        getStoredUserSession(),
        getReadNotificationIds(),
      ]).then(
        ([
          history,
          campusData,
          mode,
          session,
          nextReadIds,
        ]) => {
          if (!isActive) return;
          setAccessMode(mode);
          setUserSession(session);
          setReadNotificationIds(nextReadIds);

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
              .slice(0, 6),
          );
          setAdminLocations(campusData.visibleLocations);
        },
      );

      return () => {
        isActive = false;
      };
    }, []),
  );

  useEffect(() => subscribeToNotifications(setNotifications), []);

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

  const openLockedRoute = (
    pathname: "/(tabs)/search" | "/(tabs)/categories",
  ) => {
    if (isGuest) {
      openLimitedAccess();
      return;
    }
    if (pathname === "/(tabs)/search") {
      router.navigate({
        pathname,
        params: {
          focusSearch: "1",
          focusAt: Date.now().toString(),
        },
      });
      return;
    }
    router.navigate(pathname);
  };

  const animateSearchPress = (toValue: number) => {
    Animated.spring(searchPressProgress, {
      toValue,
      friction: 7,
      tension: 130,
      useNativeDriver: true,
    }).start();
  };

  const openSearchRoute = () => {
    Animated.sequence([
      Animated.spring(searchPressProgress, {
        toValue: 1,
        friction: 7,
        tension: 140,
        useNativeDriver: true,
      }),
      Animated.spring(searchPressProgress, {
        toValue: 0,
        friction: 8,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      openLockedRoute("/(tabs)/search");
    }, 120);
  };

  const getRecentDisplayItem = (item: GuestHistoryItem) =>
    adminLocations.find(
      (location) =>
        location.id === item.featureId && location.type === item.featureType,
    );

  const recentCards: OfficialRecentItem[] = recentItems.map((item) => ({
    id: `${item.featureType}-${item.featureId}`,
    name: getRecentDisplayItem(item)?.name ?? item.name,
    time: formatViewedAt(item.viewedAt),
  }));

  const categoryShortcuts = useMemo<CategoryShortcut[]>(() => {
    const counts = new Map<string, number>();

    adminLocations.forEach((location) => {
      counts.set(location.category, (counts.get(location.category) ?? 0) + 1);
    });

    const topCategories = sortCategoriesByPreferredOrder([...counts.keys()])
      .slice(0, 5)
      .map((category) => {
        const presentation =
          homeCategoryPresentation[category] ??
          fallbackHomeCategoryPresentation;

        return {
          title: category,
          count: counts.get(category) ?? 0,
          mapCategory: category,
          ...presentation,
        };
      });

    return [
      ...topCategories,
      {
        title: "More",
        count: counts.size,
        mapCategory: "",
        Icon: MoreIcon,
        color: "#FAF2DD",
        isMore: true,
      },
    ];
  }, [adminLocations]);

  const openRecentItem = (item: OfficialRecentItem) => {
    const historyItem = recentItems.find(
      (recent) => `${recent.featureType}-${recent.featureId}` === item.id,
    );

    if (!historyItem) return;

    router.push({
      pathname: "/(tabs)/map",
      params: {
        featureId: historyItem.featureId,
        featureType: historyItem.featureType,
      },
    });
  };

  const openCategoryOnMap = (shortcut: CategoryShortcut) => {
    if (isGuest) {
      openLimitedAccess();
      return;
    }

    if (shortcut.isMore) {
      router.navigate("/(tabs)/categories");
      return;
    }

    router.navigate({
      pathname: "/(tabs)/map",
      params: { category: shortcut.mapCategory },
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
            <Text
              style={styles.brandTitle}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
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
            <Bell width={32} height={32} />
            {!isGuest && unreadNotificationCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
                </Text>
              </View>
            ) : null}
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

          <Animated.View style={searchPressStyle}>
            <Pressable
              accessibilityRole="button"
              style={styles.searchBox}
              onPressIn={() => animateSearchPress(1)}
              onPressOut={() => animateSearchPress(0)}
              onPress={openSearchRoute}
            >
              <Search width={26} height={26} />
              <Text style={styles.input}>Search a building or location...</Text>
            </Pressable>
          </Animated.View>

          {isGuest ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Explore Campus Map"
              onPress={() => router.navigate("/(tabs)/map")}
              style={({ pressed }) => [
                styles.mapButton,
                styles.guestMapButton,
                pressed && styles.pressed,
              ]}
            >
              <View pointerEvents="none" style={styles.mapPulseIconWrap}>
                <Animated.View
                  style={[styles.mapPulseCircle, mapPulsePrimaryStyle]}
                />
                <Animated.View
                  style={[styles.mapPulseCircle, mapPulseSecondaryStyle]}
                />
                <Animated.View
                  style={[styles.mapPulseCircle, mapPulseTertiaryStyle]}
                />
                <View style={styles.mapPulseCore}>
                  <CampusMap width={30} height={30} />
                </View>
              </View>
              <View style={styles.mapCopy}>
                <Text style={styles.mapTitle}>Explore Campus Map</Text>
                <Text style={styles.mapSubtitle}>
                  View the interactive map and start exploring!
                </Text>
              </View>
              <Arrow width={21} height={25} color="white" />
            </Pressable>
          ) : (
            <>
              <View style={styles.sectionHeading}>
                <Text style={styles.sectionTitle}>Recently Viewed</Text>
                {recentItems.length > 0 ? (
                  <Pressable
                    accessibilityRole="button"
                    style={styles.seeAll}
                    onPress={() => openLockedRoute("/(tabs)/search")}
                  >
                    <Text style={styles.link}>See all</Text>
                    <Arrow
                      width={14}
                      height={16}
                      color="#AF2532"
                    />
                  </Pressable>
                ) : null}
              </View>

              <OfficialRecentLocations
                items={recentCards}
                onSelect={openRecentItem}
              />
            </>
          )}

          <View>
            <View style={styles.sectionHeading}>
              <Text style={styles.sectionTitle}>Explore Campus</Text>
              <Text style={styles.browse}>Browse by category</Text>
            </View>
            <View style={styles.grid}>
              {categoryShortcuts.map((shortcut) => {
                const { title, Icon, color, count, isMore, light } = shortcut;

                return (
                  <Pressable
                    key={title}
                    accessibilityRole="button"
                    accessibilityLabel={
                      isMore
                        ? "More categories"
                        : `${title}, ${count} locations`
                    }
                    onPress={() => openCategoryOnMap(shortcut)}
                    style={({ pressed }) => [
                      styles.tile,
                      { backgroundColor: color },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Icon width={30} height={30} />
                    <View style={styles.tileCopy}>
                      <Text
                        style={[styles.tileText, light && styles.white]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {title}
                      </Text>
                      <Text
                        style={[styles.tileCount, light && styles.white]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        {isMore
                          ? "View all"
                          : `${count} ${count === 1 ? "location" : "locations"}`}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {!isGuest ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Explore Campus Map"
              onPress={() => router.navigate("/(tabs)/map")}
              style={({ pressed }) => [
                styles.mapButton,
                pressed && styles.pressed,
              ]}
            >
              <View pointerEvents="none" style={styles.mapPulseIconWrap}>
                <Animated.View
                  style={[styles.mapPulseCircle, mapPulsePrimaryStyle]}
                />
                <Animated.View
                  style={[styles.mapPulseCircle, mapPulseSecondaryStyle]}
                />
                <Animated.View
                  style={[styles.mapPulseCircle, mapPulseTertiaryStyle]}
                />
                <View style={styles.mapPulseCore}>
                  <CampusMap width={30} height={30} />
                </View>
              </View>
              <View style={styles.mapCopy}>
                <Text style={styles.mapTitle}>Explore Campus Map</Text>
                <Text style={styles.mapSubtitle}>
                  View the interactive map and start exploring!
                </Text>
              </View>
              <Arrow width={21} height={25} color="white" />
            </Pressable>
          ) : null}
        </ScrollView>

        <OfficialBottomNavigation activeItem="Home" onSelect={navigate} />
      </SafeAreaView>

      <OfficialNotificationSheet
        visible={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        items={notifications
          .slice(0, 4)
          .map((notification) =>
            toOfficialNotification(notification, readNotificationIds),
          )}
        onSelect={(item) => {
          const notification = notifications.find(
            (candidate) => candidate.id === item.id,
          );
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
          item={toOfficialNotification(
            selectedNotification,
            readNotificationIds,
          )}
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
