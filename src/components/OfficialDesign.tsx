import { Image, type ImageSource } from "expo-image";
import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import type { SvgProps } from "react-native-svg";

import DateIcon from "@/assets/design/icons/date.svg";
import Arrow from "@/assets/design/icons/proceed-arrow.svg";
import HomeIcon from "@/assets/design/icons/nav-home.svg";
import MapIcon from "@/assets/design/icons/nav-map.svg";
import SearchIcon from "@/assets/design/icons/nav-search.svg";
import CategoriesIcon from "@/assets/design/icons/nav-categories.svg";
import ProfileIcon from "@/assets/design/icons/nav-profile.svg";
import NotificationSheetBackground from "@/assets/design/backgrounds/sevenBg.svg";
import NotificationDetailBackground from "@/assets/design/backgrounds/tenBg.svg";
import CloseIcon from "@/assets/design/icons/close.svg";
import Announcement from "@/assets/design/icons/notification-detail-announcement.svg";
import Building from "@/assets/design/icons/notification-detail-building.svg";
import Calendar from "@/assets/design/icons/notification-detail-calendar.svg";
import { styles as bottomNavStyles } from "@/styles/official/bottomNavigation.styles";
import { styles as categoryCardStyles } from "@/styles/official/categoryCard.styles";
import { styles as locationCardStyles } from "@/styles/official/locationCard.styles";
import { styles as notificationCardStyles } from "@/styles/official/notificationCard.styles";
import { styles as notificationDetailStyles } from "@/styles/official/notificationDetailSheet.styles";
import { styles as notificationSheetStyles } from "@/styles/official/notificationSheet.styles";
import { styles as profileActionStyles } from "@/styles/official/profileActionCard.styles";
import { styles as recentStyles } from "@/styles/official/recentLocations.styles";

type IconComponent = ComponentType<SvgProps>;

const navItems: { name: string; Icon: IconComponent }[] = [
  { name: "Home", Icon: HomeIcon },
  { name: "Map", Icon: MapIcon },
  { name: "Search", Icon: SearchIcon },
  { name: "Categories", Icon: CategoriesIcon },
  { name: "Profile", Icon: ProfileIcon },
];

export function OfficialBottomNavigation({
  activeItem,
  hidden = false,
  onSelect,
}: {
  activeItem: string;
  hidden?: boolean;
  onSelect?: (name: string) => void;
}) {
  const [keyboardVisible, setKeyboardVisible] = useState(() => Keyboard.isVisible());

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardVisible(false));
    setKeyboardVisible(Keyboard.isVisible());
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (hidden || keyboardVisible) {
    return null;
  }

  return (
    <View style={bottomNavStyles.edge}>
      <SafeAreaView edges={["bottom"]} style={bottomNavStyles.bar}>
        <View style={bottomNavStyles.row}>
          {navItems.map(({ name, Icon }) => {
            const selected = activeItem === name;
            return (
              <Pressable
                key={name}
                accessibilityRole="button"
                accessibilityLabel={name}
                accessibilityState={{ selected }}
                onPress={() => onSelect?.(name)}
                style={({ pressed }) => [
                  bottomNavStyles.item,
                  pressed && bottomNavStyles.pressed,
                ]}
              >
                <Icon
                  width={45}
                  height={40}
                  color={selected ? "#A42330" : "#6C757D"}
                  accessible={false}
                />
                <Text
                  style={[
                    bottomNavStyles.label,
                    bottomNavStyles.font,
                    selected && bottomNavStyles.active,
                  ]}
                >
                  {name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
}

export type OfficialRecentItem = {
  id?: string;
  image: ImageSource | number;
  name: string;
  time: string;
};

export function OfficialRecentLocations({
  items,
  onSelect,
  query = "",
}: {
  items: OfficialRecentItem[];
  onSelect?: (item: OfficialRecentItem) => void;
  query?: string;
}) {
  const [pageWidth, setPageWidth] = useState(0);
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const pages: OfficialRecentItem[][] = [];
  for (let index = 0; index < filtered.length; index += 3) {
    pages.push(filtered.slice(index, index + 3));
  }

  return (
    <View onLayout={(event) => setPageWidth(event.nativeEvent.layout.width)}>
      {filtered.length === 0 ? (
        <View style={recentStyles.empty}>
          <Text style={recentStyles.emptyText}>
            {query.trim() ? "No matching locations." : "No recently viewed locations yet."}
          </Text>
        </View>
      ) : (
        pageWidth > 0 && (
          <ScrollView
            key={`${pageWidth}-${query}`}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={pages.length > 1}
            scrollEnabled={pages.length > 1}
            keyboardShouldPersistTaps="handled"
          >
            {pages.map((page, pageIndex) => (
              <View key={pageIndex} style={[recentStyles.page, { width: pageWidth }]}>
                {Array.from({ length: 3 }, (_, slot) => {
                  const item = page[slot];
                  if (!item) {
                    return <View key={`empty-${slot}`} style={recentStyles.slot} />;
                  }

                  return (
                    <Pressable
                      key={item.id ?? item.name}
                      accessibilityRole="button"
                      accessibilityLabel={`View ${item.name}`}
                      onPress={() => onSelect?.(item)}
                      style={({ pressed }) => [
                        recentStyles.card,
                        pressed && recentStyles.pressed,
                      ]}
                    >
                      <Image source={item.image} style={recentStyles.photo} contentFit="cover" />
                      <View style={recentStyles.timeRow}>
                        <DateIcon width={15} height={15} accessible={false} />
                        <Text style={recentStyles.time}>{item.time}</Text>
                      </View>
                      <View style={recentStyles.footer}>
                        <Text style={recentStyles.name}>{item.name}</Text>
                        <Arrow width={18} height={22} color="#AF2532" accessible={false} />
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </ScrollView>
        )
      )}
    </View>
  );
}

export type OfficialLocationItem = {
  category: string;
  floors?: number | string;
  id?: string;
  image: ImageSource | number;
  name: string;
  time?: string;
};

const categoryColors: Record<string, string> = {
  Academic: "#AF2532",
  Facilities: "#1EAB58",
  "Other Buildings": "#FA5D0E",
};

export function OfficialLocationCard({
  item,
  onPress,
  variant = "search",
}: {
  item: OfficialLocationItem;
  onPress?: (item: OfficialLocationItem) => void;
  variant?: "search" | "history";
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.category}`}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [locationCardStyles.card, pressed && locationCardStyles.pressed]}
    >
      <Image source={item.image} style={locationCardStyles.photo} contentFit="cover" />
      <View style={locationCardStyles.copy}>
        <Text style={[locationCardStyles.name, locationCardStyles.nameFont]}>{item.name}</Text>
        <View style={locationCardStyles.details}>
          <Text
            style={[
              locationCardStyles.detail,
              locationCardStyles.detailFont,
              { color: categoryColors[item.category] || "#6C757D" },
              variant === "history" && locationCardStyles.badge,
              variant === "history" && {
                backgroundColor: categoryColors[item.category] || "#6C757D",
              },
            ]}
          >
            {item.category}
          </Text>
          {variant !== "history" && item.floors ? (
            <Text style={[locationCardStyles.detail, locationCardStyles.detailFont]}>
              {"\u2022"} Floors: {item.floors}
            </Text>
          ) : null}
        </View>
        {variant === "history" ? (
          <Text style={[locationCardStyles.time, locationCardStyles.detailFont]}>
            {item.time}
          </Text>
        ) : null}
      </View>
      <Arrow width={21} height={25} color="#6C757D" accessible={false} />
    </Pressable>
  );
}

export type OfficialCategoryItem = {
  color: string;
  count: number;
  id: string;
  image: ImageSource | number;
  name: string;
};

export function OfficialCategoryCard({
  Icon,
  item,
  onPress,
}: {
  Icon: IconComponent;
  item: OfficialCategoryItem;
  onPress?: (item: OfficialCategoryItem) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.name}, ${item.count} buildings`}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        categoryCardStyles.card,
        { backgroundColor: item.color },
        pressed && categoryCardStyles.pressed,
      ]}
    >
      <View style={categoryCardStyles.details}>
        <Icon width={50} height={50} accessible={false} />
        <Text style={[categoryCardStyles.name, categoryCardStyles.nameFont]}>{item.name}</Text>
        <Text style={[categoryCardStyles.count, categoryCardStyles.countFont]}>
          {item.count} {item.count === 1 ? "building" : "buildings"}
        </Text>
      </View>
      <Image source={item.image} style={categoryCardStyles.photo} contentFit="cover" />
    </Pressable>
  );
}

export function OfficialProfileActionCard({
  Icon,
  description,
  onPress,
  title,
}: {
  Icon: IconComponent;
  description: string;
  onPress?: () => void;
  title: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
      onPress={onPress}
      style={({ pressed }) => [profileActionStyles.card, pressed && profileActionStyles.pressed]}
    >
      <Icon width={65} height={64} accessible={false} />
      <View style={profileActionStyles.copy}>
        <Text style={[profileActionStyles.title, profileActionStyles.font]}>{title}</Text>
        <Text style={[profileActionStyles.description, profileActionStyles.font]}>
          {description}
        </Text>
      </View>
      <Arrow width={21} height={25} color="#6C757D" accessible={false} />
    </Pressable>
  );
}

export type OfficialNotificationItem = {
  buildingName?: string;
  id: string;
  locationName?: string;
  message: string;
  time: string;
  title: string;
};

export function OfficialNotificationCard({
  item,
  onPress,
}: {
  item: OfficialNotificationItem;
  onPress?: (item: OfficialNotificationItem) => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.title}. ${item.message}. ${item.time}`}
      onPress={() => onPress?.(item)}
      style={({ pressed }) => [
        notificationCardStyles.card,
        pressed && notificationCardStyles.pressed,
      ]}
    >
      <View style={notificationCardStyles.copy}>
        <Text style={[notificationCardStyles.title, notificationCardStyles.titleFont]}>
          {item.title}
        </Text>
        <Text style={[notificationCardStyles.message, notificationCardStyles.regularFont]}>
          {item.message}
        </Text>
        <Text style={[notificationCardStyles.time, notificationCardStyles.regularFont]}>
          {item.time}
        </Text>
      </View>
      <Arrow width={21} height={25} color="#B6B8BA" accessible={false} />
    </Pressable>
  );
}

export function OfficialNotificationSheet({
  items,
  onClose,
  onClosed,
  onSelect,
  onViewAll,
  visible,
}: {
  items: OfficialNotificationItem[];
  onClose: () => void;
  onClosed?: () => void;
  onSelect?: (item: OfficialNotificationItem) => void;
  onViewAll?: () => void;
  visible: boolean;
}) {
  const [mounted, setMounted] = useState(visible);
  const progress = useRef(new Animated.Value(0)).current;
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      setMounted(true);
    }

    const animation = Animated.timing(progress, {
      toValue: visible ? 1 : 0,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && !visible) {
        setMounted(false);
        onClosed?.();
      }
    });

    return () => animation.stop();
  }, [visible, progress, onClosed]);

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={notificationSheetStyles.overlay}>
        <Animated.View style={[notificationSheetStyles.backdrop, { opacity: progress }]}>
          <Pressable
            style={notificationSheetStyles.outside}
            accessibilityRole="button"
            accessibilityLabel="Close notifications"
            onPress={onClose}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            notificationSheetStyles.sheet,
            {
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View pointerEvents="none" style={notificationSheetStyles.background}>
            <NotificationSheetBackground width="100%" height="100%" preserveAspectRatio="none" />
          </View>
          <View style={notificationSheetStyles.header}>
            <Text accessibilityRole="header" style={notificationSheetStyles.heading}>
              Notifications
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
              onPress={onClose}
              style={({ pressed }) => [
                notificationSheetStyles.closeButton,
                pressed && notificationSheetStyles.pressed,
              ]}
            >
              <CloseIcon width={28} height={28} accessible={false} />
            </Pressable>
          </View>
          <FlatList
            style={notificationSheetStyles.list}
            contentContainerStyle={notificationSheetStyles.listContent}
            data={items}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <OfficialNotificationCard item={item} onPress={onSelect} />
            )}
            ItemSeparatorComponent={() => <View style={notificationSheetStyles.separator} />}
            ListEmptyComponent={<Text style={notificationSheetStyles.empty}>No notifications yet.</Text>}
          />
          <View
            style={[
              notificationSheetStyles.footer,
              { paddingBottom: Math.max(insets.bottom, 12) },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              onPress={onViewAll}
              style={({ pressed }) => [
                notificationSheetStyles.button,
                pressed && notificationSheetStyles.pressed,
              ]}
            >
              <Text style={[notificationSheetStyles.buttonText, notificationSheetStyles.buttonFont]}>
                View all Notifications
              </Text>
            </Pressable>
            <View style={notificationSheetStyles.waveSpace} />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

export function OfficialNotificationDetailSheet({
  item,
  onClosed,
}: {
  item: OfficialNotificationItem;
  onClosed: () => void;
}) {
  const progress = useRef(new Animated.Value(0)).current;
  const [closing, setClosing] = useState(false);
  const { height } = useWindowDimensions();
  const closedCallback = useRef(onClosed);
  closedCallback.current = onClosed;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: closing ? 0 : 1,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });

    animation.start(({ finished }) => {
      if (finished && closing) {
        closedCallback.current();
      }
    });

    return () => animation.stop();
  }, [closing, progress]);

  const close = () => setClosing(true);

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent onRequestClose={close}>
      <View style={notificationDetailStyles.overlay}>
        <Animated.View style={[notificationDetailStyles.backdrop, { opacity: progress }]}>
          <Pressable
            style={notificationDetailStyles.outside}
            accessibilityRole="button"
            accessibilityLabel="Close notification details"
            onPress={close}
          />
        </Animated.View>
        <Animated.View
          accessibilityViewIsModal
          style={[
            notificationDetailStyles.sheet,
            {
              transform: [
                {
                  translateY: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [height, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={notificationDetailStyles.background} pointerEvents="none">
            <NotificationDetailBackground width="100%" height="100%" preserveAspectRatio="none" />
          </View>
          <View style={notificationDetailStyles.closeRow}>
            <Pressable
              style={notificationDetailStyles.closeButton}
              onPress={close}
              accessibilityRole="button"
              accessibilityLabel="Close notification details"
            >
              <CloseIcon width={28} height={28} accessible={false} />
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={notificationDetailStyles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={notificationDetailStyles.announcement}>
              <Announcement
                width={52}
                height={44}
                style={notificationDetailStyles.announcementIcon}
              />
            </View>
            <Text style={[notificationDetailStyles.title, notificationDetailStyles.titleFont]}>
              {item.title}
            </Text>
            <Text style={[notificationDetailStyles.message, notificationDetailStyles.regularFont]}>
              {item.message}
            </Text>
            <View style={notificationDetailStyles.details}>
              <View style={notificationDetailStyles.row}>
                <Building width={43} height={40} accessible={false} />
                <View style={notificationDetailStyles.copy}>
                  <Text style={[notificationDetailStyles.building, notificationDetailStyles.regularFont]}>
                    {item.buildingName ?? "UMVC Campus"}
                  </Text>
                  <Text style={[notificationDetailStyles.location, notificationDetailStyles.regularFont]}>
                    {item.locationName ?? "Campus update"}
                  </Text>
                </View>
              </View>
              <View style={notificationDetailStyles.row}>
                <Calendar width={43} height={40} accessible={false} />
                <Text style={[notificationDetailStyles.time, notificationDetailStyles.regularFont]}>
                  {item.time}
                </Text>
              </View>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={close}
              style={({ pressed }) => [
                notificationDetailStyles.button,
                pressed && notificationDetailStyles.pressed,
              ]}
            >
              <Text style={[notificationDetailStyles.buttonText, notificationDetailStyles.buttonFont]}>
                Got it
              </Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
