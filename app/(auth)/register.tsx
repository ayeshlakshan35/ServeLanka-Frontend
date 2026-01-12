import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Register() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      <Text style={styles.pageTitle}>Register</Text>

     
      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Enter your full name"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="your.email@example.com"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        style={styles.input}
      />

     
      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Create a strong password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        style={styles.input}
      />

      
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.replace("/login")}
      >
        <Text style={styles.createText}>Create Account</Text>
      </TouchableOpacity>

     
      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={styles.loginLink}>Login</Text>
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 24,
  },
  label: {
    color: "#111827",
    marginBottom: 6,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    color: "#111827",
  },
  createButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  createText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  loginText: {
    textAlign: "center",
    color: "#F5A623",
  },
  loginLink: {
    fontWeight: "600",
  },
});
