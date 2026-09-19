import { Image } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getAppAccessMode,
  getStoredUserSession,
} from "../utils/appSession";

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
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Loading UMVC FIND...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapBackground}>
        <View style={[styles.mapRoad, styles.mapRoadOne]} />
        <View style={[styles.mapRoad, styles.mapRoadTwo]} />
        <View style={[styles.mapRoad, styles.mapRoadThree]} />
        <View style={[styles.mapPin, styles.smallPinTop]} />
        <View style={[styles.mapPin, styles.smallPinBottom]} />
      </View>

      <View style={styles.topWave} />
      <View style={styles.topAccent} />

      <View style={styles.content}>
        <View style={styles.logoPin}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            contentFit="contain"
          />
        </View>

        <View style={styles.foldedMap}>
          <View style={styles.mapFoldLeft} />
          <View style={styles.mapFoldCenter} />
          <View style={styles.mapFoldRight} />
        </View>

        <Text style={styles.title}>
          <Text style={styles.titleRed}>UMVC </Text>
          <Text style={styles.titleGold}>FIND</Text>
        </Text>

        <View style={styles.routeLine}>
          <View style={styles.routeDot} />
          <View style={styles.routeDash} />
          <Text style={styles.routeArrow}>-&gt;</Text>
          <View style={styles.routeDash} />
          <View style={styles.routeDot} />
        </View>

        <Text style={styles.tagline}>Find. Navigate. Explore.</Text>

        <Pressable style={styles.button} onPress={() => router.push("/login")}>
          <Text style={styles.buttonText}>Get Started</Text>
          <Text style={styles.buttonArrow}>-&gt;</Text>
        </Pressable>
      </View>

      <View style={styles.bottomAccent} />
      <View style={styles.bottomWave} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: "#f8f7f2",
  },

  mapBackground: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "#f8f7f2",
  },

  mapRoad: {
    position: "absolute",
    height: 4,
    borderRadius: 2,
    backgroundColor: "#e5e5e5",
  },

  mapRoadOne: {
    top: 120,
    left: -40,
    width: 420,
    transform: [{ rotate: "-34deg" }],
  },

  mapRoadTwo: {
    top: 300,
    left: -80,
    width: 460,
    transform: [{ rotate: "39deg" }],
  },

  mapRoadThree: {
    top: 520,
    left: -60,
    width: 420,
    transform: [{ rotate: "-28deg" }],
  },

  mapPin: {
    position: "absolute",
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 4,
    borderColor: "#8a8f97",
    opacity: 0.65,
  },

  smallPinTop: {
    top: 180,
    right: 28,
  },

  smallPinBottom: {
    bottom: 190,
    left: 22,
  },

  topWave: {
    position: "absolute",
    top: -210,
    left: -160,
    width: 470,
    height: 300,
    borderRadius: 160,
    backgroundColor: "#b0172d",
  },

  topAccent: {
    position: "absolute",
    top: 58,
    left: -70,
    width: 330,
    height: 34,
    borderRadius: 40,
    backgroundColor: "#ffd900",
    transform: [{ rotate: "-12deg" }],
  },

  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  loadingContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  loadingText: {
    color: "#1f2933",
    fontSize: 15,
    fontWeight: "800",
  },

  logoPin: {
    width: 146,
    height: 146,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 73,
    backgroundColor: "#a80f28",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },

  logo: {
    width: 96,
    height: 96,
  },

  foldedMap: {
    width: 190,
    height: 86,
    flexDirection: "row",
    marginTop: -24,
    marginBottom: 26,
    zIndex: -1,
  },

  mapFoldLeft: {
    flex: 1,
    backgroundColor: "#f9b516",
    transform: [{ skewY: "-18deg" }],
  },

  mapFoldCenter: {
    flex: 1,
    backgroundColor: "#ffcf3f",
    transform: [{ skewY: "18deg" }],
  },

  mapFoldRight: {
    flex: 1,
    backgroundColor: "#f5ad16",
    transform: [{ skewY: "-18deg" }],
  },

  title: {
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 0,
  },

  titleRed: {
    color: "#b52032",
  },

  titleGold: {
    color: "#f3b51b",
  },

  routeLine: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 8,
  },

  routeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#b52032",
  },

  routeDash: {
    width: 36,
    height: 1,
    marginHorizontal: 7,
    backgroundColor: "#d12c44",
  },

  routeArrow: {
    color: "#b52032",
    fontSize: 16,
    fontWeight: "700",
  },

  tagline: {
    color: "#1f2933",
    fontSize: 13,
    fontWeight: "700",
  },

  button: {
    minWidth: 168,
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 28,
    borderRadius: 26,
    backgroundColor: "#bb2338",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },

  buttonArrow: {
    color: "white",
    fontSize: 20,
    fontWeight: "800",
  },

  bottomAccent: {
    position: "absolute",
    right: -120,
    bottom: 44,
    width: 420,
    height: 42,
    borderRadius: 40,
    backgroundColor: "#ffe200",
    transform: [{ rotate: "11deg" }],
  },

  bottomWave: {
    position: "absolute",
    right: -160,
    bottom: -168,
    width: 520,
    height: 270,
    borderRadius: 150,
    backgroundColor: "#b0172d",
  },
});
