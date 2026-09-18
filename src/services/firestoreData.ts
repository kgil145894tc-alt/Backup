import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import type { CampusFeatureCategory, CampusFeatureType } from "../types/campus";
import type { AdminLocation, AdminLocationStatus } from "../utils/adminLocations";
import type { BuildingRoom } from "../data/campusData";
import { firestoreDb, isFirebaseConfigured } from "./firebase";

const LOCATIONS_COLLECTION = "locations";
const ROOMS_COLLECTION = "rooms";

export type FirestoreLocation = {
  locationId: string;
  geoJsonId: string;
  name: string;
  type: CampusFeatureType;
  category: CampusFeatureCategory;
  floor?: string;
  floors?: number | string;
  nearby?: string;
  description?: string;
  directions?: string;
  aliases?: string[];
  status: AdminLocationStatus;
  photoUrl?: string;
  updatedBy?: string;
};

export type FirestoreRoom = {
  roomId: string;
  buildingLocationId: string;
  name: string;
  roomType: CampusFeatureType;
  category: CampusFeatureCategory;
  floor?: string;
  floorNumber: number;
  description?: string;
  directions?: string;
  photoUrl?: string;
  status: AdminLocationStatus;
  updatedBy?: string;
};

function requireFirestore() {
  if (!isFirebaseConfigured || !firestoreDb) {
    throw new Error(
      "Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* values before using Firestore.",
    );
  }

  return firestoreDb;
}

export function canUseFirestore() {
  return isFirebaseConfigured && Boolean(firestoreDb);
}

function withoutUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
}

export function adminLocationToFirestore(
  location: AdminLocation,
): FirestoreLocation {
  return withoutUndefined({
    locationId: `${location.type}:${location.id}`,
    geoJsonId: location.id,
    name: location.name,
    type: location.type,
    category: location.category,
    floor: location.floor,
    floors: location.floors,
    nearby: location.nearby,
    description: location.description,
    directions: location.directions,
    aliases: location.aliases ?? [],
    status: location.status,
  });
}

export function buildingRoomToFirestore(room: BuildingRoom): FirestoreRoom {
  return withoutUndefined({
    roomId: room.id,
    buildingLocationId: room.buildingId,
    name: room.name,
    roomType: room.type,
    category: room.category,
    floor: room.floor,
    floorNumber: room.floorNumber,
    description: room.description,
    directions: room.directions,
    status: "Active",
  });
}

export function firestoreLocationToAdminLocation(
  location: FirestoreLocation,
): AdminLocation {
  return {
    id: location.geoJsonId,
    name: location.name,
    type: location.type,
    category: location.category,
    aliases: location.aliases,
    directions: location.directions,
    floor: location.floor,
    floors: location.floors,
    nearby: location.nearby,
    description: location.description,
    photoKey: location.photoUrl,
    status: location.status,
  };
}

export function firestoreRoomToBuildingRoom(room: FirestoreRoom): BuildingRoom {
  return {
    id: room.roomId,
    name: room.name,
    type: room.roomType,
    category: room.category,
    buildingId: room.buildingLocationId,
    floorNumber: room.floorNumber,
    floor: room.floor,
    description: room.description,
    directions: room.directions,
    photoKey: room.photoUrl,
  };
}

export async function getLocations() {
  const db = requireFirestore();
  const snapshot = await getDocs(collection(db, LOCATIONS_COLLECTION));

  return snapshot.docs.map((locationDoc) => ({
    ...locationDoc.data(),
    locationId: locationDoc.id,
  })) as FirestoreLocation[];
}

export async function updateLocation(
  location: FirestoreLocation,
  updatedBy?: string,
) {
  const db = requireFirestore();
  const locationRef = doc(db, LOCATIONS_COLLECTION, location.locationId);

  await setDoc(
    locationRef,
    withoutUndefined({
      ...location,
      updatedBy: updatedBy ?? location.updatedBy ?? null,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}

export async function getRooms(buildingLocationId?: string) {
  const db = requireFirestore();
  const snapshot = await getDocs(collection(db, ROOMS_COLLECTION));
  const rooms = snapshot.docs.map((roomDoc) => ({
    ...roomDoc.data(),
    roomId: roomDoc.id,
  })) as FirestoreRoom[];

  return buildingLocationId
    ? rooms.filter((room) => room.buildingLocationId === buildingLocationId)
    : rooms;
}

export async function updateRoom(room: FirestoreRoom, updatedBy?: string) {
  const db = requireFirestore();
  const roomRef = doc(db, ROOMS_COLLECTION, room.roomId);

  await setDoc(
    roomRef,
    withoutUndefined({
      ...room,
      updatedBy: updatedBy ?? room.updatedBy ?? null,
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}
