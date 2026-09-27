// Used by src/screens/categoriesScreen.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Screen Background and Safe Area
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  // Header: Back Button, Title, and Space Above Cards
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12, 8, 14),
    paddingHorizontal: rs(17, 12, 20),
    paddingTop: rs(12, 8, 14),
    paddingBottom: rs(42, 24, 46),
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: rf(20, 18, 22), fontWeight: "700", color: "white" },
  // Scrollable Category Grid
  list: { flex: 1 },
  // Grid Padding and Vertical Card Spacing
  content: {
    paddingHorizontal: rs(18, 14, 22),
    paddingTop: 4,
    paddingBottom: rs(28, 22, 34),
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    gap: rs(18, 14, 20),
  },
  compactContent: {
    paddingHorizontal: rs(14, 12, 18),
    gap: rs(14, 12, 16),
  },
  // Horizontal Space Between Cards
  row: { gap: rs(14, 10, 16) },
});
