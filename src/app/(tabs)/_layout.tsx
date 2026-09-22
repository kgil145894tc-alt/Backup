import { Tabs } from "expo-router";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet } from "react-native";

import LimitedAccessModal from "@/components/LimitedAccessModal";
import CategoriesIcon from "../../../assets/design/icons/nav-categories.svg";
import HomeIcon from "../../../assets/design/icons/nav-home.svg";
import MapIcon from "../../../assets/design/icons/nav-map.svg";
import ProfileIcon from "../../../assets/design/icons/nav-profile.svg";
import SearchIcon from "../../../assets/design/icons/nav-search.svg";
import { watchUserSession } from "../../services/userAuth";
import {
  clearStoredUserSession,
  getAppAccessMode,
  getStoredUserSession,
  isGuestMode,
  setAppAccessMode,
  setStoredUserSession,
  type AppAccessMode,
} from "../../utils/appSession";

export default function TabLayout() {
  const [accessMode, setAccessMode] = useState<AppAccessMode>("guest");
  const [isLimitedAccessOpen, setIsLimitedAccessOpen] = useState(false);
  const isGuest = isGuestMode(accessMode);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      let localMode: AppAccessMode = "guest";
      let hasStoredSession = false;
      let unsubscribe = () => {};

      void Promise.all([
        getAppAccessMode(),
        getStoredUserSession(),
      ]).then(([mode, storedSession]) => {
        if (!isActive) {
          return;
        }

        localMode = mode;
        hasStoredSession = Boolean(storedSession);
        setAccessMode(mode);

        unsubscribe = watchUserSession((session) => {
          if (!isActive) {
            return;
          }

          if (session) {
            setAccessMode("user");
            void setStoredUserSession(session);
            void setAppAccessMode("user");
            return;
          }

          if (localMode === "user" && hasStoredSession) {
            return;
          }

          setAccessMode("guest");
          void clearStoredUserSession();
          void setAppAccessMode("guest");
        });
      });

      return () => {
        isActive = false;
        unsubscribe();
      };
    }, []),
  );

  const lockedTabButton = (props: Record<string, unknown>) => (
    <Pressable
      {...props}
      accessibilityRole="button"
      onPress={() => setIsLimitedAccessOpen(true)}
    />
  );

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color, size }) => (
              <HomeIcon width={size} height={size} color={color} />
            ),
            title: "Home",
          }}
        />

        <Tabs.Screen
          name="map"
          options={{
            tabBarIcon: ({ color, size }) => (
              <MapIcon width={size} height={size} color={color} />
            ),
            title: "Map",
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            tabBarButton: isGuest ? lockedTabButton : undefined,
            tabBarIcon: ({ color, size }) => (
              <SearchIcon width={size} height={size} color={color} />
            ),
            title: "Search",
          }}
        />

        <Tabs.Screen
          name="categories"
          options={{
            tabBarButton: isGuest ? lockedTabButton : undefined,
            tabBarIcon: ({ color, size }) => (
              <CategoriesIcon width={size} height={size} color={color} />
            ),
            title: "Categories",
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color, size }) => (
              <ProfileIcon width={size} height={size} color={color} />
            ),
            title: "Profile",
          }}
        />

        <Tabs.Screen
          name="location-details"
          options={{
            href: null,
            title: "Location Details",
          }}
        />
      </Tabs>

      <LimitedAccessModal
        visible={isLimitedAccessOpen}
        onClose={() => setIsLimitedAccessOpen(false)}
        onLogin={() => {
          setIsLimitedAccessOpen(false);
          router.push("/login");
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    display: "none",
  },
});
