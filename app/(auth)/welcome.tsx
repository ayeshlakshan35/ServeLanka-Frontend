import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Welcome() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      
      <View style={styles.center}>

        
        <View style={styles.logo}>
          <View style={styles.iconRow}>
            <View style={styles.iconBox} />
            <View style={styles.iconBox} />
          </View>
          <View style={styles.iconRow}>
            <View style={styles.iconBox} />
            <View style={styles.iconBox} />
          </View>
        </View>

        
        <Text style={styles.subtitle}>
          Connecting you with local services, effortlessly.
        </Text>
      </View>

      
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
    padding: 24,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 64,
    height: 64,
    backgroundColor: "#F5A623",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  iconRow: {
    flexDirection: "row",
  },
  iconBox: {
    width: 10,
    height: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 3,
    margin: 3,
  },
  subtitle: {
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    paddingHorizontal: 30,
  },
  button: {
    backgroundColor: "#F5A623",
    paddingVertical: 16,
    borderRadius: 12,
  },
  buttonText: {
    textAlign: "center",
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
});
