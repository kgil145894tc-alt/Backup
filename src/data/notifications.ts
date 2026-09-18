export type CampusNotification = {
  id: string;
  title: string;
  message: string;
  timeLabel: string;
  category: "building" | "room" | "announcement" | "maintenance";
  locationName?: string;
  locationSubtitle?: string;
};

export const campusNotifications: CampusNotification[] = [
  {
    id: "new-building-information",
    title: "New Building Information",
    message: "The location of Building 2 has been updated.",
    timeLabel: "Today, 9:24 AM",
    category: "building",
    locationName: "Building 2",
    locationSubtitle: "Old Building",
  },
  {
    id: "room-update-203",
    title: "Room Update",
    message: "Room 203 is now available for viewing.",
    timeLabel: "Yesterday, 4:12 PM",
    category: "room",
    locationName: "Room 203",
    locationSubtitle: "Campus room",
  },
  {
    id: "campus-announcement",
    title: "Campus Announcement",
    message: "Check the latest campus information and updates.",
    timeLabel: "September 10, 2026",
    category: "announcement",
    locationName: "Campus Information",
    locationSubtitle: "General update",
  },
  {
    id: "maintenance-old-building-101",
    title: "Maintenance Notice",
    message: "Scheduled maintenance at the Old Building, Room 101.",
    timeLabel: "September 8, 2026",
    category: "maintenance",
    locationName: "Old Building",
    locationSubtitle: "Room 101",
  },
  {
    id: "maintenance-old-building",
    title: "Maintenance Notice",
    message: "Scheduled maintenance at the Old Building.",
    timeLabel: "September 6, 2026",
    category: "maintenance",
    locationName: "Old Building",
    locationSubtitle: "Building notice",
  },
];

