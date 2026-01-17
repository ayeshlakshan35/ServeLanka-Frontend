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

import { auth } from "../../src/config/firebase";
import { registerWithEmail } from "../../src/services/authService";
import { createUserProfile } from "../../src/services/users.api";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Firebase Auth (UNCHANGED – your working logic)
      await registerWithEmail(name.trim(), email.trim(), password);

      // 2️⃣ Get current user from Firebase Auth
      const user = auth.currentUser;

      if (!user) {
        throw new Error("User not found after registration");
      }

      // 3️⃣ Save user profile in Firestore
      await createUserProfile(user.uid, name.trim(), email.trim());

      Alert.alert("Success", "Account created successfully!");

      // 4️⃣ Go to login (or home if you prefer)
      router.replace("/login");

    } catch (error: any) {
      Alert.alert(
        "Registration Error",
        error.message || "An error occurred during registration."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Register</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        placeholder="Enter your full name"
        placeholderTextColor="#9CA3AF"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        placeholder="your.email@example.com"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        placeholder="Create a strong password"
        placeholderTextColor="#9CA3AF"
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.createText}>
          {loading ? "Creating..." : "Create Account"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.replace("/login")}>
        <Text style={styles.loginText}>
          Already have an account?{" "}
          <Text style={styles.loginLink}>Login</Text>
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
