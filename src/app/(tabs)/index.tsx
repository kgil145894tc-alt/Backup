import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Campus Map</Text>

      <Text style={styles.subtitle}>
        Find buildings and navigate around campus.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/(tabs)/map")}
      >
        <Text style={styles.buttonText}>Open Map</Text>
      </Pressable>

      <Pressable
        style={styles.button}
        onPress={() => router.push("/(tabs)/search")}
      >
        <Text style={styles.buttonText}>Search Buildings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 30,
  },

  button: {
    width: "100%",
    padding: 15,
    backgroundColor: "#333",
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
