
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { listJobs } from "../../src/services/jobs.api";

type Job = {
  id: string;
  title: string;
  category: string;
  description: string;
};

export default function Jobs() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  // Load jobs from Firestore
  const loadJobs = async () => {
    try {
      setLoading(true);
      const data = await listJobs(50);
      setJobs(data);
    } catch (error) {
      console.log("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Run when screen opens
  useEffect(() => {
    loadJobs();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Jobs</Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push("/post/create")}
        >
          <Text style={styles.createButtonText}>Create a Job</Text>
        </TouchableOpacity>
      </View>

      {/* Job List */}
      <ScrollView contentContainerStyle={styles.list}>
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" />
        ) : jobs.length === 0 ? (
          <Text style={styles.emptyText}>No jobs posted yet</Text>
        ) : (
          jobs.map((job) => (
            <View key={job.id} style={styles.card}>
              <Text style={styles.title}>{job.title}</Text>

              <Text style={styles.category}>
                Category:{" "}
                <Text style={styles.categoryValue}>
                  {job.category || "Other"}
                </Text>
              </Text>

              <Text style={styles.description} numberOfLines={3}>
                {job.description}
              </Text>

              <TouchableOpacity
                style={styles.readMoreButton}
                onPress={() => router.push(`/job/${job.id}`)}
              >
                <Text style={styles.readMoreText}>Read More</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  emptyText: {
    textAlign: "center",
    color: "#6B7280",
    marginTop: 40,
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
