// Used by src/components/BottomNavigation.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Outer Edge and Rounded Navigation Bar
  edge: {
    backgroundColor: "rgba(217,217,217,0.5)",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: 2,
    flexShrink: 0,
  },
  bar: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 25,
  },
  // Navigation Button Layout
  row: {
    flexDirection: "row",
    minHeight: 78,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 58,
  },
  // Navigation Labels and Active Color
  label: {
    fontSize: 12,
    lineHeight: 15,
    color: "#3C4147",
    textAlign: "center",
    includeFontPadding: false,
  },
  font: { fontFamily: "NavigationMedium" },
  active: { color: "#A42330" },
  // Button Press Feedback
  pressed: { opacity: 0.65 },
});
