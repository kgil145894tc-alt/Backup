// Used by src/components/NotificationDetailSheet.jsx
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  // Overlay, Outside Tap Area, and Panel
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(0,0,0,0.4)" },
  outside: { flex: 1 },
  sheet: {
    height: "78%",
    maxHeight: 677,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  background: StyleSheet.absoluteFill,
  // Close Button and Scrollable Content
  closeRow: { alignItems: "flex-end", paddingRight: 8 },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { alignItems: "center", paddingHorizontal: 29, paddingBottom: 110 },
  // Announcement Icon, Title, and Message
  announcement: {
    width: 109,
    height: 103,
    borderRadius: 55,
    backgroundColor: "#AF2532",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  announcementIcon: { transform: [{ rotate: "-30deg" }] },
  title: { fontSize: 30, color: "#3C4147", textAlign: "center", marginTop: 24 },
  titleFont: { fontFamily: "DetailSemiBold" },
  message: {
    fontSize: 24,
    color: "#3C4147",
    textAlign: "center",
    marginTop: 18,
  },
  regularFont: { fontFamily: "DetailRegular" },
  // Building Information and Timestamp
  details: {
    width: "100%",
    backgroundColor: "#F3EBEB",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingVertical: 26,
    gap: 28,
    marginTop: 18,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 22 },
  copy: { flex: 1 },
  building: { fontSize: 24, color: "#3C4147" },
  location: { fontSize: 16, color: "#3C4147" },
  time: { flex: 1, fontSize: 20, color: "#3C4147" },
  // Got It Button
  button: {
    alignSelf: "stretch",
    marginHorizontal: 15,
    marginTop: 25,
    minHeight: 48,
    borderRadius: 40,
    backgroundColor: "#A42330",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
  buttonText: { fontSize: 24, color: "white" },
  buttonFont: { fontFamily: "DetailBold" },
  pressed: { opacity: 0.7 },
});
