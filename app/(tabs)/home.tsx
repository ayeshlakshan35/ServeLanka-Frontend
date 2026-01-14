import { useState } from "react";
import { Alert, Image, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { uploadToCloudinary } from "../../src/services/image";
import { auth, db } from "../../src/config/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function Profile() {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickAndUpload = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow photo access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled) return;

      setLoading(true);

      // 1) Upload to Cloudinary
      const url = await uploadToCloudinary(result.assets[0].uri);

      // 2) Save URL in Firestore
      const uid = auth.currentUser?.uid;
      if (!uid) throw new Error("Not logged in");

      await setDoc(doc(db, "users", uid), { photoUrl: url }, { merge: true });

      // 3) Update UI
      setPhotoUrl(url);

      Alert.alert("Success", "Profile photo updated!");
    } catch (e: any) {
      Alert.alert("Upload failed", e?.message || "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>Profile</Text>

      {photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={{ width: 120, height: 120, borderRadius: 60 }}
        />
      ) : (
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: "#E5E7EB",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text>No Photo</Text>
        </View>
      )}

      <TouchableOpacity
        onPress={pickAndUpload}
        disabled={loading}
        style={{
          backgroundColor: "#F5A623",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "600" }}>
          {loading ? "Uploading..." : "Upload Profile Photo"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
