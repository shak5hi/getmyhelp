import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { locationStyles as styles } from "../styles/location.styles";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";

export default function LocationScreen() {
  useLanguage(); // re-render on language change
  const router = useRouter();

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      setError("");

      // Ask permission
      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (!canAskAgain) {
          Linking.openURL("app-settings:");
        }
        setError(i18n.t("locationPermissionError"));
        return;
      }

      // Get coordinates
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode
      const address = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      const place = address[0];

      const detectedArea =
        place?.district ||
        place?.subregion ||
        place?.neighborhood ||
        "Your area";

      // Navigate to next step
      router.push({
        pathname: "/select-society",
        params: {
          area: detectedArea,
          lat: latitude.toString(),
          lng: longitude.toString(),
        },
      });
    } catch {
      setError(i18n.t("locationFetchError"));
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
  <View style={styles.container}>
    {/* TOP CONTENT */}
    <View style={styles.topContent}>
      <View style={styles.iconWrapper}>
        <Ionicons
          name="location-outline"
          size={40}
          color="#2E3A46"
        />
      </View>

      <Text style={styles.centerTitle}>
        {i18n.t("whereDoYouLive")}
      </Text>
    </View>

    {/* BOTTOM BUTTONS */}
    <View style={styles.bottomButtons}>
      <Pressable
        style={styles.primaryButton}
        onPress={handleUseCurrentLocation}
        disabled={loadingLocation}
      >
        {loadingLocation ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {i18n.t("useCurrentLocation")}
          </Text>
        )}
      </Pressable>

      <TouchableOpacity style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>
          {i18n.t("enterLocationManually")}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);


}
