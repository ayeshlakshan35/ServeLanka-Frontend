// app/profile/edit.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";
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
  KeyboardAvoidingView,
  findNodeHandle,
  Keyboard,
  NativeSyntheticEvent,
  NativeScrollEvent,
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

  // ✅ scroll helpers
  const scrollRef = useRef<ScrollView>(null);
  const phoneRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);

  // ✅ Track scroll position so we can restore after keyboard closes
  const currentScrollYRef = useRef(0);
  const restoreScrollYRef = useRef<number | null>(null);
  const isAutoScrollingRef = useRef(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Keep tracking scroll position
    currentScrollYRef.current = e.nativeEvent.contentOffset.y;
  };

  // ✅ FIX: no measureLayout (prevents your error + works with new architecture)
  const scrollToField = (inputRef: React.RefObject<TextInput | null>) => {
    // Save position BEFORE we auto-scroll
    if (restoreScrollYRef.current === null) {
      restoreScrollYRef.current = currentScrollYRef.current;
    }

    setTimeout(() => {
      const scroll = scrollRef.current;
      const input = inputRef.current;
      if (!scroll || !input) return;

      const node = findNodeHandle(input);
      if (!node) return;

      isAutoScrollingRef.current = true;

      // Scroll so input stays visible above keyboard
      scroll
        .getScrollResponder()
        ?.scrollResponderScrollNativeHandleToKeyboard(node, 110, true);

      // Mark done shortly after
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 250);
    }, 80);
  };

  // ✅ When keyboard closes, return to previous scroll position
  useEffect(() => {
    const restore = () => {
      const scroll = scrollRef.current;
      const y = restoreScrollYRef.current;

      if (!scroll || y === null) return;

      // Restore smoothly
      setTimeout(() => {
        scroll.scrollTo({ y, animated: true });
        restoreScrollYRef.current = null;
      }, 50);
    };

    const subHide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      restore
    );

    return () => {
      subHide.remove();
    };
  }, []);

  // We store the REAL image URL (Cloudinary) here
  const [photoUrl, setPhotoUrl] = useState<string>("");

  const [name, setName] = useState("");
  const [profileEmail, setProfileEmail] = useState(""); // read-only display
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // ✅ performance: spinner only first load
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const loadProfile = useCallback(async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "No logged-in user found.");
      router.back();
      return;
    }

    try {
      if (!hasLoadedOnce) setLoading(true);

      let doc = await getUserProfile(user.uid);

      if (!doc) {
        await ensureUserProfile(user.uid, {
          name: "",
          email: user.email ?? "",
        });
        doc = await getUserProfile(user.uid);
      }

      setName(doc?.name ?? "");
      setProfileEmail(doc?.email || user.email || "");
      setPhone(doc?.phone ?? "");
      setAddress(doc?.address ?? "");
      setPhotoUrl(doc?.photoUrl ?? "");

      setHasLoadedOnce(true);
    } catch (e: any) {
      Alert.alert("Error", e?.message ?? "Failed to load profile");
    } finally {
      if (!hasLoadedOnce) setLoading(false);
    }
  }, [router, hasLoadedOnce]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.container}
          contentContainerStyle={[styles.content]} // ✅ keep
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onScroll={onScroll}
          scrollEventThrottle={16}
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
              ref={phoneRef}
              placeholder="Enter phone number"
              style={styles.input}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              onFocus={() => scrollToField(phoneRef)}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              ref={addressRef}
              placeholder="Enter address"
              style={[styles.input, styles.textArea]}
              multiline
              value={address}
              onChangeText={setAddress}
              onFocus={() => scrollToField(addressRef)}
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

          {/* extra space so last fields stay visible */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
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
    width: 154,
    height: 154,
    borderRadius: 100,
    marginBottom: 32,
  },

  avatarPlaceholder: {
    width: 174,
    height: 174,
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

  photoActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: -20,
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
    gap: 0,
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
    height: 52,
    textAlignVertical: "top",
  },

  actions: {
    flexDirection: "row",
    marginTop: 12,
    gap: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtn: {
    width: 155,
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
    width: 155,
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
