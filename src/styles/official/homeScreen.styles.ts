// Used by src/screens/homeScreen.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Screen Background and Loading State
  screen: { flex: 1, backgroundColor: "white" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  // Header: Seal, Branding, and Notifications
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 66,
    gap: 8,
  },
  seal: { width: 86, height: 93 },
  brand: { flex: 1 },
  brandTitle: {
    fontFamily: "Angkor",
    fontSize: 27,
    color: "white",
    lineHeight: 42,
  },
  gold: { color: "#FEBF1F" },
  brandSubtitle: { fontFamily: "HomeRegular", fontSize: 16, color: "white" },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  // Scrollable Home Content
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  // Welcome Message and Search Prompt
  welcome: {
    fontFamily: "Angkor",
    fontSize: 24,
    lineHeight: 36,
    color: "#3C4147",
  },
  prompt: {
    fontFamily: "HomeRegular",
    fontSize: 16,
    color: "#3C4147",
    marginTop: 2,
    marginBottom: 10,
    marginLeft: 10,
  },
  // Search Field
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 10,
    backgroundColor: "#FFF5F5",
    paddingHorizontal: 10,
    minHeight: 40,
    borderWidth: 1,
    borderColor: "#E6DDDD",
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: "HomeRegular",
    fontSize: 15,
    color: "#3C4147",
    paddingVertical: 8,
  },
  // Recently Viewed and Explore Campus Headings
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 16,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "HomeBold",
    fontSize: 24,
    color: "#4D535B",
    flexShrink: 1,
  },
  // See All Button
  seeAll: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6 },
  link: { fontFamily: "HomeBold", fontSize: 15, color: "#AF2532" },

  // Category Subtitle and Tile Grid
  browse: { fontFamily: "HomeMedium", fontSize: 14, color: "#6C757D" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  tile: {
    width: "31%",
    minHeight: 68,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 2,
  },
  // Category Tile Colors
  academic: { backgroundColor: "#AA2A37" },
  offices: { backgroundColor: "#FED257" },
  pink: { backgroundColor: "#FAE7E9" },
  cream: { backgroundColor: "#FAF2DD" },
  // Category Tile Labels
  tileText: {
    fontFamily: "HomeMedium",
    fontSize: 15,
    color: "#3C4147",
    flexShrink: 1,
  },
  white: { color: "white" },
  // Explore Campus Map Button
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#AA2A37",
    borderRadius: 10,
    minHeight: 67,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 23,
  },
  mapCopy: { flex: 1 },
  mapTitle: { fontFamily: "HomeSemiBold", fontSize: 18, color: "white" },
  mapSubtitle: { fontFamily: "HomeRegular", fontSize: 13, color: "white" },
  // Button Press Feedback
  pressed: { opacity: 0.8 },
});
