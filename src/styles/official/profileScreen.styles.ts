// Used by src/screens/profileScreen.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen Background, Safe Area, and Scrollable Content
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  content: { width: "100%", maxWidth: 600, alignSelf: "center", paddingBottom: 32 },
  // University Seal and App Name
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 13, paddingTop: 25 },
  seal: { width: 93, height: 93 },
  brand: { flex: 1, fontSize: 27, color: "white" },
  brandFont: { fontFamily: "Angkor" },
  gold: { color: "#FEBF1F" },
  // Avatar, Name, and Email
  identity: { alignItems: "center", marginTop: -10, paddingHorizontal: 24 },
  name: { fontSize: 18, color: "#A2222E", marginTop: 3, textAlign: "center" },
  nameFont: { fontFamily: "ProfileSemiBold" },
  email: { fontSize: 14, color: "#6C757D", textAlign: "center", marginTop: 2 },
  mediumFont: { fontFamily: "ProfileMedium" },
  // Google Sign-in Badge
  badge: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 24, paddingHorizontal: 16, paddingVertical: 3, marginTop: 8, borderRadius: 10, backgroundColor: "#F7E5E3" },
  badgeText: { fontSize: 11, color: "#A2222E" },
  // Help and Logout Cards
  actions: { paddingHorizontal: 24, marginTop: 20, gap: 10 },
});
