import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import packageJson from "../../../package.json";

const faqs = [
  {
    question: "What is UMVCFIND for?",
    answer:
      "UMVCFIND helps students, staff, and visitors find campus buildings, rooms, offices, laboratories, facilities, faculty areas, and food locations.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. You can use Search, Categories, and Map as a guest. Account features can be added later.",
  },
  {
    question: "Why is my current location unavailable?",
    answer:
      "Location depends on device permission, GPS availability, and browser or phone settings.",
  },
];

export default function ProfileScreen() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

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
          UMVCFIND is a campus navigation app for quickly finding places
          around the UMVC campus.
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Purpose</Text>
          <Text style={styles.bodyText}>
            The app helps users search for campus locations, browse places by
            category, and open selected places on the map.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How To Use Search</Text>
          <Text style={styles.bodyText}>
            Open the Search tab, type a building, room, office, laboratory, or
            facility name, then tap a result to view it on the map. Recent
            searches appear below the search bar.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How To Use Map</Text>
          <Text style={styles.bodyText}>
            Open the Map tab to view campus places. Tap a highlighted place to
            see its name, category, and type. If location permission is enabled,
            the map can also show your current position.
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
            For assistance, contact the campus office or UMVCFIND support.
            Placeholder: support@umvcfind.local
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.bodyText}>UMVCFIND</Text>
          <Text style={styles.bodyText}>Version {packageJson.version}</Text>
          <Text style={styles.bodyText}>
            Built for campus wayfinding and location discovery.
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
          <Text style={styles.avatarText}>G</Text>
        </View>
        <Text style={styles.name}>Guest User</Text>
        <Text style={styles.email}>Sign in later to sync your account.</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusBadgeText}>Guest Mode</Text>
        </View>
      </View>

      <View style={styles.optionList}>
        <Pressable
          style={styles.optionItem}
          onPress={() => router.replace("/")}
        >
          <View style={styles.optionIcon}>
            <Text style={styles.optionIconText}>→</Text>
          </View>
          <View style={styles.optionText}>
            <Text style={styles.optionTitle}>Login</Text>
            <Text style={styles.optionDescription}>
              Return to the start screen to sign in or continue as guest
            </Text>
          </View>
          <Text style={styles.optionArrow}>›</Text>
        </Pressable>

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
              Account registration will be connected after auth is ready
            </Text>
          </View>
          <Text style={styles.comingSoon}>Soon</Text>
        </Pressable>

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
