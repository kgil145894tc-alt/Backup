import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  OfficialBottomNavigation,
  OfficialCategoryCard,
  type OfficialCategoryItem,
} from "@/components/OfficialDesign";
import Academic from "../../../assets/design/icons/academic.svg";
import Background from "../../../assets/design/backgrounds/fifthBg.svg";
import BackArrow from "../../../assets/design/icons/back-arrow.svg";
import Facilities from "../../../assets/design/icons/facilities-cog.svg";
import Food from "../../../assets/design/icons/food.svg";
import Offices from "../../../assets/design/icons/offices.svg";
import OtherBuildings from "../../../assets/design/icons/other-building.svg";
import Services from "../../../assets/design/icons/services.svg";
import ProtectedAccess from "@/components/ProtectedAccess";
import { loadCampusData } from "../../services/campusDataStore";
import { initialAdminLocations, type AdminLocation } from "../../utils/adminLocations";
import { navigateToTab } from "@/utils/navigation";
import { styles } from "../../styles/official/categoriesScreen.styles";

type CategoryCardConfig = OfficialCategoryItem & {
  mapCategory: string;
};

const categoryImages = {
  academic: require("../../../assets/design/locations/category-academic.png"),
  admin: require("../../../assets/design/locations/category-admin.png"),
  cafeteria: require("../../../assets/design/locations/cafeteria.png"),
  facilities: require("../../../assets/design/locations/category-facilities.png"),
  faculty: require("../../../assets/design/locations/teachers-faculty.png"),
  laboratory: require("../../../assets/design/locations/new-building.png"),
  other: require("../../../assets/design/locations/category-other.png"),
};

const categoryPresentation = {
  Building: {
    color: "#AF2532",
    image: categoryImages.academic,
    Icon: OtherBuildings,
  },
  Facility: {
    color: "#1EAB58",
    image: categoryImages.facilities,
    Icon: Facilities,
  },
  Faculty: {
    color: "#7B4FC9",
    image: categoryImages.faculty,
    Icon: Academic,
  },
  Food: {
    color: "#FA5D0E",
    image: categoryImages.cafeteria,
    Icon: Food,
  },
  Laboratory: {
    color: "#208AEF",
    image: categoryImages.laboratory,
    Icon: Academic,
  },
  Office: {
    color: "#FEBF1F",
    image: categoryImages.admin,
    Icon: Offices,
  },
  Room: {
    color: "#AF2532",
    image: categoryImages.academic,
    Icon: Academic,
  },
  Security: {
    color: "#2F4858",
    image: categoryImages.other,
    Icon: Services,
  },
};

const fallbackCategoryPresentation = {
  color: "#6C757D",
  image: categoryImages.other,
  Icon: OtherBuildings,
};

const preferredCategoryOrder = [
  "Building",
  "Room",
  "Laboratory",
  "Faculty",
  "Office",
  "Facility",
  "Food",
  "Security",
];

function toCategoryId(category: string) {
  return category.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export default function Categories() {
  const listRef = useRef<FlatList<CategoryCardConfig>>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const numColumns = isCompact ? 1 : 2;
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

  const categories = useMemo<CategoryCardConfig[]>(() => {
    const counts = new Map<string, number>();

    mapFeatures.forEach((feature) => {
      counts.set(feature.category, (counts.get(feature.category) ?? 0) + 1);
    });

    const sortedCategories = [...counts.keys()].sort((first, second) => {
      const firstIndex = preferredCategoryOrder.indexOf(first);
      const secondIndex = preferredCategoryOrder.indexOf(second);

      if (firstIndex !== -1 || secondIndex !== -1) {
        return (
          (firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex) -
          (secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex)
        );
      }

      return first.localeCompare(second);
    });

    return sortedCategories.map((category) => {
      const presentation =
        categoryPresentation[
          category as keyof typeof categoryPresentation
        ] ?? fallbackCategoryPresentation;

      return {
        id: toCategoryId(category),
        name: category,
        color: presentation.color,
        image: presentation.image,
        count: counts.get(category) ?? 0,
        mapCategory: category,
      };
    });
  }, [mapFeatures]);

  const openCategoryOnMap = (card: CategoryCardConfig) => {
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
            key={numColumns}
            ref={listRef}
            style={styles.list}
            contentContainerStyle={[
              styles.content,
              isCompact && styles.compactContent,
            ]}
            columnWrapperStyle={isCompact ? undefined : styles.row}
            data={categories}
            numColumns={numColumns}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <OfficialCategoryCard
                item={item}
                Icon={
                  categoryPresentation[
                    item.mapCategory as keyof typeof categoryPresentation
                  ]?.Icon ?? fallbackCategoryPresentation.Icon
                }
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
