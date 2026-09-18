import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { campusFeatureSummaries, getBuildingRooms } from "../data/campusData";
import { loadCampusData } from "../services/campusDataStore";
import { applyAdminRoomEdits } from "../utils/adminRooms";
import type { BuildingRoom } from "../data/campusData";

export default function BuildingFloorsScreen() {
  const { buildingId } = useLocalSearchParams<{ buildingId?: string }>();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [roomEdits, setRoomEdits] = useState<Record<string, BuildingRoom>>({});
  const building = useMemo(
    () => campusFeatureSummaries.find((feature) => feature.id === buildingId && feature.type === "building"),
    [buildingId],
  );
  const rooms = useMemo(
    () =>
      buildingId
        ? applyAdminRoomEdits(
            getBuildingRooms(buildingId, selectedFloor),
            roomEdits,
          )
        : [],
    [buildingId, roomEdits, selectedFloor],
  );

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void loadCampusData().then((snapshot) => {
        if (isActive) {
          setRoomEdits(snapshot.roomEdits);
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  if (!building) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Building not found</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const floors = Array.from({ length: Number(building.floors ?? 1) }, (_, index) => index + 1);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{building.name}</Text>
      <Text style={styles.subtitle}>Select a floor to view its rooms and areas.</Text>

      <View style={styles.floorTabs}>
        {floors.map((floor) => (
          <Pressable
            key={floor}
            onPress={() => setSelectedFloor(floor)}
            style={[styles.floorButton, selectedFloor === floor && styles.floorButtonSelected]}
          >
            <Text style={[styles.floorButtonText, selectedFloor === floor && styles.floorButtonTextSelected]}>
              Floor {floor}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Rooms and areas</Text>
      {rooms.length ? (
        rooms.map((room) => (
          <Pressable
            key={`${room.type}-${room.id}`}
            style={styles.roomItem}
            onPress={() =>
              router.push({
                pathname: "/room-details",
                params: { buildingId: building.id, roomId: room.id },
              })
            }
          >
            <View>
              <Text style={styles.roomName}>{room.name}</Text>
              <Text style={styles.roomMeta}>{room.category}</Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        ))
      ) : (
        <Text style={styles.emptyText}>No rooms have been added for Floor {selectedFloor} yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 44 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 24 },
  title: { fontSize: 24, fontWeight: "700", color: "#111827" },
  subtitle: { marginTop: 6, color: "#4b5563", lineHeight: 20 },
  floorTabs: { flexDirection: "row", gap: 8, marginTop: 20 },
  floorButton: { borderWidth: 1, borderColor: "#9ca3af", borderRadius: 6, paddingHorizontal: 14, paddingVertical: 10 },
  floorButtonSelected: { backgroundColor: "#111827", borderColor: "#111827" },
  floorButtonText: { color: "#111827", fontWeight: "600" },
  floorButtonTextSelected: { color: "#ffffff" },
  sectionTitle: { marginTop: 24, marginBottom: 10, fontSize: 18, fontWeight: "700", color: "#111827" },
  roomItem: { alignItems: "center", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, flexDirection: "row", justifyContent: "space-between", marginBottom: 10, padding: 14 },
  roomName: { color: "#111827", fontSize: 16, fontWeight: "700" },
  roomMeta: { color: "#6b7280", fontSize: 13, marginTop: 3 },
  arrow: { color: "#4b5563", fontSize: 26, lineHeight: 26 },
  emptyText: { color: "#6b7280", lineHeight: 20 },
  button: { backgroundColor: "#111827", borderRadius: 6, paddingHorizontal: 16, paddingVertical: 12 },
  buttonText: { color: "#ffffff", fontWeight: "700" },
});
