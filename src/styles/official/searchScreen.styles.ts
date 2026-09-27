// Used by src/screens/searchScreen.jsx
import { StyleSheet } from "react-native";
import { rf, rs } from "@/utils/responsive";

export const styles = StyleSheet.create({
  // Screen Background and Safe Area
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  // Header: Back Button and Title
  header: { paddingHorizontal: rs(17, 12, 20), paddingTop: rs(12, 8, 14), paddingBottom: rs(10, 8, 12) },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(12, 8, 14),
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: rf(20, 18, 22), fontWeight: "700", color: "white" },
  // Search Input Size and Font
  input: {
    minHeight: rs(64, 52, 66),
    borderRadius: rs(20, 14, 22),
    backgroundColor: "white",
    paddingHorizontal: rs(24, 16, 26),
    paddingVertical: rs(14, 10, 15),
    fontSize: rf(20, 16, 21),
    color: "#3C4147",
  },
  inputFont: { fontFamily: "SearchRegular" },
  // Scrollable Location List
  list: { flex: 1 },
  // Fixed Recent Searches Heading Container
  headingContainer: {
    paddingHorizontal: rs(24, 16, 28),
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    flexShrink: 0,
  },
  // Scrollable Card List Padding
  content: {
    paddingHorizontal: rs(24, 16, 28),
    paddingBottom: rs(24, 18, 28),
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  // Recent Searches and Search Results Text
  heading: {
    fontSize: rf(24, 20, 25),
    color: "#3C4147",
    marginTop: rs(18, 14, 20),
    marginBottom: rs(16, 12, 18),
    marginLeft: rs(10, 0, 12),
    fontWeight: "700",
  },
  headingFont: { fontFamily: "SearchBold", fontWeight: "normal" },
  // Space Between Location Cards
  separator: { height: 9 },
  // No Results Message
  empty: {
    color: "#6C757D",
    fontSize: rf(16, 14, 17),
    textAlign: "center",
    paddingVertical: 30,
  },
});
