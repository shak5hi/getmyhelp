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

export default function LocationScreen() {
  const router = useRouter();

  const [area, setArea] = useState("");
  const [society, setSociety] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  // 🔹 Dummy societies (frontend-only)
  const ALL_SOCIETIES = [
    { name: "Gulmohur Greens", area: "Mohan Nagar" },
    { name: "Saviour Park", area: "Mohan Nagar" },
    { name: "Shalimar City", area: "Mohan Nagar" },

    { name: "Shipra Suncity", area: "Indirapuram" },
    { name: "ATS Advantage", area: "Indirapuram" },

    { name: "Supertech Capetown", area: "Noida" },
    { name: "Amrapali Zodiac", area: "Noida" },

    { name: "DLF Phase 3", area: "Gurgaon" },
    { name: "Sushant Lok", area: "Gurgaon" },
  ];

  // 🔹 Filter societies if location detected
  const visibleSocieties = area
    ? ALL_SOCIETIES.filter((s) => s.area === area)
    : ALL_SOCIETIES;

  const isLocationSelected = society.length > 0;

  // 🔁 Detect permission change when returning from settings
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
        if (!canAskAgain) {
          Linking.openURL("app-settings:");
        }
        setError("Location access is required to detect nearby societies.");
        return;
      }

      // ✅ Simulated detected area
      setArea("Mohan Nagar");
      setSociety("");
      setShowDropdown(false);
    } catch {
      setError("Unable to fetch current location");
    } finally {
      setLoadingLocation(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Step Indicator */}
      <Text style={styles.step}>Step 1 of 2</Text>

      {/* Title */}
      <Text style={styles.title}>Where do you live?</Text>
      <Text style={styles.subtitle}>
        Search and choose your residential community.
      </Text>

      {/* Detected Location */}
      {area ? (
        <Text style={styles.detectedLocation}>
          📍 {area} detected
        </Text>
      ) : null}

      {/* Error */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* Society Dropdown */}
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
          {society || "Select your society"}
        </Text>
        <Ionicons name="chevron-down" size={18} color="#6B7280" />
      </Pressable>

      {/* Dropdown Options */}
      {showDropdown && (
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
      )}

      {/* Use Current Location */}
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
            ? "Fetching location..."
            : "Use my current location"}
        </Text>
      </Pressable>
      {/* Continue */}
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
            Continue
        </Text>
    </TouchableOpacity>

    </View>
  );
}
