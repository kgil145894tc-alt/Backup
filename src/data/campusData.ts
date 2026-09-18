import buildingsCollection from "./buildings.json";
import { campusFeatureMetadata } from "./locationMetadata";
import locationsCollection from "./locations.json";
import type {
  BuildingProperties,
  CampusFeature,
  CampusFeatureCategory,
  CampusFeatureCollection,
  CampusFeatureType,
  LocationProperties,
  SelectedMapFeature,
} from "../types/campus";

export const buildings =
  buildingsCollection as CampusFeatureCollection<BuildingProperties>;

export const locations =
  locationsCollection as CampusFeatureCollection<LocationProperties>;

export const campusFeatures: CampusFeature[] = [
  ...buildings.features,
  ...locations.features,
];

export const campusFeatureSummaries: SelectedMapFeature[] =
  campusFeatures.map((feature) => {
    const featureType = feature.properties.type as CampusFeatureType;
    const metadata =
      campusFeatureMetadata[`${featureType}:${feature.properties.id}`];

    return {
      id: feature.properties.id,
      name: feature.properties.name,
      type: featureType,
      category: feature.properties.category as CampusFeatureCategory,
      floors:
        "floors" in feature.properties
          ? feature.properties.floors
          : undefined,
      description:
        metadata?.description ??
        ("description" in feature.properties
          ? feature.properties.description
          : undefined),
      ...metadata,
    };
  });

export const campusCategories: CampusFeatureCategory[] = Array.from(
  new Set(campusFeatureSummaries.map((feature) => feature.category)),
);

export type BuildingRoom = SelectedMapFeature & {
  buildingId: string;
  floorNumber: number;
  mapFeatureId?: string;
  mapFeatureType?: CampusFeatureType;
};

const oldBuildingRooms: BuildingRoom[] = [
  {
    id: "ob-electronics-laboratory",
    name: "Electronics Laboratory",
    type: "laboratory",
    category: "Laboratory",
    buildingId: "ob",
    floorNumber: 1,
    floor: "First Floor",
    description: "Laboratory for electronics-related classes and practical activities.",
    directions: "Enter the Old Building and proceed to the First Floor laboratory area.",
  },
  {
    id: "ob-engineering-computer-laboratory",
    name: "Engineering Computer Laboratory",
    type: "laboratory",
    category: "Laboratory",
    buildingId: "ob",
    floorNumber: 1,
    floor: "First Floor",
    description: "Computer laboratory for engineering-related classes and practical work.",
    directions: "Enter the Old Building and proceed to the First Floor laboratory area.",
  },
  {
    id: "ob-v1-computing-laboratory",
    name: "V1 Computing Laboratory",
    type: "laboratory",
    category: "Laboratory",
    buildingId: "ob",
    floorNumber: 2,
    floor: "Second Floor",
    description: "Computing laboratory identified as V1.",
    directions: "Use the stairs in the Old Building and proceed to the Second Floor.",
  },
  {
    id: "ob-v2-computing-laboratory",
    name: "V2 Computing Laboratory",
    type: "laboratory",
    category: "Laboratory",
    buildingId: "ob",
    floorNumber: 2,
    floor: "Second Floor",
    description: "Computing laboratory identified as V2.",
    directions: "Use the stairs in the Old Building and proceed to the Second Floor.",
  },
  {
    id: "ob-v3-computing-laboratory",
    name: "V3 Computing Laboratory",
    type: "laboratory",
    category: "Laboratory",
    buildingId: "ob",
    floorNumber: 2,
    floor: "Second Floor",
    description: "Computing laboratory identified as V3.",
    directions: "Use the stairs in the Old Building and proceed to the Second Floor.",
  },
  {
    id: "ob-r-301",
    name: "R-301",
    type: "room",
    category: "Room",
    buildingId: "ob",
    floorNumber: 3,
    floor: "Third Floor",
    description: "Classroom identified as R-301.",
    directions: "Use the stairs in the Old Building and proceed to the Third Floor.",
  },
  {
    id: "ob-r-302",
    name: "R-302",
    type: "room",
    category: "Room",
    buildingId: "ob",
    floorNumber: 3,
    floor: "Third Floor",
    description: "Classroom identified as R-302.",
    directions: "Use the stairs in the Old Building and proceed to the Third Floor.",
  },
  {
    id: "ob-avr-2",
    name: "AVR-2 (Audio Visual Room)",
    type: "facility",
    category: "Facility",
    buildingId: "ob",
    floorNumber: 3,
    floor: "Third Floor",
    description: "Audio Visual Room 2 for audio-visual presentations and activities.",
    directions: "Use the stairs in the Old Building and proceed to the Third Floor.",
  },
];

function directoryRooms(
  buildingId: string,
  floorNumber: number,
  roomNames: string[],
): BuildingRoom[] {
  const floorLabel = ["", "First Floor", "Second Floor", "Third Floor"][floorNumber] ?? `Floor ${floorNumber}`;

  return roomNames.map((name) => ({
    id: `${buildingId}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    name,
    type: "room",
    category: "Room",
    buildingId,
    floorNumber,
    floor: floorLabel,
    description: `${name} is listed on the ${floorLabel.toLowerCase()} directory for this building.`,
    directions: `Enter the building and proceed to the ${floorLabel.toLowerCase()}.`,
  }));
}

const buildingB1Rooms: BuildingRoom[] = [
  ...directoryRooms("b1", 1, ["B1-101", "B1-102", "B1-103", "B1-104"]),
  ...directoryRooms("b1", 2, ["B1-205", "B1-206", "B1-207", "B1-208"]),
  ...directoryRooms("b1", 3, ["B1-309", "B1-311", "B1-312"]),
];

const buildingB2Rooms: BuildingRoom[] = [
  ...directoryRooms("b2", 1, ["B2-101", "B2-102", "B2-103", "B2-104", "B2-105", "B2-108"]),
  ...directoryRooms("b2", 2, ["Defense Room", "B2-207", "B2-208", "B2-209", "B2-210", "B2-211", "B2-212"]),
  ...directoryRooms("b2", 3, ["PPMGS Visayan", "B2-313", "B2-314", "B2-315", "B2-316", "B2-317", "B2-318"]),
];

const buildingRooms: Record<string, BuildingRoom[]> = {
  ob: oldBuildingRooms,
  b1: buildingB1Rooms,
  b2: buildingB2Rooms,
  "cr1-building": [],
};

// These existing polygons can still return to their parent building when
// opened directly from the campus map. They are intentionally separate from
// the floor directories above, which follow the supplied floor plans.
const mappedFeatureBuildingIds: Record<string, string> = {
  chem: "b1",
  "physical-laboratory": "b1",
  rv1: "b1",
  cr2: "ob",
  "psychology-lab": "b2",
  "psychology-faculty": "b2",
  faculty: "b2",
  cr1: "b2",
  cr3: "b1",
};

export function getBuildingRooms(
  buildingId: string,
  floorNumber?: number,
): BuildingRoom[] {
  const rooms = buildingRooms[buildingId] ?? [];
  return floorNumber === undefined
    ? rooms
    : rooms.filter((room) => room.floorNumber === floorNumber);
}

export function getBuildingRoom(
  buildingId: string,
  roomId: string,
): BuildingRoom | undefined {
  return getBuildingRooms(buildingId).find((room) => room.id === roomId);
}

export function getBuildingIdForRoom(roomId: string): string | undefined {
  return mappedFeatureBuildingIds[roomId];
}
