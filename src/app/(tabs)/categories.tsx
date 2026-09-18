import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import ProtectedAccess from "../../../components/ProtectedAccess";
import { loadCampusData } from "../../services/campusDataStore";
import type { CampusFeatureCategory } from "../../types/campus";
import {
  initialAdminLocations,
  type AdminLocation,
} from "../../utils/adminLocations";

const categoryOrder: CampusFeatureCategory[] = [
  "Building",
  "Room",
  "Office",
  "Laboratory",
  "Facility",
  "Faculty",
  "Food",
];

export default function Categories() {
  const [mapFeatures, setMapFeatures] =
    useState<AdminLocation[]>(initialAdminLocations);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void loadCampusData().then((snapshot) => {
        if (isActive) {
          setMapFeatures(snapshot.visibleLocations);
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const categories = useMemo(
    () =>
      Array.from(
        new Set(mapFeatures.map((feature) => feature.category)),
      ).sort((a, b) => {
        const aIndex = categoryOrder.indexOf(a);
        const bIndex = categoryOrder.indexOf(b);

        if (aIndex === -1 && bIndex === -1) {
          return a.localeCompare(b);
        }

        if (aIndex === -1) {
          return 1;
        }

        if (bIndex === -1) {
          return -1;
        }

        return aIndex - bIndex;
      }),
    [mapFeatures],
  );

  function openCategoryOnMap(category: CampusFeatureCategory) {
    router.push({
      pathname: "/(tabs)/map",
      params: {
        category,
      },
    });
  }

  return (
    <ProtectedAccess>
      <ScrollView
        contentContainerStyle={styles.content}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
      <Text style={styles.heading}>Categories</Text>
      <Text style={styles.subheading}>
        Choose a campus type to show its locations on the map.
      </Text>

      <View style={styles.categoryGrid}>
        {categories.map((category) => {
          const count = mapFeatures.filter(
            (feature) => feature.category === category,
          ).length;

          return (
            <Pressable
              key={category}
              accessibilityRole="button"
              accessibilityLabel={`Show ${category} locations on the map`}
              style={styles.categoryCard}
              onPress={() => openCategoryOnMap(category)}
            >
              <Text style={styles.categoryName}>{category}</Text>
              <Text style={styles.categoryCount}>
                {count} {count === 1 ? "place" : "places"}
              </Text>
              <Text style={styles.categoryAction}>View on map</Text>
            </Pressable>
          );
        })}
      </View>
      </ScrollView>
    </ProtectedAccess>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 32,
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subheading: {
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },

  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },

  categoryCard: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 104,
    justifyContent: "space-between",
    padding: 14,
    width: "47%",
  },

  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },

  categoryCount: {
    color: "#555",
    fontSize: 13,
  },

  categoryAction: {
    color: "#8F1D32",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 12,
  },
});
