// Used by src/components/RecentLocations.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Horizontal Pages: Three Cards Per Page
  page: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 16,
  },
  // Empty Slot for Incomplete Pages
  slot: { flex: 1 },
  // Recently Viewed Card Size and Shadow
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: 93,
    backgroundColor: "white",
    borderRadius: 7,
    elevation: 3,
    boxShadow: "0px 3px 4px rgba(0,0,0,0.2)",
    justifyContent: "center",
    paddingVertical: 10,
  },
  // Date and Time Row
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginHorizontal: 8,
  },
  // Date and Time Font
  time: { flex: 1, fontFamily: "HomeRegular", fontSize: 12, color: "#6C757D" },
  // Location Name and Arrow Row
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
    marginTop: 7,
  },
  // Location Name Font
  name: {
    flex: 1,
    fontFamily: "HomeSemiBold",
    fontSize: 12,
    color: "#6C757D",
  },
  // Empty List Message
  empty: {
    minHeight: 129,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  emptyText: {
    fontFamily: "HomeRegular",
    fontSize: 16,
    color: "#6C757D",
    textAlign: "center",
  },
  // Card Press Feedback
  pressed: { opacity: 0.8 },
});
