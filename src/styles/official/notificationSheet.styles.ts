// Used by src/components/NotificationSheet.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Overlay and Outside Dismissal Area
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.4)" },
  outside: { flex: 1 },
  // Panel Height Leaves Home Visible Above It
  sheet: {
    height: "82%",
    maxHeight: 735,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
    backgroundColor: "white",
  },
  background: StyleSheet.absoluteFill,
  // Header Matches the Red Area of sevenBg.svg
  header: {
    height: "12.65%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 24,
    paddingRight: 14,
    gap: 12,
  },
  heading: { flex: 1, fontSize: 22, fontWeight: "700", color: "white" },
  // Close Icon Touch Area
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  // Card List and Spacing
  list: { flex: 1 },
  listContent: { paddingHorizontal: 17, paddingTop: 32, paddingBottom: 18 },
  separator: { height: 15 },
  empty: { textAlign: "center", color: "#6C757D", paddingVertical: 24 },
  // View All Button and Decorative Footer
  footer: { paddingHorizontal: 27, paddingTop: 12 },
  button: {
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#AB1A28",
    borderRadius: 40,
  },
  buttonText: { fontSize: 24, color: "white", textAlign: "center" },
  buttonFont: { fontFamily: "NotificationBold" },
  waveSpace: { height: 48 },
  pressed: { opacity: 0.75 },
});
