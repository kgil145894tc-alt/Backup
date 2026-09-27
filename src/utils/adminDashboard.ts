import type { AdminLocation } from "./adminLocations";

export function getAdminStats(locations: AdminLocation[]) {
  return {
    totalBuildings: locations.filter((location) => location.type === "building")
      .length,
    academicBuildings: locations.filter(
      (location) =>
        location.type === "building" || location.category === "Laboratory",
    ).length,
    adminBuildings: locations.filter(
      (location) => location.category === "Office",
    ).length,
    facilities: locations.filter(
      (location) =>
        location.category === "Facility" || location.category === "Food",
    ).length,
  };
}

export function toEditableText(value: string | number | undefined) {
  return value === undefined ? "" : String(value);
}

export function getAdminTableContentWidth({
  isCompact,
  isNarrow,
  width,
}: {
  isCompact: boolean;
  isNarrow: boolean;
  width: number;
}) {
  const adminContentPadding = isNarrow ? 28 : 56;
  const sidebarWidth = isCompact ? 0 : 286;

  return Math.max(760, width - sidebarWidth - adminContentPadding);
}

export function getLocationNotificationCopy(location: AdminLocation) {
  if (location.status === "Maintenance") {
    return {
      category: "maintenance" as const,
      message: `${location.name} is currently marked as under maintenance.`,
      title: "Maintenance Notice",
    };
  }

  return {
    category:
      location.type === "building"
        ? ("building" as const)
        : ("announcement" as const),
    message: `${location.name} information has been updated.`,
    title:
      location.type === "building"
        ? "Building Information Updated"
        : "Location Information Updated",
  };
}
