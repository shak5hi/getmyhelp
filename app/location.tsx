import { getToken } from "../src/api/tokenStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { clearSession } from "../src/api/client";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import config from "../src/config";
import { makeSocietyDetectedStyles } from "../styles/societyDetectedStyles";
import { useTheme } from "../src/ThemeContext";

/* ---------------------------------------
   Types
--------------------------------------- */
type Society = {
  id: string;
  name: string;
  address: string;
  pincode?: string;
};

export default function LocationScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeSocietyDetectedStyles(theme), [theme]);

  /* ---------------------------------------
     EXISTING STATE (UNCHANGED)
  --------------------------------------- */
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState("");

  /* ---------------------------------------
     NEW STATE (MANUAL SELECTION)
  --------------------------------------- */
  const [societies, setSocieties] = useState<Society[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);
  const [loadingSocieties, setLoadingSocieties] = useState(true);

  /* ---------------------------------------
     LOAD ALL SOCIETIES (MANUAL MODE)
  --------------------------------------- */
  useEffect(() => {
    const fetchAllSocieties = async () => {
      try {
        const token = await getToken();
        if (!token) {
          router.replace("/phone");
          return;
        }

        const response = await fetch(
          `${config.apiUrl}/customer/societies`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();
        setSocieties(data?.data?.societies || []);
      } catch (err) {
        console.log("❌ Failed to load societies", err);
        setSocieties([]);
      } finally {
        setLoadingSocieties(false);
      }
    };

    fetchAllSocieties();
  }, []);

  const filteredSocieties = societies.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  /* ---------------------------------------
     🚨 DO NOT TOUCH – ORIGINAL LOCATION LOGIC
  --------------------------------------- */
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
      const token = await getToken();

      if (!token) {
        setError("User not authenticated. Please login again.");
        setLoadingLocation(false);
        router.replace("/phone");
        return;
      }


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
          // Clear the *whole* session, not just the token: the society id and
          // cached module set are per-user and must not survive into the next login.
          await clearSession();
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

      // 7️⃣ Persist societies/address to storage and navigate
      try {
        await AsyncStorage.setItem("societies_data", JSON.stringify(societies));
        await AsyncStorage.setItem("user_address", address);
        console.log("💾 Societies and address saved to storage");
      } catch (saveErr) {
        console.log("❌ Failed to save societies to storage", saveErr);
      }

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

  /* ---------------------------------------
     CONTINUE (MANUAL)
  --------------------------------------- */
  const handleContinue = async () => {
    if (!selectedSociety) return;

    await AsyncStorage.setItem("selected_society_id", selectedSociety);
    router.push("/tower");
  };

  /* ---------------------------------------
     UI
  --------------------------------------- */
  if (loadingSocieties) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Loading societies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.title}>Which society do you live in?</Text>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <TextInput
          placeholder="Search your society"
          placeholderTextColor={theme.textTertiary}
          value={search}
          onChangeText={setSearch}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: theme.text,
            backgroundColor: theme.card,
          }}
        />
      </View>

      {/* Society List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.grid}>
          {filteredSocieties.map((society) => {
            const isSelected = selectedSociety === society.id;

            return (
              <Pressable
                key={society.id}
                onPress={() => setSelectedSociety(society.id)}
                style={[styles.card, isSelected && styles.cardSelected]}
              >
                <Text
                  style={[
                    styles.societyName,
                    isSelected && styles.societyNameSelected,
                  ]}
                >
                  {society.name}
                </Text>

                <Text
                  style={[
                    styles.societyAddress,
                    isSelected && styles.societyAddressSelected,
                  ]}
                >
                  {society.address}
                </Text>

                {society.pincode && (
                  <Text
                    style={[
                      styles.pincode,
                      isSelected && styles.pincodeSelected,
                    ]}
                  >
                    PIN: {society.pincode}
                  </Text>
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleUseCurrentLocation}
          style={[styles.retryButton, { marginBottom: 12 }]}
          disabled={loadingLocation}
        >
          {loadingLocation ? (
            <ActivityIndicator color={theme.onAccent} />
          ) : (
            <Text style={styles.retryButtonText}>
              Use my current location
            </Text>
          )}
        </Pressable>

        <Pressable
          disabled={!selectedSociety}
          onPress={handleContinue}
          style={[
            styles.continueButton,
            !selectedSociety && styles.continueButtonDisabled,
          ]}
        >
          <Text
            style={[
              styles.continueButtonText,
              !selectedSociety && styles.continueButtonTextDisabled,
            ]}
          >
            Continue
          </Text>
        </Pressable>
      </View>

      {error ? (
        <Text style={[styles.error, { textAlign: "center" }]}>{error}</Text>
      ) : null}
    </View>
  );
}
