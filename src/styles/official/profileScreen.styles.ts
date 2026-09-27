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
});
