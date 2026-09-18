import AsyncStorage from "@react-native-async-storage/async-storage";

import { campusFeatureSummaries } from "../data/campusData";
import type { SelectedMapFeature } from "../types/campus";

export type AdminLocationStatus = "Active" | "Hidden" | "Maintenance";

export type AdminLocation = SelectedMapFeature & {
  status: AdminLocationStatus;
};

export const ADMIN_LOCATIONS_KEY = "umvcfind:admin-locations";

export const initialAdminLocations: AdminLocation[] =
  campusFeatureSummaries.map((feature) => ({
    ...feature,
    status: "Active",
  }));

export function getAdminLocationKey(
  location: Pick<AdminLocation, "id" | "type">,
) {
  return `${location.type}:${location.id}`;
}

export function isVisibleAdminLocation(location: AdminLocation) {
  return location.status !== "Hidden";
}

export function isMaintenanceAdminLocation(location: AdminLocation) {
  return location.status === "Maintenance";
}

export function getHiddenAdminLocationKeys(locations: AdminLocation[]) {
  return locations
    .filter((location) => location.status === "Hidden")
    .map(getAdminLocationKey);
}

export function getVisibleAdminLocations(locations: AdminLocation[]) {
  return locations.filter(isVisibleAdminLocation);
}

function isAdminLocation(value: unknown): value is AdminLocation {
  if (!value || typeof value !== "object") {
    return false;
  }

  const location = value as Record<string, unknown>;

  return (
    typeof location.id === "string" &&
    typeof location.name === "string" &&
    typeof location.type === "string" &&
    typeof location.category === "string" &&
    (location.status === "Active" ||
      location.status === "Hidden" ||
      location.status === "Maintenance")
  );
}

export function mergeStoredAdminLocations(
  storedLocations: AdminLocation[],
) {
  const storedByKey = new Map(
    storedLocations.map((location) => [
      getAdminLocationKey(location),
      location,
    ]),
  );

  return initialAdminLocations.map(
    (location) =>
      storedByKey.get(getAdminLocationKey(location)) ?? location,
  );
}

export async function loadAdminLocations() {
  const rawLocations = await AsyncStorage.getItem(ADMIN_LOCATIONS_KEY);

  if (!rawLocations) {
    return initialAdminLocations;
  }

  try {
    const parsedLocations = JSON.parse(rawLocations) as unknown;

    if (!Array.isArray(parsedLocations)) {
      return initialAdminLocations;
    }

    return mergeStoredAdminLocations(
      parsedLocations.filter(isAdminLocation),
    );
  } catch {
    return initialAdminLocations;
  }
}

export async function saveAdminLocations(locations: AdminLocation[]) {
  await AsyncStorage.setItem(
    ADMIN_LOCATIONS_KEY,
    JSON.stringify(locations),
  );
}

export async function clearAdminLocations() {
  await AsyncStorage.removeItem(ADMIN_LOCATIONS_KEY);
}
