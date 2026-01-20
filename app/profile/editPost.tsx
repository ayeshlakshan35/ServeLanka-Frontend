import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActionSheetIOS,
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { uploadToCloudinary } from "../../src/services/image";
import { getMyPostById, updateMyPost } from "../../src/services/post.service";

export default function EditPostScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const postId = params.id;

  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<string>("");
  const [otherCategory, setOtherCategory] = useState<string>("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string>("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const CATEGORY_OPTIONS = [
    { label: "Cleaning", value: "cleaning" },
    { label: "Plumbing", value: "plumbing" },
    { label: "Electrical", value: "electrical" },
    { label: "Delivery", value: "delivery" },
    { label: "Gardening", value: "gardening" },
    { label: "Repair / Maintenance", value: "repair" },
  ];

  const labelForValue = (v: string) =>
    CATEGORY_OPTIONS.find((o) => o.value === v)?.label ?? "Other";

  useEffect(() => {
    loadPost();
  }, []);

  const loadPost = async () => {
    if (!postId) {
      Alert.alert("Error", "No post ID provided");
      router.back();
      return;
    }

    try {
      setLoading(true);
      const post = await getMyPostById(postId);

      setNotes(post.notes);
      setPrice(String(post.price));
      setOriginalImageUrl(post.imageUrl);

      // Check if category is in predefined options
      const predefined = CATEGORY_OPTIONS.find(
        (opt) => opt.value === post.category.toLowerCase(),
      );
      if (predefined) {
        setCategory(predefined.value);
      } else {
        setCategory("other");
        setOtherCategory(post.category);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to load post");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission needed", "Please allow gallery access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImageUri(result.assets[0].uri);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to pick image");
    }
  };

  const handleUpdatePost = async () => {
    if (!category) return Alert.alert("Error", "Please select a category.");

    if (category === "other" && !otherCategory.trim()) {
      return Alert.alert("Error", "Please type your category.");
    }

    if (!notes.trim()) return Alert.alert("Error", "Please add notes.");
    if (!price || isNaN(Number(price)))
      return Alert.alert("Error", "Enter a valid price.");

    const finalCategory =
      category === "other" ? otherCategory.trim() : category;

    setSaving(true);
    try {
      let imageUrl = originalImageUrl;

      // Upload new image if changed
      if (imageUri) {
        imageUrl = await uploadToCloudinary(imageUri, {
          fileName: `post-${Date.now()}.jpg`,
          mimeType: "image/jpeg",
          resourceType: "image",
        });
      }

      await updateMyPost(postId!, {
        notes: notes.trim(),
        price: Number(price),
        imageUrl,
        category: finalCategory,
      });

      Alert.alert("Success", "Post updated successfully!");
      router.back();
    } catch (err: any) {
      Alert.alert("Failed", err?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-3 text-sm text-gray-500">Loading post...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-14 pb-4 border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="absolute left-4 h-10 w-10 items-center justify-center"
          hitSlop={10}
          disabled={saving}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <Text className="text-base font-semibold text-gray-900">Edit Post</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          paddingBottom: 28,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Upload */}
        <Pressable
          onPress={pickImage}
          disabled={saving}
          className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-10 items-center justify-center"
        >
          <Ionicons name="cloud-upload-outline" size={26} color="#6B7280" />
          <Text className="mt-3 text-sm font-medium text-gray-600">
            {imageUri || originalImageUrl ? "Change Photo" : "Upload Photo"}
          </Text>
          <Text className="mt-1 text-xs text-gray-400">Tap to upload file</Text>

          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="mt-4 h-28 w-28 rounded-xl"
              resizeMode="cover"
            />
          ) : originalImageUrl ? (
            <Image
              source={{ uri: originalImageUrl }}
              className="mt-4 h-28 w-28 rounded-xl"
              resizeMode="cover"
            />
          ) : null}
        </Pressable>

        {/* Category */}
        <Text className="mt-6 text-sm font-semibold text-gray-800">
          Category
        </Text>

        <View
          style={{
            marginTop: 8,
            borderWidth: 1,
            borderColor: "#FB923C",
            borderRadius: 12,
            backgroundColor: "white",
          }}
        >
          {Platform.OS === "android" ? (
            <Picker
              selectedValue={category}
              onValueChange={(v) => {
                const value = String(v);
                setCategory(value);
                if (value !== "other") setOtherCategory("");
              }}
              enabled={!saving}
              mode="dropdown"
            >
              <Picker.Item label="Select category" value="" />
              {CATEGORY_OPTIONS.map((opt) => (
                <Picker.Item
                  key={opt.value}
                  label={opt.label}
                  value={opt.value}
                />
              ))}
              <Picker.Item label="Other" value="other" />
            </Picker>
          ) : (
            <Pressable
              disabled={saving}
              onPress={() => {
                const options = [
                  ...CATEGORY_OPTIONS.map((o) => o.label),
                  "Other",
                  "Cancel",
                ];
                ActionSheetIOS.showActionSheetWithOptions(
                  {
                    options,
                    cancelButtonIndex: options.length - 1,
                    title: "Select category",
                  },
                  (buttonIndex) => {
                    if (buttonIndex === options.length - 1) return;
                    if (buttonIndex === CATEGORY_OPTIONS.length) {
                      setCategory("other");
                      return;
                    }
                    const selected = CATEGORY_OPTIONS[buttonIndex].value;
                    setCategory(selected);
                    setOtherCategory("");
                  },
                );
              }}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 14,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ color: category ? "#111827" : "#9CA3AF" }}>
                {category ? labelForValue(category) : "Select category"}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#6B7280" />
            </Pressable>
          )}
        </View>

        {/* Other category */}
        {category === "other" && (
          <>
            <Text className="mt-4 text-sm font-semibold text-gray-800">
              Type your category
            </Text>
            <View className="mt-2 rounded-xl border border-orange-400 bg-white px-4 py-3">
              <TextInput
                value={otherCategory}
                onChangeText={setOtherCategory}
                placeholder='Example: "Ceiling Fan Repair"'
                placeholderTextColor="#9CA3AF"
                editable={!saving}
                className="text-sm text-gray-800"
              />
            </View>
          </>
        )}

        {/* Additional Notes */}
        <Text className="mt-6 text-sm font-semibold text-gray-800">
          Additional Notes
        </Text>
        <View className="mt-2 rounded-xl border border-orange-400 bg-white px-4 py-3">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Add details about your service"
            placeholderTextColor="#9CA3AF"
            editable={!saving}
            className="text-sm text-gray-800 min-h-[60px]"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Price */}
        <Text className="mt-6 text-sm font-semibold text-gray-800">
          Price per room (LKR)
        </Text>
        <View className="mt-2 rounded-xl border border-orange-400 bg-white px-4 py-3">
          <TextInput
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor="#9CA3AF"
            keyboardType="numeric"
            editable={!saving}
            className="text-sm text-gray-800"
          />
        </View>

        {/* Submit Button */}
        <Pressable
          onPress={handleUpdatePost}
          disabled={saving}
          className={`mt-8 rounded-2xl py-4 items-center ${
            saving ? "bg-gray-300" : "bg-orange-400"
          }`}
        >
          <Text className="text-base font-semibold text-white">
            {saving ? "Updating..." : "Update Post"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
