import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { auth } from "../../src/config/firebase";
import { HomePost, listenHomePosts } from "../../src/services/homecontroller";
import { getUserProfile, UserDoc } from "../../src/services/users.api";
import HomePostCard from "../home/homepostcard";

const CATEGORIES = [
  "All",
  "Cleaning",
  "Plumbing",
  "Beauty",
  "Carpentry",
  "Painting",
  "Gardening",
  "Electrical",
  "Other",
];

// ✅ Convert any Firestore category value into your tab categories
function normalizeCategory(raw: string) {
  const c = (raw || "").trim().toLowerCase();

  if (c.includes("clean")) return "Cleaning";
  if (c.includes("plumb")) return "Plumbing";
  if (c.includes("beaut")) return "Beauty";
  if (c.includes("carpent") || c.includes("wood")) return "Carpentry";
  if (c.includes("paint")) return "Painting";
  if (c.includes("garden") || c.includes("land")) return "Gardening";
  if (c.includes("elect")) return "Electrical";

  return "Other";
}

export default function HomeScreen() {
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserDoc | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const router = useRouter();

  // UI state
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  // ✅ Wait for auth state to be ready
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setIsAuthReady(true);
      setAuthUserId(user?.uid ?? null);

      if (!user) {
        setUserData(null);
        return;
      }

      getUserProfile(user.uid)
        .then((data) => setUserData(data))
        .catch((err) => console.log("Failed to load user profile:", err));
    });

    return () => unsubAuth();
  }, []);

  // ✅ Real-time listener - re-run on auth changes
  useEffect(() => {
    if (!isAuthReady) return;

    if (!authUserId) {
      setPosts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsub = listenHomePosts(
      (p) => {
        setPosts(p);
        setLoading(false);
      },
      (err) => {
        console.log("home posts error:", err);
        setLoading(false);
      },
      { pageSize: 50 },
    );

    return () => unsub();
  }, [isAuthReady, authUserId]);

  // ✅ Filter by category + search
  const filteredPosts = useMemo(() => {
    const q = search.trim().toLowerCase();

    return posts.filter((p) => {
      const tabCat = normalizeCategory(p.category);

      const matchesCategory =
        activeCategory === "All" || tabCat === activeCategory;

      const matchesSearch =
        q.length === 0 ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.notes || "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [posts, search, activeCategory]);

  // Map categories to icons
  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, string> = {
      All: "grid",
      Cleaning: "home",
      Plumbing: "hammer",
      Beauty: "brush",
      Carpentry: "build",
      Painting: "color-palette",
      Gardening: "leaf",
      Electrical: "flash",
      Other: "ellipsis-horizontal",
    };
    return iconMap[category] || "ellipsis-horizontal";
  };

  return (
    <View className="flex-1 bg-white">
      {/* ✅ Top bar - App Logo & Profile */}
      <View className="px-4 pt-4 flex-row items-center justify-between">
        {/* App Logo - Like Facebook */}
        <Text className="text-[26px] font-extrabold text-[#F2B233]">
          ServeLanka
        </Text>

        {/* User Profile Picture */}
        <Pressable
          onPress={() => router.push("/(tabs)/profile")}
          className="h-10 w-10 rounded-full bg-gray-200 items-center justify-center overflow-hidden"
        >
          {userData?.photoUrl ? (
            <Image
              source={{ uri: userData.photoUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={18} color="#111827" />
          )}
        </Pressable>
      </View>

      {/* ✅ Search - Updated with Location Icon */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-3 border border-gray-200">
          <Ionicons name="search" size={18} color="#6B7280" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for services..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-[13px] text-gray-900"
          />

          <Pressable className="h-9 w-9 items-center justify-center">
            <Ionicons name="location" size={24} color="#F2B233" />
          </Pressable>
        </View>
      </View>

      {/* ✅ Categories Section - Horizontal Scroll */}
      <View className="mt-6">
        <View className="mb-4 px-4">
          <Text className="text-[18px] font-bold text-gray-900">
            Categories
          </Text>
        </View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => {
            const active = item === activeCategory;
            return (
              <Pressable
                onPress={() => setActiveCategory(item)}
                className="mr-4 items-center"
              >
                <View
                  className={`h-14 w-14 rounded-2xl items-center justify-center ${
                    active ? "bg-[#F2B233]" : "bg-gray-100"
                  }`}
                >
                  <Ionicons
                    name={getCategoryIcon(item) as any}
                    size={24}
                    color={active ? "#FFFFFF" : "#111827"}
                  />
                </View>
                <Text
                  className={`text-[11px] mt-1 font-medium ${
                    active ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* ✅ Popular Services Section */}
      <View className="flex-1 px-4 pt-4 bg-white">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-[18px] font-bold text-gray-900">
            Popular Services
          </Text>
          <Text className="text-[13px] text-gray-500">
            {filteredPosts.length} services
          </Text>
        </View>

        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" color="#F2B233" />
            <Text className="mt-2 text-gray-500">Loading posts...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            keyExtractor={(item) => `${item.uid}_${item.id}`}
            renderItem={({ item }) => (
              <HomePostCard
                post={item}
                onPressBook={(p) => console.log("Book", p.id)}
                onPressLike={(p) => console.log("Like", p.id)}
                onPressShare={(p) => console.log("Share", p.id)}
              />
            )}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="text-center text-gray-500 mt-10">
                No posts found
              </Text>
            }
            contentContainerStyle={{ paddingBottom: 24 }}
          />
        )}
      </View>
    </View>
  );
}
