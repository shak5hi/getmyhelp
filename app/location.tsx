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

export default function LocationScreen() {
  const router = useRouter();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      setError("");

      // 1️⃣ Ask permission
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied");
        setLoadingLocation(false);
        return;
      }

      // 2️⃣ Get GPS coordinates
      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      const { latitude, longitude } = location.coords;

      // 🔍 PRINT FOR TESTING
      console.log("📍 LAT:", latitude);
      console.log("📍 LNG:", longitude);

      // 3️⃣ OpenStreetMap Reverse Geocoding
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );

      const data = await res.json();

      if (!data || !data.display_name) {
        setError("Unable to detect address");
        setLoadingLocation(false);
        return;
      }

      const address = data.display_name;

      console.log("🏠 ADDRESS:", address);

      // 4️⃣ Navigate to DIFFERENT page
      router.push({
        pathname: "/society-detected",
        params: {
          address,
          lat: latitude.toString(),
          lng: longitude.toString(),
        },
      });
    } catch (err) {
      console.log("❌ ERROR:", err);
      setError("Failed to fetch location");
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.primaryButton}
        onPress={handleUseCurrentLocation}
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            Use my current location
          </Text>
        )}
      </Pressable>

      <TouchableOpacity style={styles.secondaryButton}>
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
