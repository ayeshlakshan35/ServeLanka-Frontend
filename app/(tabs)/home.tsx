import React, { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, View } from "react-native";
import { useFocusEffect } from "expo-router";

import HomePostCard from "../home/homepostcard";
import { listenHomePosts, HomePost } from "../../src/services/homecontroller";

export default function HomeScreen() {
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      const unsub = listenHomePosts(
        (p) => {
          setPosts(p);
          setLoading(false);
        },
        (err) => {
          console.log("home posts error:", err);
          setLoading(false);
        }
      );

      return () => unsub();
    }, [])
  );

  return (
    <View className="flex-1 bg-gray-100 px-4 pt-4">
      {loading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => `${item.uid}_${item.id}`}
          renderItem={({ item }) => (
            <HomePostCard
              post={item}
              onPressBook={(p) => console.log("Book", p.id)}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
