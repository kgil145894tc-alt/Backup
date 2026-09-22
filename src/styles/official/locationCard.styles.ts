// Used by src/components/LocationCard.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Search Result Card Layout and Shadow
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 80,
    padding: 7,
    paddingRight: 15,
    backgroundColor: "#FCF8F3",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#D5D3D0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  // Location Photo
  photo: { width: 91, height: 64, borderRadius: 6 },
  // Text Placement
  copy: { flex: 1, minWidth: 0, gap: 3 },
  // Location Name
  name: { fontSize: 16, color: "#3C4147" },
  nameFont: { fontFamily: "LocationSemiBold" },
  // Category and Floor Details
  details: { flexDirection: "row", flexWrap: "wrap", columnGap: 9, rowGap: 2 },
  detail: { fontSize: 15, color: "#3C4147" },
  detailFont: { fontFamily: "LocationRegular" },
  // Card Press Feedback
  // History Variant: Category Badge and Viewed Time
  badge: { color: "white", fontSize: 13, paddingHorizontal: 9, paddingVertical: 1, borderRadius: 10, overflow: "hidden" },
  time: { fontSize: 10, color: "#6C757D" },
  pressed: { opacity: 0.7 },
});
