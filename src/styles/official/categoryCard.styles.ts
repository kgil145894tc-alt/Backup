// Used by src/components/CategoryCard.jsx
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Card Size, Rounded Corners, and Shadow
  card: {
    flex: 1,
    minWidth: 0,
    minHeight: 100,
    borderRadius: 25,
    padding: 5,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  // Icon and Text Placement
  details: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 16,
    paddingBottom: 14,
    gap: 5,
  },
  // Category Name
  name: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    fontWeight: "700",
  },
  nameFont: {
    fontFamily: "CategoryBold",
    fontWeight: "normal",
  },
  // Building Count
  count: {
    fontSize: 14,
    color: "white",
    textAlign: "center",
    marginTop: 2,
  },
  countFont: {
    fontFamily: "CategoryRegular",
  },
  // Category Photo Size and Corners
  photo: {
    width: "100%",
    height: 100,
    borderRadius: 20,
  },
  // Card Press Feedback
  pressed: { opacity: 0.75 },
});
