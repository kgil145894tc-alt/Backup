import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import type { CampusNotification } from "../data/notifications";
import type { CampusFeatureCategory, CampusFeatureType } from "../types/campus";
import type { AdminLocation, AdminLocationStatus } from "../utils/adminLocations";
import type { BuildingRoom } from "../data/campusData";
import { firestoreDb, isFirebaseConfigured } from "./firebase";

const LOCATIONS_COLLECTION = "locations";
const ROOMS_COLLECTION = "rooms";
const NOTIFICATIONS_COLLECTION = "notifications";
const USERS_COLLECTION = "users";
const NOTIFICATION_READS_COLLECTION = "notificationReads";
const RECENT_LOCATIONS_COLLECTION = "recentLocations";

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

export type FirestoreNotification = CampusNotification & {
  createdAt?: unknown;
  createdAtMs: number;
  createdBy?: string;
  relatedFeatureId?: string;
  relatedFeatureType?: CampusFeatureType;
};

export type FirestoreRecentLocation = {
  category: string;
  featureId: string;
  featureType: string;
  name: string;
  type: string;
  userId: string;
  viewedAt: number;
  viewedAtTimestamp?: unknown;
};

export type FirestoreUserProfile = {
  displayName?: string | null;
  email?: string | null;
  isActive: boolean;
  photoUrl?: string | null;
  role: "admin" | "user";
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

export async function getNotifications(maxItems = 25) {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(
      collection(db, NOTIFICATIONS_COLLECTION),
      orderBy("createdAtMs", "desc"),
      limit(maxItems),
    ),
  );

  return snapshot.docs.map((notificationDoc) => ({
    ...notificationDoc.data(),
    id: notificationDoc.id,
  })) as FirestoreNotification[];
}

export async function createNotification(
  notification: Omit<FirestoreNotification, "createdAt" | "createdAtMs">,
) {
  const db = requireFirestore();
  const createdAtMs = Date.now();
  const notificationRef = doc(
    db,
    NOTIFICATIONS_COLLECTION,
    `${createdAtMs}-${notification.id}`,
  );

  await setDoc(
    notificationRef,
    withoutUndefined({
      ...notification,
      createdAt: serverTimestamp(),
      createdAtMs,
    }),
  );
}

export async function getUserReadNotificationIds(userId: string) {
  const db = requireFirestore();
  const snapshot = await getDocs(
    collection(
      db,
      USERS_COLLECTION,
      userId,
      NOTIFICATION_READS_COLLECTION,
    ),
  );

  return new Set(snapshot.docs.map((readDoc) => readDoc.id));
}

export async function markUserNotificationRead(
  userId: string,
  notificationId: string,
) {
  const db = requireFirestore();
  const readRef = doc(
    db,
    USERS_COLLECTION,
    userId,
    NOTIFICATION_READS_COLLECTION,
    notificationId,
  );

  await setDoc(
    readRef,
    {
      notificationId,
      readAt: serverTimestamp(),
      readAtMs: Date.now(),
      userId,
    },
    { merge: true },
  );
}

export async function getUserRecentLocations(userId: string, maxItems = 25) {
  const db = requireFirestore();
  const snapshot = await getDocs(
    query(
      collection(
        db,
        USERS_COLLECTION,
        userId,
        RECENT_LOCATIONS_COLLECTION,
      ),
      orderBy("viewedAt", "desc"),
      limit(maxItems),
    ),
  );

  return snapshot.docs.map((historyDoc) => ({
    ...historyDoc.data(),
  })) as FirestoreRecentLocation[];
}

export async function saveUserRecentLocation(
  userId: string,
  historyItem: Omit<
    FirestoreRecentLocation,
    "userId" | "viewedAtTimestamp"
  >,
) {
  const db = requireFirestore();
  const historyRef = doc(
    db,
    USERS_COLLECTION,
    userId,
    RECENT_LOCATIONS_COLLECTION,
    `${historyItem.featureType}:${historyItem.featureId}`,
  );

  await setDoc(
    historyRef,
    withoutUndefined({
      ...historyItem,
      userId,
      viewedAtTimestamp: serverTimestamp(),
    }),
    { merge: true },
  );
}

export async function syncUserProfile(
  userProfile: {
    displayName?: string | null;
    email?: string | null;
    photoUrl?: string | null;
    uid: string;
  },
) {
  const db = requireFirestore();
  const userRef = doc(db, USERS_COLLECTION, userProfile.uid);
  const existingUser = await getDoc(userRef);

  await setDoc(
    userRef,
    withoutUndefined({
      displayName: userProfile.displayName ?? null,
      email: userProfile.email ?? null,
      isActive: true,
      photoUrl: userProfile.photoUrl ?? null,
      role: existingUser.exists() ? undefined : "user",
      updatedAt: serverTimestamp(),
    }),
    { merge: true },
  );
}

export async function getUserRole(userId: string) {
  const db = requireFirestore();
  const userSnapshot = await getDoc(doc(db, USERS_COLLECTION, userId));

  if (!userSnapshot.exists()) {
    return null;
  }

  const role = userSnapshot.data().role;

  return role === "admin" || role === "user" ? role : null;
}
