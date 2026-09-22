import { router } from "expo-router";

export type TabName = "Home" | "Map" | "Search" | "Categories" | "Profile";

export type NavigateToTabOptions = {
  currentTab?: TabName;
  isGuest?: boolean;
  onOpenLimitedAccess?: () => void;
  onSameTab?: () => void;
};

/**
 * Navigates between tabs without pushing each tab onto the history stack.
 * Prevents navigation stack thrashing when users switch between tabs.
 */
export function navigateToTab(
  name: string,
  options?: NavigateToTabOptions,
) {
  if (options?.currentTab && name === options.currentTab && options?.onSameTab) {
    options.onSameTab();
    return;
  }

  if ((name === "Search" || name === "Categories") && options?.isGuest) {
    if (options.onOpenLimitedAccess) {
      options.onOpenLimitedAccess();
    }
    return;
  }

  switch (name) {
    case "Home":
      router.navigate("/(tabs)");
      break;
    case "Map":
      router.navigate("/(tabs)/map");
      break;
    case "Search":
      router.navigate("/(tabs)/search");
      break;
    case "Categories":
      router.navigate("/(tabs)/categories");
      break;
    case "Profile":
      router.navigate("/(tabs)/profile");
      break;
    default:
      break;
  }
}
