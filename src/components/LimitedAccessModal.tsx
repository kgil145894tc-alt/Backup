import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { rf, rs } from "@/utils/responsive";

type LimitedAccessModalProps = {
  visible: boolean;
  onClose: () => void;
  onLogin: () => void;
};

export default function LimitedAccessModal({
  visible,
  onClose,
  onLogin,
}: LimitedAccessModalProps) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.card}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close limited access message"
            hitSlop={12}
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeText}>x</Text>
          </Pressable>

          <View style={styles.iconCircle}>
            <View style={styles.lockShackle} />
            <View style={styles.lockBody}>
              <View style={styles.lockKeyhole} />
            </View>
          </View>

          <Text style={styles.title}>Limited Access</Text>
          <Text style={styles.message}>
            You are currently in Guest Mode. Please log in using your Google
            account to access this feature and unlock the full experience.
          </Text>

          <Pressable style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: rs(22, 18, 28),
  },

  backdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },

  card: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    elevation: 10,
    maxWidth: 292,
    minHeight: 256,
    paddingBottom: 18,
    paddingHorizontal: 28,
    paddingTop: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    width: "100%",
    zIndex: 2,
  },

  closeButton: {
    alignItems: "center",
    height: 35,
    justifyContent: "center",
    position: "absolute",
    right: 11,
    top: 8,
    width: 35,
    zIndex: 3,
  },

  closeText: {
    color: "#C6C1BD",
    fontFamily: "NotificationBold",
    fontSize: rf(31, 28, 32),
    lineHeight: rf(33, 30, 34),
  },

  iconCircle: {
    alignItems: "center",
    backgroundColor: "#F7E4EA",
    borderRadius: 39,
    height: 78,
    justifyContent: "center",
    marginBottom: 7,
    width: 78,
  },

  lockShackle: {
    borderColor: "#AF2532",
    borderRadius: 13,
    borderWidth: 5,
    height: 28,
    marginBottom: -12,
    width: 27,
    zIndex: 1,
  },

  lockBody: {
    alignItems: "center",
    backgroundColor: "#AF2532",
    borderRadius: 3,
    height: 26,
    justifyContent: "center",
    width: 36,
  },

  lockKeyhole: {
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    height: 8,
    width: 6,
  },

  title: {
    color: "#AF2532",
    fontFamily: "NotificationBold",
    fontSize: rf(18, 17, 19),
    lineHeight: rf(27, 25, 28),
    marginBottom: 6,
    textAlign: "center",
  },

  message: {
    color: "#24272A",
    fontFamily: "NotificationBold",
    fontSize: rf(12, 11, 13),
    lineHeight: rf(17, 16, 18),
    marginBottom: 16,
    textAlign: "center",
  },

  loginButton: {
    alignItems: "center",
    backgroundColor: "#AF2532",
    borderRadius: 9,
    justifyContent: "center",
    minHeight: 34,
    paddingHorizontal: 16,
    paddingVertical: 7,
    width: "100%",
  },

  loginButtonText: {
    color: "white",
    fontFamily: "NotificationBold",
    fontSize: rf(16, 15, 17),
    lineHeight: rf(21, 20, 22),
  },
});
