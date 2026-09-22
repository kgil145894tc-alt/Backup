// Used by src/components/NotificationCard.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Card Layout, Rounded Corners, and Shadow
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 93,
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: 15,
    backgroundColor: "#FDF8F8",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  // Title, Message, and Timestamp
  copy: { flex: 1, gap: 3 },
  title: { fontSize: 17, color: "#1E1E1E" },
  titleFont: { fontFamily: "NotificationSemiBold" },
  message: { fontSize: 15, color: "#3C4147" },
  time: { fontSize: 12, color: "#6C757D" },
  regularFont: { fontFamily: "NotificationRegular" },
  // Card Press Feedback
  pressed: { opacity: 0.7 },
});
