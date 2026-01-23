import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getJobById, Job } from "../../src/services/jobs.api";

export default function JobDetails() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErrorMsg("");

        const data = await getJobById(String(id));
        setJob(data);
      } catch (e: any) {
        setJob(null);
        setErrorMsg(e?.message || "Failed to load job");
      } finally {
        setLoading(false);
      }
    };

    if (id) load();
  }, [id]);

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
        {loading ? (
          <Text style={styles.infoText}>Loading...</Text>
        ) : !job ? (
          <Text style={styles.infoText}>
            {errorMsg ? errorMsg : "Job not found"}
          </Text>
        ) : (
          <>
            <Text style={styles.title}>{job.title}</Text>
            <Text style={styles.description}>{job.description}</Text>

            {/* Budget */}
            <Text style={styles.sectionTitle}>Budget (LKR)</Text>
            <Text style={styles.sectionText}>
              {typeof job.budget === "number"
                ? job.budget.toLocaleString()
                : job.budget}
            </Text>

            {/* Location */}
            <Text style={styles.sectionTitle}>Location</Text>
            <Text style={styles.sectionText}>{job.location}</Text>

            {/* Images */}
            <Text style={styles.sectionTitle}>Attachments / Images</Text>

            {job.imageUrls && job.imageUrls.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {job.imageUrls.map((img, index) => (
                  <Image
                    key={index}
                    source={{ uri: img }}
                    style={styles.image}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.sectionText}>No images attached.</Text>
            )}

            {/* Apply Button */}
            <TouchableOpacity style={styles.applyButton}>
              <Text style={styles.applyText}>Apply / Contact</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
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
  content: { padding: 20 },
  infoText: { color: "#6B7280" },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 12 },
  description: { color: "#6B7280", lineHeight: 22, marginBottom: 20 },
  sectionTitle: { fontWeight: "600", marginTop: 10, marginBottom: 4 },
  sectionText: { color: "#6B7280", marginBottom: 12 },
  image: { width: 160, height: 110, borderRadius: 10, marginRight: 10 },
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


