import { router, useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import ProtectedAccess from "../../../components/ProtectedAccess";
import {
  loadCampusData,
} from "../../services/campusDataStore";
import {
  getGuestHistory,
  saveGuestHistoryItem,
} from "../../utils/guestHistory";
import type {
  GuestHistoryItem,
  SaveGuestHistoryItem,
} from "../../utils/guestHistory";

type SearchResultItem = SaveGuestHistoryItem | GuestHistoryItem;
type SearchFeatureItem = SaveGuestHistoryItem & {
  aliases: string[];
};

export default function SearchScreen() {
  const [searchText, setSearchText] = useState("");
  const [mapFeatures, setMapFeatures] = useState<SearchFeatureItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<
    GuestHistoryItem[]
  >([]);

  const trimmedSearch = searchText.trim().toLowerCase();
  const isSearching = trimmedSearch.length > 0;

  const filteredFeatures = useMemo(() => {
    if (!isSearching) {
      return [];
    }

    return mapFeatures.filter(
      (feature) =>
        feature.name.toLowerCase().includes(trimmedSearch) ||
        feature.featureId.toLowerCase().includes(trimmedSearch) ||
        feature.type.toLowerCase().includes(trimmedSearch) ||
        feature.category.toLowerCase().includes(trimmedSearch) ||
        feature.aliases.some((alias) =>
          alias.toLowerCase().includes(trimmedSearch),
        ),
    );
  }, [isSearching, trimmedSearch]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadRecentSearches() {
        const [nextRecentSearches, campusData] =
          await Promise.all([getGuestHistory(), loadCampusData()]);

        if (isActive) {
          setMapFeatures(
            campusData.visibleLocations.map((feature) => ({
              featureId: feature.id,
              featureType: feature.type,
              name: feature.name,
              category: feature.category,
              type: feature.type,
              aliases: feature.aliases ?? [],
            })),
          );
          setRecentSearches(nextRecentSearches);
        }
      }

      void loadRecentSearches();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const openFeature = useCallback(
    (feature: SaveGuestHistoryItem) => {
      void saveGuestHistoryItem(feature).then(setRecentSearches);

      router.push({
        pathname: "/(tabs)/map",
        params: {
          featureId: feature.featureId,
          featureType: feature.featureType,
          locateOnly: "1",
        },
      });
    },
    [],
  );

  const listData: SearchResultItem[] = isSearching
    ? filteredFeatures
    : recentSearches;

  return (
    <ProtectedAccess>
      <View style={styles.container}>
      <Text style={styles.heading}>Search</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search building, room, office..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <Text style={styles.sectionTitle}>
        {isSearching ? "Search Results" : "Recent Search"}
      </Text>

      <FlatList
        data={listData}
        keyExtractor={(item) => `${item.featureType}-${item.featureId}`}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {isSearching ? "No places found" : "No recent search yet"}
            </Text>
            <Text style={styles.emptyText}>
              {isSearching
                ? "Try searching by place name, category, or type."
                : "Places you open from Search or tap on the Map will appear here."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.resultItem}
            onPress={() => openFeature(item)}
          >
            <Text style={styles.resultName}>{item.name}</Text>
            <Text style={styles.resultMeta}>
              {item.category} • {item.type}
            </Text>
          </Pressable>
        )}
      />
      </View>
    </ProtectedAccess>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 15,
  },

  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },

  resultItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },

  resultName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },

  resultMeta: {
    color: "#555",
  },

  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 48,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
  },

  emptyText: {
    color: "#555",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
});
