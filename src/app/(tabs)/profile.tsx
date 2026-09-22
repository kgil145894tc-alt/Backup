import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  OfficialBottomNavigation,
  OfficialProfileActionCard,
} from "@/components/OfficialDesign";
import LimitedAccessModal from "@/components/LimitedAccessModal";
import Background from "../../../assets/design/backgrounds/sixBg.svg";
import HelpBackground from "../../../assets/design/backgrounds/ninthBg.svg";
import Avatar from "../../../assets/design/icons/profile-avatar.svg";
import Google from "../../../assets/design/logos/google.svg";
import HelpIcon from "../../../assets/design/icons/profile.svg";
import LogoutIcon from "../../../assets/design/icons/logout.svg";
import UserIcon from "../../../assets/design/icons/user.svg";
import { signOutUser } from "../../services/userAuth";
import {
  clearStoredUserSession,
  getAppAccessMode,
  getStoredUserSession,
  isGuestMode,
  setAppAccessMode,
  type AppAccessMode,
  type StoredUserSession,
} from "../../utils/appSession";
import { navigateToTab } from "@/utils/navigation";
import { styles as helpStyles } from "../../styles/official/helpScreen.styles";
import { styles } from "../../styles/official/profileScreen.styles";

const universitySeal = require("../../../assets/design/logos/UM.png");
const umvcFindLogo = require("../../../assets/design/logos/UMVC-Find.png");

const helpIntroduction =
  "UMVCFIND is a campus wayfinding app for locating places around UMVC, including buildings, rooms, offices, laboratories, facilities, food areas, and services.";

const helpSections = [
  {
    id: "purpose",
    title: "App Purpose",
    text: "The app helps users start from the dashboard and open the campus map to view, identify, and highlight selected buildings or rooms.",
  },
  {
    id: "dashboard",
    title: "How To Use Dashboard",
    text: "Open the Dashboard to access the main guest options. From there, guests can continue to the campus map and view available campus information.",
  },
  {
    id: "map",
    title: "How To Use Map",
    text: "Open the Map tab to view campus places. Tap a highlighted place to see its details, then open its full information page or floor and room list when available.",
  },
  {
    id: "guest",
    title: "Guest Access",
    text: "Guest users can use the Dashboard and Map without an account. Additional screens are intended for signed-in access or future system updates.",
  },
  {
    id: "location",
    title: "Location Information",
    text: "Location details are provided to help users identify campus places more easily, including names, floors, nearby areas, descriptions, and navigation notes.",
  },
  {
    id: "contact",
    title: "Contact / Help",
    text: "For incorrect building names, room details, or map information, contact the assigned campus office representative.",
  },
];

export default function ProfileScreen() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLimitedAccessOpen, setIsLimitedAccessOpen] = useState(false);
  const [accessMode, setAccessModeState] = useState<AppAccessMode>("guest");
  const [userSession, setUserSession] = useState<StoredUserSession | null>(null);
  const isGuest = isGuestMode(accessMode);
  const displayName =
    userSession?.displayName ?? userSession?.email?.split("@")[0] ?? "Guest User";

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void Promise.all([getAppAccessMode(), getStoredUserSession()]).then(([mode, session]) => {
        if (isActive) {
          setAccessModeState(mode);
          setUserSession(session);
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const handleLogout = async () => {
    await signOutUser();
    await clearStoredUserSession();
    await setAppAccessMode("guest");
    setAccessModeState("guest");
    setUserSession(null);
    router.replace("/login");
  };

  const navigate = (name: string) => {
    navigateToTab(name, {
      currentTab: "Profile",
      isGuest,
      onOpenLimitedAccess: () => setIsLimitedAccessOpen(true),
      onSameTab: () => setIsHelpOpen(false),
    });
  };

  if (isHelpOpen) {
    return (
      <View style={helpStyles.screen}>
        <StatusBar style="light" />
        <SafeAreaView edges={["top", "left", "right"]} style={helpStyles.header}>
          <Pressable
            accessibilityRole="button"
            onPress={() => setIsHelpOpen(false)}
            style={({ pressed }) => [helpStyles.backButton, pressed && helpStyles.pressed]}
          >
            <Text style={[helpStyles.backText, helpStyles.boldFont]}>Back to Profile</Text>
          </Pressable>
        </SafeAreaView>
        <View style={helpStyles.goldDivider} />
        <View style={helpStyles.body}>
          <View style={helpStyles.background} pointerEvents="none">
            <HelpBackground
              width="100%"
              height="100%"
              viewBox="0 180 412 550"
              preserveAspectRatio="xMidYMid slice"
            />
          </View>
          <SafeAreaView edges={["left", "right", "bottom"]} style={helpStyles.body}>
            <ScrollView contentContainerStyle={helpStyles.content} showsVerticalScrollIndicator={false}>
              <Text accessibilityRole="header" style={[helpStyles.heading, helpStyles.boldFont]}>
                Help & About
              </Text>
              <Text style={[helpStyles.introduction, helpStyles.regularFont]}>
                {helpIntroduction}
              </Text>
              {helpSections.map((section) => (
                <View key={section.id} style={helpStyles.section}>
                  <View
                    style={[
                      helpStyles.sectionHeading,
                      section.id === "dashboard" && helpStyles.alignRight,
                    ]}
                  >
                    <Text accessibilityRole="header" style={[helpStyles.heading, helpStyles.boldFont]}>
                      {section.title}
                    </Text>
                    {section.id === "purpose" ? (
                      <Image
                        source={umvcFindLogo}
                        contentFit="contain"
                        style={helpStyles.logo}
                        accessibilityLabel="UMVC Find logo"
                      />
                    ) : null}
                  </View>
                  <View style={helpStyles.card}>
                    <Text style={[helpStyles.copy, helpStyles.regularFont]}>{section.text}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.background} pointerEvents="none">
        <Background width="100%" height="100%" preserveAspectRatio="none" />
      </View>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Image
              source={universitySeal}
              style={styles.seal}
              contentFit="contain"
              accessibilityLabel="University of Mindanao seal"
            />
            <Text style={[styles.brand, styles.brandFont]} numberOfLines={1} adjustsFontSizeToFit>
              UMVC <Text style={styles.gold}>FIND</Text>
            </Text>
          </View>
          <View style={styles.identity}>
            <Avatar width={121} height={120} accessibilityLabel="Default profile avatar" />
            <Text style={[styles.name, styles.nameFont]}>{isGuest ? "Guest User" : displayName}</Text>
            <Text style={[styles.email, styles.mediumFont]}>
              {isGuest ? "Sign in to unlock the full app experience." : userSession?.email}
            </Text>
            <View style={styles.badge}>
              {isGuest ? <UserIcon width={17} height={17} accessible={false} /> : <Google width={17} height={17} accessible={false} />}
              <Text style={[styles.badgeText, styles.mediumFont]}>
                {isGuest ? "GUEST MODE" : "SIGNED IN"}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <OfficialProfileActionCard
              title="Help & About"
              description="FAQs, contact us, and app information"
              Icon={HelpIcon}
              onPress={() => setIsHelpOpen(true)}
            />
            <OfficialProfileActionCard
              title={isGuest ? "Login" : "Log Out"}
              description={isGuest ? "Sign in with Google to unlock more features" : "Sign out of your account"}
              Icon={isGuest ? UserIcon : LogoutIcon}
              onPress={isGuest ? () => router.replace("/login") : handleLogout}
            />
          </View>
        </ScrollView>
        <OfficialBottomNavigation activeItem="Profile" onSelect={navigate} />
      </SafeAreaView>

      <LimitedAccessModal
        visible={isLimitedAccessOpen}
        onClose={() => setIsLimitedAccessOpen(false)}
        onLogin={() => {
          setIsLimitedAccessOpen(false);
          router.push("/login");
        }}
      />
    </View>
  );
}
