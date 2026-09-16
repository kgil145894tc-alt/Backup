import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type HomeAction = {
  title: string;
  subtitle: string;
  icon: string;
  route:
    | "/(tabs)/map"
    | "/(tabs)/search"
    | "/(tabs)/categories"
    | "/(tabs)/profile";
};

const homeActions: HomeAction[] = [
  {
    title: "Map",
    subtitle: "Explore campus",
    icon: "M",
    route: "/(tabs)/map",
  },
  {
    title: "Search",
    subtitle: "Find a building",
    icon: "S",
    route: "/(tabs)/search",
  },
  {
    title: "Categories",
    subtitle: "Browse by type",
    icon: "C",
    route: "/(tabs)/categories",
  },
  {
    title: "Profile",
    subtitle: "Account and help",
    icon: "P",
    route: "/(tabs)/profile",
  },
];

export default function Home() {
  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.logoMark}>
          <Text style={styles.logoText}>UM</Text>
        </View>

        <View style={styles.brandBlock}>
          <Text style={styles.brand}>UMVC FIND</Text>
          <Text style={styles.tagline}>Explore the campus now</Text>
        </View>

        <View style={styles.notificationDot}>
          <Text style={styles.notificationText}>!</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <Text style={styles.title}>Welcome Back, User!</Text>
        <Text style={styles.subtitle}>Where would you like to go today?</Text>
      </View>

      <View style={styles.actionPanel}>
        {homeActions.map((action) => (
          <Pressable
            key={action.title}
            style={styles.actionCard}
            onPress={() => router.push(action.route)}
          >
            <Text style={styles.actionIcon}>{action.icon}</Text>
            <Text style={styles.actionTitle}>{action.title}</Text>
            <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
          </Pressable>
        ))}
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
    alignItems: "center",
    backgroundColor: "#1f2937",
    flexDirection: "row",
    paddingBottom: 34,
    paddingHorizontal: 20,
    paddingTop: 34,
  },

  logoMark: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    height: 58,
    justifyContent: "center",
    marginRight: 12,
    width: 58,
  },

  logoText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "900",
  },

  brandBlock: {
    flex: 1,
  },

  brand: {
    color: "white",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
  },

  tagline: {
    color: "#d1d5db",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },

  notificationDot: {
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },

  notificationText: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "900",
  },

  hero: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },

  title: {
    color: "#111827",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 32,
  },

  subtitle: {
    color: "#4b5563",
    fontSize: 16,
    marginTop: 6,
  },

  actionPanel: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
  },

  actionCard: {
    alignItems: "center",
    aspectRatio: 1,
    backgroundColor: "white",
    borderColor: "#d1d5db",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    justifyContent: "center",
    minWidth: 128,
    padding: 14,
  },

  actionIcon: {
    color: "#374151",
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 44,
    marginBottom: 10,
  },

  actionTitle: {
    color: "#111827",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 4,
  },

  actionSubtitle: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
