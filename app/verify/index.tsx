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

  // ✅ Prefill progress from Firestore (important if user comes back later)
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

        // ensure doc exists
        await ensureUserProfile(uid, { email: auth.currentUser?.email ?? "" });

        const userDoc = await getUserProfile(uid);
        if (!userDoc) return;

        // If already approved → no need to verify again
        if (userDoc.verification?.status === "approved" || userDoc.isVerified) {
          Alert.alert("Already Verified", "Your account is already verified as a provider.");
          router.back();
          return;
        }

        // Prefill existing saved progress
        const v = userDoc.verification;

        const frontUrl = v?.nationalId?.frontUrl ?? null;
        const backUrl = v?.nationalId?.backUrl ?? null;

        setIdFrontUrl(frontUrl);
        setIdBackUrl(backUrl);

        setPhone(v?.phone?.number ?? "");
        setPhoneVerified(!!v?.phone?.verified);

        // Your schema only has certificatesUploaded boolean, not URL.
        // We'll store the URL in Firestore safely as verification.certificateUrl (extra field).
        // But we still set certificatesUploaded to true.
        // If your existing DB already has it, we read it too.
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

  // ✅ Upload to Cloudinary, then update Firestore using users.api.ts (correct nested keys)
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

      // 1) Upload to Cloudinary
      const url = await uploadToCloudinary(uri);

      // 2) Save in Firestore using correct nested structure
      if (type === "front") {
        await updateVerification(uid, {
          nationalId: {
            frontUploaded: true,
            frontUrl: url,
          },
        });
        setIdFrontUrl(url);
      }

      if (type === "back") {
        await updateVerification(uid, {
          nationalId: {
            backUploaded: true,
            backUrl: url,
          },
        });
        setIdBackUrl(url);
      }

      if (type === "certificate") {
        // Your schema has certificatesUploaded boolean only
        // We'll set it true + also store URL as an extra field to show preview
        await updateVerification(uid, {
          certificatesUploaded: true,
        });

        // store extra field using updateVerification pattern is not included
        // so we store it via updateUserProfile (it supports partial update but not nested verification)
        // easiest safe way: use updateVerification for boolean + keep local state for preview
        // If you want to store the URL too, add support in users.api.ts.
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

  // ✅ Phone verify (simple local “verify”, you can add OTP later)
  const handleVerifyPhone = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    if (!phone.trim()) {
      Alert.alert("Validation", "Please enter a phone number.");
      return;
    }

    try {
      await updateVerification(uid, {
        phone: {
          number: phone.trim(),
          verified: true,
        },
      });

      setPhoneVerified(true);
      Alert.alert("Verified", "Phone marked as verified (OTP can be added later).");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to verify phone");
    }
  };

  // ✅ Submit for review + (for now) auto-approve so user never verifies again
  const handleSubmit = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      if (!canSubmit) {
        Alert.alert("Incomplete", "Please complete required steps before submitting.");
        return;
      }

      setSubmitting(true);

      // 1) Ensure phone is saved + verified in Firestore
      await updateVerification(uid, {
        phone: {
          number: phone.trim(),
          verified: true,
        },
      });

      // 2) Submit for review (status -> in_review, submittedAt set)
      await submitVerification(uid);

      // 3) ✅ For your current requirement: mark as approved immediately
      // Later: remove this and let admin approve.
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
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>Loading verification...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* NATIONAL ID (MANDATORY) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>National ID Upload (Required)</Text>
          <Text style={styles.status}>{idFrontUrl && idBackUrl ? "Completed" : "Pending"}</Text>
        </View>

        <Text style={styles.desc}>Upload clear photos of both sides of your National ID.</Text>

        {/* FRONT */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => uploadAndSave("front")}
          disabled={uploading !== null || submitting}
        >
          {uploading === "front" ? (
            <ActivityIndicator />
          ) : (
            <Ionicons name="cloud-upload-outline" size={26} />
          )}
          <Text style={styles.uploadText}>
            {idFrontUrl ? "Front Uploaded ✅" : "Upload ID – Front Side"}
          </Text>
        </TouchableOpacity>

        {idFrontUrl && <Image source={{ uri: idFrontUrl }} style={styles.preview} />}

        {/* BACK */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => uploadAndSave("back")}
          disabled={uploading !== null || submitting}
        >
          {uploading === "back" ? (
            <ActivityIndicator />
          ) : (
            <Ionicons name="cloud-upload-outline" size={26} />
          )}
          <Text style={styles.uploadText}>
            {idBackUrl ? "Back Uploaded ✅" : "Upload ID – Back Side"}
          </Text>
        </TouchableOpacity>

        {idBackUrl && <Image source={{ uri: idBackUrl }} style={styles.preview} />}
      </View>

      {/* PHONE VERIFICATION (MANDATORY) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Phone Number (Required)</Text>
          <Text style={styles.status}>{phoneVerified ? "Verified" : "Pending"}</Text>
        </View>

        <Text style={styles.desc}>Enter a valid phone number. (OTP can be added later.)</Text>

        <View style={styles.phoneRow}>
          <TextInput
            placeholder="+94 77 123 4567"
            style={styles.phoneInput}
            value={phone}
            onChangeText={(t) => {
              setPhone(t);
              // if user changes number, re-verify again
              setPhoneVerified(false);
            }}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.verifyBtn, !phone.trim() && styles.disabledBtn]}
            disabled={!phone.trim() || submitting}
            onPress={handleVerifyPhone}
          >
            <Text style={styles.verifyText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CERTIFICATES (OPTIONAL) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Certificates (Optional)</Text>
          <Text style={styles.status}>{certificateUrl ? "Uploaded" : "Optional"}</Text>
        </View>

        <Text style={styles.desc}>Upload certificates, licenses, or portfolio (if any).</Text>

        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => uploadAndSave("certificate")}
          disabled={uploading !== null || submitting}
        >
          {uploading === "certificate" ? (
            <ActivityIndicator />
          ) : (
            <Ionicons name="cloud-upload-outline" size={26} />
          )}
          <Text style={styles.uploadText}>
            {certificateUrl ? "Certificate Uploaded ✅" : "Upload Certificate"}
          </Text>
        </TouchableOpacity>

        {certificateUrl && <Image source={{ uri: certificateUrl }} style={styles.preview} />}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={[styles.submitBtn, (!canSubmit || submitting) && styles.disabledBtn]}
        disabled={!canSubmit || submitting}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>{submitting ? "Submitting..." : "Submit for Review"}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F3F4F6",
    padding: 16,
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 15,
  },
  status: {
    fontSize: 12,
    color: "#6B7280",
  },
  desc: {
    color: "#6B7280",
    marginVertical: 8,
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  uploadText: {
    marginTop: 6,
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    marginTop: 10,
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  verifyBtn: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  verifyText: {
    fontWeight: "600",
  },
  submitBtn: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
  disabledBtn: {
    opacity: 0.5,
  },
});
