import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import * as Location from "expo-location";
import { Image } from "expo-image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import CloseIcon from "../../../assets/design/icons/close.svg";
import ProceedArrow from "../../../assets/design/icons/proceed-arrow.svg";
import LimitedAccessModal from "@/components/LimitedAccessModal";
import { OfficialBottomNavigation } from "@/components/OfficialDesign";
import OSMMap from "@/components/OSMMap";
import { loadCampusData } from "../../services/campusDataStore";
import type {
  CurrentMapLocation,
  SelectedMapFeature,
} from "../../types/campus";
import {
  initialAdminLocations,
  isMaintenanceAdminLocation,
  type AdminLocation,
} from "../../utils/adminLocations";
import {
  getAppAccessMode,
  isGuestMode,
} from "../../utils/appSession";
import { saveCurrentHistoryItem } from "../../utils/guestHistory";
import { navigateToTab } from "@/utils/navigation";

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

function getFeatureFromParams(
  mapFeatures: AdminLocation[],
  featureId?: string,
  featureType?: string,
) {
  if (!featureId || !featureType) {
    return undefined;
  }

  return mapFeatures.find(
    (feature) =>
      feature.id === featureId && feature.type === featureType,
  );
}

function toAdminLocation(feature: SelectedMapFeature): AdminLocation {
  return {
    ...feature,
    status: "Active",
  };
}

function getLocationImage(location: AdminLocation) {
  const name = location.name.toLowerCase();
  const category = location.category.toLowerCase();

  if (name.includes("cafeteria")) {
    return locationImages.cafeteria;
  }

  if (name.includes("clinic")) {
    return locationImages.clinic;
  }

  if (name.includes("library")) {
    return locationImages.library;
  }

  if (name.includes("new") || name.includes("building 2")) {
    return locationImages.newBuilding;
  }

  if (category.includes("academic")) {
    return locationImages.academic;
  }

  if (category.includes("office") || category.includes("admin")) {
    return locationImages.admin;
  }

  if (category.includes("facilit")) {
    return locationImages.facilities;
  }

  return locationImages.default;
}

export default function MapScreen() {
  const { featureId, featureType, category, locateOnly } = useLocalSearchParams<{
    featureId?: string;
    featureType?: string;
    category?: string;
    locateOnly?: string;
  }>();
  const selectedCategory =
    typeof category === "string" ? category : undefined;
  const shouldOpenInitialSheet = locateOnly !== "1";
  const [mapFeatures, setMapFeatures] =
    useState<AdminLocation[]>(initialAdminLocations);
  const [hiddenFeatureKeys, setHiddenFeatureKeys] = useState<string[]>([]);
  const [isGuest, setIsGuest] = useState(false);
  const [isLimitedAccessOpen, setIsLimitedAccessOpen] = useState(false);

  const initialSelectedFeature = useMemo(
    () =>
      shouldOpenInitialSheet
        ? getFeatureFromParams(mapFeatures, featureId, featureType)
        : undefined,
    [featureId, featureType, mapFeatures, shouldOpenInitialSheet],
  );
  const [selectedFeature, setSelectedFeature] = useState<
    AdminLocation | undefined
  >(initialSelectedFeature);
  const [currentLocation, setCurrentLocation] = useState<
    CurrentMapLocation | undefined
  >();
  const [locationError, setLocationError] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void Promise.all([
        loadCampusData(),
        getAppAccessMode(),
      ]).then(([snapshot, mode]) => {
        if (isActive) {
          setMapFeatures(snapshot.visibleLocations);
          setHiddenFeatureKeys(snapshot.hiddenLocationKeys);
          setIsGuest(isGuestMode(mode));
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  useEffect(() => {
    if (!shouldOpenInitialSheet) {
      setSelectedFeature(undefined);
      return;
    }

    setSelectedFeature(initialSelectedFeature);
  }, [initialSelectedFeature, shouldOpenInitialSheet]);

  useEffect(() => {
    if (!initialSelectedFeature) {
      return;
    }

    void saveCurrentHistoryItem({
      featureId: initialSelectedFeature.id,
      featureType: initialSelectedFeature.type,
      name: initialSelectedFeature.name,
      category: initialSelectedFeature.category,
      type: initialSelectedFeature.type,
    });
  }, [initialSelectedFeature]);

  const handleFeaturePress = useCallback(
    (feature: SelectedMapFeature) => {
      const enrichedFeature =
        mapFeatures.find(
          (mapFeature) =>
            mapFeature.id === feature.id &&
            mapFeature.type === feature.type,
        ) ?? toAdminLocation(feature);

      setSelectedFeature(enrichedFeature);

      void saveCurrentHistoryItem({
        featureId: enrichedFeature.id,
        featureType: enrichedFeature.type,
        name: enrichedFeature.name,
        category: enrichedFeature.category,
        type: enrichedFeature.type,
      });
    },
    [mapFeatures],
  );

  const closeFeatureSheet = useCallback(() => {
    setSelectedFeature(undefined);
  }, []);

  const openSelectedFeatureDetails = useCallback(() => {
    if (!selectedFeature) {
      return;
    }

    if (selectedFeature.type === "building") {
      router.push({
        pathname: "/building-floors",
        params: { buildingId: selectedFeature.id },
      });
      return;
    }

    router.push({
      pathname: "/(tabs)/location-details",
      params: {
        featureId: selectedFeature.id,
        featureType: selectedFeature.type,
      },
    });
  }, [selectedFeature]);

  const navigate = (name: string) => {
    navigateToTab(name, {
      currentTab: "Map",
      isGuest,
      onOpenLimitedAccess: () => setIsLimitedAccessOpen(true),
      onSameTab: () => setSelectedFeature(undefined),
    });
  };

  useEffect(() => {
    let isMounted = true;
    let locationSubscription: Location.LocationSubscription | undefined;

    async function startLocationUpdates() {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        if (!isMounted) {
          return;
        }

        if (status !== Location.PermissionStatus.GRANTED) {
          setLocationError("Location permission denied");
          return;
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (!isMounted) {
          return;
        }

        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });

        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            distanceInterval: 3,
            timeInterval: 5000,
          },
          (updatedPosition) => {
            setCurrentLocation({
              latitude: updatedPosition.coords.latitude,
              longitude: updatedPosition.coords.longitude,
              accuracy: updatedPosition.coords.accuracy,
            });
          },
        );

        if (!isMounted) {
          locationSubscription.remove();
        }
      } catch {
        if (isMounted) {
          setLocationError("Current location unavailable");
        }
      }
    }

    startLocationUpdates();

    return () => {
      isMounted = false;
      locationSubscription?.remove();
    };
  }, []);

  return (
    <View style={styles.container}>
      <OSMMap
        selectedFeatureId={featureId}
        selectedFeatureType={featureType}
        selectedCategory={selectedCategory}
        hiddenFeatureKeys={hiddenFeatureKeys}
        featureOverrides={mapFeatures}
        openSelectedPopup={shouldOpenInitialSheet}
        currentLocation={currentLocation}
        onFeaturePress={handleFeaturePress}
      />

      {locationError ? (
        <View style={styles.locationStatus}>
          <Text style={styles.locationStatusText}>{locationError}</Text>
        </View>
      ) : null}

      {selectedFeature ? (
        <View style={styles.sheetOverlay}>
          <Pressable
            accessibilityLabel="Close location details"
            style={styles.sheetBackdrop}
            onPress={closeFeatureSheet}
          />

          <View style={styles.detailSheet}>
            <Pressable
              accessibilityLabel="Close location details"
              style={styles.closeButton}
              onPress={closeFeatureSheet}
            >
              <CloseIcon width={28} height={28} accessible={false} />
            </Pressable>

            <Image
              source={getLocationImage(selectedFeature)}
              style={styles.featureImage}
              contentFit="cover"
            />

            <Text style={styles.featureName}>{selectedFeature.name}</Text>
            {isMaintenanceAdminLocation(selectedFeature) ? (
              <View style={styles.maintenancePill}>
                <Text style={styles.maintenancePillText}>
                  Under maintenance
                </Text>
              </View>
            ) : null}

            <View style={styles.categoryPill}>
              <Text style={styles.categoryPillText}>
                {selectedFeature.category}
              </Text>
            </View>

            <View style={styles.detailList}>
              {selectedFeature.floor ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Floor</Text>
                  <Text style={styles.detailValue}>
                    {selectedFeature.floor}
                  </Text>
                </View>
              ) : selectedFeature.floors !== undefined ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Floors</Text>
                  <Text style={styles.detailValue}>
                    {selectedFeature.floors}
                  </Text>
                </View>
              ) : null}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {selectedFeature.type}
                </Text>
              </View>

              {selectedFeature.nearby ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Nearby</Text>
                  <Text style={styles.detailValue}>
                    {selectedFeature.nearby}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={styles.description}>
              {selectedFeature.description ??
                "More information for this location will be added soon."}
            </Text>

            {selectedFeature.directions ? (
              <Text style={styles.directions}>
                {selectedFeature.directions}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`View details for ${selectedFeature.name}`}
              style={styles.detailsButton}
              onPress={openSelectedFeatureDetails}
            >
              <Text style={styles.detailsButtonText}>
                {selectedFeature.type === "building"
                  ? "View Floors and Rooms"
                  : "View Details"}
              </Text>
              <ProceedArrow width={16} height={19} accessible={false} />
            </Pressable>
          </View>
        </View>
      ) : null}

      <OfficialBottomNavigation activeItem="Map" onSelect={navigate} />

      <LimitedAccessModal
        visible={isLimitedAccessOpen}
        onClose={() => setIsLimitedAccessOpen(false)}
        onLogin={() => {
          setIsLimitedAccessOpen(false);
          router.push("/login");
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  locationStatus: {
    position: "absolute",
    top: 12,
    left: 52,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "rgba(17, 24, 39, 0.82)",
  },

  locationStatusText: {
    color: "white",
    fontSize: 13,
    fontWeight: "600",
  },

  sheetOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  sheetBackdrop: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "rgba(0, 0, 0, 0.42)",
    zIndex: 0,
  },

  detailSheet: {
    width: "100%",
    maxWidth: 360,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 8,
    zIndex: 1,
  },

  closeButton: {
    position: "absolute",
    top: -16,
    right: -2,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    borderColor: "#E8DDDE",
    borderWidth: 1,
  },

  featureImage: {
    height: 128,
    marginBottom: 14,
    borderRadius: 10,
    width: "100%",
  },

  featureName: {
    marginBottom: 8,
    color: "#3C4147",
    fontFamily: "AfacadFluxBold",
    fontSize: 20,
  },

  categoryPill: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#FFF7E2",
    borderColor: "#F0E2C0",
    borderWidth: 1,
  },

  maintenancePill: {
    alignSelf: "flex-start",
    backgroundColor: "#FAE7E9",
    borderColor: "#E8DDDE",
    borderRadius: 999,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  maintenancePillText: {
    color: "#AF2532",
    fontFamily: "AfacadFluxBold",
    fontSize: 12,
  },

  categoryPillText: {
    color: "#AF2532",
    fontFamily: "AfacadFluxBold",
    fontSize: 12,
  },

  detailList: {
    gap: 8,
    marginBottom: 12,
  },

  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  detailLabel: {
    color: "#6C757D",
    fontFamily: "AfacadFluxBold",
    fontSize: 12,
    textTransform: "uppercase",
  },

  detailValue: {
    flex: 1,
    color: "#3C4147",
    fontFamily: "AfacadFluxSemiBold",
    fontSize: 14,
    textAlign: "right",
  },

  description: {
    color: "#4D535B",
    fontFamily: "AfacadFluxRegular",
    fontSize: 14,
    lineHeight: 20,
  },

  directions: {
    marginTop: 10,
    color: "#6C757D",
    fontFamily: "AfacadFluxRegular",
    fontSize: 13,
    lineHeight: 19,
  },

  detailsButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#AF2532",
    borderRadius: 20,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  detailsButtonText: {
    color: "white",
    fontFamily: "AfacadFluxBold",
    fontSize: 14,
  },
});
