// Used by src/screens/welcomeScreen.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen Background and Content Placement
  screen: { flex: 1, backgroundColor: "#FFFFFF", justifyContent: "center" },
  background: StyleSheet.absoluteFill,
  scroll: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 180,
  },
  // Logo and App Name
  logo: { width: "100%", maxWidth: 307, height: 316 },
  title: {
    width: "100%",
    maxWidth: 412,
    textAlign: "center",
    fontFamily: "Angkor",
    fontSize: 46,
    lineHeight: 68,
    color: "#AF2532",
    includeFontPadding: false,
  },
  gold: { color: "#FEBF1F" },
  // Decorative Divider and Tagline
  divider: { width: 196, height: 20, marginTop: 4 },
  tagline: {
    marginTop: 16,
    textAlign: "center",
    fontFamily: "AfacadMedium",
    fontSize: 16,
    lineHeight: 25,
    color: "#000000",
    includeFontPadding: false,
  },
  // Get Started Button
  button: {
    marginTop: 26,
    width: "100%",
    maxWidth: 231,
    minHeight: 48,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    backgroundColor: "#AF2532",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  // Button Press Feedback
  buttonPressed: { opacity: 0.8 },
  // Get Started Label and Arrow
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "AfacadBold",
    fontSize: 22,
    includeFontPadding: false,
    flexShrink: 1,
  },
  buttonArrow: { width: 26, height: 15 },
});
