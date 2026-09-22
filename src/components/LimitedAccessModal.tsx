import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

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
            <Text style={styles.iconText}>!</Text>
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
    padding: 22,
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
    backgroundColor: "rgba(255,255,255,0.98)",
    borderColor: "#CDA6AA",
    borderRadius: 15,
    borderWidth: 1,
    elevation: 8,
    maxWidth: 340,
    paddingHorizontal: 22,
    paddingBottom: 22,
    paddingTop: 30,
    width: "100%",
    zIndex: 2,
  },

  closeButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 34,
    zIndex: 3,
  },

  closeText: {
    color: "#AF2532",
    fontFamily: "NotificationBold",
    fontSize: 22,
  },

  iconCircle: {
    alignItems: "center",
    backgroundColor: "#F7E5E3",
    borderRadius: 38,
    height: 76,
    justifyContent: "center",
    marginBottom: 16,
    width: 76,
  },

  iconText: {
    color: "#AF2532",
    fontFamily: "NotificationBold",
    fontSize: 30,
  },

  title: {
    color: "#AF2532",
    fontFamily: "NotificationBold",
    fontSize: 22,
    marginBottom: 10,
    textAlign: "center",
  },

  message: {
    color: "#6C757D",
    fontFamily: "NotificationRegular",
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 20,
    textAlign: "center",
  },

  loginButton: {
    alignItems: "center",
    backgroundColor: "#AF2532",
    borderRadius: 40,
    paddingVertical: 13,
    width: "100%",
  },

  loginButtonText: {
    color: "white",
    fontFamily: "NotificationBold",
    fontSize: 18,
  },
});
