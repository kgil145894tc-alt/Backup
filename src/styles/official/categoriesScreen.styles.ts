// Used by src/screens/categoriesScreen.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen Background and Safe Area
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  // Header: Back Button, Title, and Space Above Cards
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 71,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "white" },
  // Scrollable Category Grid
  list: { flex: 1 },
  // Grid Padding and Vertical Card Spacing
  content: {
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 28,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    gap: 27,
  },
  // Horizontal Space Between Cards
  row: { gap: 21 },
});
