import AsyncStorage from "@react-native-async-storage/async-storage";

const GUEST_HISTORY_KEY = "umvcfind:guest-history";
const MAX_HISTORY_ITEMS = 25;

export type GuestHistoryItem = {
  featureId: string;
  featureType: string;
  name: string;
  category: string;
  type: string;
  viewedAt: number;
};

export type SaveGuestHistoryItem = Omit<
  GuestHistoryItem,
  "viewedAt"
>;

function isGuestHistoryItem(value: unknown): value is GuestHistoryItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const item = value as Record<string, unknown>;

  return (
    typeof item.featureId === "string" &&
    typeof item.featureType === "string" &&
    typeof item.name === "string" &&
    typeof item.category === "string" &&
    typeof item.type === "string" &&
    typeof item.viewedAt === "number"
  );
}

export async function getGuestHistory() {
  const rawHistory = await AsyncStorage.getItem(GUEST_HISTORY_KEY);

  if (!rawHistory) {
    return [];
  }

  try {
    const parsedHistory = JSON.parse(rawHistory) as unknown;

    if (!Array.isArray(parsedHistory)) {
      return [];
    }

    return parsedHistory
      .filter(isGuestHistoryItem)
      .sort((a, b) => b.viewedAt - a.viewedAt);
  } catch {
    return [];
  }
}

export async function saveGuestHistoryItem(
  historyItem: SaveGuestHistoryItem,
) {
  const currentHistory = await getGuestHistory();
  const nextItem: GuestHistoryItem = {
    ...historyItem,
    viewedAt: Date.now(),
  };
  const nextHistory = [
    nextItem,
    ...currentHistory.filter(
      (item) =>
        item.featureId !== historyItem.featureId ||
        item.featureType !== historyItem.featureType,
    ),
  ].slice(0, MAX_HISTORY_ITEMS);

  await AsyncStorage.setItem(
    GUEST_HISTORY_KEY,
    JSON.stringify(nextHistory),
  );

  return nextHistory;
}
