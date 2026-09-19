import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import packageJson from "../../../package.json";
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

const faqs = [
  {
    question: "What is UMVCFIND for?",
    answer:
      "UMVCFIND helps students, staff, and visitors find UMVC campus buildings, rooms, offices, laboratories, facilities, food areas, and other important locations.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Guests can use the dashboard and campus map. Other features can be made available after signing in or in a later version.",
  },
  {
    question: "Why did a building name or detail change?",
    answer:
      "Campus information may be updated to keep names, descriptions, and room details accurate.",
  },
  {
    question: "Can I use the app without internet?",
    answer:
      "Some information may still appear if it was already loaded, but map tiles, updated details, and current location features work best with an internet connection.",
  },
  {
    question: "Why is my current location unavailable?",
    answer:
      "Current location depends on phone/browser permission, GPS availability, internet connection, and device settings. The app can still be used without location access.",
  },
  {
    question: "Does UMVCFIND give turn-by-turn directions?",
    answer:
      "Not yet. The current version highlights campus places on the map and shows location details. Full step-by-step routing can be added in a later version.",
  },
];

export default function ProfileScreen() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [accessMode, setAccessModeState] = useState<AppAccessMode>("guest");
  const [userSession, setUserSession] =
    useState<StoredUserSession | null>(null);
  const isGuest = isGuestMode(accessMode);
  const displayName =
    userSession?.displayName ??
    userSession?.email?.split("@")[0] ??
    "Signed-in User";
  const profileInitial = isGuest
    ? "G"
    : displayName.trim().charAt(0).toUpperCase() || "U";

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void Promise.all([
        getAppAccessMode(),
        getStoredUserSession(),
      ]).then(([mode, session]) => {
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

  if (isHelpOpen) {
    return (
      <ScrollView
        contentContainerStyle={styles.helpContent}
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          style={styles.backButton}
          onPress={() => setIsHelpOpen(false)}
        >
          <Text style={styles.backButtonText}>Back to Profile</Text>
        </Pressable>

        <Text style={styles.helpTitle}>Help & About</Text>
        <Text style={styles.helpIntro}>
          UMVCFIND is a campus wayfinding app for locating places around
          UMVC, including buildings, rooms, offices, laboratories, facilities,
          food areas, and services.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Purpose</Text>
          <Text style={styles.bodyText}>
            The app helps users start from the dashboard and open the campus
            map to view, identify, and highlight selected buildings or rooms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How To Use Dashboard</Text>
          <Text style={styles.bodyText}>
            Open the Dashboard to access the main guest options. From there,
            guests can continue to the campus map and view available campus
            information.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How To Use Map</Text>
          <Text style={styles.bodyText}>
            Open the Map tab to view campus places. Tap a highlighted place to
            see its details, then open its full information page or floor and
            room list when available. If location permission is enabled, the map
            can also show your current position.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guest Access</Text>
          <Text style={styles.bodyText}>
            Guest users can use the Dashboard and Map without an account.
            Additional screens are intended for signed-in access or future
            system updates.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location Information</Text>
          <Text style={styles.bodyText}>
            Location details are provided to help users identify campus places
            more easily. Information may include the place name, category,
            floor, nearby area, description, and helpful navigation notes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          {faqs.map((faq) => (
            <View key={faq.question} style={styles.faqItem}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.bodyText}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact / Help</Text>
          <Text style={styles.bodyText}>
            For incorrect building names, room details, or map information,
            contact the assigned campus office representative.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bodyText}>UMVCFIND</Text>
          <Text style={styles.bodyText}>Version {packageJson.version}</Text>
          <Text style={styles.bodyText}>
            Built for UMVC campus wayfinding and location discovery.
          </Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.brand}>UMVC FIND</Text>
        <Text style={styles.subtitle}>Campus navigation profile</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{profileInitial}</Text>
        </View>
        <Text style={styles.name}>
          {isGuest ? "Guest User" : displayName}
        </Text>
        <Text style={styles.email}>
          {isGuest
            ? "Sign in to unlock the full app experience."
            : userSession?.email ?? "Signed in with Google"}
        </Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>
            {isGuest ? "Guest Mode" : "Signed In"}
          </Text>
        </View>
      </View>

      <View style={styles.optionList}>
        <Pressable
          style={styles.optionItem}
          onPress={isGuest ? () => router.replace("/login") : handleLogout}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionIconText}>→</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>
              {isGuest ? "Login" : "Log Out"}
            </Text>
            <Text style={styles.optionDescription}>
              {isGuest
                ? "Sign in with Google to unlock more features"
                : "Sign out of your Google account on this app"}
            </Text>
          </View>
          <Text style={styles.optionArrow}>›</Text>
        </Pressable>

        {isGuest ? (
          <Pressable
            disabled
            style={[styles.optionItem, styles.optionItemDisabled]}
          >
            <View style={[styles.optionIcon, styles.optionIconDisabled]}>
              <Text style={styles.optionIconTextDisabled}>+</Text>
            </View>
            <View style={styles.optionText}>
              <Text style={[styles.optionTitle, styles.optionTitleDisabled]}>
                Create Account
              </Text>
              <Text style={styles.optionDescription}>
                Use Google login to continue as a signed-in user
              </Text>
            </View>
            <Text style={styles.comingSoon}>Soon</Text>
          </Pressable>
        ) : null}

        <Pressable
          style={styles.optionItem}
          onPress={() => setIsHelpOpen(true)}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionIconText}>?</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Help & About</Text>
            <Text style={styles.optionDescription}>
              FAQs, contact information, and app details
            </Text>
          </View>
          <Text style={styles.optionArrow}>›</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  content: {
    paddingBottom: 32,
  },

  header: {
    backgroundColor: "#b91c2b",
    borderBottomColor: "#facc15",
    borderBottomWidth: 8,
    paddingBottom: 46,
    paddingHorizontal: 24,
    paddingTop: 42,
  },

  brand: {
    color: "white",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
  },

  subtitle: {
    color: "#fee2e2",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 20,
    marginTop: -28,
    padding: 20,
  },

  avatar: {
    alignItems: "center",
    backgroundColor: "#e0edff",
    borderColor: "white",
    borderRadius: 44,
    borderWidth: 4,
    height: 88,
    justifyContent: "center",
    marginBottom: 10,
    width: 88,
  },

  avatarText: {
    color: "#2563eb",
    fontSize: 42,
    fontWeight: "900",
  },

  name: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
  },

  email: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 4,
    textAlign: "center",
  },

  statusBadge: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusBadgeText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  optionList: {
    gap: 12,
    marginTop: 18,
    paddingHorizontal: 20,
  },

  optionItem: {
    alignItems: "center",
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    padding: 14,
  },

  optionItemDisabled: {
    opacity: 0.72,
  },

  optionIcon: {
    alignItems: "center",
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    height: 42,
    justifyContent: "center",
    marginRight: 12,
    width: 42,
  },

  optionIconText: {
    color: "#b91c2b",
    fontSize: 24,
    fontWeight: "900",
  },

  optionIconDisabled: {
    backgroundColor: "#f3f4f6",
  },

  optionIconTextDisabled: {
    color: "#9ca3af",
    fontSize: 24,
    fontWeight: "900",
  },

  optionText: {
    flex: 1,
  },

  optionTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 2,
  },

  optionTitleDisabled: {
    color: "#6b7280",
  },

  optionDescription: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 17,
  },

  optionArrow: {
    color: "#9ca3af",
    fontSize: 30,
    marginLeft: 10,
  },

  comingSoon: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "800",
    marginLeft: 10,
    textTransform: "uppercase",
  },

  helpContent: {
    padding: 20,
    paddingBottom: 36,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 18,
    paddingVertical: 6,
  },

  backButtonText: {
    color: "#2563eb",
    fontSize: 15,
    fontWeight: "700",
  },

  helpTitle: {
    color: "#111827",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 8,
  },

  helpIntro: {
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  section: {
    backgroundColor: "white",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },

  sectionTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "800",
    marginBottom: 8,
  },

  bodyText: {
    color: "#4b5563",
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 4,
  },

  faqItem: {
    marginBottom: 12,
  },

  question: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 3,
  },
});
