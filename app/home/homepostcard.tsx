import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { HomePost } from "../../src/services/homecontroller";

type Props = {
  post: HomePost;

  onPressBook?: (post: HomePost) => void;
  onPressLike?: (post: HomePost) => void;
  onPressShare?: (post: HomePost) => void;

  // (optional) later you can load provider data from /users/{uid}
  providerName?: string;
  providerAvatarUrl?: string;
  rating?: number;
  reviewCount?: number;
};

export default function HomePostCard({
  post,
  onPressBook,
  onPressLike,
  onPressShare,
  providerName = "Service Provider",
  providerAvatarUrl,
  rating = 4.5,
  reviewCount = 0,
}: Props) {
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

  useEffect(() => {
    if (!post?.imageUrl) return;
    Image.getSize(
      post.imageUrl,
      (w, h) => {
        if (w && h) setAspectRatio(w / h);
      },
      () => setAspectRatio(16 / 9),
    );
  }, [post?.imageUrl]);

  const priceText = useMemo(() => {
    const p = Number(post?.price ?? 0);
    return `LKR ${p.toLocaleString()}`;
  }, [post?.price]);

  return (
    <View className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-5">
      {/* Image */}
      <View className="w-full bg-gray-100">
        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: "100%",
            aspectRatio,
            minHeight: 160,
            maxHeight: 220,
          }}
          resizeMode="cover"
        />

        {/* Category badge */}
        <View className="absolute top-3 left-3 bg-black/55 px-3 py-1 rounded-full">
          <Text className="text-white text-[12px] font-semibold">
            {post.category || "Service"}
          </Text>
        </View>
      </View>

      {/* Content */}
      <View className="px-4 pt-3 pb-4">
        {/* Title */}
        <Text
          className="text-[16px] font-extrabold text-gray-900"
          numberOfLines={1}
        >
          {post.category || "Service"}
        </Text>

        {/* Description */}
        <Text
          className="mt-1 text-[13px] text-gray-600 leading-5"
          numberOfLines={2}
        >
          {post.notes || "No description"}
        </Text>

        {/* Provider + Price Row */}
        <View className="mt-4 flex-row items-center justify-between">
          {/* Provider */}
          <View className="flex-row items-center">
            {providerAvatarUrl ? (
              <Image
                source={{ uri: providerAvatarUrl }}
                className="h-9 w-9 rounded-full"
              />
            ) : (
              <View className="h-9 w-9 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="person" size={16} color="#6B7280" />
              </View>
            )}

            <View className="ml-2">
              <Text
                className="text-[12px] font-semibold text-gray-900"
                numberOfLines={1}
              >
                {providerName}
              </Text>

              <View className="flex-row items-center">
                <Ionicons name="star" size={12} color="#F59E0B" />
                <Text className="ml-1 text-[11px] text-gray-500">
                  {Number(rating).toFixed(1)}
                  {reviewCount ? `  •  ${reviewCount} reviews` : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Price */}
          <Text className="text-[16px] font-extrabold text-gray-900">
            {priceText}
          </Text>
        </View>

        {/* Actions Row */}
        <View className="mt-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => onPressLike?.(post)}
              className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center"
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Ionicons name="thumbs-up-outline" size={18} color="#111827" />
            </Pressable>

            <View className="w-2" />

            <Pressable
              onPress={() => onPressShare?.(post)}
              className="h-10 w-10 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center"
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Ionicons
                name="return-up-forward-outline"
                size={18}
                color="#111827"
              />
            </Pressable>
          </View>

          {/* Book Button */}
          <Pressable
            onPress={() => onPressBook?.(post)}
            className="px-6 py-3 rounded-xl bg-[#F2B233]"
            android_ripple={{ color: "#F59E0B" }}
          >
            <Text className="text-white font-extrabold text-[13px]">Book</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
