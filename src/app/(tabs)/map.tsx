import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import BuildingArtwork from "../../../assets/design/backgrounds/building.svg";
import RoomDetailsBackground from "../../../assets/design/backgrounds/elevenBg.svg";
import RoomArtwork from "../../../assets/design/backgrounds/room.svg";
import CloseIcon from "../../../assets/design/icons/close.svg";
import FilterIcon from "../../../assets/design/icons/map-filter.svg";
import LimitedAccessModal from "@/components/LimitedAccessModal";
import { OfficialBottomNavigation } from "@/components/OfficialDesign";
import OSMMap from "@/components/OSMMap";
import RoomDetailsModal from "@/components/RoomDetailsModal";
import campusBoundary from "@/data/campusBoundary";
import {
  getBuildingRooms,
  type BuildingRoom,
} from "@/data/campusData";
import { rf, rs } from "@/utils/responsive";
import { loadCampusData } from "../../services/campusDataStore";
import type {
  CurrentMapLocation,
  SelectedMapFeature,
} from "../../types/campus";
import {
  initialAdminLocations,
  type AdminLocation,
} from "../../utils/adminLocations";
import {
  getAppAccessMode,
  isGuestMode,
} from "../../utils/appSession";
import { applyAdminRoomEdits } from "../../utils/adminRooms";
import { saveCurrentHistoryItem } from "../../utils/guestHistory";
import { navigateToTab } from "@/utils/navigation";

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

function isLocationInsideCampus(location: CurrentMapLocation) {
  let isInside = false;
  const latitude = location.latitude;
  const longitude = location.longitude;

  for (
    let index = 0, previousIndex = campusBoundary.length - 1;
    index < campusBoundary.length;
    previousIndex = index++
  ) {
    const currentPoint = campusBoundary[index];
    const previousPoint = campusBoundary[previousIndex];
    const intersectsLatitude =
      currentPoint.latitude > latitude !== previousPoint.latitude > latitude;

    if (!intersectsLatitude) {
      continue;
    }

    const intersectionLongitude =
      ((previousPoint.longitude - currentPoint.longitude) *
        (latitude - currentPoint.latitude)) /
        (previousPoint.latitude - currentPoint.latitude) +
      currentPoint.longitude;

    if (longitude < intersectionLongitude) {
      isInside = !isInside;
    }
  }

  return isInside;
}

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const { featureId, featureType, category, locateOnly } = useLocalSearchParams<{
    featureId?: string;
    featureType?: string;
    category?: string;
    locateOnly?: string;
  }>();
  const selectedCategory =
    typeof category === "string" ? category : undefined;
  const shouldOpenInitialSheet = locateOnly !== "1";
  const headerHeight = rs(65, 58, 68);
  const noticeTop = insets.top + headerHeight + rs(10, 8, 12);
  const [mapFeatures, setMapFeatures] =
    useState<AdminLocation[]>(initialAdminLocations);
  const [roomEdits, setRoomEdits] = useState<Record<string, BuildingRoom>>({});
  const [selectedBuildingRoom, setSelectedBuildingRoom] =
    useState<BuildingRoom | null>(null);
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
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [campusNoticeRequest, setCampusNoticeRequest] = useState(0);
  const [currentLocationFocusRequest, setCurrentLocationFocusRequest] =
    useState(0);
  const mapNoticeOpacity = useRef(new Animated.Value(0)).current;
  const buildingSheetProgress = useRef(new Animated.Value(1)).current;
  const currentLocationAccuracy =
    Platform.OS === "android"
      ? Location.Accuracy.Balanced
      : Location.Accuracy.BestForNavigation;

  const campusLocationNotice = useMemo(() => {
    if (!currentLocation) {
      return undefined;
    }

    if (
      currentLocation.accuracy !== undefined &&
      currentLocation.accuracy !== null &&
      currentLocation.accuracy > 100
    ) {
      return undefined;
    }

    if (isLocationInsideCampus(currentLocation)) {
      return undefined;
    }

    return "Outside school campus. Location guidance may be limited until you are within UMVC.";
  }, [currentLocation]);
  const activeCampusNotice =
    campusNoticeRequest > 0 ? campusLocationNotice : undefined;
  const mapNotice = locationError ?? activeCampusNotice;
  const shouldAnimateCampusNotice = Boolean(activeCampusNotice && !locationError);

  useEffect(() => {
    if (locationError) {
      mapNoticeOpacity.stopAnimation();
      mapNoticeOpacity.setValue(1);
      return;
    }

    if (!shouldAnimateCampusNotice) {
      mapNoticeOpacity.stopAnimation();
      mapNoticeOpacity.setValue(0);
      return;
    }

    mapNoticeOpacity.stopAnimation();
    mapNoticeOpacity.setValue(0);

    const animation = Animated.sequence([
      Animated.timing(mapNoticeOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.delay(2400),
      Animated.timing(mapNoticeOpacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished) {
        setCampusNoticeRequest(0);
      }
    });

    return () => {
      animation.stop();
    };
  }, [
    campusNoticeRequest,
    locationError,
    mapNoticeOpacity,
    shouldAnimateCampusNotice,
  ]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void Promise.all([
        loadCampusData(),
        getAppAccessMode(),
      ]).then(([snapshot, mode]) => {
        if (isActive) {
          setMapFeatures(snapshot.visibleLocations);
          setRoomEdits(snapshot.roomEdits);
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
    setSelectedBuildingRoom(null);
  }, []);

  const selectedFeatureUsesRoomModal =
    selectedFeature?.type?.toLowerCase() !== "building";

  const selectedBuildingFloors = useMemo(() => {
    if (!selectedFeature || selectedFeature.type !== "building") {
      return [];
    }

    const floorCount = Number(selectedFeature.floors ?? 1);

    return Array.from({ length: floorCount }, (_, index) => {
      const floor = floorCount - index;

      return {
        floor,
        rooms: applyAdminRoomEdits(
          getBuildingRooms(selectedFeature.id, floor),
          roomEdits,
        ),
      };
    });
  }, [roomEdits, selectedFeature]);

  useEffect(() => {
    if (selectedFeature?.type !== "building") {
      return;
    }

    buildingSheetProgress.setValue(1);
    Animated.timing(buildingSheetProgress, {
      toValue: 0,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [buildingSheetProgress, selectedFeature]);

  const navigate = (name: string) => {
    navigateToTab(name, {
      currentTab: "Map",
      isGuest,
      onOpenLimitedAccess: () => setIsLimitedAccessOpen(true),
      onSameTab: () => setSelectedFeature(undefined),
    });
  };

  const handleCurrentLocationPress = useCallback(() => {
    if (!currentLocation) {
      setLocationError("Current location unavailable");
      return;
    }

    if (campusLocationNotice) {
      setCampusNoticeRequest(Date.now());
      return;
    }

    setCurrentLocationFocusRequest((request) => request + 1);
  }, [campusLocationNotice, currentLocation]);

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

        if (Platform.OS === "android") {
          try {
            await Location.enableNetworkProviderAsync();
          } catch {
            // The device may already have high accuracy enabled, or the user may
            // dismiss the prompt. GPS updates can still continue without it.
          }
        }

        const position = await Location.getCurrentPositionAsync({
          accuracy: currentLocationAccuracy,
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
            accuracy: currentLocationAccuracy,
            distanceInterval: Platform.OS === "android" ? 5 : 1,
            timeInterval: Platform.OS === "android" ? 3000 : 1000,
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
  }, [currentLocationAccuracy]);

  return (
    <View style={styles.container}>
      <SafeAreaView edges={["top"]} style={styles.headerSafe}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Campus Map</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open categories"
            onPress={() => navigate("Categories")}
            style={styles.filterButton}
          >
            <FilterIcon width={26} height={29} accessible={false} />
          </Pressable>
        </View>
      </SafeAreaView>

      <View style={styles.mapArea}>
        <OSMMap
          selectedFeatureId={featureId}
          selectedFeatureType={featureType}
          selectedCategory={selectedCategory}
          hiddenFeatureKeys={hiddenFeatureKeys}
          featureOverrides={mapFeatures}
          openSelectedPopup={shouldOpenInitialSheet}
          currentLocation={currentLocation}
          currentLocationFocusRequest={currentLocationFocusRequest}
          onFeaturePress={handleFeaturePress}
          onMapReady={() => setIsMapLoading(false)}
        />
      </View>

      {isMapLoading ? (
        <View pointerEvents="none" style={styles.mapLoadingOverlay}>
          <View style={styles.mapLoadingCard}>
            <ActivityIndicator color="#AF2532" size="large" />
            <Text style={styles.mapLoadingText}>Loading campus map...</Text>
          </View>
        </View>
      ) : null}

      {mapNotice ? (
        <Animated.View
          style={[
            styles.locationStatus,
            campusLocationNotice && !locationError
              ? styles.campusWarningStatus
              : null,
            { top: noticeTop },
            { opacity: mapNoticeOpacity },
          ]}
        >
          <Text style={styles.locationStatusText}>{mapNotice}</Text>
        </Animated.View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Show my current location"
        style={styles.currentLocationButton}
        onPress={handleCurrentLocationPress}
      >
        <View style={styles.currentLocationIconOuter}>
          <View style={styles.currentLocationIconInner} />
        </View>
      </Pressable>

      {selectedFeature ? (
        <View
          style={[
            styles.sheetOverlay,
            !selectedFeatureUsesRoomModal && styles.buildingSheetOverlay,
          ]}
        >
          <Pressable
            accessibilityLabel="Close location details"
            style={styles.sheetBackdrop}
            onPress={closeFeatureSheet}
          />

          {selectedFeatureUsesRoomModal ? (
            <View style={styles.roomModalWrap}>
              <View style={styles.roomModalCard}>
                <View style={styles.roomModalBackground} pointerEvents="none">
                  <RoomDetailsBackground
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                  />
                </View>
                <Pressable
                  accessibilityLabel="Close room details"
                  style={styles.roomModalClose}
                  onPress={closeFeatureSheet}
                >
                  <CloseIcon width={36} height={36} accessible={false} />
                </Pressable>
                <ScrollView
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  style={styles.roomModalContent}
                  contentContainerStyle={styles.roomModalScroll}
                >
                  <Text style={styles.roomModalName}>{selectedFeature.name}</Text>
                  <View style={styles.roomModalBadge}>
                    <Text
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.roomModalBadgeText}
                    >
                      {selectedFeature.category}
                    </Text>
                  </View>
                  <View style={styles.roomModalFacts}>
                    <View style={styles.roomModalFact}>
                      <Text style={styles.roomModalFactLabel}>Floor</Text>
                      <Text style={styles.roomModalFactValue}>
                        {selectedFeature.floor ?? "Not specified"}
                      </Text>
                    </View>
                    <View style={styles.roomModalFact}>
                      <Text style={styles.roomModalFactLabel}>Type</Text>
                      <Text style={styles.roomModalFactValue}>
                        {selectedFeature.type}
                      </Text>
                    </View>
                  </View>
                  {selectedFeature.nearby ? (
                    <View style={styles.roomModalInfoBlock}>
                      <Text style={styles.roomModalInfoLabel}>Nearby</Text>
                      <Text style={styles.roomModalNearby}>
                        {selectedFeature.nearby}
                      </Text>
                    </View>
                  ) : null}
                  <Text style={styles.roomModalInfoLabel}>Description</Text>
                  <Text style={styles.roomModalDescription}>
                    {selectedFeature.description ??
                      "No description available yet."}
                  </Text>
                  {selectedFeature.directions ? (
                    <View style={styles.roomModalInfoBlock}>
                      <Text style={styles.roomModalInfoLabel}>Directions</Text>
                      <Text style={styles.roomModalDescription}>
                        {selectedFeature.directions}
                      </Text>
                    </View>
                  ) : null}
                </ScrollView>
              </View>
            </View>
          ) : (
            <Animated.View
              style={[
                styles.buildingSheet,
                {
                  transform: [
                    {
                      translateY: buildingSheetProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 640],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Pressable
                accessibilityLabel="Close building details"
                style={styles.buildingSheetClose}
                onPress={closeFeatureSheet}
              >
                <CloseIcon width={30} height={30} accessible={false} />
              </Pressable>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.buildingSheetScroll}
                nestedScrollEnabled
              >
                <View style={styles.buildingPreview}>
                  <View style={styles.buildingArtwork} pointerEvents="none">
                    <BuildingArtwork
                      width="100%"
                      height="100%"
                      preserveAspectRatio="none"
                    />
                  </View>
                  <Text numberOfLines={1} style={styles.buildingPreviewName}>
                    {selectedFeature.name}
                  </Text>
                  <View style={styles.buildingPreviewFloors}>
                    {selectedBuildingFloors.map(({ floor, rooms }) => (
                      <View key={floor} style={styles.buildingPreviewFloor}>
                        <View style={styles.buildingPreviewFloorSign}>
                          <Text style={styles.buildingPreviewFloorText}>
                            FLOOR {floor}
                          </Text>
                        </View>
                        {rooms.length ? (
                          <ScrollView
                            horizontal
                            nestedScrollEnabled
                            showsHorizontalScrollIndicator={false}
                            style={styles.buildingPreviewRoomsScroller}
                            contentContainerStyle={styles.buildingPreviewRoomsRow}
                          >
                            {rooms.map((room) => (
                              <Pressable
                                key={`${room.type}-${room.id}`}
                                accessibilityRole="button"
                                accessibilityLabel={`Open ${room.name} details`}
                                onPress={() => setSelectedBuildingRoom(room)}
                                style={styles.buildingPreviewRoom}
                              >
                                <RoomArtwork width={82} height={160} />
                                <View style={styles.buildingPreviewRoomSign}>
                                  <Text
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    style={styles.buildingPreviewRoomName}
                                  >
                                    {room.name}
                                  </Text>
                                  <Text
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    style={styles.buildingPreviewRoomType}
                                  >
                                    {room.category}
                                  </Text>
                                </View>
                              </Pressable>
                            ))}
                          </ScrollView>
                        ) : (
                          <View style={styles.buildingPreviewEmptyFloor}>
                            <Text style={styles.buildingPreviewEmptyText}>
                              No rooms added yet.
                            </Text>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              </ScrollView>
            </Animated.View>
          )}

          {selectedBuildingRoom ? (
            <RoomDetailsModal
              room={selectedBuildingRoom}
              onClose={() => setSelectedBuildingRoom(null)}
            />
          ) : null}
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

  headerSafe: {
    backgroundColor: "#9E212D",
    zIndex: 7,
  },

  header: {
    alignItems: "center",
    height: rs(65, 58, 68),
    justifyContent: "center",
  },

  headerTitle: {
    color: "#FFFFFF",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(28, 24, 30),
  },

  filterButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 16,
    width: 44,
  },

  mapArea: {
    flex: 1,
  },

  mapLoadingOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "#F7F3EC",
    zIndex: 4,
    elevation: 4,
  },

  mapLoadingCard: {
    alignItems: "center",
    gap: rs(12, 10, 14),
    paddingHorizontal: rs(22, 18, 26),
    paddingVertical: rs(18, 16, 22),
    borderRadius: rs(8, 8, 10),
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDDE",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },

  mapLoadingText: {
    color: "#3C4147",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(14, 13, 15),
  },

  locationStatus: {
    position: "absolute",
    left: rs(14, 10, 18),
    right: rs(14, 10, 18),
    paddingHorizontal: rs(12, 10, 14),
    paddingVertical: rs(8, 7, 10),
    borderRadius: rs(8, 8, 10),
    backgroundColor: "rgba(17, 24, 39, 0.82)",
    zIndex: 8,
    elevation: 8,
  },

  campusWarningStatus: {
    left: rs(14, 10, 18),
    right: rs(14, 10, 18),
    backgroundColor: "rgba(175, 37, 50, 0.9)",
  },

  locationStatusText: {
    color: "white",
    fontSize: rf(13, 12, 14),
    fontWeight: "600",
    lineHeight: rf(18, 16, 19),
    textAlign: "center",
  },

  currentLocationButton: {
    position: "absolute",
    right: rs(16, 12, 18),
    bottom: rs(112, 104, 120),
    alignItems: "center",
    justifyContent: "center",
    width: rs(48, 44, 52),
    height: rs(48, 44, 52),
    borderRadius: rs(24, 22, 26),
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDDE",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    zIndex: 5,
  },

  currentLocationIconOuter: {
    alignItems: "center",
    justifyContent: "center",
    width: rs(24, 22, 26),
    height: rs(24, 22, 26),
    borderRadius: rs(12, 11, 13),
    borderColor: "#AF2532",
    borderWidth: 2,
  },

  currentLocationIconInner: {
    width: rs(8, 7, 9),
    height: rs(8, 7, 9),
    borderRadius: rs(4, 3.5, 4.5),
    backgroundColor: "#AF2532",
  },

  sheetOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    alignItems: "center",
    justifyContent: "center",
    padding: rs(20, 14, 22),
  },

  buildingSheetOverlay: {
    justifyContent: "flex-end",
    paddingHorizontal: rs(7, 5, 10),
    paddingTop: rs(42, 34, 48),
    paddingBottom: 0,
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

  buildingSheet: {
    alignSelf: "center",
    maxHeight: "82%",
    maxWidth: 426,
    width: "100%",
    zIndex: 1,
  },

  buildingSheetClose: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E8DDDE",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 44,
    zIndex: 3,
  },

  buildingSheetScroll: {
    paddingHorizontal: 7,
    paddingBottom: rs(18, 14, 22),
  },

  buildingPreview: {
    height: 721,
  },

  buildingArtwork: {
    ...StyleSheet.absoluteFill,
  },

  buildingPreviewName: {
    color: "#FFFFFF",
    fontFamily: "AfacadFluxBold",
    fontSize: 25,
    left: 30,
    position: "absolute",
    right: 30,
    textAlign: "center",
    top: 22,
  },

  buildingPreviewFloors: {
    left: 37,
    position: "absolute",
    right: 34,
    top: 112,
  },

  buildingPreviewFloor: {
    alignItems: "center",
    height: 206,
  },

  buildingPreviewFloorSign: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#6C757D",
    borderWidth: 0.5,
    height: 32,
    justifyContent: "center",
    minWidth: 73,
    paddingHorizontal: 7,
  },

  buildingPreviewFloorText: {
    color: "#000000",
    fontFamily: "AfacadFluxMedium",
    fontSize: 15,
  },

  buildingPreviewRoomsScroller: {
    flexGrow: 0,
    height: 160,
    marginTop: 5,
    width: "100%",
  },

  buildingPreviewRoomsRow: {
    gap: 6,
    paddingHorizontal: 4,
  },

  buildingPreviewRoom: {
    height: 160,
    width: 82,
  },

  buildingPreviewRoomSign: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#A9A199",
    borderRadius: 2,
    borderWidth: 0.5,
    height: 28,
    justifyContent: "center",
    left: 10,
    paddingHorizontal: 2,
    position: "absolute",
    top: 20,
    width: 62,
  },

  buildingPreviewRoomName: {
    color: "#000000",
    fontFamily: "AfacadFluxBold",
    fontSize: 9,
    lineHeight: 11,
    textAlign: "center",
  },

  buildingPreviewRoomType: {
    color: "#6C757D",
    fontFamily: "AfacadFluxRegular",
    fontSize: 7,
    lineHeight: 9,
    textAlign: "center",
    textTransform: "capitalize",
  },

  buildingPreviewEmptyFloor: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.78)",
    borderColor: "#CDA6AA",
    borderRadius: 8,
    borderWidth: 1,
    height: 92,
    justifyContent: "center",
    marginTop: 18,
    paddingHorizontal: 12,
    width: "100%",
  },

  buildingPreviewEmptyText: {
    color: "#6C757D",
    fontFamily: "AfacadFluxRegular",
    fontSize: 14,
    textAlign: "center",
  },

  detailSheet: {
    width: "100%",
    maxWidth: rs(360, 320, 390),
    padding: rs(16, 12, 18),
    borderRadius: rs(12, 10, 14),
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
    width: rs(38, 34, 40),
    height: rs(38, 34, 40),
    borderRadius: rs(19, 17, 20),
    backgroundColor: "#ffffff",
    borderColor: "#E8DDDE",
    borderWidth: 1,
  },

  roomModalWrap: {
    alignItems: "center",
    maxWidth: 349,
    width: "100%",
    zIndex: 1,
  },

  roomModalCard: {
    aspectRatio: 349 / 386,
    width: "100%",
  },

  roomModalBackground: {
    ...StyleSheet.absoluteFill,
  },

  roomModalClose: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    width: 44,
    zIndex: 2,
  },

  roomModalContent: {
    bottom: 74,
    left: 32,
    position: "absolute",
    right: 24,
    top: 86,
  },

  roomModalScroll: {
    paddingBottom: 18,
  },

  roomModalName: {
    color: "#000000",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(20, 18, 22),
    lineHeight: rf(24, 22, 26),
    marginBottom: 4,
  },

  roomModalBadge: {
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#FA5D0E",
    borderRadius: 50,
    justifyContent: "center",
    minHeight: 24,
    minWidth: 117,
    paddingHorizontal: 12,
  },

  roomModalBadgeText: {
    color: "#FFFFFF",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(15, 13, 16),
    textTransform: "capitalize",
  },

  roomModalFacts: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    marginTop: 10,
  },

  roomModalFact: {
    backgroundColor: "rgba(255,255,255,0.88)",
    borderColor: "#E8DDDE",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },

  roomModalFactLabel: {
    color: "#6C757D",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(10, 9, 11),
    textTransform: "uppercase",
  },

  roomModalFactValue: {
    color: "#24272A",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(12, 11, 13),
    marginTop: 2,
    textTransform: "capitalize",
  },

  roomModalInfoBlock: {
    marginTop: 10,
  },

  roomModalInfoLabel: {
    color: "#AF2532",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(12, 11, 13),
    marginBottom: 3,
    textTransform: "uppercase",
  },

  roomModalNearby: {
    color: "#3C4147",
    fontFamily: "AfacadFluxSemiBold",
    fontSize: rf(12, 11, 13),
    lineHeight: rf(16, 15, 17),
  },

  roomModalDescription: {
    color: "#3C4147",
    fontFamily: "AfacadFluxRegular",
    fontSize: rf(13, 12, 14),
    lineHeight: rf(18, 17, 19),
  },

  featureImage: {
    height: rs(128, 96, 140),
    marginBottom: rs(14, 10, 16),
    borderRadius: 10,
    width: "100%",
  },

  featureName: {
    marginBottom: 8,
    color: "#3C4147",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(20, 17, 21),
  },

  categoryPill: {
    alignSelf: "flex-start",
    marginBottom: 14,
    paddingHorizontal: rs(10, 8, 12),
    paddingVertical: rs(5, 4, 6),
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
    fontSize: rf(12, 11, 13),
  },

  categoryPillText: {
    color: "#AF2532",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(12, 11, 13),
  },

  detailList: {
    gap: rs(8, 6, 10),
    marginBottom: rs(12, 10, 14),
  },

  detailRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: rs(12, 8, 14),
  },

  detailLabel: {
    color: "#6C757D",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(12, 11, 13),
    textTransform: "uppercase",
  },

  detailValue: {
    flex: 1,
    color: "#3C4147",
    fontFamily: "AfacadFluxSemiBold",
    fontSize: rf(14, 12, 15),
    textAlign: "right",
  },

  description: {
    color: "#4D535B",
    fontFamily: "AfacadFluxRegular",
    fontSize: rf(14, 13, 15),
    lineHeight: rf(20, 18, 21),
  },

  directions: {
    marginTop: 10,
    color: "#6C757D",
    fontFamily: "AfacadFluxRegular",
    fontSize: rf(13, 12, 14),
    lineHeight: rf(19, 17, 20),
  },

  detailsButton: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: rs(8, 6, 10),
    backgroundColor: "#AF2532",
    borderRadius: 20,
    marginTop: rs(16, 12, 18),
    paddingHorizontal: rs(14, 12, 16),
    paddingVertical: rs(12, 10, 14),
  },

  detailsButtonText: {
    color: "white",
    fontFamily: "AfacadFluxBold",
    fontSize: rf(14, 13, 15),
  },

});
