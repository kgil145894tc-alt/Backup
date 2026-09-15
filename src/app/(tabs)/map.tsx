import { useLocalSearchParams } from "expo-router";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import OSMMap from "../../../components/OSMMap";
import { campusFeatureSummaries } from "../../data/campusData";
import type {
  CurrentMapLocation,
  SelectedMapFeature,
} from "../../types/campus";
import { saveGuestHistoryItem } from "../../utils/guestHistory";

const mapFeatures = campusFeatureSummaries;

function getFeatureFromParams(
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

export default function MapScreen() {
  const { featureId, featureType } = useLocalSearchParams<{
    featureId?: string;
    featureType?: string;
  }>();

  const initialSelectedFeature = useMemo(
    () => getFeatureFromParams(featureId, featureType),
    [featureId, featureType],
  );
  const [selectedFeature, setSelectedFeature] = useState<
    SelectedMapFeature | undefined
  >(initialSelectedFeature);
  const [currentLocation, setCurrentLocation] = useState<
    CurrentMapLocation | undefined
  >();
  const [locationError, setLocationError] = useState<string | undefined>();

  useEffect(() => {
    setSelectedFeature(initialSelectedFeature);
  }, [initialSelectedFeature]);

  useEffect(() => {
    if (!initialSelectedFeature) {
      return;
    }

    void saveGuestHistoryItem({
      featureId: initialSelectedFeature.id,
      featureType: initialSelectedFeature.type,
      name: initialSelectedFeature.name,
      category: initialSelectedFeature.category,
      type: initialSelectedFeature.type,
    });
  }, [initialSelectedFeature]);

  const handleFeaturePress = useCallback((feature: SelectedMapFeature) => {
    setSelectedFeature(feature);

    void saveGuestHistoryItem({
      featureId: feature.id,
      featureType: feature.type,
      name: feature.name,
      category: feature.category,
      type: feature.type,
    });
  }, []);

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
        currentLocation={currentLocation}
        onFeaturePress={handleFeaturePress}
      />

      {locationError ? (
        <View style={styles.locationStatus}>
          <Text style={styles.locationStatusText}>{locationError}</Text>
        </View>
      ) : null}

      {selectedFeature ? (
        <View style={styles.infoPanel}>
          <Text style={styles.featureName}>{selectedFeature.name}</Text>

          <View style={styles.detailGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Category</Text>
              <Text style={styles.detailValue}>
                {selectedFeature.category}
              </Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Type</Text>
              <Text style={styles.detailValue}>
                {selectedFeature.type}
              </Text>
            </View>

            {selectedFeature.floors !== undefined ? (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Floors</Text>
                <Text style={styles.detailValue}>
                  {selectedFeature.floors}
                </Text>
              </View>
            ) : null}
          </View>

          {selectedFeature.description ? (
            <Text style={styles.description}>
              {selectedFeature.description}
            </Text>
          ) : null}
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

  infoPanel: {
    position: "absolute",
    right: 16,
    bottom: 20,
    left: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },

  featureName: {
    marginBottom: 12,
    color: "#1f2933",
    fontSize: 20,
    fontWeight: "700",
  },

  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  detailItem: {
    minWidth: 92,
    flexGrow: 1,
  },

  detailLabel: {
    marginBottom: 3,
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
  },

  detailValue: {
    color: "#111827",
    fontSize: 15,
    fontWeight: "600",
    textTransform: "capitalize",
  },

  description: {
    marginTop: 12,
    color: "#374151",
    fontSize: 14,
    lineHeight: 20,
  },
});
