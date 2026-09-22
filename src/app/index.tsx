import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import WelcomeBackground from "../../assets/design/backgrounds/firstBg.svg";
import TitleDivider from "../../assets/design/icons/arrow.svg";
import StartArrow from "../../assets/design/icons/start-arrow.svg";
import {
  getAppAccessMode,
  getStoredUserSession,
} from "../utils/appSession";
import { styles } from "../styles/official/welcomeScreen.styles";

const logo = require("../../assets/design/logos/UMVC-Find.png");

export default function WelcomeScreen() {
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void Promise.all([
        getAppAccessMode(),
        getStoredUserSession(),
      ]).then(([mode, session]) => {
        if (!isActive) {
          return;
        }

        if (mode === "user" && session?.uid) {
          router.replace("/(tabs)");
          return;
        }

        setIsCheckingSession(false);
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  if (isCheckingSession) {
    return (
      <View style={styles.screen}>
        <StatusBar hidden />
        <ActivityIndicator color="#AF2532" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <StatusBar hidden />

      <View style={styles.background} pointerEvents="none" accessible={false}>
        <WelcomeBackground
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          accessible={false}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Image
          source={logo}
          accessibilityLabel="UM Tagum College map pin logo"
          contentFit="contain"
          style={styles.logo}
        />

        <Text
          accessibilityRole="header"
          accessibilityLabel="UMVC FIND"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.title}
        >
          UMVC
          <Text style={styles.gold}>FIND</Text>
        </Text>

        <TitleDivider
          width={196}
          height={20}
          accessible={false}
          style={styles.divider}
        />

        <Text style={styles.tagline}>Find. Navigate. Explore.</Text>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Get Started"
          hitSlop={8}
          onPress={() => router.push("/login")}
          style={({ pressed }) => [
            styles.button,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.buttonText}>Get Started</Text>
          <StartArrow width={26} height={15} accessible={false} />
        </Pressable>
      </ScrollView>
    </View>
  );
}
