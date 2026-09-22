import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import Background from "@/assets/design/backgrounds/fifthBg.svg";
import BackArrow from "@/assets/design/icons/back-arrow.svg";

export default function OfficialPage({
  children,
  subtitle,
  title,
}: {
  children: ReactNode;
  subtitle?: string;
  title: string;
}) {
  return (
    <View style={styles.screen}>
      <StatusBar style="light" />
      <View style={styles.background} pointerEvents="none">
        <Background width="100%" height="100%" preserveAspectRatio="none" />
      </View>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back"
            onPress={() => (router.canGoBack() ? router.back() : router.replace("/(tabs)"))}
            style={styles.backButton}
          >
            <BackArrow width={32} height={32} accessible={false} />
          </Pressable>
          <View style={styles.copy}>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
          </View>
        </View>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

export const officialDetailStyles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.94)",
    borderWidth: 1,
    borderColor: "#CDA6AA",
    borderRadius: 12,
    padding: 12,
  },
  bodyText: {
    color: "#6C757D",
    fontFamily: "HelpRegular",
    fontSize: 18,
    lineHeight: 26,
  },
  button: {
    minHeight: 48,
    borderRadius: 40,
    backgroundColor: "#A42330",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 8,
    flexDirection: "row",
    gap: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontFamily: "DetailBold",
    fontSize: 20,
  },
  sectionTitle: {
    color: "#AF2532",
    fontFamily: "HelpBold",
    fontSize: 26,
  },
});

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "white" },
  background: StyleSheet.absoluteFill,
  safe: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 17,
    paddingTop: 12,
    paddingBottom: 71,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  copy: { flex: 1 },
  title: { fontSize: 20, fontWeight: "700", color: "white" },
  subtitle: {
    color: "white",
    fontFamily: "HomeRegular",
    fontSize: 14,
    marginTop: 2,
  },
  content: {
    width: "100%",
    maxWidth: 600,
    alignSelf: "center",
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 28,
    gap: 12,
  },
});
