import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  FlatList,
  Pressable,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  OfficialBottomNavigation,
  OfficialCategoryCard,
  type OfficialCategoryItem,
} from "@/components/OfficialDesign";
import ProtectedAccess from "@/components/ProtectedAccess";
import { navigateToTab } from "@/utils/navigation";
import Background from "../../../assets/design/backgrounds/fifthBg.svg";
import BackArrow from "../../../assets/design/icons/back-arrow.svg";
import {
  categoryPresentation,
  fallbackCategoryPresentation,
  sortCategoriesByPreferredOrder,
  toCategoryId,
} from "../../constants/campusPresentation";
import { loadCampusData } from "../../services/campusDataStore";
import { styles } from "../../styles/official/categoriesScreen.styles";
import {
  initialAdminLocations,
  type AdminLocation,
} from "../../utils/adminLocations";

type CategoryCardConfig = OfficialCategoryItem & {
  mapCategory: string;
};

export default function Categories() {
  const listRef = useRef<FlatList<CategoryCardConfig>>(null);
  const { width } = useWindowDimensions();
  const isCompact = width < 380;
  const numColumns = isCompact ? 1 : 2;
  const [mapFeatures, setMapFeatures] = useState<AdminLocation[]>(
    initialAdminLocations,
  );

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

    const sortedCategories = sortCategoriesByPreferredOrder([...counts.keys()]);

    return sortedCategories.map((category) => {
      const presentation =
        categoryPresentation[category] ?? fallbackCategoryPresentation;

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
      onSameTab: () =>
        listRef.current?.scrollToOffset({ offset: 0, animated: true }),
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
              onPress={() =>
                router.canGoBack() ? router.back() : router.replace("/(tabs)")
              }
              style={styles.backButton}
            >
              <BackArrow width={32} height={32} />
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
                  categoryPresentation[item.mapCategory]?.Icon ??
                  fallbackCategoryPresentation.Icon
                }
                onPress={() => openCategoryOnMap(item)}
              />
            )}
          />
          <OfficialBottomNavigation
            activeItem="Categories"
            onSelect={navigate}
          />
        </SafeAreaView>
      </View>
    </ProtectedAccess>
  );
}
