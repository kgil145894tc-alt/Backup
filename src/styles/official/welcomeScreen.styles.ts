// Used by src/screens/welcomeScreen.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Screen Background and Content Placement
  screen: { flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center" },
  background: StyleSheet.absoluteFill,
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: rs(24, 16, 28),
    paddingTop: rs(100, 56, 110),
    paddingBottom: rs(180, 96, 190),
  },
  // Logo and App Name
  logo: {
    width: "100%",
    maxWidth: rs(307, 220, 316),
    aspectRatio: 307 / 316,
  },
  title: {
    width: "100%",
    maxWidth: 412,
    textAlign: "center",
    fontFamily: "Angkor",
    fontSize: rf(46, 34, 48),
    lineHeight: rf(68, 50, 70),
    color: "#AF2532",
    includeFontPadding: false,
  },
  gold: { color: "#FEBF1F" },
  // Decorative Divider and Tagline
  divider: { width: rs(196, 146, 204), height: rs(20, 15, 21), marginTop: 4 },
  tagline: {
    marginTop: 16,
    textAlign: "center",
    fontFamily: "AfacadMedium",
    fontSize: rf(16, 14, 17),
    lineHeight: rf(25, 21, 26),
    color: "#000000",
    includeFontPadding: false,
  },
  // Get Started Button
  button: {
    marginTop: rs(26, 18, 28),
    width: "100%",
    maxWidth: 231,
    minHeight: rs(48, 44, 50),
    paddingHorizontal: rs(20, 16, 22),
    paddingVertical: rs(10, 8, 11),
    borderRadius: 30,
    backgroundColor: "#AF2532",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: rs(12, 9, 13),
  },
  // Button Press Feedback
  buttonPressed: { opacity: 0.8 },
  // Get Started Label and Arrow
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "AfacadBold",
    fontSize: rf(22, 18, 23),
    includeFontPadding: false,
    flexShrink: 1,
  },
  buttonArrow: { width: 26, height: 15 },
});
