import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { MyPost } from "../../src/services/post.service";

type Props = {
  post: MyPost;
  onEdit?: (post: MyPost) => void;
  onDelete?: (postId: string) => void;
  disabled?: boolean;
};

export default function PostCard({ post, onEdit, onDelete, disabled }: Props) {
  // ✅ default ratio so UI doesn't jump
  const [aspectRatio, setAspectRatio] = useState<number>(4 / 3);

  useEffect(() => {
    if (!post?.imageUrl) return;

    Image.getSize(
      post.imageUrl,
      (w, h) => {
        if (w && h) setAspectRatio(w / h);
      },
      () => setAspectRatio(4 / 3),
    );
  }, [post?.imageUrl]);

  const confirmDelete = () => {
    Alert.alert("Delete post?", "This will remove your post permanently.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => onDelete?.(post.id),
      },
    ]);
  };

  return (
    <View className="bg-white rounded-2xl overflow-hidden mb-4 shadow-sm">
      {/* Full width dynamic image */}
      <Image
        source={{ uri: post.imageUrl }}
        style={{ width: "100%", aspectRatio }}
        resizeMode="cover"
      />

      <View className="px-4 pt-3 pb-4">
        {/* Title + Edit/Delete actions */}
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text
              className="text-base font-bold text-gray-900 capitalize"
              numberOfLines={1}
            >
              {post.category}
            </Text>
            <Text
              className="mt-1 text-xs text-gray-600 leading-5"
              numberOfLines={3}
            >
              {post.notes}
            </Text>
          </View>

          <View className="flex-row">
            <Pressable
              onPress={() => onEdit?.(post)}
              disabled={disabled}
              className="h-9 w-9 rounded-xl bg-gray-100 border border-gray-200 items-center justify-center mr-2"
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Ionicons name="pencil" size={18} color="#111827" />
            </Pressable>

            <Pressable
              onPress={confirmDelete}
              disabled={disabled}
              className="h-9 w-9 rounded-xl bg-gray-100 border border-gray-200 items-center justify-center"
              android_ripple={{ color: "#E5E7EB" }}
            >
              <Ionicons name="trash" size={18} color="#EF4444" />
            </Pressable>
          </View>
        </View>

        {/* Bottom action row: like/comment + price */}
        <View className="mt-8 flex-row items-center justify-center gap-20">
          <Pressable className="flex-row items-center" hitSlop={8}>
            <Ionicons name="thumbs-up-outline" size={25} color="#374151" />
          </Pressable>
          <Pressable className="flex-row items-center" hitSlop={8}>
            <Ionicons name="chatbubble-outline" size={25} color="#374151" />
          </Pressable>
          <Text className="text-sm font-bold text-gray-900">
            ${Number(post.price).toLocaleString()}
          </Text>
        </View>
      </View>
    </View>
  );
}
