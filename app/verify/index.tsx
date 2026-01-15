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
import { useState } from "react";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { auth, db } from "../../src/config/firebase";
import { doc, setDoc } from "firebase/firestore";
import { uploadToCloudinary } from "../../src/services/image";

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
  const [uploading, setUploading] = useState<
    null | "front" | "back" | "certificate"
  >(null);

  const canSubmit = !!(idFrontUrl && idBackUrl && phoneVerified);

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

      // 1) Upload to Cloudinary
      const url = await uploadToCloudinary(uri);

      // 2) Save URL in Firestore (inside users document)
      // We store under verification object
      const dataToSave =
        type === "front"
          ? { verification: { nationalIdFrontUrl: url } }
          : type === "back"
          ? { verification: { nationalIdBackUrl: url } }
          : { verification: { certificateUrl: url } };

      await setDoc(doc(db, "users", uid), dataToSave, { merge: true });

      // 3) Update UI state
      if (type === "front") setIdFrontUrl(url);
      if (type === "back") setIdBackUrl(url);
      if (type === "certificate") setCertificateUrl(url);

      Alert.alert("Success", "Upload completed!");
    } catch (e: any) {
      console.log("Upload error:", e);
      Alert.alert("Upload failed", e?.message || "Something went wrong");
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    try {
      const uid = auth.currentUser?.uid;
      if (!uid) return;

      // Save phone and mark request submitted
      await setDoc(
        doc(db, "users", uid),
        {
          verification: {
            phone,
            phoneVerified: true,
            submittedAt: new Date(),
            status: "pending",
          },
          // keep role/user verified as is (admin can approve later)
        },
        { merge: true }
      );

      Alert.alert("Submitted!", "Your verification was submitted for review.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to submit verification");
    }
  };

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
          <Text style={styles.status}>
            {idFrontUrl && idBackUrl ? "Completed" : "Pending"}
          </Text>
        </View>

        <Text style={styles.desc}>
          Upload clear photos of both sides of your National ID.
        </Text>

        {/* FRONT */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => uploadAndSave("front")}
          disabled={uploading !== null}
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

        {idFrontUrl && (
          <Image source={{ uri: idFrontUrl }} style={styles.preview} />
        )}

        {/* BACK */}
        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => uploadAndSave("back")}
          disabled={uploading !== null}
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

        {idBackUrl && (
          <Image source={{ uri: idBackUrl }} style={styles.preview} />
        )}
      </View>

      {/* PHONE VERIFICATION (MANDATORY) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Phone Number (Required)</Text>
          <Text style={styles.status}>
            {phoneVerified ? "Verified" : "Pending"}
          </Text>
        </View>

        <Text style={styles.desc}>
          Enter a valid phone number. (OTP can be added later.)
        </Text>

        <View style={styles.phoneRow}>
          <TextInput
            placeholder="+94 77 123 4567"
            style={styles.phoneInput}
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.verifyBtn, !phone && styles.disabledBtn]}
            disabled={!phone}
            onPress={() => setPhoneVerified(true)}
          >
            <Text style={styles.verifyText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CERTIFICATES (OPTIONAL) */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Certificates (Optional)</Text>
          <Text style={styles.status}>
            {certificateUrl ? "Uploaded" : "Optional"}
          </Text>
        </View>

        <Text style={styles.desc}>
          Upload certificates, licenses, or portfolio (if any).
        </Text>

        <TouchableOpacity
          style={styles.uploadBox}
          onPress={() => uploadAndSave("certificate")}
          disabled={uploading !== null}
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

        {certificateUrl && (
          <Image source={{ uri: certificateUrl }} style={styles.preview} />
        )}
      </View>

      {/* SUBMIT */}
      <TouchableOpacity
        style={[styles.submitBtn, !canSubmit && styles.disabledBtn]}
        disabled={!canSubmit}
        onPress={handleSubmit}
      >
        <Text style={styles.submitText}>Submit for Review</Text>
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
