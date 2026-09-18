import type { BuildingRoom } from "../data/campusData";
import {
  getHiddenAdminLocationKeys,
  getVisibleAdminLocations,
  loadAdminLocations,
  mergeStoredAdminLocations,
  saveAdminLocations,
  type AdminLocation,
} from "../utils/adminLocations";
import {
  getAdminRoomKey,
  loadAdminRoomEdits,
  saveAdminRoomEdits,
} from "../utils/adminRooms";
import {
  canUseFirestore,
  firestoreLocationToAdminLocation,
  firestoreRoomToBuildingRoom,
  getLocations,
  getRooms,
} from "./firestoreData";

export type CampusDataSource =
  | "local"
  | "firestore"
  | "firestore-empty"
  | "firestore-fallback";

export type CampusDataSnapshot = {
  source: CampusDataSource;
  locations: AdminLocation[];
  visibleLocations: AdminLocation[];
  hiddenLocationKeys: string[];
  roomEdits: Record<string, BuildingRoom>;
};

function roomsToEditMap(rooms: BuildingRoom[]) {
  return rooms.reduce<Record<string, BuildingRoom>>((roomEdits, room) => {
    roomEdits[getAdminRoomKey(room)] = room;
    return roomEdits;
  }, {});
}

function buildSnapshot(
  locations: AdminLocation[],
  roomEdits: Record<string, BuildingRoom>,
  source: CampusDataSource,
): CampusDataSnapshot {
  return {
    source,
    locations,
    visibleLocations: getVisibleAdminLocations(locations),
    hiddenLocationKeys: getHiddenAdminLocationKeys(locations),
    roomEdits,
  };
}

export async function loadCampusData(): Promise<CampusDataSnapshot> {
  const [localLocations, localRoomEdits] = await Promise.all([
    loadAdminLocations(),
    loadAdminRoomEdits(),
  ]);

  if (!canUseFirestore()) {
    return buildSnapshot(localLocations, localRoomEdits, "local");
  }

  try {
    const [firestoreLocations, firestoreRooms] = await Promise.all([
      getLocations(),
      getRooms(),
    ]);

    if (!firestoreLocations.length && !firestoreRooms.length) {
      return buildSnapshot(
        localLocations,
        localRoomEdits,
        "firestore-empty",
      );
    }

    const nextLocations = firestoreLocations.length
      ? mergeStoredAdminLocations(
          firestoreLocations.map(firestoreLocationToAdminLocation),
        )
      : localLocations;

    const nextRoomEdits = firestoreRooms.length
      ? roomsToEditMap(firestoreRooms.map(firestoreRoomToBuildingRoom))
      : localRoomEdits;

    if (firestoreLocations.length) {
      void saveAdminLocations(nextLocations);
    }

    if (firestoreRooms.length) {
      void saveAdminRoomEdits(nextRoomEdits);
    }

    return buildSnapshot(nextLocations, nextRoomEdits, "firestore");
  } catch (error) {
    console.warn("Failed to load campus data from Firestore", error);
    return buildSnapshot(
      localLocations,
      localRoomEdits,
      "firestore-fallback",
    );
  }
}

