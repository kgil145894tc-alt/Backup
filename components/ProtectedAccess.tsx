import { router, useFocusEffect } from "expo-router";
import { useCallback, useState, type ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import {
  getAppAccessMode,
  isGuestMode,
  type AppAccessMode,
} from "../src/utils/appSession";
import LimitedAccessModal from "./LimitedAccessModal";

type ProtectedAccessProps = {
  children: ReactNode;
};

export default function ProtectedAccess({ children }: ProtectedAccessProps) {
  const [accessMode, setAccessMode] = useState<AppAccessMode>("guest");
  const [isReady, setIsReady] = useState(false);
  const isGuest = isGuestMode(accessMode);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      void getAppAccessMode().then((mode) => {
        if (isActive) {
          setAccessMode(mode);
          setIsReady(true);
        }
      });

      return () => {
        isActive = false;
      };
    }, []),
  );

  const goHome = () => {
    router.replace("/(tabs)");
  };

  const goLogin = () => {
    router.replace("/login");
  };

  if (!isReady || isGuest) {
    return (
      <View style={styles.container}>
        <LimitedAccessModal
          visible={isReady && isGuest}
          onClose={goHome}
          onLogin={goLogin}
        />
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

