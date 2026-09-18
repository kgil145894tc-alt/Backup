import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import FloorPlan from "../../components/FloorPlan";
import {
  campusFeatureSummaries,
  getBuildingIdForRoom,
  type BuildingRoom,
} from "../data/campusData";
import { loadCampusData } from "../services/campusDataStore";
import {
  getEditedBuildingRoom,
  getEditedBuildingRooms,
} from "../utils/adminRooms";

const sampleClassroomPhoto =
  "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80";

export default function RoomDetailsScreen() {
  const { buildingId, roomId, featureId, featureType } = useLocalSearchParams<{
    buildingId?: string;
    roomId?: string;
    featureId?: string;
    featureType?: string;
  }>();
  const [roomEdits, setRoomEdits] = useState<Record<string, BuildingRoom>>({});
  const resolvedBuildingId = buildingId || (featureId ? getBuildingIdForRoom(featureId) : undefined);
  const requestedRoomId = roomId ?? featureId;
  const mappedRoom = useMemo(
    () =>
      resolvedBuildingId && requestedRoomId
        ? getEditedBuildingRoom(
            resolvedBuildingId,
            requestedRoomId,
            roomEdits,
          )
        : undefined,
    [resolvedBuildingId, requestedRoomId, roomEdits],
  );
  const room = useMemo(
    () => mappedRoom ?? campusFeatureSummaries.find((feature) => feature.id === featureId && feature.type === featureType),
    [mappedRoom, featureId, featureType],
  );
  const building = useMemo(
    () => campusFeatureSummaries.find((feature) => feature.id === resolvedBuildingId && feature.type === "building"),
    [resolvedBuildingId],
  );
  const floorRooms = useMemo(
    () =>
      resolvedBuildingId && mappedRoom
        ? getEditedBuildingRooms(
            resolvedBuildingId,
            roomEdits,
            mappedRoom.floorNumber,
          )
        : [],
    [mappedRoom, resolvedBuildingId, roomEdits],
  );
  const mapFeatureId = mappedRoom?.mapFeatureId ?? room?.id ?? "";
  const mapFeatureType = mappedRoom?.mapFeatureType ?? room?.type ?? "";

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

  if (!room) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Room not found</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{room.name}</Text>
      <Text style={styles.meta}>{building?.name ?? "Campus building"} {room.floor ? `• ${room.floor}` : ""}</Text>

      <Image source={{ uri: sampleClassroomPhoto }} style={styles.photo} />

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Room information</Text>
        <Text style={styles.infoValue}>{room.description ?? "Information for this room will be added soon."}</Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoLabel}>Directions</Text>
        <Text style={styles.infoValue}>{room.directions ?? "Open the map to view the room location."}</Text>
      </View>

      {mappedRoom && floorRooms.length ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open full floor plan"
          onPress={() =>
            router.push({
              pathname: "/room-map",
              params: {
                buildingId: resolvedBuildingId ?? "",
                roomId: mappedRoom.id,
                floorNumber: String(mappedRoom.floorNumber),
              },
            })
          }
          style={styles.floorPlanButton}
        >
          <FloorPlan rooms={floorRooms} selectedRoomId={mappedRoom.id} />
          <Text style={styles.floorPlanHint}>Tap the floor plan to view it clearly.</Text>
        </Pressable>
      ) : null}

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push({
            pathname: "/(tabs)/map",
            params: {
              featureId: mapFeatureId,
              featureType: mapFeatureType,
              locateOnly: "1",
            },
          })
        }
      >
        <Text style={styles.buttonText}>View on Map</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 32, paddingTop: 44 },
  center: { flex: 1, justifyContent: "center", alignItems: "center", gap: 16, padding: 24 },
  title: { color: "#111827", fontSize: 24, fontWeight: "700" },
  meta: { color: "#6b7280", marginTop: 6 },
  photo: { borderRadius: 6, height: 180, marginTop: 20, width: "100%" },
  infoBox: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 6, marginTop: 20, padding: 14 },
  infoLabel: { color: "#374151", fontSize: 13, fontWeight: "700", marginBottom: 6, textTransform: "uppercase" },
  infoValue: { color: "#374151", lineHeight: 21 },
  floorPlanButton: { marginTop: 20 },
  floorPlanHint: { color: "#4b5563", fontSize: 13, marginTop: 10, textAlign: "center" },
  button: { alignItems: "center", backgroundColor: "#111827", borderRadius: 6, marginTop: 24, paddingHorizontal: 16, paddingVertical: 13 },
  buttonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },
});
