import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { globalStyles } from "../../constants/globalStyles";
import { COLORS } from "../../constants/index";
import { HomePost, listenHomePosts } from "../../src/services/homecontroller";
import { getUserProfile, UserDoc } from "../../src/services/users.api";

export default function BookingScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("cash");
  const [serviceAddress, setServiceAddress] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [post, setPost] = useState<HomePost | null>(null);
  const [providerData, setProviderData] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch post data from Firebase
  useEffect(() => {
    if (!id) return;

    setLoading(true);
    const unsub = listenHomePosts(
      (posts) => {
        const foundPost = posts.find((p) => `${p.uid}_${p.id}` === id);
        if (foundPost) {
          setPost(foundPost);
          // Fetch provider data
          getUserProfile(foundPost.uid)
            .then((data) => setProviderData(data))
            .catch((err) => console.log("Failed to load provider:", err));
        }
        setLoading(false);
      },
      (err) => {
        console.log("Error fetching posts:", err);
        setLoading(false);
      },
      { pageSize: 100 },
    );

    return () => unsub();
  }, [id]);

  if (loading) {
    return (
      <View
        style={[
          globalStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text>Loading service...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View
        style={[
          globalStyles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text>Service not found</Text>
      </View>
    );
  }

  // Map post to service format for display
  const service = {
    id: post.id,
    title: post.category,
    description: post.notes,
    imageUrl: post.imageUrl,
    price: `LKR ${post.price.toLocaleString()}`,
    provider: {
      name: providerData?.name || "Service Provider",
      avatar: providerData?.photoUrl || "",
    },
  };

  return (
    <ScrollView
      style={[globalStyles.container, { backgroundColor: "#F8F9FB" }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Custom Header Nav */}
      <View style={styles.navHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Book Services</Text>
      </View>

      <View style={styles.contentContainer}>
        {/* Service Summary Card - Matches Wireframe */}
        <View style={styles.summaryCard}>
          <Image source={{ uri: service.imageUrl }} style={styles.summaryImg} />
          <View style={styles.summaryInfo}>
            <Text style={styles.summaryTitle}>{service.title}</Text>
            <Text style={styles.summaryDesc} numberOfLines={2}>
              {service.description}
            </Text>
            <Text style={styles.summaryRating}>⭐ 4.8 (124 reviews)</Text>
            <Text style={styles.summaryPrice}>{service.price}.00</Text>
          </View>
        </View>

        {/* Date & Time Row - Matches Wireframe */}
        <Text style={styles.sectionLabel}>Select Date & Time</Text>
        <View style={styles.dateTimeRow}>
          <View style={styles.halfInput}>
            <Text style={styles.fieldLabel}>Date</Text>
            <TouchableOpacity
              style={styles.inputIconWrapper}
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={18} color="#999" />
              <Text style={styles.inputText}>
                {selectedDate.toLocaleDateString("en-GB")}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.halfInput}>
            <Text style={styles.fieldLabel}>Time</Text>
            <TouchableOpacity
              style={styles.inputIconWrapper}
              onPress={() => setShowTimePicker(true)}
            >
              <Ionicons name="time-outline" size={18} color="#999" />
              <Text style={styles.inputText}>{selectedTime || "--:-- --"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Calendar Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.calendarModalContainer}>
            <View style={styles.calendarPicker}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() - 1,
                      ),
                    )
                  }
                >
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.calendarMonth}>
                  {selectedDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    setSelectedDate(
                      new Date(
                        selectedDate.getFullYear(),
                        selectedDate.getMonth() + 1,
                      ),
                    )
                  }
                >
                  <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarGrid}>
                {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                  <Text key={day} style={styles.dayHeader}>
                    {day}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarDates}>
                {Array.from({ length: 35 }, (_, i) => {
                  const firstDay = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    1,
                  ).getDay();
                  const daysInMonth = new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth() + 1,
                    0,
                  ).getDate();
                  const dayNum = i - firstDay + 1;
                  const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
                  const isToday =
                    isCurrentMonth && dayNum === new Date().getDate();

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => {
                        if (isCurrentMonth) {
                          setSelectedDate(
                            new Date(
                              selectedDate.getFullYear(),
                              selectedDate.getMonth(),
                              dayNum,
                            ),
                          );
                          setShowDatePicker(false);
                        }
                      }}
                      style={styles.dateItemContainer}
                    >
                      <Text
                        style={[
                          styles.dateItem,
                          isCurrentMonth ? {} : styles.dateItemDisabled,
                          isToday && styles.dateItemToday,
                        ]}
                      >
                        {isCurrentMonth ? String(dayNum).padStart(2, "0") : ""}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={styles.calendarFooter}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.calendarAction}>Close</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSelectedDate(new Date())}>
                  <Text style={styles.calendarAction}>Today</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.timeModalContainer}>
            <View style={styles.timePickerBox}>
              <View style={styles.timePickerHeader}>
                <TouchableOpacity onPress={() => setShowTimePicker(false)}>
                  <Text style={styles.timePickerClose}>Close</Text>
                </TouchableOpacity>
                <Text style={styles.timePickerTitle}>Select Time</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowTimePicker(false);
                  }}
                >
                  <Text style={styles.timePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.spinnerContainer}>
                {/* Hour Spinner */}
                <View style={styles.spinnerColumn}>
                  <Text style={styles.spinnerLabel}>Hour</Text>
                  <FlatList
                    data={Array.from({ length: 12 }, (_, i) =>
                      String(i === 0 ? 12 : i).padStart(2, "0"),
                    )}
                    renderItem={({ item, index }) => (
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedTime((prev) => {
                            const parts = prev.split(":");
                            const newHour = item;
                            const newMin = parts[1] || "00";
                            const newAMPM = parts[2] || "AM";
                            return `${newHour}:${newMin} ${newAMPM}`;
                          })
                        }
                        style={styles.spinnerItem}
                      >
                        <Text style={styles.spinnerText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEventThrottle={16}
                    style={styles.spinnerList}
                  />
                </View>

                {/* Minute Spinner */}
                <View style={styles.spinnerColumn}>
                  <Text style={styles.spinnerLabel}>Min</Text>
                  <FlatList
                    data={["00", "15", "30", "45"]}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        onPress={() =>
                          setSelectedTime((prev) => {
                            const parts = prev.split(":");
                            const newHour = parts[0] || "12";
                            const newMin = item;
                            const newAMPM = parts[2] || "AM";
                            return `${newHour}:${newMin} ${newAMPM}`;
                          })
                        }
                        style={styles.spinnerItem}
                      >
                        <Text style={styles.spinnerText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEventThrottle={16}
                    style={styles.spinnerList}
                  />
                </View>

                {/* AM/PM Spinner */}
                <View style={styles.spinnerColumn}>
                  <Text style={styles.spinnerLabel}>Period</Text>
                  <FlatList
                    data={["AM", "PM"]}
                    renderItem={({ item }) => {
                      const currentPeriod = selectedTime.split(" ")[1] || "AM";
                      const isSelected = item === currentPeriod;
                      return (
                        <TouchableOpacity
                          onPress={() =>
                            setSelectedTime((prev) => {
                              let parts = prev.split(" ");
                              let timeParts = parts[0].split(":");
                              const newHour = timeParts[0] || "12";
                              const newMin = timeParts[1] || "00";
                              return `${newHour}:${newMin} ${item}`;
                            })
                          }
                          style={[
                            styles.spinnerItem,
                            isSelected && { backgroundColor: "#E0E0E0" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.spinnerText,
                              isSelected && {
                                fontWeight: "bold",
                                color: "#007AFF",
                              },
                            ]}
                          >
                            {item}
                          </Text>
                        </TouchableOpacity>
                      );
                    }}
                    keyExtractor={(item, index) => index.toString()}
                    scrollEventThrottle={16}
                    style={styles.spinnerList}
                  />
                </View>
              </View>
            </View>
          </View>
        </Modal>

        {/* Address Input */}
        <Text style={styles.sectionLabel}>Service Address</Text>
        <View style={styles.inputIconWrapper}>
          <Ionicons name="location-outline" size={18} color="#999" />
          <TextInput
            style={styles.iconTextInput}
            placeholder="Enter service location"
            value={serviceAddress}
            onChangeText={setServiceAddress}
          />
        </View>

        {/* Notes Input */}
        <Text style={styles.sectionLabel}>Additional Notes</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Any specific instructions for provider"
          multiline={true}
          numberOfLines={4}
          value={additionalNotes}
          onChangeText={setAdditionalNotes}
        />

        {/* Payment Method Selection */}
        <Text style={styles.sectionLabel}>Payment Method</Text>
        <View style={styles.paymentBox}>
          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setSelectedPayment("cash")}
          >
            <Ionicons name="cash-outline" size={20} color="#444" />
            <Text style={styles.paymentText}>Cash on Delivery</Text>
            <Ionicons
              name={
                selectedPayment === "cash"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={selectedPayment === "cash" ? COLORS.primary : "#ccc"}
            />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => setSelectedPayment("card")}
          >
            <Ionicons name="card-outline" size={20} color="#444" />
            <Text style={styles.paymentText}>Credit / Debit Card</Text>
            <Ionicons
              name={
                selectedPayment === "card"
                  ? "radio-button-on"
                  : "radio-button-off"
              }
              size={20}
              color={selectedPayment === "card" ? COLORS.primary : "#ccc"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[globalStyles.primaryButton, { marginVertical: 20 }]}
          onPress={() => {
            router.push({
              pathname: "/book/confirmed",
              params: {
                serviceId: service.id,
                serviceName: service.title,
                serviceImage: service.imageUrl,
                selectedDate: selectedDate.toLocaleDateString("en-GB"),
                selectedTime: selectedTime,
                serviceAddress: serviceAddress,
                additionalNotes: additionalNotes,
                paymentMethod: selectedPayment,
                providerName: service.provider.name,
                providerImage: service.provider.avatar,
                providerUid: post.uid,
                postId: post.id,
              },
            });
          }}
        >
          <Text style={globalStyles.buttonText}>Confirm Booking</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  navHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 10,
  },
  navTitle: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  contentContainer: { paddingBottom: 40 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
  },
  summaryImg: { width: "100%", height: 140, borderRadius: 10 },
  summaryInfo: { marginTop: 12 },
  summaryTitle: { fontSize: 16, fontWeight: "bold" },
  summaryDesc: { fontSize: 12, color: "#777", marginVertical: 4 },
  summaryRating: { fontSize: 12, color: "#f3a712", marginBottom: 8 },
  summaryPrice: { fontSize: 16, fontWeight: "bold", color: "#000" },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  dateTimeRow: { flexDirection: "row", justifyContent: "space-between" },
  halfInput: { width: "48%" },
  fieldLabel: { fontSize: 12, color: "#666", marginBottom: 5 },
  inputIconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
  },
  iconTextInput: { flex: 1, marginLeft: 10, fontSize: 14 },
  inputText: { flex: 1, marginLeft: 10, fontSize: 14, color: "#333" },
  calendarModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  calendarPicker: {
    backgroundColor: "#f5f5f5",
    borderRadius: 20,
    padding: 15,
    marginHorizontal: 20,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  calendarMonth: {
    color: "#333",
    fontSize: 14,
    fontWeight: "bold",
  },
  calendarGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 8,
  },
  dayHeader: {
    color: "#666",
    fontSize: 11,
    fontWeight: "600",
    width: "14.28%",
    textAlign: "center",
  },
  calendarDates: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
    justifyContent: "space-between",
  },
  dateItemContainer: {
    width: "14.28%",
    paddingVertical: 6,
    alignItems: "center",
  },
  dateItem: {
    width: 35,
    height: 35,
    paddingVertical: 8,
    textAlign: "center",
    color: "#333",
    fontSize: 12,
    fontWeight: "500",
    backgroundColor: "#e8e8e8",
    borderRadius: 6,
  },
  dateItemDisabled: {
    color: "#ccc",
    backgroundColor: "#f5f5f5",
  },
  dateItemToday: {
    backgroundColor: "#4a9eff",
    color: "#fff",
  },
  calendarFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  calendarAction: {
    color: "#4a9eff",
    fontSize: 13,
    fontWeight: "600",
  },
  timeModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    justifyContent: "flex-end",
    paddingBottom: 20,
  },
  timePickerBox: {
    backgroundColor: "#f5f5f5",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 12,
    paddingBottom: 20,
    marginHorizontal: 60,
  },
  timePickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  timePickerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  timePickerClose: {
    fontSize: 13,
    color: "#999",
    fontWeight: "500",
  },
  timePickerDone: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: "600",
  },
  spinnerContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  spinnerColumn: {
    flex: 1,
    alignItems: "center",
    minWidth: 50,
  },
  spinnerLabel: {
    fontSize: 11,
    color: "#999",
    marginBottom: 8,
    fontWeight: "600",
  },
  spinnerList: {
    height: 100,
  },
  spinnerItem: {
    height: 35,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  spinnerText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  textArea: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
  },
  paymentBox: {
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#eee",
    overflow: "hidden",
  },
  paymentOption: { flexDirection: "row", alignItems: "center", padding: 15 },
  paymentText: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: "500" },
  divider: { height: 1, backgroundColor: "#eee", marginHorizontal: 15 },
});
