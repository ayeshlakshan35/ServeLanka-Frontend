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
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { auth } from "../../src/config/firebase";
import { uploadToCloudinary } from "../../src/services/image";
import {
  ensureUserProfile,
  getUserProfile,
  updateUserProfile,
} from "../../src/services/users.api";

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
        phone: phone.trim(),
        address: address.trim(),
        photoUrl: photoUrl.trim(),
      });

      Alert.alert("Saved", "Profile updated successfully.");
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.container, styles.loadingWrap]}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading profile...</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* HEADER */}
        <Text style={styles.header}>Edit Profile</Text>

        {/* PROFILE PHOTO */}
        <View style={styles.photoContainer}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.noPhotoText}>No Profile Photo</Text>
            </View>
          )}

          <View style={styles.photoActions}>
            <TouchableOpacity
              onPress={pickFromGallery}
              style={styles.photoBtn}
              disabled={uploading}
              activeOpacity={0.9}
            >
              <Text style={styles.photoBtnText}>
                {uploading ? "Uploading..." : "Gallery"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={takePhoto}
              style={styles.photoBtn}
              disabled={uploading}
              activeOpacity={0.9}
            >
              <Text style={styles.photoBtnText}>
                {uploading ? "Uploading..." : "Camera"}
              </Text>
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
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.cancelBtn}
            disabled={saving}
            activeOpacity={0.9}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={onSave}
            disabled={saving || uploading}
            activeOpacity={0.9}
          >
            <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
  },

  content: {
    paddingBottom: 22,
  },

  loadingWrap: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },

  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },

  photoContainer: {
    alignItems: "center",
    marginBottom: 18,
  },

  avatar: {
    width: 194,
    height: 194,
    borderRadius: 100,
    marginBottom: 32,
  },

  avatarPlaceholder: {
    width: 194,
    height: 194,
    borderRadius: 100,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
    paddingHorizontal: 10,
  },
  noPhotoText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textAlign: "center",
  },
  tapToAddText: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },

  photoActions: {
    flexDirection: "row",
    gap: 10,
  },

  photoBtn: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    minWidth: 116,
    alignItems: "center",
  },

  photoBtnText: {
    color: "#fff",
    fontWeight: "700",
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },

  label: {
    fontWeight: "700",
    marginBottom: 6,
    color: "#111827",
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
    height: 82,
    textAlignVertical: "top",
  },

  actions: {
    flexDirection: "row",
    marginTop: 18,
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
    fontWeight: "700",
    color: "#111827",
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
    fontWeight: "700",
  },
});
