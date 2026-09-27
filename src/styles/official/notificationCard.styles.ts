// Used by src/components/NotificationCard.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Card Layout, Rounded Corners, and Shadow
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12, 8, 14),
    minHeight: rs(93, 78, 100),
    paddingHorizontal: rs(26, 16, 28),
    paddingVertical: rs(12, 10, 14),
    borderRadius: rs(15, 12, 16),
    backgroundColor: "#FDF8F8",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  unreadCard: {
    borderColor: "#AF2532",
    borderWidth: 1,
    backgroundColor: "#FFF5F6",
  },
  // Title, Message, and Timestamp
  copy: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#AF2532",
  },
  title: { fontSize: rf(17, 15, 18), color: "#1E1E1E" },
  titleFont: { fontFamily: "NotificationSemiBold" },
  message: { fontSize: rf(15, 13, 16), color: "#3C4147" },
  time: { fontSize: rf(12, 11, 13), color: "#6C757D" },
  regularFont: { fontFamily: "NotificationRegular" },
  // Card Press Feedback
  pressed: { opacity: 0.7 },
});
