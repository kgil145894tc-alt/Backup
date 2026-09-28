// Used by src/screens/profileScreen.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Screen Background, Safe Area, and Scrollable Content
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  content: { width: "100%", maxWidth: 600, alignSelf: "center", paddingBottom: rs(32, 24, 36) },
  // University Seal and App Name
  header: { flexDirection: "row", alignItems: "center", gap: rs(10, 8, 12), paddingHorizontal: rs(13, 10, 16), paddingTop: rs(25, 16, 28) },
  seal: { width: rs(93, 70, 96), height: rs(93, 70, 96) },
  brand: { flex: 1, fontSize: rf(27, 22, 29), color: "white" },
  brandFont: { fontFamily: "Angkor" },
  gold: { color: "#FEBF1F" },
  // Avatar, Name, and Email
  identity: { alignItems: "center", marginTop: rs(-10, -12, -6), paddingHorizontal: rs(24, 16, 28) },
  name: { fontSize: rf(18, 16, 19), color: "#A2222E", marginTop: 3, textAlign: "center" },
  nameFont: { fontFamily: "ProfileSemiBold" },
  email: { fontSize: rf(14, 12, 15), color: "#6C757D", textAlign: "center", marginTop: 2 },
  mediumFont: { fontFamily: "ProfileMedium" },
  // Google Sign-in Badge
  badge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: rs(12, 8, 12), minHeight: rs(24, 22, 26), paddingHorizontal: rs(16, 12, 18), paddingVertical: 3, marginTop: 8, borderRadius: 10, backgroundColor: "#F7E5E3" },
  badgeText: { fontSize: 11, color: "#A2222E" },
  // Help and Logout Cards
  actions: { paddingHorizontal: rs(24, 16, 28), marginTop: rs(20, 14, 22), gap: rs(10, 8, 12) },
  pressed: { opacity: 0.72 },
  logoutModalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(26, 18, 32),
    backgroundColor: "rgba(32, 21, 22, 0.58)",
  },
  logoutModalCard: {
    width: "100%",
    maxWidth: 360,
    alignItems: "center",
    position: "relative",
    borderRadius: 24,
    backgroundColor: "white",
    paddingHorizontal: rs(25, 20, 28),
    paddingBottom: rs(24, 20, 28),
    paddingTop: rs(28, 24, 32),
    shadowColor: "#321014",
    shadowOpacity: 0.24,
    shadowRadius: 22,
    elevation: 8,
  },
  logoutModalClose: {
    position: "absolute",
    top: 10,
    right: 12,
    alignItems: "center",
    justifyContent: "center",
    width: 34,
    height: 34,
    borderRadius: 17,
  },
  logoutModalCloseText: {
    color: "#B7B0AA",
    fontSize: rf(27, 24, 29),
    lineHeight: rf(30, 27, 32),
  },
  logoutIconCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: rs(82, 74, 88),
    height: rs(82, 74, 88),
    borderRadius: 999,
    marginBottom: 12,
    backgroundColor: "#F7E5E3",
  },
  logoutModalTitle: {
    color: "#A2222E",
    fontSize: rf(24, 21, 26),
    textAlign: "center",
  },
  logoutModalMessage: {
    color: "#3C4147",
    fontSize: rf(15, 13, 16),
    lineHeight: rf(21, 19, 22),
    marginTop: 8,
    textAlign: "center",
  },
  logoutModalActions: {
    flexDirection: "row",
    gap: 10,
    width: "100%",
    marginTop: rs(24, 20, 26),
  },
  logoutCancelButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: rs(48, 44, 50),
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E4C6CB",
    backgroundColor: "#FFF8F9",
  },
  logoutConfirmButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: rs(48, 44, 50),
    borderRadius: 14,
    backgroundColor: "#AF2532",
  },
  logoutCancelText: {
    color: "#A2222E",
    fontSize: rf(15, 13, 16),
  },
  logoutConfirmText: {
    color: "white",
    fontSize: rf(15, 13, 16),
  },
});
