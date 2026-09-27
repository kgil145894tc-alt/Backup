// Used by src/components/BottomNavigation.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Outer Edge and Rounded Navigation Bar
  edge: {
    backgroundColor: "rgba(217,217,217,0.5)",
    borderTopLeftRadius: rs(25, 20, 28),
    borderTopRightRadius: rs(25, 20, 28),
    paddingTop: 2,
    flexShrink: 0,
  },
  bar: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: rs(20, 18, 24),
    borderTopRightRadius: rs(25, 20, 28),
  },
  // Navigation Button Layout
  row: {
    flexDirection: "row",
    minHeight: rs(72, 62, 76),
    paddingHorizontal: rs(8, 4, 10),
    paddingVertical: rs(8, 6, 10),
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: rs(58, 50, 62),
  },
  // Navigation Labels and Active Color
  label: {
    fontSize: rf(11, 9, 12),
    lineHeight: rf(15, 13, 16),
    color: "#3C4147",
    textAlign: "center",
    includeFontPadding: false,
  },
  font: { fontFamily: "NavigationMedium" },
  active: { color: "#A42330" },
  // Button Press Feedback
  pressed: { opacity: 0.65 },
});
