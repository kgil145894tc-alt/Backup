// Used by src/screens/historyScreen.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen Background and Safe Area
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  // Header and Space for the Decorative Divider
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 17,
    paddingTop: 20,
    paddingBottom: 42,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "white" },
  // Fixed Section Heading
  headingContainer: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 34,
    paddingTop: 15,
    paddingBottom: 15,
  },
  heading: { fontSize: 24, color: "#3C4147", fontWeight: "700" },
  headingFont: { fontFamily: "HistoryBold", fontWeight: "normal" },
  // Scrollable Cards and Spacing
  list: { flex: 1 },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 24,
  },
  separator: { height: 12 },
  empty: { paddingVertical: 24, textAlign: "center", color: "#6C757D" },
});
