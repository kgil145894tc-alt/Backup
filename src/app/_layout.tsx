import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="building-floors" options={{ title: "Building Floors" }} />
      <Stack.Screen name="room-details" options={{ title: "Room Details" }} />
      <Stack.Screen name="room-map" options={{ title: "Floor Plan" }} />
    </Stack>
  );
}
