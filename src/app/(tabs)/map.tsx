import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import OSMMap from "../../../components/OSMMap";
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
import { saveCurrentHistoryItem } from "../../utils/guestHistory";

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

      void loadCampusData().then((snapshot) => {
        if (isActive) {
          setMapFeatures(snapshot.visibleLocations);
          setHiddenFeatureKeys(snapshot.hiddenLocationKeys);
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
              <Text style={styles.closeButtonText}>x</Text>
            </Pressable>

            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>Image</Text>
            </View>

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
              <Text style={styles.detailsButtonArrow}>→</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
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
    borderRadius: 8,
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
    top: -18,
    right: -4,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },

  closeButtonText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 20,
  },

  imagePlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    height: 128,
    marginBottom: 14,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },

  imagePlaceholderText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "700",
  },

  featureName: {
    marginBottom: 8,
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
  },

  categoryPill: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    borderWidth: 1,
  },

  maintenancePill: {
    alignSelf: "flex-start",
    backgroundColor: "#f3f4f6",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  maintenancePillText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "900",
  },

  categoryPillText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "800",
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
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  detailValue: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "right",
  },

  description: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
  },

  directions: {
    marginTop: 10,
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 19,
  },

  detailsButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#111827",
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  detailsButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "800",
  },

  detailsButtonArrow: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },
});
