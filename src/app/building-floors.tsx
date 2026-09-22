import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import ProceedArrow from "../../assets/design/icons/proceed-arrow.svg";
import OfficialPage, { officialDetailStyles } from "@/components/OfficialPage";
import { campusFeatureSummaries, getBuildingRooms } from "../data/campusData";
import type { BuildingRoom } from "../data/campusData";
import { loadCampusData } from "../services/campusDataStore";
import { applyAdminRoomEdits } from "../utils/adminRooms";

export default function BuildingFloorsScreen() {
  const { buildingId } = useLocalSearchParams<{ buildingId?: string }>();
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [roomEdits, setRoomEdits] = useState<Record<string, BuildingRoom>>({});
  const building = useMemo(
    () =>
      campusFeatureSummaries.find(
        (feature) => feature.id === buildingId && feature.type === "building",
      ),
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
      <OfficialPage title="Building not found" subtitle="This building is unavailable.">
        <Pressable style={officialDetailStyles.button} onPress={() => router.back()}>
          <Text style={officialDetailStyles.buttonText}>Go Back</Text>
        </Pressable>
      </OfficialPage>
    );
  }

  const floors = Array.from(
    { length: Number(building.floors ?? 1) },
    (_, index) => index + 1,
  );

  return (
    <OfficialPage
      title={building.name}
      subtitle="Select a floor to view its rooms and areas."
    >
      <View style={styles.floorTabs}>
        {floors.map((floor) => (
          <Pressable
            key={floor}
            onPress={() => setSelectedFloor(floor)}
            style={[
              styles.floorButton,
              selectedFloor === floor && styles.floorButtonSelected,
            ]}
          >
            <Text
              style={[
                styles.floorButtonText,
                selectedFloor === floor && styles.floorButtonTextSelected,
              ]}
            >
              Floor {floor}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[officialDetailStyles.sectionTitle, styles.sectionTitle]}>
        Rooms and areas
      </Text>
      {rooms.length ? (
        rooms.map((room) => (
          <Pressable
            key={`${room.type}-${room.id}`}
            style={[officialDetailStyles.card, styles.roomItem]}
            onPress={() =>
              router.push({
                pathname: "/room-details",
                params: { buildingId: building.id, roomId: room.id },
              })
            }
          >
            <View style={styles.roomCopy}>
              <Text style={styles.roomTitle}>{room.name}</Text>
              <Text style={styles.roomMeta}>{room.category}</Text>
            </View>
            <ProceedArrow width={16} height={19} accessible={false} />
          </Pressable>
        ))
      ) : (
        <Text style={officialDetailStyles.bodyText}>
          No rooms have been added for Floor {selectedFloor} yet.
        </Text>
      )}
    </OfficialPage>
  );
}

const styles = StyleSheet.create({
  floorTabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  floorButton: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CDA6AA",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  floorButtonSelected: {
    backgroundColor: "#AF2532",
    borderColor: "#AF2532",
  },

  floorButtonText: {
    color: "#3C4147",
    fontFamily: "HelpBold",
  },

  floorButtonTextSelected: {
    color: "#FFFFFF",
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
  },

  roomItem: {
    marginBottom: 10,
  },

  roomCopy: {
    flex: 1,
  },

  roomTitle: {
    color: "#3C4147",
    fontFamily: "HelpBold",
    fontSize: 18,
  },

  roomMeta: {
    color: "#6C757D",
    fontFamily: "HelpRegular",
    fontSize: 16,
  },
});
