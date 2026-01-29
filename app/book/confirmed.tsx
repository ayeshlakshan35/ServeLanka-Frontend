import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { auth } from "../../src/config/firebase";
import { createBooking } from "../../src/services/booking";
import { getUserProfile } from "../../src/services/users.api";

export default function ConfirmationPage() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const {
    serviceName = "House Cleaning Service",
    selectedDate = "N/A",
    selectedTime = "N/A",
    serviceAddress = "N/A",
    additionalNotes = "N/A",
    paymentMethod = "Cash",
    providerName = "Service Provider",
    providerImage = "https://i.pravatar.cc/100?u=2",
    providerUid = "",
    postId = "",
    serviceImage = "",
  } = params;

  // Ensure providerImage is a string (handle array from route params)
  const providerImageUrl = Array.isArray(providerImage)
    ? providerImage[0]
    : providerImage;

  const serviceImageUrl = Array.isArray(serviceImage)
    ? serviceImage[0]
    : serviceImage;

  // ✅ Save booking notification when page loads
  useEffect(() => {
    const saveBooking = async () => {
      try {
        const user = auth.currentUser;
        if (!user || !providerUid) return;

        // Get customer profile for name
        const customerProfile = await getUserProfile(user.uid);
        const customerName = customerProfile?.name || "Customer";

        // Create booking record
        await createBooking({
          providerId: String(providerUid),
          userId: user.uid,
          postId: String(postId),
          serviceName: String(serviceName),
          serviceImage: serviceImageUrl || "",
          customerName: customerName,
          customerPhone: customerProfile?.phone || "",
          selectedDate: String(selectedDate),
          selectedTime: String(selectedTime),
          serviceAddress: String(serviceAddress),
          additionalNotes: String(additionalNotes),
          paymentMethod: (String(paymentMethod) === "card"
            ? "card"
            : "cash") as "cash" | "card",
        });

        console.log("Booking saved successfully");
      } catch (err) {
        console.log("Error saving booking:", err);
      }
    };

    saveBooking();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Confirmed</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Ionicons name="checkmark-circle-outline" size={100} color="#f3a712" />
        <Text style={styles.title}>Booking Confirmed Successfully!</Text>
        <Text style={styles.subtitle}>
          Your {serviceName} booking with {providerName} is all set.
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoHeader}>Service Information</Text>
          <View style={styles.serviceInfo}>
            {providerImageUrl && (
              <Image
                source={{ uri: String(providerImageUrl) }}
                style={styles.avatar}
              />
            )}
            <View style={{ flex: 1 }}>
              <Text style={styles.serviceName}>{serviceName}</Text>
              <Text style={styles.providerNameText}>{providerName}</Text>
            </View>
          </View>

          <Text style={styles.infoHeader}>Booking Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} />
            <Text style={styles.detailValue}>{selectedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} />
            <Text style={styles.detailValue}>{selectedTime || "N/A"}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} />
            <Text style={styles.detailValue}>{serviceAddress}</Text>
          </View>

          {additionalNotes && additionalNotes !== "N/A" && (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={18} />
              <Text style={styles.detailValue}>{additionalNotes}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Ionicons
              name={paymentMethod === "card" ? "card-outline" : "cash-outline"}
              size={18}
            />
            <Text style={styles.detailValue}>
              {paymentMethod === "card"
                ? "Credit / Debit Card"
                : "Cash on Delivery"}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => router.push("/profile")}
        >
          <Ionicons name="person-outline" size={18} />
          <Text style={{ marginLeft: 10 }}>Go to Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => router.replace("/")}
        >
          <Ionicons name="home-outline" size={18} color="#fff" />
          <Text style={styles.homeText}>Go to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 15,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backBtn: { width: 28 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  content: { alignItems: "center", paddingVertical: 30 },
  serviceImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 15,
  },
  subtitle: { textAlign: "center", color: "#666", marginBottom: 30 },
  infoBox: {
    width: "100%",
    padding: 20,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 15,
  },
  infoHeader: { fontWeight: "bold", marginVertical: 10, fontSize: 16 },
  serviceInfo: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  serviceName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  providerNameText: { fontSize: 13, color: "#999", marginTop: 2 },
  providerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  detailValue: { marginLeft: 10, color: "#444" },
  profileBtn: {
    width: "100%",
    flexDirection: "row",
    padding: 15,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  homeBtn: {
    width: "100%",
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#f3a712",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  homeText: { color: "#fff", fontWeight: "bold", marginLeft: 10 },
});
