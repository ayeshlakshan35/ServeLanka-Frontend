// app/profile/homepostcard.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { HomePost } from "../../src/services/homecontroller";

type Props = {
  post: HomePost;

  // optional callbacks
  onPressBook?: (post: HomePost) => void;
  onPressLike?: (post: HomePost) => void;
  onPressShare?: (post: HomePost) => void;

  // optional display fields (later you can load provider name/photo/rating)
  providerName?: string;
  providerAvatarUrl?: string;
  rating?: number;
};

export default function HomePostCard({
  post,
  onPressBook,
  onPressLike,
  onPressShare,
  providerName = "Service Provider",
  providerAvatarUrl,
  rating = 4.5,
}: Props) {
  // keep full image without awkward crop
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

  useEffect(() => {
    if (!post?.imageUrl) return;
    Image.getSize(
      post.imageUrl,
      (w, h) => {
        if (w && h) setAspectRatio(w / h);
      },
      () => setAspectRatio(16 / 9)
    );
  }, [post?.imageUrl]);

  return (
    <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-4">
      {/* Image */}
      <View className="w-full bg-gray-100">
        <Image
          source={{ uri: post.imageUrl }}
          style={{ width: "100%", aspectRatio }}
          resizeMode="cover"
        />
      </View>

      {/* Body */}
      <View className="p-4">
        <Text className="text-[16px] font-extrabold text-gray-900" numberOfLines={1}>
          {post.category}
        </Text>

        <Text className="mt-1 text-[13px] text-gray-500 leading-5" numberOfLines={2}>
          {post.notes}
        </Text>

        {/* Provider row + price */}
        <View className="mt-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            {providerAvatarUrl ? (
              <Image
                source={{ uri: providerAvatarUrl }}
                className="h-8 w-8 rounded-full"
              />
            ) : (
              <View className="h-8 w-8 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="person" size={16} color="#6B7280" />
              </View>
            )}

            <View className="ml-2">
              <Text className="text-[12px] font-semibold text-gray-900" numberOfLines={1}>
                {providerName}
              </Text>
              <View className="flex-row items-center">
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text className="ml-1 text-[11px] text-gray-500">
                  {Number(rating).toFixed(1)}
                </Text>
              </View>
            </View>
          </View>

          <Text className="text-[16px] font-extrabold text-gray-900">
            LKR {Number(post.price).toLocaleString()}
          </Text>
        </View>

        {/* Actions */}
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => onPressLike?.(post)}
              className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center"
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Ionicons name="thumbs-up-outline" size={20} color="#111827" />
            </Pressable>

            <View className="w-3" />

            <Pressable
              onPress={() => onPressShare?.(post)}
              className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center"
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Ionicons name="return-up-forward-outline" size={20} color="#111827" />
            </Pressable>
          </View>

          <Pressable
            onPress={() => onPressBook?.(post)}
            className="px-6 py-3 rounded-xl bg-[#F2B233]"
            android_ripple={{ color: "#F59E0B" }}
          >
            <Text className="text-white font-bold">Book</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
