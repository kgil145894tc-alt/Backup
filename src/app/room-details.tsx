import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

import ProceedArrow from "../../assets/design/icons/proceed-arrow.svg";
import FloorPlan from "@/components/FloorPlan";
import OfficialPage, { officialDetailStyles } from "@/components/OfficialPage";
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
  const resolvedBuildingId =
    buildingId || (featureId ? getBuildingIdForRoom(featureId) : undefined);
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
    () =>
      mappedRoom ??
      campusFeatureSummaries.find(
        (feature) => feature.id === featureId && feature.type === featureType,
      ),
    [featureId, featureType, mappedRoom],
  );
  const building = useMemo(
    () =>
      campusFeatureSummaries.find(
        (feature) =>
          feature.id === resolvedBuildingId && feature.type === "building",
      ),
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
      <OfficialPage title="Room not found" subtitle="This room is unavailable.">
        <Pressable style={officialDetailStyles.button} onPress={() => router.back()}>
          <Text style={officialDetailStyles.buttonText}>Go Back</Text>
        </Pressable>
      </OfficialPage>
    );
  }

  return (
    <OfficialPage
      title={room.name}
      subtitle={`${building?.name ?? "Campus building"}${room.floor ? ` - ${room.floor}` : ""}`}
    >
      <Image source={{ uri: sampleClassroomPhoto }} style={styles.photo} />

      <InfoBox title="Room information">
        {room.description ?? "Information for this room will be added soon."}
      </InfoBox>

      <InfoBox title="Directions">
        {room.directions ?? "Open the map to view the room location."}
      </InfoBox>

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
          <Text style={styles.floorPlanHint}>
            Tap the floor plan to view it clearly.
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        style={[officialDetailStyles.button, styles.mapButton]}
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
        <Text style={officialDetailStyles.buttonText}>View on Map</Text>
        <ProceedArrow width={16} height={19} accessible={false} />
      </Pressable>
    </OfficialPage>
  );
}

function InfoBox({ children, title }: { children: string; title: string }) {
  return (
    <View style={styles.infoBox}>
      <Text style={styles.infoLabel}>{title}</Text>
      <Text style={officialDetailStyles.bodyText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: {
    borderRadius: 10,
    height: 180,
    width: "100%",
  },

  infoBox: {
    ...officialDetailStyles.card,
    marginTop: 14,
    padding: 14,
  },

  infoLabel: {
    color: "#AF2532",
    fontFamily: "HelpBold",
    fontSize: 13,
    marginBottom: 6,
    textTransform: "uppercase",
  },

  floorPlanButton: {
    marginTop: 20,
  },

  floorPlanHint: {
    color: "#6C757D",
    fontFamily: "HelpRegular",
    fontSize: 13,
    marginTop: 10,
    textAlign: "center",
  },

  mapButton: {
    marginTop: 24,
  },
});
