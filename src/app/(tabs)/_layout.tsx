import { Tabs } from "expo-router";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import LimitedAccessModal from "../../../components/LimitedAccessModal";
import {
  getAppAccessMode,
  isGuestMode,
  type AppAccessMode,
} from "../../utils/appSession";

export default function TabLayout() {
  const [accessMode, setAccessMode] = useState<AppAccessMode>("guest");
  const [isLimitedAccessOpen, setIsLimitedAccessOpen] = useState(false);
  const isGuest = isGuestMode(accessMode);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void getAppAccessMode().then((mode) => {
        if (isActive) {
          setAccessMode(mode);
        }
      });

      return () => {
        isActive = false;
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
