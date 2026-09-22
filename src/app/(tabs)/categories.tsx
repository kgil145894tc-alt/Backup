import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  OfficialBottomNavigation,
  OfficialCategoryCard,
  type OfficialCategoryItem,
} from "@/components/OfficialDesign";
import Academic from "../../../assets/design/icons/academic.svg";
import Admin from "../../../assets/design/icons/admin-office.svg";
import Background from "../../../assets/design/backgrounds/fifthBg.svg";
import BackArrow from "../../../assets/design/icons/back-arrow.svg";
import Facilities from "../../../assets/design/icons/facilities-cog.svg";
import OtherBuildings from "../../../assets/design/icons/other-building.svg";
import ProtectedAccess from "@/components/ProtectedAccess";
import { loadCampusData } from "../../services/campusDataStore";
import type { CampusFeatureCategory } from "../../types/campus";
import { initialAdminLocations, type AdminLocation } from "../../utils/adminLocations";
import { navigateToTab } from "@/utils/navigation";
import { styles } from "../../styles/official/categoriesScreen.styles";

type CategoryCardConfig = OfficialCategoryItem & {
  mapCategory?: CampusFeatureCategory;
};

const categoryImages = {
  academic: require("../../../assets/design/locations/category-academic.png"),
  admin: require("../../../assets/design/locations/category-admin.png"),
  facilities: require("../../../assets/design/locations/category-facilities.png"),
  other: require("../../../assets/design/locations/category-other.png"),
};

const categoryCards: CategoryCardConfig[] = [
  {
    id: "academic",
    name: "Academic",
    color: "#AF2532",
    image: categoryImages.academic,
    count: 0,
    mapCategory: "Room",
  },
  {
    id: "admin",
    name: "Admin",
    color: "#FEBF1F",
    image: categoryImages.admin,
    count: 0,
    mapCategory: "Office",
  },
  {
    id: "facilities",
    name: "Facilities",
    color: "#1EAB58",
    image: categoryImages.facilities,
    count: 0,
    mapCategory: "Facility",
  },
  {
    id: "other",
    name: "Other Buildings",
    color: "#FA5D0E",
    image: categoryImages.other,
    count: 0,
  },
];

const icons = {
  academic: Academic,
  admin: Admin,
  facilities: Facilities,
  other: OtherBuildings,
};

export default function Categories() {
  const listRef = useRef<FlatList<CategoryCardConfig>>(null);
  const [mapFeatures, setMapFeatures] = useState<AdminLocation[]>(initialAdminLocations);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void loadCampusData().then((snapshot) => {
        if (isActive) setMapFeatures(snapshot.visibleLocations);
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    mapFeatures.forEach((feature) => {
      counts.set(feature.category, (counts.get(feature.category) ?? 0) + 1);
    });
    return counts;
  }, [mapFeatures]);

  const categories = categoryCards.map((card) => {
    if (!card.mapCategory) {
      const known = new Set(categoryCards.map((item) => item.mapCategory).filter(Boolean));
      return {
        ...card,
        count: mapFeatures.filter((feature) => !known.has(feature.category)).length,
      };
    }

    return { ...card, count: categoryCounts.get(card.mapCategory) ?? 0 };
  });

  const openCategoryOnMap = (card: CategoryCardConfig) => {
    if (!card.mapCategory) {
      router.navigate("/(tabs)/map");
      return;
    }

    router.navigate({
      pathname: "/(tabs)/map",
      params: { category: card.mapCategory },
    });
  };

  const navigate = (name: string) => {
    navigateToTab(name, {
      currentTab: "Categories",
      onSameTab: () => listRef.current?.scrollToOffset({ offset: 0, animated: true }),
    });
  };

  return (
    <ProtectedAccess>
      <View style={styles.screen}>
        <StatusBar style="light" />
        <View style={styles.background} pointerEvents="none">
          <Background width="100%" height="100%" preserveAspectRatio="none" />
        </View>
        <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
              style={styles.backButton}
            >
              <BackArrow width={32} height={32} accessible={false} />
            </Pressable>
            <Text style={styles.title}>Categories</Text>
          </View>
          <FlatList
            ref={listRef}
            style={styles.list}
            contentContainerStyle={styles.content}
            columnWrapperStyle={styles.row}
            data={categories}
            numColumns={2}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <OfficialCategoryCard
                item={item}
                Icon={icons[item.id as keyof typeof icons]}
                onPress={() => openCategoryOnMap(item)}
              />
            )}
          />
          <OfficialBottomNavigation activeItem="Categories" onSelect={navigate} />
        </SafeAreaView>
      </View>
    </ProtectedAccess>
  );
}
