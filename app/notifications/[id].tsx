import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { globalStyles } from "../../constants/globalStyles";
import {
    Booking,
    getBookingById,
    updateBookingStatus,
} from "../../src/services/booking";

export default function BookingNotificationDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      setLoading(true);
      const data = await getBookingById(String(id));
      setBooking(data);
      setLoading(false);
    };

    load();
  }, [id]);

  if (loading) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading booking...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={[globalStyles.container, styles.center]}>
        <Text>Booking not found</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={26} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>{booking.serviceName}</Text>
          <Text style={styles.subTitle}>Booked by {booking.customerName}</Text>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} />
            <Text style={styles.detailValue}>{booking.selectedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={18} />
            <Text style={styles.detailValue}>{booking.selectedTime}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} />
            <Text style={styles.detailValue}>{booking.serviceAddress}</Text>
          </View>
          {booking.additionalNotes ? (
            <View style={styles.detailRow}>
              <Ionicons name="document-text-outline" size={18} />
              <Text style={styles.detailValue}>{booking.additionalNotes}</Text>
            </View>
          ) : null}

          <View style={styles.statusRow}>
            <Text style={styles.statusLabel}>Status</Text>
            <Text style={styles.statusValue}>{booking.status}</Text>
          </View>
        </View>

        {booking.status === "pending" && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={async () => {
                await updateBookingStatus(booking.id, "accepted");
                setBooking({ ...booking, status: "accepted" });
              }}
            >
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={async () => {
                await updateBookingStatus(booking.id, "rejected");
                setBooking({ ...booking, status: "rejected" });
              }}
            >
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  backBtn: {
    width: 26,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A2533",
  },
  content: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  subTitle: {
    marginTop: 4,
    color: "#6B7280",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  detailValue: {
    marginLeft: 10,
    color: "#374151",
  },
  statusRow: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statusLabel: {
    color: "#6B7280",
  },
  statusValue: {
    textTransform: "capitalize",
    fontWeight: "bold",
  },
  actions: {
    flexDirection: "row",
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
  },
  acceptBtn: {
    backgroundColor: "#22C55E",
  },
  rejectBtn: {
    backgroundColor: "#EF4444",
    marginRight: 0,
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
