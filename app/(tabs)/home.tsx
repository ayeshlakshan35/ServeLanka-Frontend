import { Ionicons } from "@expo/vector-icons";
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

import { HomePost, listenHomePosts } from "../../src/services/homecontroller";
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

  // UI state
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  // ✅ Real-time listener
  useEffect(() => {
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
      { pageSize: 50 }
    );

    return () => unsub();
  }, []);

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

  return (
    <View className="flex-1 bg-white">
      {/* ✅ Top bar */}
      <View className="px-4 pt-4 flex-row items-center justify-between">
        <Pressable className="h-10 w-10 rounded-xl bg-gray-100 items-center justify-center">
          <Ionicons name="grid-outline" size={20} color="#111827" />
        </Pressable>

        <Text className="text-[16px] font-extrabold text-gray-900">Home</Text>

        <Pressable className="h-10 w-10 rounded-full bg-gray-200 items-center justify-center overflow-hidden">
          {/* If you have user avatar url later, replace with Image */}
          <Ionicons name="person" size={18} color="#111827" />
        </Pressable>
      </View>

      {/* ✅ Search */}
      <View className="px-4 mt-4">
        <View className="flex-row items-center bg-gray-100 rounded-xl px-3 py-2 border border-gray-200">
          <Ionicons name="search" size={18} color="#6B7280" />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search for services..."
            placeholderTextColor="#9CA3AF"
            className="flex-1 ml-2 text-[13px] text-gray-900"
          />

          <Pressable className="h-9 w-9 rounded-xl bg-white border border-gray-200 items-center justify-center">
            <Ionicons name="filter-outline" size={18} color="#111827" />
          </Pressable>
        </View>
      </View>

      {/* ✅ Category chips */}
      <View className="mt-4">
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
                className={`mr-3 px-5 py-3 rounded-2xl border ${
                  active
                    ? "bg-[#F2B233] border-[#F2B233]"
                    : "bg-gray-50 border-gray-200"
                }`}
                android_ripple={{ color: "#E5E7EB" }}
              >
                <Text
                  className={`text-[12px] font-bold ${
                    active ? "text-white" : "text-gray-800"
                  }`}
                >
                  {item}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* ✅ Posts list */}
      <View className="flex-1 px-4 pt-4 bg-gray-100">
        {loading ? (
          <View className="items-center justify-center py-10">
            <ActivityIndicator size="large" />
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
