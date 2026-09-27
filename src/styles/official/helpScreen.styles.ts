// Used by src/screens/helpScreen.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";
export const styles = StyleSheet.create({
  // Screen and Background
  screen: { flex: 1, backgroundColor: "white" },
  body: { flex: 1 },
  background: { ...StyleSheet.absoluteFill, overflow: "hidden" },
  // Header and Gold Divider
  header: { backgroundColor: "#AF2532" },
  backButton: {
    minHeight: rs(64, 56, 68),
    justifyContent: "flex-end",
    paddingHorizontal: rs(18, 14, 20),
    paddingBottom: rs(12, 10, 14),
  },
  backText: { color: "white", fontSize: rf(16, 14, 17) },
  goldDivider: { height: rs(14, 10, 15), backgroundColor: "#FEBF1F" },
  // Scrollable Content and Fonts
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: rs(18, 14, 22),
    paddingTop: rs(10, 8, 12),
    paddingBottom: rs(34, 26, 38),
  },
  regularFont: { fontFamily: "HelpRegular" },
  boldFont: { fontFamily: "HelpBold" },
  heading: { fontSize: rf(24, 20, 25), color: "#AF2532", flexShrink: 1 },
  introduction: {
    fontSize: rf(17, 15, 18),
    lineHeight: rf(25, 22, 26),
    color: "#5F6268",
    marginTop: 10,
  },
  // Help Section Titles, Logo, and Text Cards
  section: { marginTop: rs(24, 18, 26) },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 7,
    gap: rs(8, 6, 10),
  },
  alignRight: { justifyContent: "flex-end" },
  logo: { width: rs(66, 52, 70), height: rs(66, 52, 70) },
  card: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderWidth: 1,
    borderColor: "#E2BDC1",
    borderRadius: 8,
    paddingHorizontal: rs(14, 12, 16),
    paddingVertical: rs(12, 10, 14),
  },
  copy: { fontSize: rf(16, 14, 17), lineHeight: rf(24, 21, 25), color: "#5F6268" },
  faqBlock: { marginTop: rs(28, 22, 30), gap: rs(10, 8, 12) },
  faqTitle: { color: "#AF2532", fontSize: rf(24, 20, 25), marginBottom: 2 },
  faqCard: {
    backgroundColor: "rgba(255,255,255,0.96)",
    borderLeftWidth: 4,
    borderLeftColor: "#FEBF1F",
    borderRadius: 8,
    paddingHorizontal: rs(14, 12, 16),
    paddingVertical: rs(12, 10, 14),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  faqQuestion: { color: "#AF2532", fontSize: rf(16, 14, 17), lineHeight: rf(22, 20, 23) },
  faqAnswer: { color: "#5F6268", fontSize: rf(15, 13, 16), lineHeight: rf(22, 20, 23), marginTop: 5 },
  pressed: { opacity: 0.7 },
});
