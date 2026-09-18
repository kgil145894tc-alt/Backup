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
            style={styles.closeButton}
            onPress={onClose}
          >
            <Text style={styles.closeText}>x</Text>
          </Pressable>

          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>L</Text>
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
    backgroundColor: "rgba(17, 24, 39, 0.58)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },

  card: {
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 8,
    maxWidth: 340,
    paddingHorizontal: 22,
    paddingBottom: 22,
    paddingTop: 30,
    width: "100%",
  },

  closeButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 34,
  },

  closeText: {
    color: "#9ca3af",
    fontSize: 22,
    fontWeight: "900",
  },

  iconCircle: {
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 38,
    height: 76,
    justifyContent: "center",
    marginBottom: 16,
    width: 76,
  },

  iconText: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "900",
  },

  title: {
    color: "#111827",
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 10,
    textAlign: "center",
  },

  message: {
    color: "#374151",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 20,
    textAlign: "center",
  },

  loginButton: {
    alignItems: "center",
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 13,
    width: "100%",
  },

  loginButtonText: {
    color: "white",
    fontSize: 15,
    fontWeight: "900",
  },
});

