import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Linking,
  AppState,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { locationStyles as styles } from "../styles/location.styles";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";

export default function LocationScreen() {
  useLanguage(); // 🔁 force re-render on language change
  const router = useRouter();

  const [area, setArea] = useState("");
  const [society, setSociety] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  const ALL_SOCIETIES = [
    { name: "Gulmohur Greens", area: "Mohan Nagar" },
    { name: "Saviour Park", area: "Mohan Nagar" },
    { name: "Shalimar City", area: "Mohan Nagar" },
    { name: "Shipra Suncity", area: "Indirapuram" },
    { name: "ATS Advantage", area: "Indirapuram" },
    { name: "Supertech Capetown", area: "Noida" },
    { name: "Amrapali Zodiac", area: "Noida" },
  ];

  const visibleSocieties = area
    ? ALL_SOCIETIES.filter((s) => s.area === area)
    : ALL_SOCIETIES;

  const isLocationSelected = society.length > 0;

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (state) => {
      if (state === "active") {
        const { status } =
          await Location.getForegroundPermissionsAsync();
        if (status === "granted" && !area) {
          setArea("Mohan Nagar");
        }
      }
    });

    return () => sub.remove();
  }, []);

  const handleUseCurrentLocation = async () => {
    try {
      setLoadingLocation(true);
      setError("");

      const { status, canAskAgain } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (!canAskAgain) Linking.openURL("app-settings:");
        setError(i18n.t("locationPermissionError"));
        return;
      }

      setArea("Mohan Nagar");
      setSociety("");
      setShowDropdown(false);
    } catch {
      setError(i18n.t("locationFetchError"));
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* STEP */}
      <Text style={styles.step}>{i18n.t("step1")}</Text>

      {/* TITLE */}
      <Text style={styles.title}>{i18n.t("whereDoYouLive")}</Text>
      <Text style={styles.subtitle}>
        {i18n.t("locationSubtitle")}
      </Text>

      {/* DETECTED LOCATION */}
      {area ? (
        <Text style={styles.detectedLocation}>
          📍 {area} {i18n.t("areaDetected")}
        </Text>
      ) : null}

      {/* ERROR */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {/* DROPDOWN */}
      <Pressable
        style={styles.dropdown}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text
          style={[
            styles.dropdownText,
            !society && styles.placeholderText,
          ]}
        >
          {society || i18n.t("selectSociety")}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </Pressable>

      {/* DROPDOWN LIST */}
      {showDropdown ? (
        <View style={styles.dropdownList}>
          {visibleSocieties.map((item) => (
            <Pressable
              key={item.name}
              style={styles.dropdownItem}
              onPress={() => {
                setSociety(item.name);
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>
                {item.name}
                <Text style={{ color: "#9CA3AF" }}>
                  {"  "}• {item.area}
                </Text>
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {/* USE CURRENT LOCATION */}
      <Pressable
        style={styles.currentLocation}
        onPress={handleUseCurrentLocation}
      >
        <Ionicons
          name="location-outline"
          size={16}
          color="#2E3A46"
        />
        <Text style={styles.currentLocationText}>
          {loadingLocation
            ? i18n.t("fetchingLocation")
            : i18n.t("useCurrentLocation")}
        </Text>
      </Pressable>

      {/* CONTINUE BUTTON */}
      <TouchableOpacity
        style={[
          styles.button,
          !isLocationSelected && styles.buttonDisabled,
        ]}
        disabled={!isLocationSelected}
        onPress={() => router.push("/tower")}
      >
        <Text
          style={[
            styles.buttonText,
            !isLocationSelected && styles.buttonTextDisabled,
          ]}
        >
          {i18n.t("continue")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
