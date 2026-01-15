import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";



export default function EditProfile() {
  const router = useRouter();

  const [photo, setPhoto] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  // Pick image from gallery
  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  // Take photo using camera
  const takePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <Text style={styles.header}>Edit Profile</Text>

      {/* PROFILE PHOTO */}
      <View style={styles.photoContainer}>
        <Image
          source={{
            uri: photo || "https://i.pravatar.cc/150?img=47",
          }}
          style={styles.avatar}
        />

        <View style={styles.photoActions}>
          <TouchableOpacity
            onPress={pickFromGallery}
            style={styles.photoBtn}
          >
            <Text style={styles.photoBtnText}>Gallery</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={takePhoto}
            style={styles.photoBtn}
          >
            <Text style={styles.photoBtnText}>Camera</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* FORM */}
      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          placeholder="Enter your name"
          style={styles.input}
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Profile Email</Text>
        <TextInput
          placeholder="Enter profile email"
          style={styles.input}
          keyboardType="email-address"
          value={profileEmail}
          onChangeText={setProfileEmail}
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          placeholder="Enter phone number"
          style={styles.input}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          placeholder="Enter address"
          style={[styles.input, styles.textArea]}
          multiline
          value={address}
          onChangeText={setAddress}
        />
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.cancelBtn}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  photoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  photoActions: {
    flexDirection: "row",
    gap: 10,
  },
  photoBtn: {
    backgroundColor: "#F59E0B",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  photoBtnText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#F59E0B",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  actions: {
    flexDirection: "row",
    marginTop: 20,
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#E5E7EB",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelText: {
    fontWeight: "600",
  },
  saveBtn: {
    flex: 1,
    backgroundColor: "#F59E0B",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
