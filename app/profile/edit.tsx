// app/profile/edit.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { auth } from "../../src/config/firebase";
import { uploadToCloudinary } from "../../src/services/image";
import { ensureUserProfile, getUserProfile, updateUserProfile } from "../../src/services/users.api";

export default function EditProfile() {
  const router = useRouter();

  // We store the REAL image URL (Cloudinary) here
  const [photoUrl, setPhotoUrl] = useState<string>("");

  const [name, setName] = useState("");
  const [profileEmail, setProfileEmail] = useState(""); // read-only display
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ Load & prefill existing saved data when screen opens
  useEffect(() => {
    const load = async () => {
      const user = auth.currentUser;
      if (!user) {
        Alert.alert("Error", "No logged-in user found.");
        router.back();
        return;
      }

      try {
        setLoading(true);

        // Ensure user doc exists (if missing, create default doc)
        await ensureUserProfile(user.uid, {
          name: "",
          email: user.email ?? "",
        });

        const doc = await getUserProfile(user.uid);

        // Prefill fields
        setName(doc?.name ?? "");
        setProfileEmail(doc?.email || user.email || "");
        setPhone(doc?.phone ?? "");
        setAddress(doc?.address ?? "");
        setPhotoUrl(doc?.photoUrl ?? "");
      } catch (e: any) {
        Alert.alert("Error", e?.message ?? "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  // ✅ Upload picked image to Cloudinary and set the URL
  const uploadAndSetPhoto = async (localUri: string) => {
    try {
      setUploading(true);

      // Your service should return a string URL
      const url = await uploadToCloudinary(localUri);

      if (!url || typeof url !== "string") {
        throw new Error("Cloudinary upload did not return a valid URL.");
      }

      setPhotoUrl(url);
      Alert.alert("Success", "Profile photo updated.");
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message ?? "Could not upload photo");
    } finally {
      setUploading(false);
    }
  };

  // Pick image from gallery
  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      await uploadAndSetPhoto(result.assets[0].uri);
    }
  };

  // Take photo using camera
  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow camera access.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      await uploadAndSetPhoto(result.assets[0].uri);
    }
  };

  // ✅ Save updated data to Firestore then go back
  const onSave = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No logged-in user found.");
      return;
    }

    if (!name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }

    try {
      setSaving(true);

      await updateUserProfile(user.uid, {
        name: name.trim(),
        // email is normally from auth; keep as read-only in edit UI
        phone: phone.trim(),
        address: address.trim(),
        photoUrl: photoUrl.trim(),
      });

      Alert.alert("Saved", "Profile updated successfully.");
      router.back(); // Profile should show updated data if it reloads on focus
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#6B7280" }}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>Edit Profile</Text>

      {/* PROFILE PHOTO */}
      <View style={styles.photoContainer}>
        <Image
          source={{
            uri: photoUrl || "https://i.pravatar.cc/150?img=47",
          }}
          style={styles.avatar}
        />

        <View style={styles.photoActions}>
          <TouchableOpacity onPress={pickFromGallery} style={styles.photoBtn} disabled={uploading}>
            <Text style={styles.photoBtnText}>{uploading ? "Uploading..." : "Gallery"}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={takePhoto} style={styles.photoBtn} disabled={uploading}>
            <Text style={styles.photoBtnText}>{uploading ? "Uploading..." : "Camera"}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Enter your name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Profile Email</Text>
        <TextInput
          placeholder="Enter profile email"
          style={[styles.input, styles.disabledInput]}
          keyboardType="email-address"
          value={profileEmail}
          editable={false}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          placeholder="Enter phone number"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          placeholder="Enter address"
          style={[styles.input, styles.textArea]}
          multiline
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelBtn} disabled={saving}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={onSave}
          disabled={saving || uploading}
        >
          <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  photoActions: {
    flexDirection: "row",
    gap: 10,
  },
  photoBtn: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  photoBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  disabledInput: {
    borderColor: "#E5E7EB",
    color: "#6B7280",
    backgroundColor: "#F3F4F6",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#F59E0B",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
