import {
  View,
  Text,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useEffect, useState } from "react";
import { auth } from "../../src/config/firebase";
import {
  getUserProfile,
  updateUserProfile,
} from "../../src/services/users.api";
import { signOut } from "firebase/auth";
import { useRouter } from "expo-router";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const data = await getUserProfile(user.uid);
    setUserData(data);
    setName(data?.name || "");
    setLoading(false);
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateUserProfile(user.uid, { name });
    setEditing(false);
    loadProfile();
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.replace("/login");
  };

  if (loading) {
    return (
      <View className="items-center justify-center flex-1">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-6">
      <Text className="mb-4 text-xl font-bold">Profile</Text>

      {editing ? (
        <>
          <Text className="mb-2">Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            className="p-3 mb-4 border border-gray-300 rounded"
          />

          <TouchableOpacity
            onPress={handleSave}
            className="p-4 mb-2 bg-orange-500 rounded"
          >
            <Text className="text-center text-white">Save</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setEditing(false)}>
            <Text className="text-center text-gray-500">Cancel</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text>Name: {userData.name}</Text>
          <Text>Email: {userData.email}</Text>
          <Text>Role: {userData.role}</Text>
          <Text>
            Verified: {userData.isVerified ? "Yes" : "No"}
          </Text>

          {userData.role === "user" && (
            <TouchableOpacity
              onPress={() => router.push("/verify/index")}
              className="p-4 mt-4 bg-orange-500 rounded"
            >
              <Text className="text-center text-white">
                Verify as Provider
              </Text>
            </TouchableOpacity>
          )}

          {userData.role === "provider" && (
            <View className="mt-4">
              <Text>⭐ Rating: 4.5</Text>
              <Text>My Services</Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => setEditing(true)}
            className="p-4 mt-6 bg-orange-500 rounded"
          >
            <Text className="text-center text-white">Edit Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            className="p-4 mt-4 bg-red-500 rounded"
          >
            <Text className="text-center text-white">Logout</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
