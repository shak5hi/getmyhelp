import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import config from "../src/config";
import { locationStyles as styles } from "../styles/location.styles";

export default function LocationScreen() {
  const router = useRouter();
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      setError("");

      // 1️⃣ Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied. Please enable location access.");
        setLoadingLocation(false);
        return;
      }

      // 2️⃣ Get GPS coordinates
      console.log("📍 Getting current position...");
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      console.log("📍 LAT:", latitude);
      console.log("📍 LNG:", longitude);

      // 3️⃣ Reverse geocoding to get address
      console.log("🌍 Fetching address from coordinates...");
      const geocodeResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            "User-Agent": "GetMyHelp/1.0",
          },
        }
      );

      if (!geocodeResponse.ok) {
        throw new Error("Failed to fetch address from coordinates");
      }

      const geocodeData = await geocodeResponse.json();

      if (!geocodeData?.display_name) {
        setError("Unable to detect address from your location");
        setLoadingLocation(false);
        return;
      }

      const address = geocodeData.display_name;
      console.log("🏠 ADDRESS:", address);

      // 4️⃣ Get access token from storage
      const token = await AsyncStorage.getItem("access_token");

      if (!token) {
        setError("User not authenticated. Please login again.");
        setLoadingLocation(false);
        router.replace("/phone");
        return;
      }

      console.log("🔐 USING TOKEN:", token.substring(0, 20) + "...");

      // 5️⃣ Send location to backend with correct field names
      console.log("📤 Sending location to backend...");

      const requestBody = {
        latitude: latitude,
        longitude: longitude,
        address: address,
        locality: "",
      };

      console.log("📦 REQUEST BODY:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(
        `${config.apiUrl}/customer/explore-societies`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      console.log("📥 Backend response status:", response.status);

      // Handle response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: "Unknown error",
        }));
        console.log("❌ Backend error details:", JSON.stringify(errorData, null, 2));
        
        if (response.status === 401) {
          setError("Session expired. Please login again.");
          await AsyncStorage.removeItem("access_token");
          router.replace("/phone");
        } else if (response.status === 422) {
          setError("Invalid data sent to server. Please try again.");
        } else {
          setError(`Server error: ${response.status}`);
        }
        setLoadingLocation(false);
        return;
      }

      const successData = await response.json();
      console.log("✅ Location sent successfully");
      console.log("📊 Response data:", JSON.stringify(successData, null, 2));

      // 6️⃣ Extract societies from response
      const societies = successData.data?.societies || [];
      console.log("🏘️ Received societies:", societies.length);

      if (societies.length === 0) {
        setError("No societies found in your area");
        setLoadingLocation(false);
        return;
      }

      // 7️⃣ Navigate with societies data directly in params
      console.log("🚀 Navigating with data...");
      
      router.push({
        pathname: "/society-detected",
        params: {
          address: address,
          societiesData: JSON.stringify(societies),
        },
      });

    } catch (err) {
      console.log("❌ ERROR:", err);
      
      if (err instanceof Error) {
        if (err.message.includes("network")) {
          setError("Network error. Please check your internet connection.");
        } else if (err.message.includes("timeout")) {
          setError("Request timeout. Please try again.");
        } else {
          setError(`Error: ${err.message}`);
        }
      } else {
        setError("Failed to fetch location. Please try again.");
      }
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleManualLocation = () => {
    router.push("/manual-location");
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={[
          styles.primaryButton,
          loadingLocation && styles.primaryButtonDisabled,
        ]}
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

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleManualLocation}
        disabled={loadingLocation}
      >
        <Text style={styles.secondaryButtonText}>
          Enter location manually
        </Text>
      </TouchableOpacity>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}