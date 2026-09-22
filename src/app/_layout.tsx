import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect } from "react";
import { Platform, StatusBar as NativeStatusBar } from "react-native";

import { useDesignFonts } from "@/utils/designFonts";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useDesignFonts();

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync("#AF2532");
    if (Platform.OS === "android") {
      NativeStatusBar.setBackgroundColor("#AF2532", true);
      NativeStatusBar.setBarStyle("light-content", true);
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="building-floors" options={{ title: "Building Floors" }} />
      <Stack.Screen name="room-details" options={{ title: "Room Details" }} />
      <Stack.Screen name="room-map" options={{ title: "Floor Plan" }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}
