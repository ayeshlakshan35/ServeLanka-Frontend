import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useEffect, useState } from "react";
import { auth } from "../../src/config/firebase";
import { getUserProfile } from "../../src/services/users.api";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profile" | "activity">("profile");
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const data = await getUserProfile(user.uid);
    setUserData(data);
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* PROFILE CARD – MATCHES DESIGN */}
      <View style={styles.profileCard}>
        {/* Edit Icon */}
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => router.push("/profile/edit")}
        >
          <Ionicons name="pencil" size={18} color="#555" />
        </TouchableOpacity>

        {/* Left: Avatar */}
        <Image
          source={{
            uri:
              userData.photoURL ||
              "https://i.pravatar.cc/150?img=47",
          }}
          style={styles.avatar}
        />

        {/* Middle: Name + Email */}
        <View style={styles.info}>
          <Text style={styles.name}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
        </View>

        {/* Right: Logout */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutBtn}
        >
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tabBtn,
            tab === "profile" && styles.activeTab,
          ]}
          onPress={() => setTab("profile")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "profile" && styles.activeTabText,
            ]}
          >
            Verify as Provider
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabBtn,
            tab === "activity" && styles.activeTab,
          ]}
          onPress={() => setTab("activity")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "activity" && styles.activeTabText,
            ]}
          >
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      {/* PROFILE TAB (USER) */}
      {tab === "profile" && userData.role === "user" && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Unlock More Opportunities
          </Text>
          <Text style={styles.sectionDesc}>
            Join our verified provider network and expand your reach.
          </Text>

          <Text style={styles.benefit}>🎯 Increased Work Opportunities</Text>
          <Text style={styles.benefit}>💰 Higher Earning Potential</Text>
          <Text style={styles.benefit}>✅ Trusted Provider Badge</Text>

          <TouchableOpacity
            onPress={() => router.push("/verify")}
            style={styles.verifyBtn}
          >
            <Text style={styles.verifyText}>
              Verify as Provider
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ACTIVITY TAB */}
      {tab === "activity" && (
        <View style={styles.center}>
          <Text style={styles.email}>No activity yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    flex: 1,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },

  /* PROFILE CARD */
  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    position: "relative",
  },
  editIcon: {
    position: "absolute",
    top: 12,
    right: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    color: "#6B7280",
    marginTop: 2,
  },
  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },

  /* TABS */
  tabs: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#F59E0B",
  },
  tabText: {
    color: "#6B7280",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "bold",
  },

  /* CONTENT CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  sectionDesc: {
    color: "#6B7280",
    marginBottom: 12,
    textAlign: "center",
  },
  benefit: {
    marginBottom: 6,
    textAlign: "center",
  },
  verifyBtn: {
    marginTop: 14,
    backgroundColor: "#F59E0B",
    paddingVertical: 14,
    borderRadius: 10,
  },
  verifyText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});
