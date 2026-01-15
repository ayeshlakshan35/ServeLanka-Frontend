import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ProviderVerification() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Verification</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* IDENTITY DOCUMENT */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Identity Document Upload
          </Text>
          <View style={styles.statusCompleted}>
            <Text style={styles.statusText}>Completed</Text>
          </View>
        </View>

        <Text style={styles.cardDesc}>
          Please upload a clear scan or photo of your
          National ID or Passport.
        </Text>

        <View style={styles.uploadBox}>
          <Ionicons name="cloud-upload-outline" size={28} color="#9CA3AF" />
          <Text style={styles.uploadText}>
            Upload National ID / Passport
          </Text>
          <Text style={styles.uploadHint}>Tap to upload file</Text>
        </View>
      </View>

      {/* PHONE VERIFICATION */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Phone Number Verification
          </Text>
          <View style={styles.statusProgress}>
            <Text style={styles.statusText}>In Progress</Text>
          </View>
        </View>

        <Text style={styles.cardDesc}>
          Enter your phone number to receive a verification code.
        </Text>

        <View style={styles.phoneRow}>
          <TextInput
            placeholder="e.g., +94 77 123 4567"
            style={styles.phoneInput}
            keyboardType="phone-pad"
          />
          <TouchableOpacity style={styles.verifyBtnSmall}>
            <Text style={styles.verifyBtnText}>Verify</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SERVICE PROOF */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>
            Service Proof Upload
          </Text>
          <View style={styles.statusPending}>
            <Text style={styles.statusText}>Pending</Text>
          </View>
        </View>

        <Text style={styles.cardDesc}>
          Upload relevant certifications, licenses, or a
          portfolio showcasing your work.
        </Text>

        <View style={styles.uploadBox}>
          <Ionicons name="cloud-upload-outline" size={28} color="#9CA3AF" />
          <Text style={styles.uploadText}>
            Upload Certificates / Portfolio
          </Text>
          <Text style={styles.uploadHint}>Tap to upload file</Text>
        </View>
      </View>

      {/* SUBMIT */}
      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitText}>Submit for Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardDesc: {
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 12,
  },

  /* STATUS BADGES */
  statusCompleted: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusProgress: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusPending: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#111",
  },

  /* UPLOAD BOX */
  uploadBox: {
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  uploadText: {
    marginTop: 6,
    fontWeight: "600",
  },
  uploadHint: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },

  /* PHONE */
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  phoneInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  verifyBtnSmall: {
    backgroundColor: "#E5E7EB",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  verifyBtnText: {
    fontWeight: "600",
  },

  /* SUBMIT */
  submitBtn: {
    backgroundColor: "#F59E0B",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  submitText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
});
