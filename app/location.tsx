import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { locationStyles as styles } from "../styles/location.styles";

const MOCK_SOCIETIES = [
  { name: "Gulmohur Greens", lat: 28.6862, lng: 77.3734 },
  { name: "Saviour Park", lat: 28.6666, lng: 77.3589 },
  { name: "Shalimar City", lat: 28.6753, lng: 77.4049 },
];

const isNearby = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) => {
  const threshold = 0.01;
  return (
    Math.abs(lat1 - lat2) < threshold &&
    Math.abs(lng1 - lng2) < threshold
  );
};

export default function LocationScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUseCurrentLocation = async () => {
    try {
      setLoading(true);
      setError("");

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied");
        setLoading(false);
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({});

      const { latitude, longitude } = location.coords;

      // 🔍 Print for testing
      console.log("LAT:", latitude);
      console.log("LNG:", longitude);

      const society = MOCK_SOCIETIES.find((s) =>
        isNearby(latitude, longitude, s.lat, s.lng)
      );

      if (!society) {
        setError(
          "We’re sorry, but your society is not registered with us yet."
        );
        setLoading(false);
        return;
      }

      // 👉 MOVE TO NEXT PAGE
      router.push({
        pathname: "/society-detected",
        params: {
          society: society.name,
          lat: latitude.toString(),
          lng: longitude.toString(),
        },
      });
    } catch {
      setError("Failed to get location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.primaryButton}
        onPress={handleUseCurrentLocation}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Use my current location
          </Text>
        )}
      </Pressable>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.push("/manual-location")}
      >
        <Text style={styles.secondaryButtonText}>
          Enter location manually
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text style={{ marginTop: 16, color: "red" }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
