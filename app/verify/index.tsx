import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { auth } from "../../src/config/firebase";
import { uploadToCloudinary } from "../../src/services/image";

import {
  ensureUserProfile,
  getUserProfile,
  updateVerification,
  submitVerification,
  approveProviderVerification,
} from "../../src/services/users.api";

export default function ProviderVerification() {
  const router = useRouter();

  // Local-only state (NOT saved to DB until submit)
  const [idFrontUrl, setIdFrontUrl] = useState<string | null>(null);
  const [idBackUrl, setIdBackUrl] = useState<string | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<null | "front" | "back" | "certificate">(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!(idFrontUrl && idBackUrl && phoneVerified);

  // ✅ performance: prevent spinner + extra firestore calls on every focus
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  // ✅ Only check auth + already-verified status.
  // ❌ Do NOT prefill saved progress (you requested empty when re-entering).
  const load = useCallback(async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      Alert.alert("Error", "You are not logged in");
      router.back();
      return;
    }

    try {
      // ✅ Only show spinner first time (avoid delay feeling)
      if (!hasLoadedOnce) setLoading(true);

      // ✅ Fast path: read doc first
      let userDoc = await getUserProfile(uid);

      // ✅ If missing, create once then read again
      if (!userDoc) {
        await ensureUserProfile(uid, { email: auth.currentUser?.email ?? "" });
        userDoc = await getUserProfile(uid);
      }

      if (!userDoc) return;

      // ✅ Already verified → just go back (NO alert)
      if (userDoc.verification?.status === "approved" || userDoc.isVerified) {
        router.back();
        return;
      }

      // Always start fresh (nothing loaded from DB)
      setIdFrontUrl(null);
      setIdBackUrl(null);
      setCertificateUrl(null);
      setPhone("");
      setPhoneVerified(false);

      setHasLoadedOnce(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load verification");
    } finally {
      if (!hasLoadedOnce) setLoading(false);
    }
  }, [router, hasLoadedOnce]);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow gallery access.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.85,
      aspect: [4, 3],
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  // ✅ Upload to Cloudinary only (local state). No DB writes here.
  const uploadLocal = async (type: "front" | "back" | "certificate") => {
    try {
      // Block front/back upload if already exists (one per slot)
      if (type === "front" && idFrontUrl) return;
      if (type === "back" && idBackUrl) return;

      const uri = await pickImage();
      if (!uri) return;

      setUploading(type);

      const url = await uploadToCloudinary(uri);

      if (type === "front") setIdFrontUrl(url);
      if (type === "back") setIdBackUrl(url);

      // Certificate can be replaced unlimited times
      if (type === "certificate") setCertificateUrl(url);
    } catch (e: any) {
      console.log("Upload error:", e);
      Alert.alert("Upload failed", e?.message || "Something went wrong");
    } finally {
      setUploading(null);
    }
  };

  const removeLocal = (type: "front" | "back" | "certificate") => {
    if (type === "front") setIdFrontUrl(null);
    if (type === "back") setIdBackUrl(null);
    if (type === "certificate") setCertificateUrl(null);
  };

  // ✅ Local "verify" only (no DB write until submit)
  const handleVerifyPhone = async () => {
    if (!phone.trim()) {
      Alert.alert("Validation", "Please enter a phone number.");
      return;
    }
    setPhoneVerified(true);
  };

  // ✅ Save everything ONLY here
  const handleSubmit = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      if (!canSubmit) {
        Alert.alert("Incomplete", "Please complete required steps before submitting.");
        return;
      }

      setSubmitting(true);

      // 1) Save all verification info to DB now (single write path)
      await updateVerification(uid, {
        nationalId: {
          frontUploaded: true,
          frontUrl: idFrontUrl,
          backUploaded: true,
          backUrl: idBackUrl,
        },
        phone: {
          number: phone.trim(),
          verified: true,
        },
        certificatesUploaded: !!certificateUrl,
      });

      // 2) Submit + approve (your current flow)
      await submitVerification(uid);
      await approveProviderVerification(uid);

      Alert.alert("Success", "Verification successful! Your provider account is now active.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading verification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.9}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Provider Verification</Text>

          <View style={{ width: 34 }} />
        </View>

        {/* NATIONAL ID */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>National ID Upload (Required)</Text>
            <Text style={styles.statusText}>
              {idFrontUrl && idBackUrl ? "Completed" : "Pending"}
            </Text>
          </View>

          <Text style={styles.desc}>
            Upload clear photos of both sides of your National ID.
          </Text>

          {/* FRONT SLOT */}
          <View style={styles.slotWrap}>
            <TouchableOpacity
              style={[styles.uploadSlot, idFrontUrl && styles.uploadSlotFilled]}
              onPress={() => uploadLocal("front")}
              disabled={!!idFrontUrl || uploading !== null || submitting}
              activeOpacity={0.9}
            >
              {idFrontUrl ? (
                <>
                  <Image source={{ uri: idFrontUrl }} style={styles.slotImage} />
                  <View style={styles.slotLabelRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text style={styles.slotLabel}>Front Uploaded</Text>
                  </View>
                </>
              ) : (
                <>
                  {uploading === "front" ? (
                    <ActivityIndicator />
                  ) : (
                    <Ionicons name="cloud-upload-outline" size={30} color="#111827" />
                  )}
                  <Text style={styles.uploadText}>Upload ID – Front Side</Text>
                </>
              )}
            </TouchableOpacity>

            {idFrontUrl && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeLocal("front")}
                activeOpacity={0.9}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* BACK SLOT */}
          <View style={styles.slotWrap}>
            <TouchableOpacity
              style={[styles.uploadSlot, idBackUrl && styles.uploadSlotFilled]}
              onPress={() => uploadLocal("back")}
              disabled={!!idBackUrl || uploading !== null || submitting}
              activeOpacity={0.9}
            >
              {idBackUrl ? (
                <>
                  <Image source={{ uri: idBackUrl }} style={styles.slotImage} />
                  <View style={styles.slotLabelRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text style={styles.slotLabel}>Back Uploaded</Text>
                  </View>
                </>
              ) : (
                <>
                  {uploading === "back" ? (
                    <ActivityIndicator />
                  ) : (
                    <Ionicons name="cloud-upload-outline" size={30} color="#111827" />
                  )}
                  <Text style={styles.uploadText}>Upload ID – Back Side</Text>
                </>
              )}
            </TouchableOpacity>

            {idBackUrl && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeLocal("back")}
                activeOpacity={0.9}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* PHONE */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Phone Number (Required)</Text>
            <Text style={styles.statusText}>{phoneVerified ? "Verified" : "Pending"}</Text>
          </View>

          <Text style={styles.desc}>
            Enter a valid phone number. (OTP can be added later.)
          </Text>

          <View style={styles.phoneRow}>
            <TextInput
              placeholder="+94 77 123 4567"
              style={styles.phoneInput}
              value={phone}
              onChangeText={(t) => {
                setPhone(t);
                setPhoneVerified(false);
              }}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[styles.verifyBtn, (!phone.trim() || phoneVerified) && styles.btnDisabled]}
              disabled={!phone.trim() || phoneVerified || submitting}
              onPress={handleVerifyPhone}
              activeOpacity={0.9}
            >
              <Text style={styles.verifyBtnText}>Verify</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CERTIFICATES */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Certificates (Optional)</Text>
            <Text style={styles.statusText}>{certificateUrl ? "Uploaded" : "Optional"}</Text>
          </View>

          <Text style={styles.desc}>
            Upload certificates, licenses, or portfolio (if any).
          </Text>

          <View style={styles.slotWrap}>
            <TouchableOpacity
              style={[styles.uploadSlot, certificateUrl && styles.uploadSlotFilled]}
              onPress={() => uploadLocal("certificate")}
              disabled={uploading !== null || submitting}
              activeOpacity={0.9}
            >
              {certificateUrl ? (
                <>
                  <Image source={{ uri: certificateUrl }} style={styles.slotImage} />
                  <View style={styles.slotLabelRow}>
                    <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                    <Text style={styles.slotLabel}>Certificate Uploaded</Text>
                  </View>
                  <Text style={styles.changeHint}>Tap to change</Text>
                </>
              ) : (
                <>
                  {uploading === "certificate" ? (
                    <ActivityIndicator />
                  ) : (
                    <Ionicons name="cloud-upload-outline" size={30} color="#111827" />
                  )}
                  <Text style={styles.uploadText}>Upload Certificate</Text>
                </>
              )}
            </TouchableOpacity>

            {certificateUrl && (
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeLocal("certificate")}
                activeOpacity={0.9}
              >
                <Ionicons name="trash-outline" size={18} color="#EF4444" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.submitBtn, (!canSubmit || submitting) && styles.btnDisabled]}
          disabled={!canSubmit || submitting}
          onPress={handleSubmit}
          activeOpacity={0.9}
        >
          <Text style={styles.submitText}>
            {submitting ? "Submitting..." : "Submit for Review"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  container: { flex: 1, backgroundColor: "#F3F4F6" },
  content: { padding: 16, paddingBottom: 28 },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 10, color: "#6B7280" },

  header: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#EEF2F7",
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontWeight: "800", fontSize: 14.5, color: "#111827" },
  statusText: { fontSize: 12, color: "#9CA3AF", fontWeight: "700" },
  desc: { color: "#6B7280", marginTop: 6, marginBottom: 10, lineHeight: 18 },

  slotWrap: { position: "relative", marginTop: 10 },

  uploadSlot: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    minHeight: 140,
  },
  uploadSlotFilled: {
    borderStyle: "solid",
    borderColor: "#E5E7EB",
    paddingVertical: 10,
  },
  uploadText: { marginTop: 8, fontWeight: "800", color: "#111827" },

  slotImage: {
    width: "100%",
    height: 110,
    borderRadius: 10,
    marginBottom: 10,
  },
  slotLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  slotLabel: { fontWeight: "800", color: "#111827" },
  changeHint: { marginTop: 6, color: "#6B7280", fontSize: 12, fontWeight: "700" },

  removeBtn: {
    position: "absolute",
    right: 10,
    top: 10,
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },

  phoneRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  verifyBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyBtnText: { fontWeight: "800", color: "#111827" },

  submitBtn: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 6,
    marginBottom: 20,
  },
  submitText: { color: "#fff", textAlign: "center", fontWeight: "900", fontSize: 16 },

  btnDisabled: { opacity: 0.5 },
});
