// app/verify/index.tsx
import React, { useEffect, useState } from "react";
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

  // URLs
  const [idFrontUrl, setIdFrontUrl] = useState<string | null>(null);
  const [idBackUrl, setIdBackUrl] = useState<string | null>(null);
  const [certificateUrl, setCertificateUrl] = useState<string | null>(null);

  // Phone
  const [phone, setPhone] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Loading
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<null | "front" | "back" | "certificate">(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = !!(idFrontUrl && idBackUrl && phoneVerified);

  useEffect(() => {
    const load = async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "You are not logged in");
        router.back();
        return;
      }

      try {
        setLoading(true);

        await ensureUserProfile(uid, { email: auth.currentUser?.email ?? "" });

        const userDoc = await getUserProfile(uid);
        if (!userDoc) return;

        if (userDoc.verification?.status === "approved" || userDoc.isVerified) {
          Alert.alert("Already Verified", "Your account is already verified as a provider.");
          router.back();
          return;
        }

        const v = userDoc.verification;

        setIdFrontUrl(v?.nationalId?.frontUrl ?? null);
        setIdBackUrl(v?.nationalId?.backUrl ?? null);

        setPhone(v?.phone?.number ?? "");
        setPhoneVerified(!!v?.phone?.verified);

        const anyCertUrl = (userDoc as any)?.verification?.certificateUrl ?? null;
        setCertificateUrl(anyCertUrl);
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load verification");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow gallery access.");
      return null;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const uploadAndSave = async (type: "front" | "back" | "certificate") => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        Alert.alert("Error", "You are not logged in");
        return;
      }

      const uri = await pickImage();
      if (!uri) return;

      setUploading(type);

      const url = await uploadToCloudinary(uri);

      if (type === "front") {
        await updateVerification(uid, {
          nationalId: { frontUploaded: true, frontUrl: url },
        });
        setIdFrontUrl(url);
      }

      if (type === "back") {
        await updateVerification(uid, {
          nationalId: { backUploaded: true, backUrl: url },
        });
        setIdBackUrl(url);
      }

      if (type === "certificate") {
        await updateVerification(uid, { certificatesUploaded: true });
        setCertificateUrl(url);
      }

      Alert.alert("Success", "Upload completed!");
    } catch (e: any) {
      console.log("Upload error:", e);
      Alert.alert("Upload failed", e?.message || "Something went wrong");
    } finally {
      setUploading(null);
    }
  };

  const handleVerifyPhone = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!phone.trim()) {
      Alert.alert("Validation", "Please enter a phone number.");
      return;
    }

    try {
      await updateVerification(uid, {
        phone: { number: phone.trim(), verified: true },
      });
      setPhoneVerified(true);
      Alert.alert("Verified", "Phone marked as verified (OTP can be added later).");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to verify phone");
    }
  };

  const handleSubmit = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      if (!canSubmit) {
        Alert.alert("Incomplete", "Please complete required steps before submitting.");
        return;
      }

      setSubmitting(true);

      await updateVerification(uid, {
        phone: { number: phone.trim(), verified: true },
      });

      await submitVerification(uid);
      await approveProviderVerification(uid);

      Alert.alert("Success", "Verification successful! Your provider account is now active.");
      router.back(); // ✅ back to previous screen
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to submit verification");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.loadingWrap]}>
          <ActivityIndicator size="large" />
          <Text style={{ marginTop: 10, color: "#6B7280" }}>Loading verification...</Text>
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Provider Verification</Text>

          {/* spacer for perfect center */}
          <View style={{ width: 34 }} />
        </View>

        {/* NATIONAL ID */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>National ID Upload (Required)</Text>
            <Text style={styles.statusText}>{idFrontUrl && idBackUrl ? "Completed" : "Pending"}</Text>
          </View>

          <Text style={styles.desc}>
            Upload clear photos of both sides of your National ID.
          </Text>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => uploadAndSave("front")}
            disabled={uploading !== null || submitting}
            activeOpacity={0.9}
          >
            {uploading === "front" ? (
              <ActivityIndicator />
            ) : (
              <Ionicons name="cloud-upload-outline" size={30} color="#111827" />
            )}
            <Text style={styles.uploadText}>
              {idFrontUrl ? "Front Uploaded ✅" : "Upload ID – Front Side"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => uploadAndSave("back")}
            disabled={uploading !== null || submitting}
            activeOpacity={0.9}
          >
            {uploading === "back" ? (
              <ActivityIndicator />
            ) : (
              <Ionicons name="cloud-upload-outline" size={30} color="#111827" />
            )}
            <Text style={styles.uploadText}>
              {idBackUrl ? "Back Uploaded ✅" : "Upload ID – Back Side"}
            </Text>
          </TouchableOpacity>

          {/* previews are optional, keep your feature */}
          {idFrontUrl && <Image source={{ uri: idFrontUrl }} style={styles.preview} />}
          {idBackUrl && <Image source={{ uri: idBackUrl }} style={styles.preview} />}
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
              style={[styles.verifyBtn, !phone.trim() && styles.btnDisabled]}
              disabled={!phone.trim() || submitting}
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

          <TouchableOpacity
            style={styles.uploadBox}
            onPress={() => uploadAndSave("certificate")}
            disabled={uploading !== null || submitting}
            activeOpacity={0.9}
          >
            {uploading === "certificate" ? (
              <ActivityIndicator />
            ) : (
              <Ionicons name="cloud-upload-outline" size={30} color="#111827" />
            )}
            <Text style={styles.uploadText}>
              {certificateUrl ? "Certificate Uploaded ✅" : "Upload Certificate"}
            </Text>
          </TouchableOpacity>

          {certificateUrl && <Image source={{ uri: certificateUrl }} style={styles.preview} />}
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            (!canSubmit || submitting) && styles.btnDisabled,
          ]}
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
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  content: {
    padding: 16,
    paddingBottom: 28,
  },
  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontWeight: "800",
    fontSize: 14.5,
    color: "#111827",
  },
  statusText: {
    fontSize: 12,
    color: "#9CA3AF",
    fontWeight: "700",
  },
  desc: {
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 10,
    lineHeight: 18,
  },

  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    backgroundColor: "#FFFFFF",
  },
  uploadText: {
    marginTop: 8,
    fontWeight: "800",
    color: "#111827",
  },

  preview: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    marginTop: 12,
  },

  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
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
  verifyBtnText: {
    fontWeight: "800",
    color: "#111827",
  },

  submitBtn: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 6,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
    fontSize: 16,
  },

  btnDisabled: {
    opacity: 0.5,
  },
});
