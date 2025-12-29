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
  useLanguage(); // 🔁 force re-render on language change
  const router = useRouter();

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      setError("");

      // 1️⃣ Ask permission
      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (!canAskAgain) {
          Linking.openURL("app-settings:");
        }
        setError(i18n.t("locationPermissionError"));
        return;
      }

      // 2️⃣ Get coordinates
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;

      // 3️⃣ Reverse geocode
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

      // 4️⃣ Navigate (Urban Company style)
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
    {/* HEADER */}
    <View style={styles.header}>
      <Ionicons name="chevron-back" size={22} />
      <Text style={styles.headerTitle}>GetMyHelp</Text>
      <Ionicons name="help-circle-outline" size={22} />
    </View>

    {/* TOP CONTENT */}
    <View style={styles.content}>
      <Text style={styles.step}>{i18n.t("step1")}</Text>

      <Text style={styles.title}>
        {i18n.t("whereDoYouLive")}
      </Text>

      <Text style={styles.subtitle}>
        {i18n.t("locationSubtitle")}
      </Text>
    </View>

    {/* BOTTOM ACTIONS (THIS CREATES UC FLOW) */}
    <View style={styles.bottomActions}>
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <Pressable
        style={styles.primaryButton}
        onPress={handleUseCurrentLocation}
        disabled={loadingLocation}
      >
        <Ionicons
          name="location-outline"
          size={18}
          color="#fff"
        />

        {loadingLocation ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {i18n.t("useCurrentLocation")}
          </Text>
        )}
      </Pressable>

      <TouchableOpacity>
        <Text style={styles.secondaryAction}>
          {i18n.t("enterLocationManually")}
        </Text>
      </TouchableOpacity>
    </View>
  </View>
);

}
