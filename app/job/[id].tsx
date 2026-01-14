import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function JobDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  // Mock data (later replace with API)
  const job = {
    title: "House Cleaning and Garden Maintenance",
    description:
      "Looking for a reliable individual to perform house cleaning duties twice a week and garden maintenance once a month. Tasks include dusting, vacuuming, mopping, bathroom cleaning, kitchen cleaning, weeding, pruning, and lawn mowing. Experience preferred.",
    budget: "5000 per visit (negotiable)",
    location: "Colombo, Sri Lanka",
    images: [
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    ],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>{job.title}</Text>

        <Text style={styles.description}>{job.description}</Text>

        {/* Budget */}
        <Text style={styles.sectionTitle}>Budget (LKR)</Text>
        <Text style={styles.sectionText}>{job.budget}</Text>

        {/* Location */}
        <Text style={styles.sectionTitle}>Location</Text>
        <Text style={styles.sectionText}>{job.location}</Text>

        {/* Images */}
        <Text style={styles.sectionTitle}>Attachments / Images</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {job.images.map((img, index) => (
            <Image key={index} source={{ uri: img }} style={styles.image} />
          ))}
        </ScrollView>

        {/* Apply Button */}
        <TouchableOpacity style={styles.applyButton}>
          <Text style={styles.applyText}>Apply / Contact</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    color: "#6B7280",
    lineHeight: 22,
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 4,
  },
  sectionText: {
    color: "#6B7280",
    marginBottom: 12,
  },
  image: {
    width: 160,
    height: 110,
    borderRadius: 10,
    marginRight: 10,
  },
  applyButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 40,
  },
  applyText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
