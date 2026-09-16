import { router, useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import FloorPlan from "../../components/FloorPlan";
import { getBuildingRoom, getBuildingRooms } from "../data/campusData";

export default function RoomMapScreen() {
  const { buildingId, roomId, floorNumber } = useLocalSearchParams<{
    buildingId?: string;
    roomId?: string;
    floorNumber?: string;
  }>();
  const selectedFloor = Number(floorNumber ?? 1);
  const room = useMemo(
    () => (buildingId && roomId ? getBuildingRoom(buildingId, roomId) : undefined),
    [buildingId, roomId],
  );
  const rooms = useMemo(
    () => (buildingId ? getBuildingRooms(buildingId, selectedFloor) : []),
    [buildingId, selectedFloor],
  );

  if (!room || !rooms.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Floor plan not found</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{room.name}</Text>
      <Text style={styles.subtitle}>{room.floor}</Text>
      <View style={styles.planWrapper}>
        <FloorPlan rooms={rooms} selectedRoomId={room.id} />
      </View>
      <View style={styles.footer}>
        <Text style={styles.helpText}>The highlighted room is your selected location.</Text>
        <Pressable
          accessibilityRole="button"
          style={styles.button}
          onPress={() => router.replace("/(tabs)/map")}
        >
          <Text style={styles.buttonText}>Back to Map</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  center: { alignItems: "center", flex: 1, gap: 16, justifyContent: "center", padding: 24 },
  title: { color: "#111827", fontSize: 24, fontWeight: "700" },
  subtitle: { color: "#6b7280", marginTop: 5 },
  planWrapper: { flex: 1, justifyContent: "center", marginTop: 24 },
  footer: { marginTop: 28 },
  helpText: { color: "#4b5563", fontSize: 13, lineHeight: 18, marginBottom: 12 },
  button: { alignItems: "center", backgroundColor: "#111827", borderRadius: 6, paddingVertical: 13 },
  buttonText: { color: "#ffffff", fontWeight: "700" },
});
