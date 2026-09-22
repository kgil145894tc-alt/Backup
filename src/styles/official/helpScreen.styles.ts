// Used by src/screens/helpScreen.jsx
import { StyleSheet } from "react-native";
export const styles = StyleSheet.create({
  // Screen and Background
  screen: { flex: 1, backgroundColor: "white" },
  body: { flex: 1 },
  background: { ...StyleSheet.absoluteFill, overflow: "hidden" },
  // Header and Gold Divider
  header: { backgroundColor: "#AF2532" },
  backButton: { minHeight: 64, justifyContent: "flex-end", paddingHorizontal: 18, paddingBottom: 12 },
  backText: { color: "white", fontSize: 16 },
  goldDivider: { height: 14, backgroundColor: "#FEBF1F" },
  // Scrollable Content and Fonts
  content: { width: "100%", maxWidth: 600, alignSelf: "center", paddingHorizontal: 15, paddingTop: 8, paddingBottom: 28 },
  regularFont: { fontFamily: "HelpRegular" },
  boldFont: { fontFamily: "HelpBold" },
  heading: { fontSize: 26, color: "#AF2532", flexShrink: 1 },
  introduction: { fontSize: 20, lineHeight: 28, color: "#6C757D", marginTop: 10 },
  // Help Section Titles, Logo, and Text Cards
  section: { marginTop: 26, marginHorizontal: 10 },
  sectionHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 7, gap: 8 },
  alignRight: { justifyContent: "flex-end" },
  logo: { width: 66, height: 66 },
  card: { backgroundColor: "rgba(255,255,255,0.94)", borderWidth: 1, borderColor: "#CDA6AA", borderRadius: 12, padding: 12 },
  copy: { fontSize: 18, lineHeight: 26, color: "#6C757D" },
  pressed: { opacity: 0.7 },
});
