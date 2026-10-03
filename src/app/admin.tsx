import { useEffect, useMemo, useState, type ComponentType } from "react";
import { useFonts } from "expo-font";
import { Image } from "expo-image";
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

import DashboardAcademicIcon from "../../assets/admin/dashboard-academic.svg";
import DashboardAdminIcon from "../../assets/admin/dashboard-admin.svg";
import DashboardBuildingIcon from "../../assets/admin/dashboard-building.svg";
import DashboardEditIcon from "../../assets/admin/dashboard-edit.svg";
import DashboardFacilityIcon from "../../assets/admin/dashboard-facility.svg";
import DashboardWaves from "../../assets/admin/dashboard-waves.svg";
import EmailIcon from "../../assets/admin/email.svg";
import EyeIcon from "../../assets/admin/eye.svg";
import LockIcon from "../../assets/admin/lock.svg";
import Waves from "../../assets/admin/waves.svg";
import FilterIcon from "../../assets/icons/map-filter.svg";
import SearchIcon from "../../assets/icons/nav-search.svg";
import { styles } from "../styles/admin.styles";
import { adminAssets } from "../constants/adminAssets";
import {
  campusCategories,
  getBuildingRooms,
  type BuildingRoom,
} from "../data/campusData";
import type { CampusNotification } from "../data/notifications";
import {
  loginAdmin,
  logoutAdmin,
  watchFirebaseAdminSession,
  type AdminSession,
} from "../services/adminAuth";
import { loadCampusData } from "../services/campusDataStore";
import { subscribeToNotifications } from "../services/notificationStore";
import {
  adminLocationToFirestore,
  buildingRoomToFirestore,
  canUseFirestore,
  createNotification,
  updateLocation,
  updateRoom,
} from "../services/firestoreData";
import {
  getAdminLocationKey,
  initialAdminLocations,
  saveAdminLocations,
  type AdminLocation,
} from "../utils/adminLocations";
import {
  applyAdminRoomEdits,
  getAdminRoomKey,
  saveAdminRoomEdits,
} from "../utils/adminRooms";
import {
  getAdminStats,
  getAdminTableContentWidth,
  getLocationNotificationCopy,
  toEditableText,
} from "../utils/adminDashboard";

const categoryOptions = ["All Categories", ...campusCategories];
const notificationCategoryOptions: CampusNotification["category"][] = [
  "announcement",
  "building",
  "room",
  "maintenance",
];

type AdminSvgIcon = ComponentType<any>;

type NotificationDraft = {
  category: CampusNotification["category"];
  message: string;
  relatedLocationKey: string;
  title: string;
};

type SuccessDialogState = {
  message: string;
  title: string;
};

type AdminView = "locations" | "activity";

const emptyNotificationDraft: NotificationDraft = {
  category: "announcement",
  message: "",
  relatedLocationKey: "",
  title: "",
};

export default function AdminScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 980;
  const isNarrow = width < 720;
  const tableContentWidth = getAdminTableContentWidth({
    isCompact,
    isNarrow,
    width,
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminSession, setAdminSession] = useState<AdminSession | null>(
    null,
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [locations, setLocations] = useState(initialAdminLocations);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [editingLocation, setEditingLocation] =
    useState<AdminLocation | null>(null);
  const [roomLocation, setRoomLocation] = useState<AdminLocation | null>(null);
  const [editingRoom, setEditingRoom] = useState<BuildingRoom | null>(null);
  const [roomEdits, setRoomEdits] = useState<Record<string, BuildingRoom>>(
    {},
  );
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [saveMessage, setSaveMessage] = useState("");
  const [successDialog, setSuccessDialog] =
    useState<SuccessDialogState | null>(null);
  const [isNotificationComposerOpen, setIsNotificationComposerOpen] =
    useState(false);
  const [notificationDraft, setNotificationDraft] =
    useState<NotificationDraft>(emptyNotificationDraft);
  const [adminView, setAdminView] = useState<AdminView>("locations");
  const [publishedNotifications, setPublishedNotifications] = useState<
    CampusNotification[]
  >([]);
  const [fontsLoaded] = useFonts({
    AdminRegular: require("../../assets/fonts/afacad-flux-latin-400-normal.ttf"),
    AdminMedium: require("../../assets/fonts/afacad-flux-latin-500-normal.ttf"),
    AdminBold: require("../../assets/fonts/afacad-flux-latin-700-normal.ttf"),
    AdminBrand: require("../../assets/fonts/Angkor-Regular.ttf"),
    DashboardRegular: require("../../assets/fonts/afacad-flux-latin-400-normal.ttf"),
    DashboardMedium: require("../../assets/fonts/afacad-flux-latin-500-normal.ttf"),
    DashboardBrand: require("../../assets/fonts/Angkor-Regular.ttf"),
  });

  useEffect(() => {
    let isActive = true;

    const loadAdminData = async () => {
      const campusData = await loadCampusData();

      if (isActive) {
        setLocations(campusData.locations);
        setRoomEdits(campusData.roomEdits);
        setSaveMessage("");
        setIsLoadingData(false);
      }
    };

    void loadAdminData();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") {
      return;
    }

    return watchFirebaseAdminSession((session) => {
      setAdminSession(session);
      setIsLoggedIn(Boolean(session));
    });
  }, []);

  useEffect(
    () =>
      subscribeToNotifications((nextNotifications) => {
        setPublishedNotifications(nextNotifications);
      }),
    [],
  );

  const stats = useMemo(() => getAdminStats(locations), [locations]);
  const activityStats = useMemo(
    () => ({
      mapUpdates: publishedNotifications.filter((notification) =>
        ["building", "room", "maintenance"].includes(notification.category),
      ).length,
      published: publishedNotifications.length,
    }),
    [publishedNotifications],
  );

  const filteredLocations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return locations.filter((location) => {
      const matchesSearch =
        !query ||
        location.name.toLowerCase().includes(query) ||
        location.category.toLowerCase().includes(query) ||
        location.type.toLowerCase().includes(query) ||
        location.aliases?.some((alias) =>
          alias.toLowerCase().includes(query),
        );

      const matchesCategory =
        selectedCategory === "All Categories" ||
        location.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [locations, searchQuery, selectedCategory]);

  const syncLocationToFirestore = async (location: AdminLocation) => {
    if (!canUseFirestore()) {
      setSaveMessage("Saved locally. Firestore is not configured yet.");
      setSuccessDialog({
        title: "Changes Saved",
        message: `${location.name} was saved locally.`,
      });
      return;
    }

    try {
      await updateLocation(
        adminLocationToFirestore(location),
        adminSession?.uid ?? "admin",
      );
      const notificationCopy = getLocationNotificationCopy(location);

      await createNotification({
        id: `location-${location.type}-${location.id}`,
        title: notificationCopy.title,
        message: notificationCopy.message,
        timeLabel: "Recently",
        category: notificationCopy.category,
        locationName: location.name,
        locationSubtitle: location.category,
        relatedFeatureId: location.id,
        relatedFeatureType: location.type,
      });
      setSaveMessage("Saved locally and synced to Firestore.");
      setSuccessDialog({
        title: "Changes Saved",
        message: `${location.name} was successfully updated.`,
      });
    } catch (error) {
      console.warn("Failed to sync location to Firestore", error);
      setSaveMessage("Saved locally, but Firestore sync failed.");
    }
  };

  const saveEditedLocation = () => {
    if (!editingLocation) {
      return;
    }

    const nextLocations = locations.map((location) =>
      getAdminLocationKey(location) ===
      getAdminLocationKey(editingLocation)
        ? editingLocation
        : location,
    );

    setLocations(nextLocations);
    setEditingLocation(null);
    setSaveMessage("Saving locally and syncing to Firestore...");
    void saveAdminLocations(nextLocations);
    void syncLocationToFirestore(editingLocation);
  };

  const syncRoomToFirestore = async (room: BuildingRoom) => {
    if (!canUseFirestore()) {
      setSaveMessage("Room saved locally. Firestore is not configured yet.");
      setSuccessDialog({
        title: "Room Saved",
        message: `${room.name} was saved locally.`,
      });
      return;
    }

    try {
      await updateRoom(buildingRoomToFirestore(room), adminSession?.uid ?? "admin");
      await createNotification({
        id: `room-${room.buildingId}-${room.id}`,
        title: "Room Update",
        message: `${room.name} information is now updated.`,
        timeLabel: "Recently",
        category: "room",
        locationName: room.name,
        locationSubtitle: room.floor,
        relatedFeatureId: room.id,
        relatedFeatureType: room.type,
      });
      setSaveMessage("Room saved locally and synced to Firestore.");
      setSuccessDialog({
        title: "Room Saved",
        message: `${room.name} was successfully updated.`,
      });
    } catch (error) {
      console.warn("Failed to sync room to Firestore", error);
      setSaveMessage("Room saved locally, but Firestore sync failed.");
    }
  };

  const saveEditedRoom = () => {
    if (!editingRoom) {
      return;
    }

    const nextRoomEdits = {
      ...roomEdits,
      [getAdminRoomKey(editingRoom)]: editingRoom,
    };

    setRoomEdits(nextRoomEdits);
    void saveAdminRoomEdits(nextRoomEdits);
    setEditingRoom(null);
    setSaveMessage("Saving room locally and syncing to Firestore...");
    void syncRoomToFirestore(editingRoom);
  };

  const publishManualNotification = async () => {
    const title = notificationDraft.title.trim();
    const message = notificationDraft.message.trim();

    if (!title || !message) {
      setSaveMessage("Notification title and message are required.");
      return;
    }

    if (!canUseFirestore()) {
      setSaveMessage("Notification was not sent. Firestore is not configured.");
      return;
    }

    const relatedLocation = locations.find(
      (location) =>
        `${location.type}:${location.id}` ===
        notificationDraft.relatedLocationKey,
    );

    setSaveMessage("Publishing notification...");

    try {
      await createNotification({
        id: `manual-${notificationDraft.category}-${Date.now()}`,
        category: notificationDraft.category,
        createdBy: adminSession?.uid ?? "admin",
        locationName: relatedLocation?.name,
        locationSubtitle: relatedLocation?.category,
        message,
        relatedFeatureId: relatedLocation?.id,
        relatedFeatureType: relatedLocation?.type,
        timeLabel: "Recently",
        title,
      });

      setNotificationDraft(emptyNotificationDraft);
      setIsNotificationComposerOpen(false);
      setSaveMessage("Notification published to users.");
      setSuccessDialog({
        title: "Notification Published",
        message: "Your notification was successfully sent to users.",
      });
    } catch (error) {
      console.warn("Failed to publish manual notification", error);
      setSaveMessage("Notification publish failed. Check Firestore rules.");
    }
  };

  const handleAdminLogin = async () => {
    setIsLoginLoading(true);
    setLoginError("");

    const result = await loginAdmin(email, password);

    if (result.ok) {
      setAdminSession(result.session);
      setIsLoggedIn(true);
      setPassword("");
    } else {
      setLoginError(result.message);
    }

    setIsLoginLoading(false);
  };

  const handleAdminLogout = async () => {
    await logoutAdmin();
    setAdminSession(null);
    setIsLoggedIn(false);
  };

  if (Platform.OS !== "web") {
    return (
      <View style={styles.webOnlyContainer}>
        <Text style={styles.webOnlyTitle}>Admin is web only</Text>
        <Text style={styles.webOnlyText}>
          Open /admin in the web app to manage campus locations.
        </Text>
      </View>
    );
  }

  if (!fontsLoaded) {
    return (
      <View style={styles.webOnlyContainer}>
        <Text style={styles.webOnlyTitle}>Loading admin...</Text>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <ScrollView
        contentContainerStyle={[
          styles.loginScrollContent,
          isCompact && styles.loginScrollContentCompact,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.loginContainer,
            isCompact && styles.loginContainerCompact,
            isNarrow && styles.loginContainerNarrow,
          ]}
        >
          <View
            style={[
              styles.loginBrandPanel,
              isCompact && styles.loginBrandPanelCompact,
              isNarrow && styles.loginBrandPanelNarrow,
            ]}
          >
            <Image
              contentFit="cover"
              source={adminAssets.campus}
              style={styles.loginCampusImage}
            />
            <Image
              contentFit="cover"
              source={adminAssets.watermark}
              style={styles.loginWatermark}
            />
            <View
              style={[
                styles.loginTopDivider,
                isNarrow && styles.loginTopDividerNarrow,
              ]}
            >
              <View style={styles.loginDividerDot} />
              <View style={styles.loginDividerLine} />
              <Image source={adminAssets.plane} style={styles.loginPlane} />
              <View style={styles.loginDividerLine} />
              <View style={styles.loginDividerDot} />
            </View>

            <View
              style={[
                styles.loginBrandContent,
                isCompact && styles.loginBrandContentCompact,
                isNarrow && styles.loginBrandContentNarrow,
              ]}
            >
              <View style={styles.loginBrandRow}>
                <Image
                  contentFit="contain"
                  source={adminAssets.logo}
                  style={[
                    styles.loginLogoImage,
                    isNarrow && styles.loginLogoImageNarrow,
                  ]}
                />
                <View>
                  <Text
                    style={[
                      styles.loginBrandTitle,
                      isNarrow && styles.loginBrandTitleNarrow,
                    ]}
                  >
                    UMVC
                  </Text>
                  <Text
                    style={[
                      styles.loginBrandTitle,
                      styles.loginBrandGold,
                      isNarrow && styles.loginBrandTitleNarrow,
                    ]}
                  >
                    FIND
                  </Text>
                </View>
              </View>
              <View
                style={[
                  styles.loginTaglineDivider,
                  isNarrow && styles.loginTaglineDividerNarrow,
                ]}
              />
              <View
                style={[
                  styles.loginTaglineRow,
                  isNarrow && styles.loginTaglineRowNarrow,
                ]}
              >
                <Text
                  style={[
                    styles.loginTagline,
                    isNarrow && styles.loginTaglineNarrow,
                  ]}
                >
                  Manage
                </Text>
                <View style={styles.loginDividerDot} />
                <Text
                  style={[
                    styles.loginTagline,
                    isNarrow && styles.loginTaglineNarrow,
                  ]}
                >
                  Locate
                </Text>
                <View style={styles.loginDividerDot} />
                <Text
                  style={[
                    styles.loginTagline,
                    isNarrow && styles.loginTaglineNarrow,
                  ]}
                >
                  Explore
                </Text>
              </View>
            </View>

            <View style={styles.loginWaves} pointerEvents="none">
              <Waves width="100%" height="100%" preserveAspectRatio="none" />
            </View>
          </View>

          <View
            style={[
              styles.loginPanel,
              isCompact && styles.loginPanelCompact,
              isNarrow && styles.loginPanelNarrow,
            ]}
          >
            <Image
              contentFit="cover"
              source={adminAssets.formBackground}
              style={styles.loginFormBackground}
            />
            <View
              style={[styles.loginForm, isNarrow && styles.loginFormNarrow]}
            >
              <Image
                contentFit="contain"
                source={adminAssets.adminAvatar}
                style={[
                  styles.adminAvatarImage,
                  isNarrow && styles.adminAvatarImageNarrow,
                ]}
              />
              <Text
                style={[styles.loginTitle, isNarrow && styles.loginTitleNarrow]}
              >
                Admin Login
              </Text>
              <Text
                style={[
                  styles.loginSubtitle,
                  isNarrow && styles.loginSubtitleNarrow,
                ]}
              >
                Access the administration panel
              </Text>

              <Text
                style={[styles.inputLabel, isNarrow && styles.inputLabelNarrow]}
              >
                Email / Admin
              </Text>
              <View
                style={[
                  styles.loginInputRow,
                  isNarrow && styles.loginInputRowNarrow,
                ]}
              >
                <EmailIcon width={18} height={18} />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="username"
                  onChangeText={setEmail}
                  placeholder="Email / Admin Username"
                  placeholderTextColor="#B5B7B9"
                  style={[
                    styles.loginInput,
                    isNarrow && styles.loginInputNarrow,
                  ]}
                  value={email}
                />
              </View>

              <Text
                style={[styles.inputLabel, isNarrow && styles.inputLabelNarrow]}
              >
                Password
              </Text>
              <View
                style={[
                  styles.loginInputRow,
                  isNarrow && styles.loginInputRowNarrow,
                ]}
              >
                <LockIcon width={18} height={18} />
                <TextInput
                  autoCapitalize="none"
                  autoComplete="current-password"
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#B5B7B9"
                  secureTextEntry={!showPassword}
                  style={[
                    styles.loginInput,
                    isNarrow && styles.loginInputNarrow,
                  ]}
                  value={password}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  accessibilityState={{ selected: showPassword }}
                  onPress={() => setShowPassword(!showPassword)}
                  style={({ hovered, pressed }: any) => [
                    styles.eyeButton,
                    isNarrow && styles.eyeButtonNarrow,
                    hovered && styles.iconButtonHover,
                    pressed && styles.buttonPressed,
                  ]}
                >
                  <EyeIcon width={18} height={18} />
                </Pressable>
              </View>

              {loginError ? (
                <Text
                  style={[
                    styles.loginError,
                    isNarrow && styles.loginErrorNarrow,
                  ]}
                >
                  {loginError}
                </Text>
              ) : null}

              <Pressable
                disabled={isLoginLoading}
                onPress={handleAdminLogin}
                style={({ hovered, pressed }: any) => [
                  styles.primaryButton,
                  isNarrow && styles.primaryButtonNarrow,
                  hovered && !isLoginLoading && styles.primaryButtonHover,
                  pressed && !isLoginLoading && styles.buttonPressed,
                  isLoginLoading && styles.primaryButtonDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    isNarrow && styles.primaryButtonTextNarrow,
                  ]}
                >
                  {isLoginLoading ? "Logging in..." : "Login"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.adminShell, isCompact && styles.adminShellCompact]}>
      <View style={[styles.sidebar, isCompact && styles.sidebarCompact]}>
        <Image
          contentFit="cover"
          source={adminAssets.campus}
          style={styles.sidebarCampusImage}
        />
        <View style={styles.sidebarOverlay} />
        <View style={styles.sidebarLogoRow}>
          <Image
            contentFit="contain"
            source={adminAssets.logo}
            style={styles.sidebarLogoImage}
          />
          <View>
            <Text style={styles.sidebarBrand}>UMVC</Text>
            <Text style={[styles.sidebarBrand, styles.sidebarBrandGold]}>
              FIND
            </Text>
          </View>
        </View>

        <View style={styles.sidebarNav}>
          {[
            { key: "locations", label: "Location Management" },
            { key: "activity", label: "Activity" },
          ].map((item) => (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              accessibilityState={{ selected: adminView === item.key }}
              onPress={() => setAdminView(item.key as AdminView)}
              style={({ hovered, pressed }: any) => [
                styles.sidebarNavItem,
                hovered && styles.sidebarNavItemHover,
                adminView === item.key && styles.sidebarNavItemActive,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text
                style={[
                  styles.sidebarNavText,
                  adminView === item.key && styles.sidebarNavTextActive,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.sidebarWaves} pointerEvents="none">
          <DashboardWaves
            width="100%"
            height="100%"
            preserveAspectRatio="none"
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.adminContent,
          isNarrow && styles.adminContentNarrow,
        ]}
      >
        <View style={[styles.adminHeader, isNarrow && styles.adminHeaderNarrow]}>
          <View style={[styles.headingGroup, isNarrow && styles.headingGroupNarrow]}>
            <View style={styles.headingIconCircle}>
              {adminView === "locations" ? (
                <DashboardBuildingIcon width={34} height={34} />
              ) : (
                <DashboardFacilityIcon width={34} height={34} />
              )}
            </View>
            <View>
              <Text style={styles.pageTitle}>
                {adminView === "locations"
                  ? "Location Management"
                  : "Activity"}
              </Text>
              <Text style={styles.pageSubtitle}>
                {adminView === "locations"
                  ? "Manage campus buildings, rooms, and location details."
                  : "Review published notifications and map data updates."}
              </Text>
              {saveMessage ? (
                <Text accessibilityLiveRegion="polite" style={styles.saveMessage}>
                  {saveMessage}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.adminUserCard, isNarrow && styles.adminUserCardNarrow]}>
            <Image
              contentFit="cover"
              source={adminAssets.dashboardUser}
              style={styles.userAvatar}
            />
            <View>
              <Text style={styles.userName}>
                {adminSession?.email ?? "Admin User"}
              </Text>
              <Text style={styles.userRole}>
                {adminSession?.source === "firebase"
                  ? "Firebase Administrator"
                  : "Prototype Administrator"}
              </Text>
            </View>
            <Pressable
              style={({ hovered, pressed }: any) => [
                styles.resetButton,
                hovered && styles.outlineButtonHover,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => setIsNotificationComposerOpen(true)}
            >
              <Text style={styles.resetButtonText}>New Notification</Text>
            </Pressable>
            <Pressable
              style={({ hovered, pressed }: any) => [
                styles.logoutButton,
                hovered && styles.logoutButtonHover,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleAdminLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        {adminView === "locations" ? (
          <>
            <View style={styles.statsGrid}>
              <StatCard
                Icon={DashboardBuildingIcon}
                label="Total Buildings"
                value={stats.totalBuildings}
              />
              <StatCard
                Icon={DashboardAcademicIcon}
                label="Academic Buildings"
                value={stats.academicBuildings}
              />
              <StatCard
                Icon={DashboardAdminIcon}
                label="Admin Buildings"
                value={stats.adminBuildings}
              />
              <StatCard
                Icon={DashboardFacilityIcon}
                label="Facilities and Others"
                value={stats.facilities}
              />
            </View>

            <View style={styles.toolbar}>
              <View style={styles.searchBox}>
                <SearchIcon width={22} height={22} />
                <TextInput
                  autoCapitalize="none"
                  onChangeText={setSearchQuery}
                  placeholder="Search building or room..."
                  placeholderTextColor="#9ca3af"
                  style={styles.searchInput}
                  value={searchQuery}
                />
              </View>

              <ScrollView
                contentContainerStyle={styles.filterList}
                horizontal
                showsHorizontalScrollIndicator={false}
              >
                {categoryOptions.map((category) => (
                  <Pressable
                    key={category}
                    style={({ hovered, pressed }: any) => [
                      styles.filterChip,
                      hovered && styles.filterChipHover,
                      selectedCategory === category && styles.filterChipActive,
                      hovered &&
                        selectedCategory === category &&
                        styles.filterChipActiveHover,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    {category === selectedCategory ? (
                      <FilterIcon width={14} height={14} color="#ffffff" />
                    ) : null}
                    <Text
                      style={[
                        styles.filterChipText,
                        selectedCategory === category &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.tableCard}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={[styles.tableInner, { width: tableContentWidth }]}>
                  <View style={[styles.tableRow, styles.tableHeader]}>
                    <Text style={[styles.tableCell, styles.nameCell]}>
                      Building Name
                    </Text>
                    <Text style={styles.tableCell}>Category</Text>
                    <Text style={styles.tableCell}>Floors</Text>
                    <Text style={styles.tableCell}>Status</Text>
                    <Text style={styles.actionsCell}>Actions</Text>
                  </View>

                  {isLoadingData ? (
                    <View style={styles.loadingRow}>
                      <Text style={styles.loadingText}>Loading admin data...</Text>
                    </View>
                  ) : (
                    filteredLocations.map((location) => (
                      <View
                        key={`${location.type}-${location.id}`}
                        style={styles.tableRow}
                      >
                        <View style={styles.nameCell}>
                          <Text style={styles.locationName}>{location.name}</Text>
                          <Text style={styles.locationDescription} numberOfLines={1}>
                            {location.description ?? location.nearby ?? location.type}
                          </Text>
                        </View>
                        <Text style={styles.tableCell}>{location.category}</Text>
                        <Text style={styles.tableCell}>
                          {toEditableText(location.floors || location.floor) || "-"}
                        </Text>
                        <Text style={styles.tableCell}>{location.status}</Text>
                        <View style={styles.actionsCell}>
                          {location.type === "building" ? (
                            <Pressable
                              style={({ hovered, pressed }: any) => [
                                styles.secondaryActionButton,
                                hovered && styles.outlineButtonHover,
                                pressed && styles.buttonPressed,
                              ]}
                              onPress={() => setRoomLocation(location)}
                            >
                              <Text style={styles.secondaryActionText}>Rooms</Text>
                            </Pressable>
                          ) : null}
                          <Pressable
                            style={({ hovered, pressed }: any) => [
                              styles.editButton,
                              hovered && styles.editButtonHover,
                              pressed && styles.buttonPressed,
                            ]}
                            onPress={() => setEditingLocation(location)}
                          >
                            <DashboardEditIcon width={22} height={22} />
                          </Pressable>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            </View>
          </>
        ) : (
          <AdminActivityView
            mapUpdates={activityStats.mapUpdates}
            notifications={publishedNotifications}
            publishedCount={activityStats.published}
          />
        )}
      </ScrollView>

      <EditLocationModal
        location={editingLocation}
        onChange={setEditingLocation}
        onClose={() => setEditingLocation(null)}
        onOpenRooms={(location) => {
          setEditingLocation(null);
          setRoomLocation(location);
        }}
        onSave={saveEditedLocation}
      />

      <RoomsModal
        location={roomLocation}
        onEditRoom={setEditingRoom}
        roomEdits={roomEdits}
        onClose={() => setRoomLocation(null)}
      />

      <EditRoomModal
        room={editingRoom}
        onChange={setEditingRoom}
        onClose={() => setEditingRoom(null)}
        onSave={saveEditedRoom}
      />

      <NotificationComposerModal
        draft={notificationDraft}
        locations={locations}
        onChange={setNotificationDraft}
        onClose={() => setIsNotificationComposerOpen(false)}
        onPublish={publishManualNotification}
        visible={isNotificationComposerOpen}
      />

      <SuccessDialog
        state={successDialog}
        onClose={() => setSuccessDialog(null)}
      />
    </View>
  );
}

function StatCard({
  Icon,
  label,
  value,
}: {
  Icon?: AdminSvgIcon;
  label: string;
  value: number;
}) {
  return (
    <View style={styles.statCard}>
      <View style={styles.statIconWrap}>
        {Icon ? <Icon width={34} height={34} /> : null}
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </View>
  );
}

function AdminActivityView({
  mapUpdates,
  notifications,
  publishedCount,
}: {
  mapUpdates: number;
  notifications: CampusNotification[];
  publishedCount: number;
}) {
  return (
    <View>
      <View style={styles.statsGrid}>
        <StatCard
          Icon={DashboardFacilityIcon}
          label="Published Notifications"
          value={publishedCount}
        />
        <StatCard
          Icon={DashboardBuildingIcon}
          label="Map Data Updates"
          value={mapUpdates}
        />
      </View>

      <View style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <View>
            <Text style={styles.activityTitle}>Notification and Map Activity</Text>
            <Text style={styles.activitySubtitle}>
              Updates shown here are the same posts users can view from Home.
            </Text>
          </View>
        </View>

        {notifications.length ? (
          notifications.map((notification) => {
            const isMapUpdate = ["building", "room", "maintenance"].includes(
              notification.category,
            );

            return (
              <View key={notification.id} style={styles.activityItem}>
                <View
                  style={[
                    styles.activityMarker,
                    isMapUpdate && styles.activityMarkerMap,
                  ]}
                />
                <View style={styles.activityBody}>
                  <View style={styles.activityMetaRow}>
                    <Text
                      style={[
                        styles.activityBadge,
                        isMapUpdate && styles.activityBadgeMap,
                      ]}
                    >
                      {isMapUpdate ? "Map Update" : "Notification"}
                    </Text>
                    <Text style={styles.activityTime}>
                      {notification.timeLabel}
                    </Text>
                  </View>
                  <Text style={styles.activityItemTitle}>
                    {notification.title}
                  </Text>
                  <Text style={styles.activityMessage}>
                    {notification.message}
                  </Text>
                  {notification.locationName ? (
                    <Text style={styles.activityLocation}>
                      {notification.locationName}
                      {notification.locationSubtitle
                        ? ` - ${notification.locationSubtitle}`
                        : ""}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.activityEmpty}>
            <Text style={styles.activityEmptyTitle}>No activity yet</Text>
            <Text style={styles.activityEmptyText}>
              Published notifications and map data edits will appear here.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

function EditLocationModal({
  location,
  onChange,
  onClose,
  onOpenRooms,
  onSave,
}: {
  location: AdminLocation | null;
  onChange: (location: AdminLocation | null) => void;
  onClose: () => void;
  onOpenRooms: (location: AdminLocation) => void;
  onSave: () => void;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;

  return (
    <Modal transparent visible={Boolean(location)} animationType="fade">
      <View style={[styles.modalOverlay, isNarrow && styles.modalOverlayNarrow]}>
        {location ? (
          <View style={[styles.editModal, isNarrow && styles.modalNarrow]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Location</Text>
              <Pressable
                onPress={onClose}
                style={({ hovered, pressed }: any) => [
                  styles.modalCloseButton,
                  hovered && styles.iconButtonHover,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalClose}>x</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.editScrollContent}
              showsVerticalScrollIndicator={false}
              style={styles.editScroll}
            >
              <View style={styles.editFormColumn}>
                <View style={styles.compactFormGrid}>
                  <AdminTextField
                    compact
                    label="Building Name"
                    value={location.name}
                    onChangeText={(name) => onChange({ ...location, name })}
                  />
                  <AdminTextField
                    compact
                    label="Category"
                    value={location.category}
                    onChangeText={(category) =>
                      onChange({
                        ...location,
                        category: category as never,
                      })
                    }
                  />
                  <AdminTextField
                    compact
                    label="Type"
                    value={location.type}
                    onChangeText={(type) =>
                      onChange({ ...location, type: type as never })
                    }
                  />
                  <AdminTextField
                    compact
                    label="Floors / Floor"
                    value={toEditableText(location.floors || location.floor)}
                    onChangeText={(value) =>
                      onChange({
                        ...location,
                        floor: value,
                        floors:
                          location.type === "building" && Number(value)
                            ? Number(value)
                            : location.floors,
                      })
                    }
                  />
                  <AdminTextField
                    compact
                    label="Status"
                    value={location.status}
                    onChangeText={(status) =>
                      onChange({
                        ...location,
                        status: status as AdminLocation["status"],
                      })
                    }
                  />
                  <View style={styles.statusButtonGroup}>
                    {(["Active", "Maintenance", "Hidden"] as const).map(
                      (status) => (
                        <Pressable
                          key={status}
                          style={({ hovered, pressed }: any) => [
                            styles.statusButton,
                            hovered && styles.statusButtonHover,
                            location.status === status &&
                              styles.statusButtonActive,
                            hovered &&
                              location.status === status &&
                              styles.statusButtonActiveHover,
                            pressed && styles.buttonPressed,
                          ]}
                          onPress={() =>
                            onChange({ ...location, status })
                          }
                        >
                          <Text
                            style={[
                              styles.statusButtonText,
                              location.status === status &&
                                styles.statusButtonTextActive,
                            ]}
                          >
                            {status}
                          </Text>
                        </Pressable>
                      ),
                    )}
                  </View>
                  <AdminTextField
                    compact
                    label="Nearby / Landmark"
                    value={location.nearby ?? ""}
                    onChangeText={(nearby) =>
                      onChange({ ...location, nearby })
                    }
                  />
                </View>

                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  multiline
                  onChangeText={(description) =>
                    onChange({ ...location, description })
                  }
                  placeholder="Location description"
                  style={[styles.input, styles.compactTextArea]}
                  value={location.description ?? ""}
                />

                <Text style={styles.inputLabel}>Directions</Text>
                <TextInput
                  multiline
                  onChangeText={(directions) =>
                    onChange({ ...location, directions })
                  }
                  placeholder="Directions shown to users"
                  style={[styles.input, styles.compactTextArea]}
                  value={location.directions ?? ""}
                />

                <AdminTextField
                  compact
                  label="Aliases / Search Keywords"
                  value={location.aliases?.join(", ") ?? ""}
                  onChangeText={(aliases) =>
                    onChange({
                      ...location,
                      aliases: aliases
                        .split(",")
                        .map((alias) => alias.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </View>
            </ScrollView>

            {location.type === "building" ? (
              <Pressable
                style={({ hovered, pressed }: any) => [
                  styles.manageRoomsRow,
                  hovered && styles.outlineButtonHover,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => onOpenRooms(location)}
              >
                <Text style={styles.manageRoomsText}>
                  Manage Floors and Rooms
                </Text>
                <Text style={styles.manageRoomsArrow}>{">"}</Text>
              </Pressable>
            ) : null}

            <View style={styles.modalFooter}>
              <Pressable
                style={({ hovered, pressed }: any) => [
                  styles.cancelButton,
                  hovered && styles.cancelButtonHover,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ hovered, pressed }: any) => [
                  styles.saveButton,
                  hovered && styles.saveButtonHover,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function AdminTextField({
  compact = false,
  label,
  value,
  onChangeText,
}: {
  compact?: boolean;
  label: string;
  value: string;
  onChangeText: (value: string) => void;
}) {
  return (
    <View style={compact ? styles.compactField : styles.field}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        onChangeText={onChangeText}
        placeholder={label}
        style={[styles.input, compact && styles.compactInput]}
        value={value}
      />
    </View>
  );
}

function RoomsModal({
  location,
  onEditRoom,
  roomEdits,
  onClose,
}: {
  location: AdminLocation | null;
  onEditRoom: (room: BuildingRoom) => void;
  roomEdits: Record<string, BuildingRoom>;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;
  const rooms = location
    ? applyAdminRoomEdits(getBuildingRooms(location.id), roomEdits)
    : [];
  const floors = Array.from(new Set(rooms.map((room) => room.floorNumber)));

  return (
    <Modal transparent visible={Boolean(location)} animationType="fade">
      <View style={[styles.modalOverlay, isNarrow && styles.modalOverlayNarrow]}>
        {location ? (
          <View style={[styles.roomsModal, isNarrow && styles.modalNarrow]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Floors and Rooms</Text>
                <Text style={styles.modalSubtitle}>{location.name}</Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ hovered, pressed }: any) => [
                  styles.modalCloseButton,
                  hovered && styles.iconButtonHover,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalClose}>x</Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.roomsScrollContent}
              showsVerticalScrollIndicator={false}
              style={styles.roomsScroll}
            >
              {floors.length ? (
                floors.map((floor) => (
                  <View key={floor} style={styles.floorGroup}>
                    <Text style={styles.floorTitle}>Floor {floor}</Text>
                    {rooms
                      .filter((room) => room.floorNumber === floor)
                      .map((room) => (
                        <View key={room.id} style={styles.roomRow}>
                          <Text style={styles.roomNumber}>{room.name}</Text>
                          <Text style={styles.roomType}>{room.type}</Text>
                          <Pressable
                            style={({ hovered, pressed }: any) => [
                              styles.smallEditButton,
                              hovered && styles.outlineButtonHover,
                              pressed && styles.buttonPressed,
                            ]}
                            onPress={() => onEditRoom(room)}
                          >
                            <Text style={styles.smallEditText}>Edit</Text>
                          </Pressable>
                        </View>
                      ))}
                  </View>
                ))
              ) : (
                <View style={styles.emptyRooms}>
                  <Text style={styles.emptyRoomsTitle}>No rooms added yet</Text>
                  <Text style={styles.emptyRoomsText}>
                    Room editing can be connected here after the admin data
                    model is finalized.
                  </Text>
                </View>
              )}
            </ScrollView>

            <Pressable
              style={({ hovered, pressed }: any) => [
                styles.saveButton,
                hovered && styles.saveButtonHover,
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.saveButtonText}>Done</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function EditRoomModal({
  room,
  onChange,
  onClose,
  onSave,
}: {
  room: BuildingRoom | null;
  onChange: (room: BuildingRoom | null) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;

  return (
    <Modal transparent visible={Boolean(room)} animationType="fade">
      <View style={[styles.modalOverlay, isNarrow && styles.modalOverlayNarrow]}>
        {room ? (
          <View style={[styles.roomEditModal, isNarrow && styles.modalNarrow]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Room</Text>
              <Pressable
                onPress={onClose}
                style={({ hovered, pressed }: any) => [
                  styles.modalCloseButton,
                  hovered && styles.iconButtonHover,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.modalClose}>x</Text>
              </Pressable>
            </View>

            <View style={styles.roomEditForm}>
              <View style={styles.roomEditFieldRow}>
                <AdminTextField
                  compact
                  label="Room Name"
                  value={room.name}
                  onChangeText={(name) => onChange({ ...room, name })}
                />

                <AdminTextField
                  compact
                  label="Room Type"
                  value={room.type}
                  onChangeText={(type) =>
                    onChange({ ...room, type: type as never })
                  }
                />
              </View>

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                multiline
                onChangeText={(description) =>
                  onChange({ ...room, description })
                }
                placeholder="Room description"
                style={[styles.input, styles.roomDescriptionInput]}
                value={room.description ?? ""}
              />
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                style={({ hovered, pressed }: any) => [
                  styles.cancelButton,
                  hovered && styles.cancelButtonHover,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onClose}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ hovered, pressed }: any) => [
                  styles.saveButton,
                  hovered && styles.saveButtonHover,
                  pressed && styles.buttonPressed,
                ]}
                onPress={onSave}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

function NotificationComposerModal({
  draft,
  locations,
  onChange,
  onClose,
  onPublish,
  visible,
}: {
  draft: NotificationDraft;
  locations: AdminLocation[];
  onChange: (draft: NotificationDraft) => void;
  onClose: () => void;
  onPublish: () => void;
  visible: boolean;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={[styles.modalOverlay, isNarrow && styles.modalOverlayNarrow]}>
        <View
          style={[
            styles.notificationComposerModal,
            isNarrow && styles.modalNarrow,
          ]}
        >
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>New Notification</Text>
              <Text style={styles.modalSubtitle}>
                Publish an update users can view from Home.
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={({ hovered, pressed }: any) => [
                styles.modalCloseButton,
                hovered && styles.iconButtonHover,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.modalClose}>x</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.notificationComposerContent}
            showsVerticalScrollIndicator={false}
            style={styles.notificationComposerScroll}
          >
            <View style={styles.notificationField}>
              <AdminTextField
                label="Title"
                value={draft.title}
                onChangeText={(title) => onChange({ ...draft, title })}
              />
            </View>

            <Text style={styles.inputLabel}>Category</Text>
            <View style={styles.notificationCategoryList}>
              {notificationCategoryOptions.map((category) => (
              <Pressable
                key={category}
                style={({ hovered, pressed }: any) => [
                  styles.statusButton,
                  hovered && styles.statusButtonHover,
                  draft.category === category && styles.statusButtonActive,
                  hovered &&
                    draft.category === category &&
                    styles.statusButtonActiveHover,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => onChange({ ...draft, category })}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    draft.category === category &&
                      styles.statusButtonTextActive,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
              ))}
            </View>

            <Text style={styles.inputLabel}>Related Location</Text>
            <View style={styles.relatedLocationList}>
              <Pressable
                style={({ hovered, pressed }: any) => [
                  styles.filterChip,
                  hovered && styles.filterChipHover,
                  !draft.relatedLocationKey && styles.filterChipActive,
                  hovered &&
                    !draft.relatedLocationKey &&
                    styles.filterChipActiveHover,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() =>
                  onChange({ ...draft, relatedLocationKey: "" })
                }
              >
                <Text
                  style={[
                    styles.filterChipText,
                    !draft.relatedLocationKey &&
                      styles.filterChipTextActive,
                  ]}
                >
                  None
                </Text>
              </Pressable>
              {locations.slice(0, 20).map((location) => {
                const locationKey = `${location.type}:${location.id}`;

                return (
                  <Pressable
                    key={locationKey}
                    style={({ hovered, pressed }: any) => [
                      styles.filterChip,
                      hovered && styles.filterChipHover,
                      draft.relatedLocationKey === locationKey &&
                        styles.filterChipActive,
                      hovered &&
                        draft.relatedLocationKey === locationKey &&
                        styles.filterChipActiveHover,
                      pressed && styles.buttonPressed,
                    ]}
                    onPress={() =>
                      onChange({
                        ...draft,
                        relatedLocationKey: locationKey,
                      })
                    }
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        draft.relatedLocationKey === locationKey &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {location.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              multiline
              onChangeText={(message) => onChange({ ...draft, message })}
              placeholder="Write the notification details"
              style={[styles.input, styles.notificationMessageInput]}
              value={draft.message}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <Pressable
              style={({ hovered, pressed }: any) => [
                styles.cancelButton,
                hovered && styles.cancelButtonHover,
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={({ hovered, pressed }: any) => [
                styles.saveButton,
                hovered && styles.saveButtonHover,
                pressed && styles.buttonPressed,
              ]}
              onPress={onPublish}
            >
              <Text style={styles.saveButtonText}>Publish</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function SuccessDialog({
  state,
  onClose,
}: {
  state: SuccessDialogState | null;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;

  return (
    <Modal transparent visible={Boolean(state)} animationType="fade">
      <View style={[styles.modalOverlay, isNarrow && styles.modalOverlayNarrow]}>
        {state ? (
          <View style={[styles.successDialog, isNarrow && styles.modalNarrow]}>
            <View style={styles.successIcon}>
              <Text style={styles.successIconText}>✓</Text>
            </View>
            <Text style={styles.successTitle}>{state.title}</Text>
            <Text style={styles.successMessage}>{state.message}</Text>
            <Pressable
              style={({ hovered, pressed }: any) => [
                styles.successButton,
                hovered && styles.saveButtonHover,
                pressed && styles.buttonPressed,
              ]}
              onPress={onClose}
            >
              <Text style={styles.successButtonText}>Done</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}
