import { Tabs } from "expo-router";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LimitedAccessModal from "../../../components/LimitedAccessModal";
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
    <SafeAreaView edges={["top"]} style={styles.container}>
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
          }}
        />

        <Tabs.Screen
          name="map"
          options={{
            title: "Map",
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            tabBarButton: isGuest ? lockedTabButton : undefined,
            title: "Search",
          }}
        />

        <Tabs.Screen
          name="categories"
          options={{
            tabBarButton: isGuest ? lockedTabButton : undefined,
            title: "Categories",
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
