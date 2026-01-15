import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useCallback, useState } from "react";
import { auth } from "../../src/config/firebase";
import {
  ensureUserProfile,
  getUserProfile,
  updateUserProfile,
  isProviderApproved,
  UserDoc,
} from "../../src/services/users.api";
import { signOut } from "firebase/auth";
import { useRouter, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../src/services/image";

export default function Profile() {
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"profile" | "activity">("profile");
  const router = useRouter();

  // Photo URL from Firestore
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      // ✅ Ensure doc exists
      await ensureUserProfile(user.uid, {
        email: user.email ?? "",
        name: "",
      });

      const data = await getUserProfile(user.uid);

      setUserData(data);
      setPhotoUrl(data?.photoUrl ?? null);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Refresh when returning from edit/verify screens
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const pickAndUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      setLoading(true);

      // 1) Upload to Cloudinary
      const url = await uploadToCloudinary(result.assets[0].uri);

      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Not logged in");

      // 2) Save URL in Firestore
      await updateUserProfile(uid, { photoUrl: url });

      // 3) Update UI
      setPhotoUrl(url);

      Alert.alert("Success", "Profile photo updated!");
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Logout failed");
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={styles.subText}>No user data found.</Text>
      </View>
    );
  }

  // ✅ verified status: before = Not Verified, after = Verified Provider
  const isVerified = isProviderApproved(userData) || !!userData?.isVerified;

  // ✅ Show these like name/email
  const displayName = userData?.name?.trim() ? userData.name : "Your Name";
  const displayEmail = userData?.email || auth.currentUser?.email || "";

  // If empty, show nothing (clean UI)
  const displayPhone = userData?.phone?.trim() ? userData.phone : "";
  const displayAddress = userData?.address?.trim() ? userData.address : "";

  return (
    <ScrollView style={styles.container}>
      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        {/* Edit Icon */}
        <TouchableOpacity
          style={styles.editIcon}
          onPress={() => router.push("/profile/edit")}
        >
          <Ionicons name="pencil" size={18} color="#555" />
        </TouchableOpacity>

        {/* Avatar + Upload */}
        <TouchableOpacity onPress={pickAndUpload} activeOpacity={0.8}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={{ fontSize: 12, color: "#6B7280" }}>No Photo</Text>
              <Text style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>
                Tap to add
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Name + Email + Phone + Address */}
        <View style={styles.info}>
          <Text style={styles.name}>{displayName}</Text>

          <Text style={styles.subText}>{displayEmail}</Text>

          {/* ✅ Phone (shows only if saved) */}
          {!!displayPhone && <Text style={styles.subText}>{displayPhone}</Text>}

          {/* ✅ Address (shows only if saved) */}
          {!!displayAddress && <Text style={styles.subText}>{displayAddress}</Text>}

          {/* Verified badge */}
          {isVerified ? (
            <View style={styles.verifiedBadge}>
              <Text style={styles.verifiedText}>Verified Provider</Text>
            </View>
          ) : (
            <View style={styles.notVerifiedBadge}>
              <Text style={styles.notVerifiedText}>Not Verified</Text>
            </View>
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "profile" && styles.activeTab]}
          onPress={() => setTab("profile")}
        >
          <Text style={[styles.tabText, tab === "profile" && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === "activity" && styles.activeTab]}
          onPress={() => setTab("activity")}
        >
          <Text style={[styles.tabText, tab === "activity" && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      {/* PROFILE TAB */}
      {tab === "profile" && (
        <>
          {/* ✅ If Verified: show “completed” look (like img1 without posts) */}
          {isVerified ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Provider Verification</Text>
              <Text style={styles.sectionDesc}>
                Your provider account is verified. You can now create posts and offer
                services.
              </Text>

              <View style={styles.row}>
                <Text style={styles.rowText}>Identity Document Upload</Text>
                <View style={styles.statusDone}>
                  <Text style={styles.statusDoneText}>Completed</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowText}>Phone Number Verification</Text>
                <View style={styles.statusDone}>
                  <Text style={styles.statusDoneText}>Completed</Text>
                </View>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowText}>Service Proof Upload</Text>
                <View style={styles.statusDone}>
                  <Text style={styles.statusDoneText}>Completed</Text>
                </View>
              </View>
            </View>
          ) : (
            /* ✅ If NOT verified: show verify card + button (img3) */
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Unlock More Opportunities</Text>
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
                <Text style={styles.verifyText}>Verify as Provider</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {/* ACTIVITY TAB */}
      {tab === "activity" && (
        <View style={styles.center}>
          <Text style={styles.subText}>No activity yet</Text>
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
    zIndex: 10,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
  },

  // ✅ reuse for email/phone/address
  subText: {
    color: "#6B7280",
    marginTop: 2,
  },

  verifiedBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
  },

  notVerifiedBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  notVerifiedText: {
    color: "#9A3412",
    fontSize: 12,
    fontWeight: "700",
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

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  rowText: {
    color: "#111827",
    fontWeight: "600",
  },
  statusDone: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  statusDoneText: {
    color: "#166534",
    fontSize: 12,
    fontWeight: "700",
  },
});
