import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const JOBS = [
  {
    id: 1,
    title: "House Cleaning Service",
    category: "Cleaning",
    description:
      "Looking for a reliable and thorough house cleaner for a weekly service. Must be experienced and have own supplies. References required.",
  },
  {
    id: 2,
    title: "Garden Maintenance",
    category: "Gardening",
    description:
      "Need a gardener for regular lawn mowing, weeding, and general garden upkeep. Flexible hours, but consistent service is a must.",
  },
  {
    id: 3,
    title: "Dog Walking",
    category: "Pet Care",
    description:
      "Seeking a friendly and responsible dog walker for daily walks. Experience with large breeds preferred. Background check required.",
  },
  {
    id: 4,
    title: "IT Support Specialist",
    category: "Tech",
    description:
      "On-site IT support needed for small business. Troubleshooting hardware/software, network issues. Part-time, flexible schedule.",
  },
];

export default function Jobs() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Jobs</Text>

        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create a Job</Text>
        </TouchableOpacity>
      </View>

      {/* Job List */}
      <ScrollView contentContainerStyle={styles.list}>
        {JOBS.map((job) => (
          <View key={job.id} style={styles.card}>
            <Text style={styles.title}>{job.title}</Text>

            <Text style={styles.category}>
              Category: <Text style={styles.categoryValue}>{job.category}</Text>
            </Text>

            <Text style={styles.description}>{job.description}</Text>

            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Read More</Text>
            </TouchableOpacity>
          </View>
        ))}
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
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 10,
  },
  createButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  createButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  list: {
    padding: 16,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  category: {
    color: "#6B7280",
    marginBottom: 8,
  },
  categoryValue: {
    fontWeight: "600",
  },
  description: {
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  readMoreButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 10,
    borderRadius: 8,
  },
  readMoreText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "600",
  },
});
