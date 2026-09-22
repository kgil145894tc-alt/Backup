import { Image } from "expo-image";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import LoginBackground from "../../assets/design/backgrounds/secondBg.svg";
import GoogleIcon from "../../assets/design/logos/google.svg";
import GuestIcon from "../../assets/design/icons/user.svg";
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
import { styles } from "../styles/official/loginScreen.styles";

const logo = require("../../assets/design/logos/UMVC-Find.png");

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

  try {
    const googleSignInModule = await import(
      "@react-native-google-signin/google-signin"
    );

    return googleSignInModule.GoogleSignin;
  } catch (error) {
    console.warn("Google Sign-In native module is not available", error);
    return null;
  }
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
        setLoginError(
          "Google login needs a freshly rebuilt Android development build. Reinstall the app with npx expo run:android, then open that installed app instead of Expo Go.",
        );
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
    <View style={styles.screen}>
      <StatusBar hidden />

      <View style={styles.background} pointerEvents="none" accessible={false}>
        <LoginBackground
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
        keyboardShouldPersistTaps="handled"
      >
        <Image
          source={logo}
          contentFit="contain"
          accessibilityLabel="UM Tagum College map pin logo"
          style={styles.logo}
        />

        <Text
          style={styles.title}
          numberOfLines={1}
          adjustsFontSizeToFit
          accessibilityRole="header"
        >
          UMVC
          <Text style={styles.gold}>FIND</Text>
        </Text>

        <Text style={styles.subtitle}>
          Campus Navigator and Room Locator
        </Text>

        <Text style={styles.welcome} numberOfLines={1} adjustsFontSizeToFit>
          Welcome to UM Visayan Campus!
        </Text>

        <Text style={styles.instructions}>
          {isIosEmailLogin
            ? "Use your UMindanao email and password to login."
            : "Use your University of Mindanao google account to login."}
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
                styles.button,
                styles.guestButton,
                isEmailLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleEmailPasswordLogin}
            >
              <Text style={[styles.buttonText, styles.guestText]}>
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
              styles.button,
              styles.googleButton,
              isGoogleLoading && styles.primaryButtonDisabled,
            ]}
            onPress={handleGoogleLogin}
          >
            <GoogleIcon
              width={35}
              height={35}
              style={styles.googleIcon}
              accessible={false}
            />
            <Text style={[styles.buttonText, styles.googleText]}>
              {isGoogleLoading ? "Signing in..." : "Continue with Google"}
            </Text>
          </Pressable>
        )}

        {loginError ? (
          <Text style={styles.loginError}>{loginError}</Text>
        ) : null}

        <Pressable
          style={[styles.button, styles.guestButton]}
          onPress={() => {
            void clearStoredUserSession().then(() =>
              setAppAccessMode("guest"),
            ).then(() => {
              router.replace("/(tabs)");
            });
          }}
        >
          <GuestIcon width={21} height={23} accessible={false} />
          <Text style={[styles.buttonText, styles.guestText]}>
            Continue as Guest
          </Text>
        </Pressable>
      </ScrollView>
    </View>
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
