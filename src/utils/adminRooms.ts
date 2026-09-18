import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  getBuildingRoom,
  getBuildingRooms,
  type BuildingRoom,
} from "../data/campusData";

export const ADMIN_ROOMS_KEY = "umvcfind:admin-rooms";

export function getAdminRoomKey(
  room: Pick<BuildingRoom, "buildingId" | "id">,
) {
  return `${room.buildingId}:${room.id}`;
}

function isBuildingRoom(value: unknown): value is BuildingRoom {
  if (!value || typeof value !== "object") {
    return false;
  }

  const room = value as Record<string, unknown>;

  return (
    typeof room.id === "string" &&
    typeof room.name === "string" &&
    typeof room.type === "string" &&
    typeof room.category === "string" &&
    typeof room.buildingId === "string" &&
    typeof room.floorNumber === "number"
  );
}

export async function loadAdminRoomEdits() {
  const rawRooms = await AsyncStorage.getItem(ADMIN_ROOMS_KEY);

  if (!rawRooms) {
    return {};
  }

  try {
    const parsedRooms = JSON.parse(rawRooms) as unknown;

    if (!Array.isArray(parsedRooms)) {
      return {};
    }

    return parsedRooms.filter(isBuildingRoom).reduce<
      Record<string, BuildingRoom>
    >((roomEdits, room) => {
      roomEdits[getAdminRoomKey(room)] = room;
      return roomEdits;
    }, {});
  } catch {
    return {};
  }
}

export async function saveAdminRoomEdits(
  roomEdits: Record<string, BuildingRoom>,
) {
  await AsyncStorage.setItem(
    ADMIN_ROOMS_KEY,
    JSON.stringify(Object.values(roomEdits)),
  );
}

export async function clearAdminRoomEdits() {
  await AsyncStorage.removeItem(ADMIN_ROOMS_KEY);
}

export function applyAdminRoomEdits(
  rooms: BuildingRoom[],
  roomEdits: Record<string, BuildingRoom>,
) {
  return rooms.map((room) => roomEdits[getAdminRoomKey(room)] ?? room);
}

export function getEditedBuildingRooms(
  buildingId: string,
  roomEdits: Record<string, BuildingRoom>,
  floorNumber?: number,
) {
  return applyAdminRoomEdits(
    getBuildingRooms(buildingId, floorNumber),
    roomEdits,
  );
}

export function getEditedBuildingRoom(
  buildingId: string,
  roomId: string,
  roomEdits: Record<string, BuildingRoom>,
) {
  const room = getBuildingRoom(buildingId, roomId);

  if (!room) {
    return undefined;
  }

  return roomEdits[getAdminRoomKey(room)] ?? room;
}
