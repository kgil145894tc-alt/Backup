import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import FloorPlan from "@/components/FloorPlan";
import OfficialPage, { officialDetailStyles } from "@/components/OfficialPage";
import type { BuildingRoom } from "../data/campusData";
import { loadCampusData } from "../services/campusDataStore";
import {
  getEditedBuildingRoom,
  getEditedBuildingRooms,
} from "../utils/adminRooms";

export default function RoomMapScreen() {
  const { buildingId, roomId, floorNumber } = useLocalSearchParams<{
    buildingId?: string;
    roomId?: string;
    floorNumber?: string;
  }>();
  const selectedFloor = Number(floorNumber ?? 1);
  const [roomEdits, setRoomEdits] = useState<Record<string, BuildingRoom>>({});
  const room = useMemo(
    () =>
      buildingId && roomId
        ? getEditedBuildingRoom(buildingId, roomId, roomEdits)
        : undefined,
    [buildingId, roomEdits, roomId],
  );
  const rooms = useMemo(
    () =>
      buildingId
        ? getEditedBuildingRooms(buildingId, roomEdits, selectedFloor)
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

  if (!room || !rooms.length) {
    return (
      <OfficialPage title="Floor plan not found" subtitle="This floor plan is unavailable.">
        <Pressable style={officialDetailStyles.button} onPress={() => router.back()}>
          <Text style={officialDetailStyles.buttonText}>Go Back</Text>
        </Pressable>
      </OfficialPage>
    );
  }

  return (
    <OfficialPage title={room.name} subtitle={room.floor}>
      <View style={styles.planWrapper}>
        <FloorPlan rooms={rooms} selectedRoomId={room.id} />
      </View>
      <View style={styles.footer}>
        <Text style={officialDetailStyles.bodyText}>
          The highlighted room is your selected location.
        </Text>
        <Pressable
          accessibilityRole="button"
          style={[officialDetailStyles.button, styles.mapButton]}
          onPress={() => router.replace("/(tabs)/map")}
        >
          <Text style={officialDetailStyles.buttonText}>Back to Map</Text>
        </Pressable>
      </View>
    </OfficialPage>
  );
}

const styles = StyleSheet.create({
  planWrapper: {
    ...officialDetailStyles.card,
    flex: 1,
    justifyContent: "center",
    minHeight: 360,
    padding: 12,
  },

  footer: {
    gap: 12,
    marginTop: 20,
  },

  mapButton: {
    marginTop: 0,
  },
});
