import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { HomePost } from "../../src/services/homecontroller";
import { getUserProfile, UserDoc } from "../../src/services/users.api";

type Props = {
  post: HomePost;

  onPressBook?: (post: HomePost) => void;
  onPressLike?: (post: HomePost) => void;
  onPressShare?: (post: HomePost) => void;
};

export default function HomePostCard({
  post,
  onPressBook,
  onPressLike,
  onPressShare,
}: Props) {
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);
  const [providerData, setProviderData] = useState<UserDoc | null>(null);

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

  // ✅ Fetch provider data
  useEffect(() => {
    if (!post?.uid) return;
    getUserProfile(post.uid)
      .then((data) => setProviderData(data))
      .catch((err) => console.log("Failed to load provider:", err));
  }, [post?.uid]);

  const priceText = useMemo(() => {
    const p = Number(post?.price ?? 0);
    return `LKR ${p.toLocaleString()}`;
  }, [post?.price]);

  return (
    <View className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
      {/* Image */}
      <View className="w-full bg-gray-100 relative">
        <Image
          source={{ uri: post.imageUrl }}
          style={{
            width: "100%",
            aspectRatio,
          }}
          resizeMode="cover"
        />
      </View>

      {/* Content */}
      <View className="px-4 pt-3 pb-3">
        {/* Title */}
        <Text className="text-[16px] font-bold text-gray-900" numberOfLines={1}>
          {post.category || "Service"}
        </Text>

        {/* Description */}
        <Text
          className="mt-2 text-[13px] text-gray-600 leading-5"
          numberOfLines={2}
        >
          {post.notes || "No description"}
        </Text>

        {/* Top Row: Provider Info + Price */}
        <View className="mt-3 flex-row items-center justify-between">
          {/* Provider Avatar + Name */}
          <View className="flex-row items-center flex-1">
            {providerData?.photoUrl ? (
              <Image
                source={{ uri: providerData.photoUrl }}
                className="h-9 w-9 rounded-full"
              />
            ) : (
              <View className="h-9 w-9 rounded-full bg-gray-200 items-center justify-center">
                <Ionicons name="person" size={14} color="#6B7280" />
              </View>
            )}

            <Text
              className="ml-2 text-[12px] font-semibold text-gray-900"
              numberOfLines={1}
            >
              {providerData?.name || "Service Provider"}
            </Text>
          </View>

          {/* Price */}
          <Text className="text-[15px] font-bold text-gray-900">
            {priceText}
          </Text>
        </View>

        {/* Bottom Row: Actions + Book Button */}
        <View className="mt-3 flex-row items-center justify-between">
          {/* Like + Comment Buttons */}
          <View className="flex-row items-center gap-2">
            <Pressable
              onPress={() => onPressLike?.(post)}
              className="h-9 w-9 rounded-lg bg-white border border-gray-300 items-center justify-center"
            >
              <Ionicons name="thumbs-up-outline" size={16} color="#111827" />
            </Pressable>

            <Pressable className="h-9 w-9 rounded-lg bg-white border border-gray-300 items-center justify-center">
              <Ionicons name="chatbubble-outline" size={16} color="#111827" />
            </Pressable>

          
          </View>

          {/* Book Button */}
          <Pressable
            onPress={() => onPressBook?.(post)}
            className="px-6 py-2 rounded-lg bg-[#F2B233]"
          >
            <Text className="text-white font-bold text-[13px]">Book</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
