import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  canUseFirebaseUserAuth,
  signInUserWithGoogleIdToken,
} from "../services/userAuth";
import { setAppAccessMode } from "../utils/appSession";

WebBrowser.maybeCompleteAuthSession();

const googleClientIds = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

export default function LoginScreen() {
  const [loginError, setLoginError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest(
    {
      ...googleClientIds,
      selectAccount: true,
    },
    {
      scheme: "umvcfind",
    },
  );

  useEffect(() => {
    if (!response) {
      return;
    }

    async function finishGoogleLogin() {
      if (response?.type !== "success") {
        setIsGoogleLoading(false);
        return;
      }

      const idToken = response.params.id_token;

      if (!idToken) {
        setLoginError("Google did not return a sign-in token.");
        setIsGoogleLoading(false);
        return;
      }

      try {
        await signInUserWithGoogleIdToken(idToken);
        await setAppAccessMode("user");
        router.replace("/(tabs)");
      } catch {
        setLoginError("Google sign-in failed. Please try again.");
        setIsGoogleLoading(false);
      }
    }

    void finishGoogleLogin();
  }, [response]);

  const handleGoogleLogin = async () => {
    setLoginError("");

    if (!canUseFirebaseUserAuth()) {
      setLoginError("Firebase Auth is not configured yet.");
      return;
    }

    if (!googleClientIds.webClientId) {
      setLoginError("Google login needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.");
      return;
    }

    if (!request) {
      setLoginError("Google login is still loading. Please try again.");
      return;
    }

    setIsGoogleLoading(true);

    const result = await promptAsync();

    if (result.type !== "success") {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to UMVC FIND</Text>
        <Text style={styles.subtitle}>
          Sign in with your school account, or continue as a guest for now.
        </Text>

        <Pressable
          disabled={isGoogleLoading}
          style={[
            styles.primaryButton,
            isGoogleLoading && styles.primaryButtonDisabled,
          ]}
          onPress={handleGoogleLogin}
        >
          <Text style={styles.primaryButtonText}>
            {isGoogleLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </Pressable>

        {loginError ? (
          <Text style={styles.loginError}>{loginError}</Text>
        ) : null}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void setAppAccessMode("guest").then(() => {
              router.replace("/(tabs)");
            });
          }}
        >
          <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8f7f2",
  },

  card: {
    width: "100%",
    maxWidth: 420,
    padding: 22,
    borderRadius: 8,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },

  title: {
    color: "#a80f28",
    fontSize: 26,
    fontWeight: "900",
    textAlign: "center",
  },

  subtitle: {
    marginTop: 10,
    marginBottom: 24,
    color: "#4b5563",
    fontSize: 15,
    lineHeight: 21,
    textAlign: "center",
  },

  primaryButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: 25,
    backgroundColor: "#bb2338",
  },

  primaryButtonDisabled: {
    opacity: 0.68,
  },

  primaryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
  },

  loginError: {
    color: "#991b1b",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 10,
    textAlign: "center",
  },

  secondaryButton: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#bb2338",
    borderRadius: 25,
    backgroundColor: "white",
  },

  secondaryButtonText: {
    color: "#bb2338",
    fontSize: 16,
    fontWeight: "800",
  },
});
