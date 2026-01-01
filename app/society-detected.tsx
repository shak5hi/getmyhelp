import { View, Text } from "react-native";
import { useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function LocationDetectedScreen() {
  const router = useRouter();
  const { address, lat, lng } =
    useLocalSearchParams<{
      address: string;
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
        paddingHorizontal: 24,
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "600" }}>
        Location detected
      </Text>

      <Text
        style={{
          marginTop: 8,
          fontSize: 15,
          color: "#444",
          textAlign: "center",
        }}
      >
        {address}
      </Text>
    </View>
  );
}
