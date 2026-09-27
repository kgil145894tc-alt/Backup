// Used by src/components/ProfileActionCard.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Action Card Size, Border, and Shadow
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10, 8, 12),
    minHeight: rs(80, 72, 86),
    paddingVertical: rs(7, 6, 8),
    paddingHorizontal: rs(14, 10, 16),
    backgroundColor: "white",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D0D2D4",
    elevation: 2,
    shadowColor: "#3C4147",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 0 },
  },
  // Text Placement and Fonts
  copy: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: rf(18, 16, 19), color: "#791023" },
  description: { fontSize: rf(14, 12, 15), color: "#6C757D" },
  font: { fontFamily: "ProfileActionMedium" },
  // Button Press Feedback
  pressed: { opacity: 0.7 },
});
