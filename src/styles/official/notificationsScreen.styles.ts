// Used by src/screens/notificationsScreen.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Screen Background and Decorative Waves
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  // Fixed Header, Title, and Close Button
  headerSafe: { backgroundColor: "#AF2532" },
  header: {
    minHeight: rs(80, 66, 84),
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: rs(19, 14, 22),
    paddingRight: rs(12, 8, 14),
    gap: rs(12, 8, 14),
  },
  title: { flex: 1, fontSize: rf(22, 18, 23), fontWeight: "700", color: "white" },
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
    paddingTop: rs(40, 24, 44),
    paddingHorizontal: rs(15, 12, 18),
    paddingBottom: rs(100, 76, 112),
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  separator: { height: rs(25, 16, 28) },
  empty: {
    textAlign: "center",
    fontSize: rf(16, 14, 17),
    color: "#6C757D",
    paddingVertical: 24,
  },
});
