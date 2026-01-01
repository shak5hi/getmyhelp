import { View, Text } from "react-native";
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function SocietyDetectedScreen() {
  const router = useRouter();
  const { society, lat, lng } =
    useLocalSearchParams<{
      society: string;
      lat: string;
      lng: string;
    }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace({
        pathname: "/tower",
        params: { lat, lng },
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600" }}>
        Society detected
      </Text>
      <Text style={{ marginTop: 8, fontSize: 16 }}>
        {society}
      </Text>
    </View>
  );
}
