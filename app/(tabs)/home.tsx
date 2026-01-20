import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";

import { COLORS } from "../../constants";
import { HomePost, listenHomePosts } from "../../src/services/homecontroller";
import HomePostCard from "../home/homepostcard";

export default function HomeScreen() {
  const [posts, setPosts] = useState<HomePost[]>([]);
  const [loading, setLoading] = useState(true);

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
    );

    return () => unsub();
  }, []);

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

const styles = StyleSheet.create({
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  notificationBtn: {
    padding: 8,
  },
  topAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  scrollContent: {
    paddingHorizontal: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f1f1",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginVertical: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  sectionHeaderWithCount: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
  serviceCount: {
    fontSize: 13,
    color: "#999",
  },
  catRow: {
    marginVertical: 10,
  },
  catItem: {
    alignItems: "center",
    marginRight: 20,
  },
  catIcon: {
    padding: 15,
    backgroundColor: "#f1f1f1",
    borderRadius: 15,
    marginBottom: 5,
  },
  catText: {
    fontSize: 12,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    overflow: "hidden",
  },
  cardImg: {
    width: "100%",
    height: 180,
  },
  cardBody: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  cardDesc: {
    fontSize: 13,
    color: "#888",
    marginVertical: 6,
  },
  providerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
  },
  providerName: {
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  reviewText: {
    fontSize: 12,
    color: "#999",
  },
  price: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#333",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
  },
  actionIcons: {
    flexDirection: "row",
    alignItems: "center",
  },
  bookBtn: {
    backgroundColor: "#f3a712",
    paddingHorizontal: 30,
    paddingVertical: 8,
    borderRadius: 10,
  },
  bookBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
});
