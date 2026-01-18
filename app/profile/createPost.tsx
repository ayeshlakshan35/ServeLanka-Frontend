// app/create-post.tsx
import React, { useState } from "react";
import { View, Text, Image, TextInput, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function CreatePostScreen() {
  const router = useRouter();

  const [notes, setNotes] = useState("");
  const [price, setPrice] = useState("150");

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-center px-4 pt-14 pb-4 border-b border-gray-100">
        <Pressable
          onPress={() => router.back()}
          className="absolute left-4 h-10 w-10 items-center justify-center"
          hitSlop={10}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </Pressable>

        <Text className="text-base font-semibold text-gray-900">Create Post</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >


        {/* Upload Box */}
        <Pressable
          onPress={() => {}}
          className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-10 items-center justify-center"
        >
          <Ionicons name="cloud-upload-outline" size={26} color="#6B7280" />
          <Text className="mt-3 text-sm font-medium text-gray-600">Upload Photo / Videos</Text>
          <Text className="mt-1 text-xs text-gray-400">Tap to upload file</Text>
        </Pressable>

        {/* Additional Notes */}
        <Text className="mt-6 text-sm font-semibold text-gray-800">Additional Notes</Text>
        <View className="mt-2 rounded-xl border border-orange-400 bg-white px-4 py-3">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Any specific instructions or requests?"
            placeholderTextColor="#9CA3AF"
            multiline
            className="text-sm text-gray-800"
            style={{ minHeight: 70, textAlignVertical: "top" }}
          />
        </View>

        {/* Price */}
        <Text className="mt-6 text-sm font-semibold text-gray-800">Price</Text>
        <View className="mt-2 rounded-xl border border-orange-400 bg-white px-4 py-3">
          <TextInput
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            placeholder="$150"
            placeholderTextColor="#9CA3AF"
            className="text-sm text-gray-800"
          />
        </View>

        {/* Button */}
        <Pressable
          onPress={() => {}}
          className="mt-10 h-12 rounded-xl bg-[#F2B233] items-center justify-center"
        >
          <Text className="text-white font-semibold">Create Post</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
