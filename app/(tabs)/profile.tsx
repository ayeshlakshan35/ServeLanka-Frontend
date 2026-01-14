import { View, Text, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import { auth } from "../../src/config/firebase";
import { getUserProfile } from "../../src/services/users.api";

export default function Profile() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      const data = await getUserProfile(user.uid);
      setUserData(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View className="items-center justify-center flex-1">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="items-center justify-center flex-1">
      <Text className="text-xl font-bold">Profile</Text>

      {userData ? (
        <>
          <Text className="mt-4">Name: {userData.name}</Text>
          <Text>Email: {userData.email}</Text>
          <Text>Role: {userData.role}</Text>
          <Text>
            Verified: {userData.isVerified ? "Yes" : "No"}
          </Text>
        </>
      ) : (
        <Text>No profile data found</Text>
      )}
    </View>
  );
}
