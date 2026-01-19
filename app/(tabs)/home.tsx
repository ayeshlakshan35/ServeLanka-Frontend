import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Import Theme & Data
import { globalStyles } from "../../constants/globalStyles";
import { COLORS } from "../../constants/index";
import { CATEGORIES, SERVICES } from "../../constants/services";

export default function HomeScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Logic to filter services based on selected category
  const filteredServices =
    selectedCategory === "All"
      ? SERVICES
      : SERVICES.filter((s) => s.category === selectedCategory);

  return (
    <SafeAreaView style={globalStyles.container}>
      {/* Top Navigation Bar - Notification & Avatar */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.notificationBtn}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={COLORS.text}
          />
        </TouchableOpacity>
        <Image
          source={{ uri: "https://i.pravatar.cc/100" }}
          style={styles.topAvatar}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollContent}
      >
        {/* Horizontal Divider */}
        <View style={styles.divider} />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for services..."
          />
          <Ionicons name="location-outline" size={20} color={COLORS.primary} />
        </View>

        {/* Categories Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Category Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.catRow}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => setSelectedCategory(cat)}
              style={styles.catItem}
            >
              <View
                style={[
                  styles.catIcon,
                  selectedCategory === cat && {
                    backgroundColor: COLORS.primary,
                  },
                ]}
              >
                <Ionicons
                  name={
                    cat === "All"
                      ? "apps"
                      : cat === "Cleaning"
                        ? "home-outline"
                        : cat === "Plumbing"
                          ? "hammer-outline"
                          : cat === "Beauty"
                            ? "brush-outline"
                            : cat === "Carpentry"
                              ? "build-outline"
                              : cat === "Painting"
                                ? "color-palette-outline"
                                : cat === "Gardening"
                                  ? "leaf-outline"
                                  : cat === "Electrical"
                                    ? "flash-outline"
                                    : "apps"
                  }
                  size={24}
                  color={selectedCategory === cat ? "#fff" : COLORS.textLight}
                />
              </View>
              <Text
                style={[
                  styles.catText,
                  selectedCategory === cat && {
                    color: COLORS.primary,
                    fontWeight: "bold",
                  },
                ]}
              >
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Popular Services Section */}
        <View style={styles.sectionHeaderWithCount}>
          <Text style={styles.sectionTitle}>Popular Services</Text>
          <Text style={styles.serviceCount}>
            {filteredServices.length} services
          </Text>
        </View>

        {/* Dynamic Service List */}
        {filteredServices.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.cardImg} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardDesc} numberOfLines={2}>
                {item.description}
              </Text>

              <View style={styles.providerRow}>
                <Image
                  source={{ uri: item.provider.avatar }}
                  style={styles.smallAvatar}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{item.provider.name}</Text>
                  <Text style={styles.reviewText}>
                    ⭐ {item.provider.rating}
                  </Text>
                </View>
                <Text style={styles.price}>{item.price}</Text>
              </View>

              {/* Wireframe Action Footer */}
              <View style={styles.cardFooter}>
                <View style={styles.actionIcons}>
                  <TouchableOpacity>
                    <Ionicons
                      name="thumbs-up-outline"
                      size={22}
                      color="#666"
                      style={{ marginRight: 20 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons
                      name="chatbubble-outline"
                      size={22}
                      color="#666"
                      style={{ marginRight: 20 }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity>
                    <Ionicons
                      name="share-social-outline"
                      size={22}
                      color="#666"
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.bookBtn}
                  onPress={() => router.push(`/book/${item.id}`)}
                >
                  <Text style={styles.bookBtnText}>Book</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
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
