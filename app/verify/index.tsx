import { View, Text, TouchableOpacity } from "react-native";
import { auth } from "../../src/config/firebase";
import { updateUserProfile } from "../../src/services/users.api";
import { useRouter } from "expo-router";

export default function VerifyProvider() {
  const router = useRouter();

  const handleVerify = async () => {
    const user = auth.currentUser;
    if (!user) return;

    await updateUserProfile(user.uid, {
      role: "provider",
      isVerified: true,
    });

    router.replace("/(tabs)/profile");
  };

  return (
    <View className="items-center justify-center flex-1 p-6">
      <Text className="mb-4 text-xl font-bold">
        Verify as Provider
      </Text>

      <Text className="mb-6 text-center">
        This will convert your account into a service provider.
      </Text>

      <TouchableOpacity
        onPress={handleVerify}
        className="w-full p-4 bg-orange-500 rounded"
      >
        <Text className="text-center text-white">
          Confirm Verification
        </Text>
      </TouchableOpacity>
    </View>
  );
}
