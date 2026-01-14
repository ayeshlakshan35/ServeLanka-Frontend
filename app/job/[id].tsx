import { View, Text } from "react-native";
import { useLocalSearchParams } from "expo-router";

export default function JobDetails() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Job Details</Text>
      <Text>Job ID: {id}</Text>
    </View>
  );
}
