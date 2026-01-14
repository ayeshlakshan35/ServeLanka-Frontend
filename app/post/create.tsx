import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function CreateJob() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [location, setLocation] = useState("");

  const handleSubmit = async () => {
    if (!title || !description || !budget || !location) {
      Alert.alert("Error", "Please fill all required fields");
      return;
    }

    const jobData = {
      title,
      category,
      description,
      budget: Number(budget),
      location,
    };

    try {
      console.log("Posting job:", jobData);

      // Example API call (enable later)
      /*
      await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jobData),
      });
      */

      Alert.alert("Success", "Job posted successfully!");
      router.back();
    } catch (error) {
      Alert.alert("Error", "Failed to post job");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post a Job</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Job Title */}
        <Text style={styles.label}>Job Title</Text>
        <TextInput
          placeholder="e.g., House Cleaning, Garden Maintenance"
          style={styles.input}
          value={title}
          onChangeText={setTitle}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.selectBox}>
          <Text style={styles.selectText}>
            {category || "Select a category"}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#6B7280" />
        </TouchableOpacity>

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          placeholder="Provide a detailed description of the job requirements and expectations."
          multiline
          style={styles.textArea}
          value={description}
          onChangeText={setDescription}
        />

        {/* Budget */}
        <Text style={styles.label}>Budget (LKR)</Text>
        <TextInput
          placeholder="e.g., 5000"
          keyboardType="numeric"
          style={styles.input}
          value={budget}
          onChangeText={setBudget}
        />

        {/* Location */}
        <Text style={styles.label}>Location</Text>
        <TextInput
          placeholder="e.g., Colombo, Kandy, Galle"
          style={styles.input}
          value={location}
          onChangeText={setLocation}
        />

        {/* Upload */}
        <Text style={styles.label}>Attach Images (Optional)</Text>
        <TouchableOpacity style={styles.uploadBox}>
          <Ionicons name="cloud-upload-outline" size={26} color="#6B7280" />
          <Text style={styles.uploadText}>
            Drag & drop files or click to browse
          </Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>Post Job</Text>
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
    color: "#111827",
  },
  content: {
    padding: 20,
  },
  label: {
    marginBottom: 6,
    fontWeight: "500",
    color: "#111827",
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    padding: 14,
    height: 120,
    marginBottom: 16,
    textAlignVertical: "top",
  },
  selectBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F5A623",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  selectText: {
    color: "#6B7280",
  },
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    marginBottom: 24,
  },
  uploadText: {
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: "#F5A623",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  submitText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
});
