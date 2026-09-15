import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { campusFeatureSummaries } from "../../data/campusData";
import type { CampusFeatureCategory } from "../../types/campus";

const categoryOrder: CampusFeatureCategory[] = [
  "Building",
  "Room",
  "Office",
  "Laboratory",
  "Facility",
  "Faculty",
  "Food",
];

const mapFeatures = campusFeatureSummaries.map((feature) => ({
  properties: {
    id: feature.id,
    name: feature.name,
    type: feature.type,
    category: feature.category,
  },
}));

const categories = Array.from(
  new Set(mapFeatures.map((feature) => feature.properties.category)),
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
});

export default function Categories() {
  const [selectedCategory, setSelectedCategory] = useState(
    categories[0] ?? "",
  );

  const selectedFeatures = useMemo(
    () =>
      mapFeatures.filter(
        (feature) => feature.properties.category === selectedCategory,
      ),
    [selectedCategory],
  );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.heading}>Categories</Text>
      <Text style={styles.subheading}>
        Browse campus places by type, then tap a result to open it on the map.
      </Text>

      <View style={styles.categoryGrid}>
        {categories.map((category) => {
          const count = mapFeatures.filter(
            (feature) => feature.properties.category === category,
          ).length;
          const isSelected = selectedCategory === category;

          return (
            <Pressable
              key={category}
              style={[
                styles.categoryCard,
                isSelected && styles.categoryCardSelected,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryName,
                  isSelected && styles.categoryNameSelected,
                ]}
              >
                {category}
              </Text>
              <Text
                style={[
                  styles.categoryCount,
                  isSelected && styles.categoryCountSelected,
                ]}
              >
                {count} {count === 1 ? "place" : "places"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>{selectedCategory}</Text>
        <Text style={styles.resultsCount}>
          {selectedFeatures.length}{" "}
          {selectedFeatures.length === 1 ? "match" : "matches"}
        </Text>
      </View>

      <View style={styles.resultList}>
        {selectedFeatures.map((feature) => (
          <Pressable
            key={`${feature.properties.type}-${feature.properties.id}`}
            style={styles.resultItem}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/map",
                params: {
                  featureId: feature.properties.id,
                  featureType: feature.properties.type,
                },
              })
            }
          >
            <Text style={styles.resultName}>{feature.properties.name}</Text>
            <Text style={styles.resultMeta}>
              {feature.properties.category} - {feature.properties.type}
            </Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
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
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 76,
    padding: 14,
    width: "47%",
  },

  categoryCardSelected: {
    backgroundColor: "#0078ff",
    borderColor: "#0078ff",
  },

  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
  },

  categoryNameSelected: {
    color: "white",
  },

  categoryCount: {
    color: "#555",
    fontSize: 13,
  },

  categoryCountSelected: {
    color: "white",
  },

  resultsHeader: {
    alignItems: "baseline",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  resultsTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  resultsCount: {
    color: "#555",
    fontSize: 13,
  },

  resultList: {
    borderTopColor: "#ddd",
    borderTopWidth: 1,
  },

  resultItem: {
    borderBottomColor: "#ddd",
    borderBottomWidth: 1,
    paddingVertical: 15,
  },

  resultName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  resultMeta: {
    color: "#555",
  },
});
