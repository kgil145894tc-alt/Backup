// Used by src/components/ProfileActionCard.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Action Card Size, Border, and Shadow
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 80,
    paddingVertical: 7,
    paddingHorizontal: 14,
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
  title: { fontSize: 18, color: "#791023" },
  description: { fontSize: 14, color: "#6C757D" },
  font: { fontFamily: "ProfileActionMedium" },
  // Button Press Feedback
  pressed: { opacity: 0.7 },
});
