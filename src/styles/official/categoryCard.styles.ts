// Used by src/components/CategoryCard.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Card Size, Rounded Corners, and Shadow
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: rs(188, 156, 198),
    borderRadius: rs(16, 12, 18),
    padding: rs(6, 5, 8),
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  // Icon and Text Placement
  details: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: rs(84, 72, 90),
    paddingTop: rs(12, 8, 14),
    paddingBottom: rs(10, 8, 12),
    paddingHorizontal: 4,
    gap: rs(5, 3, 6),
  },
  // Category Name
  name: {
    fontSize: rf(14, 12, 15),
    color: "white",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: rf(18, 16, 19),
  },
  nameFont: {
    fontFamily: "CategoryBold",
    fontWeight: "normal",
  },
  // Building Count
  count: {
    fontSize: rf(14, 12, 15),
    color: "white",
    textAlign: "center",
    marginTop: 2,
    lineHeight: rf(18, 16, 19),
  },
  countFont: {
    fontFamily: "CategoryRegular",
  },
  // Category Photo Size and Corners
  photo: {
    width: "100%",
    height: rs(92, 76, 100),
    borderRadius: rs(12, 10, 14),
  },
  // Card Press Feedback
  pressed: { opacity: 0.75 },
});
