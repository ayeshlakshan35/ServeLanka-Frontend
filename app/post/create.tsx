import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { uploadToCloudinary } from "../../src/services/image";
import { createJob } from "../../src/services/jobs.api";

const CATEGORIES = [
  "House Cleaning",
  "Garden Maintenance",
  "Dog Walking",
  "IT Support",
  "Other",
];

export default function CreateJob() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");

  const [submitting, setSubmitting] = useState(false);

  // ✅ category modal
  const [categoryOpen, setCategoryOpen] = useState(false);

  // ✅ images
  const [localImages, setLocalImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const busy = submitting || uploadingImages;

  const selectCategory = (value: string) => {
    setCategory(value);
    setCategoryOpen(false);
  };

  // ✅ Pick images from gallery
  const pickImages = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert("Permission required", "Please allow gallery access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 3,
      quality: 0.8,
    });

    if (result.canceled) return;

    const uris = result.assets.map((a) => a.uri);

    // max 3
    setLocalImages((prev) => [...prev, ...uris].slice(0, 3));
  };

  const removeImage = (uri: string) => {
    setLocalImages((prev) => prev.filter((x) => x !== uri));
  };

  const handleSubmit = async () => {
    // basic validation
    if (
      !title.trim() ||
      !description.trim() ||
      !budget.trim() ||
      !location.trim()
    ) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const budgetNumber = Number(budget);
    if (Number.isNaN(budgetNumber) || budgetNumber <= 0) {
      Alert.alert("Error", "Budget must be a valid number (ex: 5000)");
      return;
    }

    try {
      setSubmitting(true);

      // ✅ 1) Upload images to Cloudinary (if any)
      let uploadedUrls: string[] = [];

      if (localImages.length > 0) {
        setUploadingImages(true);

        uploadedUrls = await Promise.all(
          localImages.map((uri) =>
            uploadToCloudinary(uri, {
              fileName: `job-${Date.now()}.jpg`,
              mimeType: "image/jpeg",
              resourceType: "image",
            }),
          ),
        );

        setUploadingImages(false);
      }

      // ✅ 2) Save job to Firestore with image URLs
      await createJob({
        title: title.trim(),
        category: category.trim(),
        description: description.trim(),
        budget: budgetNumber,
        location: location.trim(),
        imageUrls: uploadedUrls,
      });

      Alert.alert("Success", "Job posted successfully!");
      router.replace("/(tabs)/jobs");
    } catch (error: any) {
      Alert.alert("Error", error?.message || "Failed to post job");
    } finally {
      setUploadingImages(false);
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} disabled={busy}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Job Title */}
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          placeholder="e.g., House Cleaning, Garden Maintenance"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity
          style={styles.selectBox}
          activeOpacity={0.8}
          onPress={() => setCategoryOpen(true)}
          disabled={busy}
        >
          <Text
            style={[
              styles.selectText,
              category ? styles.selectTextActive : null,
            ]}
          >
            {category || "Select a category"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#6B7280" />
        </TouchableOpacity>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Provide a detailed description of the job requirements and expectations."
          multiline
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
        />

        {/* Budget */}
        <Text style={styles.label}>Budget (LKR)</Text>
        <TextInput
          placeholder="e.g., 5000"
          keyboardType="numeric"
          style={styles.input}
          value={budget}
          onChangeText={setBudget}
        />

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          placeholder="e.g., Colombo, Kandy, Galle"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        {/* ✅ Upload images */}
        <Text style={styles.label}>Attach Images (Optional)</Text>
        <TouchableOpacity
          style={styles.uploadBox}
          activeOpacity={0.8}
          onPress={pickImages}
          disabled={busy}
        >
          <Ionicons name="cloud-upload-outline" size={26} color="#6B7280" />
          <Text style={styles.uploadText}>
            {localImages.length > 0
              ? `Selected ${localImages.length} image(s) (tap to add more)`
              : "Tap to select images"}
          </Text>
        </TouchableOpacity>

        {/* ✅ Preview images */}
        {localImages.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 18 }}
          >
            {localImages.map((uri) => (
              <View key={uri} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} />
                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeImage(uri)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, busy && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={busy}
        >
          <Text style={styles.submitText}>
            {uploadingImages
              ? "Uploading Images..."
              : submitting
                ? "Posting..."
                : "Post Job"}
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ✅ Category Modal */}
      <Modal
        visible={categoryOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setCategoryOpen(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setCategoryOpen(false)}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Category</Text>

            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={styles.modalItem}
                onPress={() => selectCategory(c)}
              >
                <Text style={styles.modalItemText}>{c}</Text>
                {category === c ? (
                  <Ionicons name="checkmark" size={18} color="#2563EB" />
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  content: { padding: 20 },

  label: { marginBottom: 6, fontWeight: "500", color: "#111827" },

  input: {
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },

  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    height: 120,
    marginBottom: 16,
    textAlignVertical: "top",
  },

  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  selectText: { color: "#6B7280" },
  selectTextActive: { color: "#111827", fontWeight: "600" },

  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 12,
  },
  uploadText: { color: "#6B7280", marginTop: 8, textAlign: "center" },

  // ✅ thumbnails
  thumbWrap: { marginRight: 10, position: "relative" },
  thumb: { width: 90, height: 70, borderRadius: 10 },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 4,
  },

  submitButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: "#111827",
  },
  modalItem: {
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  modalItemText: { fontSize: 15, color: "#111827" },
});
