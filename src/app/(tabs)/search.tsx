import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, FlatList, Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  OfficialBottomNavigation,
  OfficialLocationCard,
  type OfficialLocationItem,
} from "@/components/OfficialDesign";
import Background from "../../../assets/design/backgrounds/fourthBg.svg";
import BackArrow from "../../../assets/design/icons/back-arrow.svg";
import ProtectedAccess from "@/components/ProtectedAccess";
import { loadCampusData } from "../../services/campusDataStore";
import { getCurrentHistory, saveCurrentHistoryItem } from "../../utils/guestHistory";
import type { GuestHistoryItem, SaveGuestHistoryItem } from "../../utils/guestHistory";
import { navigateToTab } from "@/utils/navigation";
import { styles } from "../../styles/official/searchScreen.styles";

type SearchResultItem = SaveGuestHistoryItem | GuestHistoryItem;
type SearchFeatureItem = SaveGuestHistoryItem & {
  aliases: string[];
  floor?: string;
  floors?: number | string;
};

const locationImages = {
  academic: require("../../../assets/design/locations/category-academic.png"),
  admin: require("../../../assets/design/locations/category-admin.png"),
  cafeteria: require("../../../assets/design/locations/cafeteria.png"),
  clinic: require("../../../assets/design/locations/clinic.png"),
  default: require("../../../assets/design/locations/old-building.png"),
  facilities: require("../../../assets/design/locations/category-facilities.png"),
  library: require("../../../assets/design/locations/library.png"),
  newBuilding: require("../../../assets/design/locations/new-building.png"),
};

function getLocationImage(item: Pick<SearchResultItem, "category" | "name">) {
  const name = item.name.toLowerCase();
  const category = item.category.toLowerCase();

  if (name.includes("cafeteria")) return locationImages.cafeteria;
  if (name.includes("clinic")) return locationImages.clinic;
  if (name.includes("library")) return locationImages.library;
  if (name.includes("new") || name.includes("building 2")) return locationImages.newBuilding;
  if (category.includes("academic") || category.includes("room")) return locationImages.academic;
  if (category.includes("office") || category.includes("admin")) return locationImages.admin;
  if (category.includes("facilit")) return locationImages.facilities;
  return locationImages.default;
}

function toLocationCardItem(item: SearchResultItem): OfficialLocationItem {
  const feature = item as SearchFeatureItem;
  return {
    id: `${item.featureType}-${item.featureId}`,
    name: item.name,
    category: item.category,
    floors: feature.floors ?? feature.floor,
    image: getLocationImage(item),
  };
}

export default function SearchScreen() {
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  const [searchOpening, setSearchOpening] = useState(false);
  const [mapFeatures, setMapFeatures] = useState<SearchFeatureItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<GuestHistoryItem[]>([]);

  useEffect(() => {
    const subscription = Keyboard.addListener("keyboardDidHide", () => setSearchOpening(false));
    return () => subscription.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      async function loadRecentSearches() {
        const [nextRecentSearches, campusData] = await Promise.all([
          getCurrentHistory(),
          loadCampusData(),
        ]);

        if (!isActive) return;

        setMapFeatures(
          campusData.visibleLocations.map((feature) => ({
            featureId: feature.id,
            featureType: feature.type,
            name: feature.name,
            category: feature.category,
            type: feature.type,
            aliases: feature.aliases ?? [],
            floor: feature.floor,
            floors: feature.floors,
          })),
        );
        setRecentSearches(nextRecentSearches);
      }

      void loadRecentSearches();

      return () => {
        isActive = false;
      };
    }, []),
  );

  const searchTerm = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!searchTerm) return [];

    return mapFeatures.filter(
      (feature) =>
        feature.name.toLowerCase().includes(searchTerm) ||
        feature.featureId.toLowerCase().includes(searchTerm) ||
        feature.type.toLowerCase().includes(searchTerm) ||
        feature.category.toLowerCase().includes(searchTerm) ||
        feature.aliases.some((alias) => alias.toLowerCase().includes(searchTerm)),
    );
  }, [mapFeatures, searchTerm]);

  const listData: SearchResultItem[] = searchTerm ? results : recentSearches;

  const openFeature = useCallback((feature: SearchResultItem) => {
    void saveCurrentHistoryItem(feature).then(setRecentSearches);

    router.push({
      pathname: "/(tabs)/map",
      params: {
        featureId: feature.featureId,
        featureType: feature.featureType,
        locateOnly: "1",
      },
    });
  }, []);

  const navigate = (name: string) => {
    navigateToTab(name, {
      currentTab: "Search",
      onSameTab: () => {
        setSearchOpening(true);
        requestAnimationFrame(() => inputRef.current?.focus());
      },
    });
  };

  return (
    <ProtectedAccess>
      <View style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.background} pointerEvents="none">
          <Background
            width="100%"
            height={Dimensions.get("screen").height}
            preserveAspectRatio="none"
          />
        </View>
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Go back"
                onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
                style={styles.backButton}
              >
                <BackArrow width={32} height={32} accessible={false} />
              </Pressable>
              <Text style={styles.title}>Search</Text>
            </View>
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              style={[styles.input, styles.inputFont]}
              placeholder="Search building, room, or facility..."
              placeholderTextColor="#6C757D"
              accessibilityLabel="Search building, room, or facility"
              returnKeyType="search"
              autoCorrect={false}
              onPressIn={() => setSearchOpening(true)}
              onFocus={() => setSearchOpening(true)}
              onBlur={() => {
                if (!Keyboard.isVisible()) setSearchOpening(false);
              }}
            />
          </View>
          <View style={styles.headingContainer}>
            <Text style={[styles.heading, styles.headingFont]}>
              {searchTerm ? "Search Results" : "Recent Searches"}
            </Text>
          </View>
          <FlatList
            style={styles.list}
            contentContainerStyle={styles.content}
            data={listData}
            keyExtractor={(item) => `${item.featureType}-${item.featureId}`}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <OfficialLocationCard item={toLocationCardItem(item)} onPress={() => openFeature(item)} />
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <Text style={styles.empty}>No locations found. Try another search.</Text>
            }
          />
          <OfficialBottomNavigation activeItem="Search" onSelect={navigate} hidden={searchOpening} />
        </SafeAreaView>
      </View>
    </ProtectedAccess>
  );
}
