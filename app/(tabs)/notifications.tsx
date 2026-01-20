import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { globalStyles } from "../../constants/globalStyles";

const NOTIFICATIONS = [
  {
    id: "1",
    title: "Booking Confirmed",
    description:
      "Your plumbing service with AquaFlow has been confirmed for tomorrow.",
    time: "2 hours ago",
    icon: "calendar",
    iconBg: "#E7F0FF",
    iconColor: "#3B82F6",
    unread: true,
  },
  {
    id: "2",
    title: "New Job Posting",
    description:
      "Experienced Electrician needed in Colombo 05. Tap to view details.",
    time: "3 hours ago",
    icon: "briefcase",
    iconBg: "#FFF9E7",
    iconColor: "#F3A712",
    unread: true,
  },
  {
    id: "3",
    title: "Profile Updated",
    description: "Your profile information has been successfully updated.",
    time: "Yesterday",
    icon: "person-outline",
    iconBg: "#F3F4F6",
    iconColor: "#6B7280",
    unread: false,
  },
  {
    id: "4",
    title: "Payment Reminder",
    description:
      "Reminder: Your payment for gardening service is due tomorrow.",
    time: "Yesterday",
    icon: "card-outline",
    iconBg: "#FFE7E7",
    iconColor: "#EF4444",
    unread: true,
  },
  {
    id: "5",
    title: "Welcome to ServeLanka!",
    description:
      "Explore our latest services and get 10% off your first booking.",
    time: "2 days ago",
    icon: "star-outline",
    iconBg: "#E7FFE7",
    iconColor: "#22C55E",
    unread: false,
  },
  {
    id: "6",
    title: "Request Accepted",
    description: 'Service provider "Clean & Shine" has accepted your request.',
    time: "3 days ago",
    icon: "checkmark-circle-outline",
    iconBg: "#E7F0FF",
    iconColor: "#3B82F6",
    unread: true,
  },
  {
    id: "7",
    title: "Privacy Policy Update",
    description: "We have updated our terms of service and privacy policy.",
    time: "1 week ago",
    icon: "document-text-outline",
    iconBg: "#F3F4F6",
    iconColor: "#6B7280",
    unread: false,
  },
  {
    id: "8",
    title: "System Maintenance",
    description:
      "Servers will be down for maintenance on Sunday from 2 AM to 4 AM.",
    time: "1 week ago",
    icon: "construct-outline",
    iconBg: "#FFF9E7",
    iconColor: "#F3A712",
    unread: false,
  },
];

export default function NotificationsScreen() {
  const renderItem = ({ item }: { item: (typeof NOTIFICATIONS)[0] }) => (
    <View style={styles.notificationCard}>
      <View style={[styles.iconContainer, { backgroundColor: item.iconBg }]}>
        <Ionicons name={item.icon as any} size={22} color={item.iconColor} />
      </View>

      <View style={styles.textContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          {item.unread && <View style={styles.unreadDot} />}
        </View>
        <Text style={styles.notifDescription}>{item.description}</Text>
        <Text style={styles.notifTime}>{item.time}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={styles.screenHeader}>
        <Text style={styles.screenTitle}>Notifications</Text>
        <TouchableOpacity>
          <Ionicons name="trash-outline" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={NOTIFICATIONS}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
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
    // Shadow for iOS/Android
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
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
});
