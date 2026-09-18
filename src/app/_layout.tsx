import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="building-floors" options={{ title: "Building Floors" }} />
      <Stack.Screen name="room-details" options={{ title: "Room Details" }} />
      <Stack.Screen name="room-map" options={{ title: "Floor Plan" }} />
      <Stack.Screen name="notifications" options={{ headerShown: false }} />
    </Stack>
  );
}
