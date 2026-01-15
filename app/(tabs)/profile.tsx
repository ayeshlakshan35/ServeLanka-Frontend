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

      const url = await uploadToCloudinary(result.assets[0].uri);

      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Not logged in");

      await updateUserProfile(uid, { photoUrl: url });
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

  const isVerified = isProviderApproved(userData) || !!userData?.isVerified;

  const displayName = userData?.name?.trim() ? userData.name : "Your Name";
  const displayEmail = userData?.email || auth.currentUser?.email || "";
  const displayPhone = userData?.phone?.trim() ? userData.phone : "";
  const displayAddress = userData?.address?.trim() ? userData.address : "";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.pageTitle}>Profile</Text>

      <View style={styles.profileCard}>
        <TouchableOpacity onPress={pickAndUpload} activeOpacity={0.85}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={{ fontSize: 11, color: "#6B7280" }}>No Photo</Text>
              <Text style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}>
                Tap to add
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* ✅ pointerEvents box-none so the absolute edit button receives taps */}
        <View style={styles.info} pointerEvents="box-none">
          <TouchableOpacity
            style={styles.editBtnInline}
            onPress={() => router.push("/profile/edit")}
            activeOpacity={0.85}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="pencil" size={16} color="#374151" />
          </TouchableOpacity>

          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.subText}>{displayEmail}</Text>
          {!!displayPhone && <Text style={styles.subText}>{displayPhone}</Text>}
          {!!displayAddress && <Text style={styles.subText}>{displayAddress}</Text>}

          <View style={styles.badgeRow}>
            {isVerified ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>Verified Provider</Text>
              </View>
            ) : (
              <View style={styles.notVerifiedBadge}>
                <Text style={styles.notVerifiedText}>Not Verified</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.logoutBtn}
              activeOpacity={0.9}
            >
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tabBtn, tab === "profile" && styles.activeTab]}
          onPress={() => setTab("profile")}
          activeOpacity={0.9}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={16}
            color={tab === "profile" ? "#111827" : "#6B7280"}
          />
          <Text style={[styles.tabText, tab === "profile" && styles.activeTabText]}>
            Verify as Provider
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabBtn, tab === "activity" && styles.activeTab]}
          onPress={() => setTab("activity")}
          activeOpacity={0.9}
        >
          <Ionicons
            name="pulse-outline"
            size={16}
            color={tab === "activity" ? "#111827" : "#6B7280"}
          />
          <Text style={[styles.tabText, tab === "activity" && styles.activeTabText]}>
            Activity
          </Text>
        </TouchableOpacity>
      </View>

      {tab === "profile" && (
        <>
          {isVerified ? (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Provider Verification</Text>
              <Text style={styles.sectionDesc}>
                Your provider account is verified. You won’t need to verify again.
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
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Unlock More Opportunities</Text>
              <Text style={styles.sectionDesc}>
                Join our verified provider network and expand your reach.
              </Text>

              <View style={styles.benefits}>
                <View style={styles.benefitRow}>
                  <Ionicons name="briefcase-outline" size={18} color="#F59E0B" />
                  <Text style={styles.benefitText}>Increased Work Opportunities</Text>
                </View>

                <View style={styles.benefitRow}>
                  <Ionicons name="cash-outline" size={18} color="#F59E0B" />
                  <Text style={styles.benefitText}>Higher Earning Potential</Text>
                </View>

                <View style={styles.benefitRow}>
                  <Ionicons name="shield-checkmark-outline" size={18} color="#F59E0B" />
                  <Text style={styles.benefitText}>Trusted Provider Badge</Text>
                </View>
              </View>

              <View style={styles.divider} />
              <Text style={styles.smallHint}>Over 120 providers verified in your area!</Text>

              <TouchableOpacity
                onPress={() => router.push("/verify")}
                style={styles.verifyBtn}
                activeOpacity={0.9}
              >
                <Text style={styles.verifyText}>Verify as Provider</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}

      {tab === "activity" && (
        <View style={styles.activityWrap}>
          <Text style={styles.subText}>No activity yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { backgroundColor: "#F3F4F6", flex: 1 },
  content: { padding: 16, paddingBottom: 14 },

  pageTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },

  center: { alignItems: "center", justifyContent: "center", marginTop: 40 },

  profileCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: { width: 56, height: 56, borderRadius: 28 },
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
    position: "relative",
    paddingRight: 4,
  },

  // ✅ Make sure it is always on top (Android needs elevation)
  editBtnInline: {
    position: "absolute",
    right: 0,
    top: 0,
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    zIndex: 50,
    elevation: 8,
  },

  name: { fontSize: 16, fontWeight: "bold", paddingRight: 36 },
  subText: { color: "#6B7280", marginTop: 2, paddingRight: 36 },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },

  verifiedBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedText: { color: "#166534", fontSize: 12, fontWeight: "700" },

  notVerifiedBadge: {
    backgroundColor: "#FFEDD5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  notVerifiedText: { color: "#9A3412", fontSize: 12, fontWeight: "700" },

  logoutBtn: {
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 10,
  },
  logoutText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  tabs: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  activeTab: { backgroundColor: "#F59E0B" },
  tabText: { color: "#6B7280", fontSize: 12.5, fontWeight: "600" },
  activeTabText: { color: "#111827", fontWeight: "800" },

  card: { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginBottom: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 6, textAlign: "center" },
  sectionDesc: { color: "#6B7280", marginBottom: 12, textAlign: "center" },

  benefits: { marginTop: 6, gap: 10, paddingHorizontal: 4 },
  benefitRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  benefitText: { color: "#111827", fontWeight: "600" },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginTop: 14, marginBottom: 10 },
  smallHint: { textAlign: "center", color: "#6B7280", fontSize: 12, marginBottom: 12 },

  verifyBtn: { backgroundColor: "#F59E0B", paddingVertical: 14, borderRadius: 10 },
  verifyText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  rowText: { color: "#111827", fontWeight: "600" },
  statusDone: { backgroundColor: "#DCFCE7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  statusDoneText: { color: "#166534", fontSize: 12, fontWeight: "700" },

  activityWrap: { backgroundColor: "#fff", borderRadius: 12, padding: 16 },
});
