import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { globalStyles } from "../../constants/globalStyles";
import { auth } from "../../src/config/firebase";
import {
  Booking,
  deleteBooking,
  listenProviderBookings,
  updateBookingStatus,
} from "../../src/services/booking";

export default function NotificationsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  useEffect(() => {
    let unsubBookings: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (unsubBookings) {
        unsubBookings();
        unsubBookings = null;
      }

      if (!user) {
        setBookings([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      unsubBookings = listenProviderBookings(
        user.uid,
        (data) => {
          setBookings(data);
          setLoading(false);
        },
        (err) => {
          console.log("bookings error:", err);
          setLoading(false);
        },
      );
    });

    return () => {
      if (unsubBookings) unsubBookings();
      unsubAuth();
    };
  }, []);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    await Promise.all(ids.map((id) => deleteBooking(id)));
    setSelectedIds([]);
    setSelectMode(false);
  };

  const renderItem = ({ item }: { item: Booking }) => (
    <TouchableOpacity
      style={[
        styles.notificationCard,
        selectMode && selectedSet.has(item.id) && styles.selectedCard,
      ]}
      onPress={() =>
        selectMode
          ? toggleSelect(item.id)
          : router.push(`/notifications/${item.id}`)
      }
      activeOpacity={0.9}
    >
      <View style={[styles.iconContainer, { backgroundColor: "#E7F0FF" }]}>
        <Ionicons name="calendar" size={22} color="#3B82F6" />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.notifTitle}>New Booking</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.notifDescription}>
          {item.customerName} booked {item.serviceName}
        </Text>
        <Text style={styles.notifTime}>
          {item.selectedDate} • {item.selectedTime}
        </Text>

        {selectMode && (
          <View style={styles.selectIcon}>
            <Ionicons
              name={selectedSet.has(item.id) ? "checkbox" : "square-outline"}
              size={20}
              color={selectedSet.has(item.id) ? "#22C55E" : "#94A3B8"}
            />
          </View>
        )}

        {item.status === "pending" && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.acceptBtn]}
              onPress={() => updateBookingStatus(item.id, "accepted")}
            >
              <Text style={styles.actionText}>Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.rejectBtn]}
              onPress={() => updateBookingStatus(item.id, "rejected")}
            >
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={globalStyles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Notifications</Text>
        {selectMode ? (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleDelete}>
              <Ionicons name="trash-outline" size={24} color="#EF4444" />
            </TouchableOpacity>
            <View style={{ width: 12 }} />
            <TouchableOpacity
              onPress={() => {
                setSelectMode(false);
                setSelectedIds([]);
              }}
            >
              <Ionicons name="close-outline" size={26} color="#666" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setSelectMode(true)}>
            <Ionicons name="trash-outline" size={24} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={bookings}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            {loading ? "Loading bookings..." : "No bookings yet"}
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 10,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A2533",
  },
  listContent: {
    paddingBottom: 20,
  },
  notificationCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A2533",
  },
  notifDescription: {
    fontSize: 14,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 8,
  },
  notifTime: {
    fontSize: 12,
    color: "#94A3B8",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: "#F3F4F6",
  },
  statusText: {
    fontSize: 11,
    color: "#6B7280",
    textTransform: "capitalize",
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 10,
  },
  acceptBtn: {
    backgroundColor: "#22C55E",
  },
  rejectBtn: {
    backgroundColor: "#EF4444",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 40,
  },
  selectedCard: {
    borderColor: "#22C55E",
    backgroundColor: "#F0FDF4",
  },
  selectIcon: {
    position: "absolute",
    right: 0,
    top: 0,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
});
