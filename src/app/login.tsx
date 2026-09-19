import { router } from "expo-router";
import { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  canUseFirebaseUserAuth,
  registerUserWithEmailPassword,
  signInUserWithEmailPassword,
  signInUserWithGoogleIdToken,
  signInUserWithGooglePopup,
} from "../services/userAuth";
import {
  clearStoredUserSession,
  setAppAccessMode,
  setStoredUserSession,
} from "../utils/appSession";

const googleClientIds = {
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
};

let hasConfiguredNativeGoogleSignIn = false;

async function getAndroidGoogleSignIn() {
  if (Platform.OS !== "android") {
    return null;
  }

  const googleSignInModule = await import(
    "@react-native-google-signin/google-signin"
  );

  return googleSignInModule.GoogleSignin;
}

async function configureNativeGoogleSignIn() {
  if (hasConfiguredNativeGoogleSignIn) {
    return getAndroidGoogleSignIn();
  }

  const GoogleSignin = await getAndroidGoogleSignIn();

  if (!GoogleSignin) {
    return null;
  }

  GoogleSignin.configure({
    webClientId: googleClientIds.webClientId,
    iosClientId: googleClientIds.iosClientId,
    offlineAccess: false,
    hostedDomain: "umindanao.edu.ph",
  });

  hasConfiguredNativeGoogleSignIn = true;

  return GoogleSignin;
}

function getNativeGoogleClientSetupError() {
  if (!googleClientIds.webClientId) {
    return "Google login needs EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.";
  }

  if (Platform.OS === "android") {
    if (!googleClientIds.androidClientId) {
      return "Google login needs EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.";
    }

    if (googleClientIds.androidClientId === googleClientIds.webClientId) {
      return "Android Google login is using the Web client ID. Add the Android OAuth client ID to EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.";
    }
  }

  if (Platform.OS === "ios") {
    return "iOS Google login needs an iOS development build. Expo Go cannot load the native Google Sign-In module.";
  }

  return "";
}

export default function LoginScreen() {
  const [loginError, setLoginError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    setLoginError("");

    if (!canUseFirebaseUserAuth()) {
      setLoginError("Firebase Auth is not configured yet.");
      return;
    }

    if (Platform.OS === "web") {
      setIsGoogleLoading(true);

      try {
        const session = await signInUserWithGooglePopup();
        await setStoredUserSession(session);
        await setAppAccessMode("user");
        router.replace("/(tabs)");
      } catch (error) {
        console.warn("Google web sign-in failed", error);
        setLoginError(getGoogleLoginErrorMessage(error));
        setIsGoogleLoading(false);
      }

      return;
    }

    const nativeSetupError = getNativeGoogleClientSetupError();

    if (nativeSetupError) {
      setLoginError(nativeSetupError);
      return;
    }

    setIsGoogleLoading(true);

    try {
      const GoogleSignin = await configureNativeGoogleSignIn();

      if (!GoogleSignin) {
        setLoginError("Google login is only available in the Android development build.");
        setIsGoogleLoading(false);
        return;
      }

      if (Platform.OS === "android") {
        await GoogleSignin.hasPlayServices({
          showPlayServicesUpdateDialog: true,
        });
      }

      await GoogleSignin.signOut();
      const result = await GoogleSignin.signIn();

      if (result.type !== "success") {
        setIsGoogleLoading(false);
        return;
      }

      const idToken = result.data.idToken;

      if (!idToken) {
        setLoginError("Google did not return a sign-in token.");
        setIsGoogleLoading(false);
        return;
      }

      const session = await signInUserWithGoogleIdToken(idToken);
      await setStoredUserSession(session);
      await setAppAccessMode("user");
      router.replace("/(tabs)");
    } catch (error) {
      console.warn("Google native sign-in failed", error);
      setLoginError(getGoogleLoginErrorMessage(error));
      setIsGoogleLoading(false);
    }
  };

  const handleEmailPasswordLogin = async () => {
    setLoginError("");

    if (!canUseFirebaseUserAuth()) {
      setLoginError("Firebase Auth is not configured yet.");
      return;
    }

    if (isCreatingAccount && !acceptedPrivacy) {
      setLoginError("Please accept the privacy notice to create an account.");
      return;
    }

    setIsEmailLoading(true);

    try {
      const session = isCreatingAccount
        ? await registerUserWithEmailPassword(username, email, password)
        : await signInUserWithEmailPassword(email, password);

      await setStoredUserSession(session);
      await setAppAccessMode("user");
      router.replace("/(tabs)");
    } catch (error) {
      console.warn("Email sign-in failed", error);
      setLoginError(getEmailPasswordErrorMessage(error));
      setIsEmailLoading(false);
    }
  };

  const isIosEmailLogin = Platform.OS === "ios";

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome to UMVC FIND</Text>
        <Text style={styles.subtitle}>
          {isIosEmailLogin
            ? "Sign in with your umindanao.edu.ph account, or continue as a guest for now."
            : "Sign in with your umindanao.edu.ph Google account, or continue as a guest for now."}
        </Text>

        {isIosEmailLogin ? (
          <>
            <View style={styles.modeToggle}>
              <Pressable
                style={[
                  styles.modeButton,
                  !isCreatingAccount && styles.modeButtonActive,
                ]}
                onPress={() => {
                  setLoginError("");
                  setIsCreatingAccount(false);
                }}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    !isCreatingAccount && styles.modeButtonTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.modeButton,
                  isCreatingAccount && styles.modeButtonActive,
                ]}
                onPress={() => {
                  setLoginError("");
                  setIsCreatingAccount(true);
                }}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    isCreatingAccount && styles.modeButtonTextActive,
                  ]}
                >
                  Create Account
                </Text>
              </Pressable>
            </View>

            {isCreatingAccount ? (
              <TextInput
                autoCapitalize="words"
                editable={!isEmailLoading}
                placeholder="Username"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
              />
            ) : null}

            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isEmailLoading}
              keyboardType="email-address"
              placeholder="UMindanao email"
              placeholderTextColor="#9ca3af"
              style={styles.input}
              textContentType="emailAddress"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              autoCapitalize="none"
              editable={!isEmailLoading}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              style={styles.input}
              textContentType={isCreatingAccount ? "newPassword" : "password"}
              value={password}
              onChangeText={setPassword}
            />

            {isCreatingAccount ? (
              <Pressable
                style={styles.privacyRow}
                onPress={() => setAcceptedPrivacy((current) => !current)}
              >
                <View
                  style={[
                    styles.checkbox,
                    acceptedPrivacy && styles.checkboxChecked,
                  ]}
                >
                  <Text style={styles.checkboxText}>
                    {acceptedPrivacy ? "X" : ""}
                  </Text>
                </View>
                <Text style={styles.privacyText}>
                  I agree to the privacy notice and allow UMVC FIND to use my
                  account information for campus navigation access.
                </Text>
              </Pressable>
            ) : null}

            <Pressable
              disabled={isEmailLoading}
              style={[
                styles.primaryButton,
                isEmailLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleEmailPasswordLogin}
            >
              <Text style={styles.primaryButtonText}>
                {isEmailLoading
                  ? "Please wait..."
                  : isCreatingAccount
                    ? "Create Account"
                    : "Sign In"}
              </Text>
            </Pressable>
          </>
        ) : (
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
        )}

        {loginError ? (
          <Text style={styles.loginError}>{loginError}</Text>
        ) : null}

        <Pressable
          style={styles.secondaryButton}
          onPress={() => {
            void clearStoredUserSession().then(() =>
              setAppAccessMode("guest"),
            ).then(() => {
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

function getGoogleLoginErrorMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "auth/popup-closed-by-user") {
    return "Google sign-in was closed before it finished.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Google sign-in is not enabled in Firebase Authentication.";
  }

  if (code === "auth/unauthorized-domain") {
    return "This localhost address is not authorized in Firebase Authentication.";
  }

  if (code === "auth/invalid-credential") {
    return "Google sign-in token was rejected. Check your Google/Firebase client setup.";
  }

  if (code === "auth/unauthorized-school-domain") {
    return "Please use your umindanao.edu.ph Google account to log in.";
  }

  if (code === "SIGN_IN_CANCELLED") {
    return "Google sign-in was cancelled.";
  }

  if (code === "PLAY_SERVICES_NOT_AVAILABLE") {
    return "Google Play Services is not available on this device.";
  }

  return code
    ? `Google sign-in failed: ${code}`
    : "Google sign-in failed. Please try again.";
}

function getEmailPasswordErrorMessage(error: unknown) {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code?: unknown }).code)
      : "";

  if (code === "auth/unauthorized-school-domain") {
    return "Please use your umindanao.edu.ph email address.";
  }

  if (code === "auth/missing-username") {
    return "Please enter your username.";
  }

  if (code === "auth/email-already-in-use") {
    return "This email already has an account. Please sign in instead.";
  }

  if (code === "auth/invalid-credential") {
    return "Invalid email or password.";
  }

  if (code === "auth/invalid-email") {
    return "Please enter a valid UMindanao email address.";
  }

  if (code === "auth/missing-password") {
    return "Please enter your password.";
  }

  if (code === "auth/weak-password") {
    return "Password should be at least 6 characters.";
  }

  if (code === "auth/operation-not-allowed") {
    return "Email and password login is not enabled in Firebase Authentication.";
  }

  return code
    ? `Email login failed: ${code}`
    : "Email login failed. Please try again.";
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

  modeToggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
    padding: 4,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
  },

  modeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 42,
    borderRadius: 6,
  },

  modeButtonActive: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },

  modeButtonText: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "800",
  },

  modeButtonTextActive: {
    color: "#a80f28",
  },

  input: {
    height: 48,
    marginBottom: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    color: "#111827",
    fontSize: 15,
    backgroundColor: "#fffafa",
  },

  privacyRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 14,
  },

  checkbox: {
    alignItems: "center",
    justifyContent: "center",
    width: 22,
    height: 22,
    marginTop: 1,
    borderWidth: 1,
    borderColor: "#bb2338",
    borderRadius: 4,
    backgroundColor: "white",
  },

  checkboxChecked: {
    backgroundColor: "#bb2338",
  },

  checkboxText: {
    color: "white",
    fontSize: 13,
    fontWeight: "900",
  },

  privacyText: {
    flex: 1,
    color: "#4b5563",
    fontSize: 12,
    lineHeight: 17,
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
