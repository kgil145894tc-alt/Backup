// Used by src/screens/homeScreen.jsx
import { rf, rs } from "@/utils/responsive";
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
    paddingHorizontal: rs(14, 10, 16),
    paddingTop: rs(12, 8, 14),
    paddingBottom: rs(66, 42, 70),
    gap: rs(8, 6, 10),
  },
  seal: { width: rs(86, 66, 92), height: rs(93, 71, 99) },
  brand: { flex: 1 },
  brandTitle: {
    fontFamily: "Angkor",
    fontSize: rf(27, 22, 29),
    color: "white",
    lineHeight: 42,
  },
  gold: { color: "#FEBF1F" },
  brandSubtitle: {
    fontFamily: "HomeRegular",
    fontSize: rf(16, 13, 17),
    color: "white",
  },
  iconButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ translateY: -30 }],
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: "#FEBF1F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  notificationBadgeText: {
    fontFamily: "HomeBold",
    fontSize: 10,
    color: "#8F1724",
  },
  // Scrollable Home Content
  content: {
    paddingHorizontal: rs(20, 14, 24),
    paddingBottom: rs(24, 18, 28),
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  // Welcome Message and Search Prompt
  welcome: {
    fontFamily: "Angkor",
    fontSize: rf(24, 20, 25),
    lineHeight: rf(36, 30, 38),
    color: "#3C4147",
  },
  prompt: {
    fontFamily: "HomeRegular",
    fontSize: rf(16, 14, 16),
    color: "#3C4147",
    marginTop: 2,
    marginBottom: 10,
    marginLeft: 10,
  },
  // Search Field
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10, 8, 12),
    borderRadius: 10,
    backgroundColor: "#FFF5F5",
    paddingHorizontal: rs(10, 8, 12),
    minHeight: rs(40, 38, 44),
    borderWidth: 1,
    borderColor: "#E6DDDD",
    elevation: 2,
  },
  input: {
    flex: 1,
    fontFamily: "HomeRegular",
    fontSize: rf(15, 14, 16),
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
    fontSize: rf(24, 20, 25),
    color: "#4D535B",
    flexShrink: 1,
  },
  // See All Button
  seeAll: { minHeight: 44, flexDirection: "row", alignItems: "center", gap: 6 },
  link: { fontFamily: "HomeBold", fontSize: rf(15, 13, 16), color: "#AF2532" },

  // Category Subtitle and Tile Grid
  browse: {
    fontFamily: "HomeMedium",
    fontSize: rf(14, 12, 15),
    color: "#6C757D",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
  },
  tile: {
    width: "31%",
    minHeight: rs(68, 60, 72),
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    gap: 2,
  },
  // Category Tile Labels
  tileCopy: {
    flex: 1,
    minWidth: 0,
  },
  tileText: {
    fontFamily: "HomeMedium",
    fontSize: rf(14, 12, 15),
    color: "#3C4147",
  },
  tileCount: {
    fontFamily: "HomeRegular",
    fontSize: rf(10, 9, 11),
    color: "#6C757D",
    marginTop: 1,
  },
  white: { color: "white" },
  // Explore Campus Map Button
  mapButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: rs(10, 8, 12),
    backgroundColor: "#AA2A37",
    borderRadius: 10,
    minHeight: rs(67, 60, 72),
    paddingHorizontal: rs(16, 12, 18),
    paddingVertical: rs(12, 10, 14),
    marginTop: rs(23, 18, 25),
  },
  guestMapButton: {
    marginTop: rs(16, 12, 18),
  },
  mapCopy: { flex: 1 },
  mapTitle: {
    fontFamily: "HomeSemiBold",
    fontSize: rf(18, 16, 19),
    color: "white",
  },
  mapSubtitle: {
    fontFamily: "HomeRegular",
    fontSize: rf(13, 12, 14),
    color: "white",
  },
  mapPulseIconWrap: {
    alignItems: "center",
    justifyContent: "center",
    width: rs(58, 52, 62),
    height: rs(58, 52, 62),
  },
  mapPulseCircle: {
    position: "absolute",
    width: rs(48, 42, 52),
    height: rs(48, 42, 52),
    borderRadius: rs(24, 21, 26),
    backgroundColor: "rgba(255, 45, 45, 0.28)",
  },
  mapPulseCore: {
    alignItems: "center",
    justifyContent: "center",
    width: rs(42, 38, 46),
    height: rs(42, 38, 46),
    borderRadius: rs(21, 19, 23),
    backgroundColor: "#FF1F1F",
    shadowColor: "#FF1F1F",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    elevation: 6,
  },
  // Button Press Feedback
  pressed: { opacity: 0.8 },
});
