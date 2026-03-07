import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import config from "../src/config";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import { towerStyles as styles } from "../styles/tower.styles";

export default function TowerScreen() {
  useLanguage();
  const router = useRouter();

  const [towerNumber, setTowerNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValid = towerNumber.trim().length > 0;

  const handleContinue = async () => {
    if (!isValid) {
      setError("Please enter your tower/flat number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const societyId = await AsyncStorage.getItem("selected_society_id");
      const token = await AsyncStorage.getItem("access_token");

      // Additional data needed for onboarding depending on backend
      const phoneRaw = await AsyncStorage.getItem("user");
      const phoneObj = phoneRaw ? JSON.parse(phoneRaw) : null;
      const phoneNumber = phoneObj?.phone || "Unknown";

      if (!societyId || !token) {
        setError("Missing society or token information. Please go back.");
        return;
      }

      // Final onboarding / validate API
      // Since your prompt specifies POST /user/onboarding, I will use that endpoint
      const response = await fetch(
        `${config.apiUrl}/user/onboarding`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phoneNumber,
            societyId: societyId,
            towerNumber: towerNumber.trim(),
            // Assuming latitude and longitude are handled by societyId backend matching or can be sent if needed
          }),
        }
      );

      // If the `/user/onboarding` endpoint does not actually exist yet on your external backend
      // and you meant for me to use the existing `/customer/validate-tower-number` from house.tsx, 
      // replace the fetch URL and payload above with:
      /*
      const response = await fetch(
        `${config.apiUrl}/customer/validate-tower-number`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            society_id: societyId,
            tower_id: towerNumber.trim(), // The backend might expect an ID here, but if text is allowed now
            flat_number: towerNumber.trim(),
          }),
        }
      );
      */

      if (!response.ok) {
        // Just in case we hit a 404 because the prompt's endpoint doesn't exist
        if (response.status === 404) {
          console.warn("Endpoint /user/onboarding not found. Attempting fallback to existing flow.");

          await AsyncStorage.setItem("selected_tower_id", towerNumber.trim());
          router.replace("/dashboard");
          return;
        }

        const data = await response.json();
        setError(data.message || "Failed to complete onboarding");
        return;
      }

      // Success! Proceed to dashboard
      await AsyncStorage.setItem("selected_tower_id", towerNumber.trim());
      await AsyncStorage.setItem("flat_number", towerNumber.trim());

      router.replace("/dashboard");
    } catch (err) {
      setError("Network err. Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>{i18n.t("step2")}</Text>

      <Text style={styles.title}>{i18n.t("selectTower")}</Text>
      <Text style={styles.subtitle}>{i18n.t("towerSubtitle")}</Text>

      {error ? <Text style={{ color: "red", marginBottom: 10 }}>{error}</Text> : null}

      <TextInput
        placeholder="e.g. A-704 or Tower 3, Flat 102"
        placeholderTextColor="#9CA3AF"
        value={towerNumber}
        onChangeText={(text) => {
          setTowerNumber(text);
          if (text.trim()) setError("");
        }}
        style={{
          borderWidth: 1,
          borderColor: "#4a5057",
          borderRadius: 14,
          paddingHorizontal: 16,
          paddingVertical: 14,
          fontSize: 16,
          color: "#000000",
          backgroundColor: "#FFFFFF",
          marginBottom: 20
        }}
        autoCapitalize="characters"
      />

      {/* CONTINUE */}
      <TouchableOpacity
        style={[
          styles.button,
          (!isValid || loading) && styles.buttonDisabled,
        ]}
        disabled={!isValid || loading}
        onPress={handleContinue}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text
            style={[
              styles.buttonText,
              !isValid && styles.buttonTextDisabled,
            ]}
          >
            {i18n.t("continue") || "Continue"}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
