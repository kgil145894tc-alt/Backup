// Used by src/screens/searchScreen.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen Background and Safe Area
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  // Header: Back Button and Title
  header: { paddingHorizontal: 17, paddingTop: 12, paddingBottom: 10 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 20, fontWeight: "700", color: "white" },
  // Search Input Size and Font
  input: {
    minHeight: 64,
    borderRadius: 20,
    backgroundColor: "white",
    paddingHorizontal: 24,
    paddingVertical: 14,
    fontSize: 20,
    color: "#3C4147",
  },
  inputFont: { fontFamily: "SearchRegular" },
  // Scrollable Location List
  list: { flex: 1 },
  // Fixed Recent Searches Heading Container
  headingContainer: {
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    flexShrink: 0,
  },
  // Scrollable Card List Padding
  content: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
  },
  // Recent Searches and Search Results Text
  heading: {
    fontSize: 24,
    color: "#3C4147",
    marginTop: 18,
    marginBottom: 16,
    marginLeft: 10,
    fontWeight: "700",
  },
  headingFont: { fontFamily: "SearchBold", fontWeight: "normal" },
  // Space Between Location Cards
  separator: { height: 9 },
  // No Results Message
  empty: {
    color: "#6C757D",
    fontSize: 16,
    textAlign: "center",
    paddingVertical: 30,
  },
});
