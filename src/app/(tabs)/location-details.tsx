import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import {
  campusFeatureSummaries,
  getBuildingIdForRoom,
} from "../../data/campusData";
import { saveGuestHistoryItem } from "../../utils/guestHistory";

function getFeatureFromParams(featureId?: string, featureType?: string) {
  if (!featureId || !featureType) {
    return undefined;
  }

  return campusFeatureSummaries.find(
    (feature) => feature.id === featureId && feature.type === featureType,
  );
}

export default function LocationDetailsScreen() {
  const { featureId, featureType } = useLocalSearchParams<{
    featureId?: string;
    featureType?: string;
  }>();

  const feature = useMemo(
    () => getFeatureFromParams(featureId, featureType),
    [featureId, featureType],
  );
  const isRoomFeature =
    feature?.type === "room" ||
    feature?.type === "laboratory" ||
    feature?.type === "faculty";

  useEffect(() => {
    if (!feature) {
      return;
    }

    void saveGuestHistoryItem({
      featureId: feature.id,
      featureType: feature.type,
      name: feature.name,
      category: feature.category,
      type: feature.type,
    });
  }, [feature]);

  if (!feature) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Location not found</Text>
        <Text style={styles.emptyText}>
          The selected campus place is missing or no longer available.
        </Text>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>{feature.category}</Text>
      <Text style={styles.title}>{feature.name}</Text>

      <View style={styles.detailGrid}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Type</Text>
          <Text style={styles.detailValue}>{feature.type}</Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Category</Text>
          <Text style={styles.detailValue}>{feature.category}</Text>
        </View>

        {feature.floors !== undefined ? (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Floors</Text>
            <Text style={styles.detailValue}>{feature.floors}</Text>
          </View>
        ) : null}

        {feature.floor ? (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Floor</Text>
            <Text style={styles.detailValue}>{feature.floor}</Text>
          </View>
        ) : null}
      </View>

      {feature.aliases?.length ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Also Known As</Text>
          <View style={styles.aliasList}>
            {feature.aliases.map((alias) => (
              <Text key={alias} style={styles.aliasPill}>
                {alias}
              </Text>
            ))}
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {feature.description ??
            "No description has been added for this location yet."}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Navigation</Text>
        <Text style={styles.description}>
          {feature.directions ??
            "Open this place on the campus map to highlight its exact building or room shape."}
        </Text>
      </View>

      {feature.nearby ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nearby</Text>
          <Text style={styles.description}>{feature.nearby}</Text>
        </View>
      ) : null}

      {feature.accessibility ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Accessibility</Text>
          <Text style={styles.description}>{feature.accessibility}</Text>
        </View>
      ) : null}

      <Pressable
        style={styles.primaryButton}
        onPress={() => {
          if (feature.type === "building") {
            router.push({ pathname: "/building-floors", params: { buildingId: feature.id } });
            return;
          }

          if (isRoomFeature) {
            router.push({
              pathname: "/room-details",
              params: {
                buildingId: getBuildingIdForRoom(feature.id) ?? "",
                featureId: feature.id,
                featureType: feature.type,
              },
            });
            return;
          }

          router.push({
            pathname: "/(tabs)/map",
            params: {
              featureId: feature.id,
              featureType: feature.type,
            },
          });
        }}
      >
        <Text style={styles.primaryButtonText}>
          {feature.type === "building"
            ? "View Floors and Rooms"
            : isRoomFeature
              ? "View Room Details"
              : "View on Map"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    padding: 20,
    paddingBottom: 36,
  },

  eyebrow: {
    color: "#0078ff",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },

  title: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
    marginBottom: 18,
  },

  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },

  detailItem: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexGrow: 1,
    minWidth: 120,
    padding: 14,
  },

  detailLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 5,
    textTransform: "uppercase",
  },

  detailValue: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "700",
    textTransform: "capitalize",
  },

  section: {
    marginBottom: 20,
  },

  aliasList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  aliasPill: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    color: "#374151",
    fontSize: 13,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
  },

  description: {
    color: "#374151",
    fontSize: 15,
    lineHeight: 22,
  },

  primaryButton: {
    alignItems: "center",
    backgroundColor: "#0078ff",
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },

  emptyContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  emptyTitle: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },

  emptyText: {
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },

  secondaryButton: {
    borderColor: "#0078ff",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  secondaryButtonText: {
    color: "#0078ff",
    fontSize: 15,
    fontWeight: "800",
  },
});
