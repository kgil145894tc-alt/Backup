// Used by src/screens/notificationsScreen.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen Background and Decorative Waves
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  // Fixed Header, Title, and Close Button
  headerSafe: { backgroundColor: "#AF2532" },
  header: {
    minHeight: 80,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 19,
    paddingRight: 12,
    gap: 12,
  },
  title: { flex: 1, fontSize: 22, fontWeight: "700", color: "white" },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { opacity: 0.7 },
  // Card List Padding and Spacing; Bottom Space Exposes the Waves
  body: { flex: 1 },
  content: {
    paddingTop: 40,
    paddingHorizontal: 15,
    paddingBottom: 100,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  separator: { height: 25 },
  empty: {
    textAlign: "center",
    fontSize: 16,
    color: "#6C757D",
    paddingVertical: 24,
  },
});
