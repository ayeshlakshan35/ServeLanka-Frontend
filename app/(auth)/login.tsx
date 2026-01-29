import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { loginWithEmail } from "../../src/services/authService";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try {
      setLoading(true);
      await loginWithEmail(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert(
        "Login Error",
        error.message || "An error occurred during login.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Log in</Text>

      <View style={styles.inputContainer}>
        <Ionicons name="mail-outline" size={20} color="#6B7280" />
        <TextInput
          placeholder="Email Address"
          placeholderTextColor="#9CA3AF"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          secureTextEntry
          style={styles.input}
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity style={styles.forgotContainer}>
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.loginText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/register")}>
        <Text style={styles.registerText}>
          Don’t have an account?{" "}
          <Text style={styles.registerLink}>Register</Text>
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
    marginBottom: 32,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#111827",
  },
  forgotContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  forgotText: {
    color: "#6B7280",
  },
  loginButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  loginText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  registerText: {
    textAlign: "center",
    color: "#F5A623",
  },
  registerLink: {
    fontWeight: "600",
  },
});
