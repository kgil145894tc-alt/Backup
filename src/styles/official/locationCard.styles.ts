// Used by src/components/LocationCard.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Search Result Card Layout and Shadow
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12, 8, 14),
    minHeight: rs(80, 72, 86),
    padding: rs(7, 6, 8),
    paddingRight: rs(15, 10, 16),
    backgroundColor: "#FCF8F3",
    borderRadius: rs(13, 10, 14),
    borderWidth: 1,
    borderColor: "#D5D3D0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  // Location Photo
  photo: { width: rs(91, 72, 96), height: rs(64, 52, 68), borderRadius: 6 },
  // Text Placement
  copy: { flex: 1, minWidth: 0, gap: 3 },
  // Location Name
  name: { fontSize: rf(16, 14, 17), color: "#3C4147" },
  nameFont: { fontFamily: "LocationSemiBold" },
  // Category and Floor Details
  details: { flexDirection: "row", flexWrap: "wrap", columnGap: 9, rowGap: 2 },
  detail: { fontSize: rf(15, 13, 16), color: "#3C4147" },
  detailFont: { fontFamily: "LocationRegular" },
  // Card Press Feedback
  // History Variant: Category Badge and Viewed Time
  badge: { color: "white", fontSize: rf(13, 11, 14), paddingHorizontal: rs(9, 7, 10), paddingVertical: 1, borderRadius: 10, overflow: "hidden" },
  time: { fontSize: rf(10, 9, 11), color: "#6C757D" },
  pressed: { opacity: 0.7 },
});
