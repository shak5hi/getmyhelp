import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
  const [towers, setTowers] = useState<any[]>([]);
  const [fetchingTowers, setFetchingTowers] = useState(true);

  const isValid = towerNumber.trim().length > 0;

  useEffect(() => {
    fetchTowers();
  }, []);

  const fetchTowers = async () => {
    try {
      const societyId = await AsyncStorage.getItem("selected_society_id");
      const token = await AsyncStorage.getItem("access_token");
      
      if (!societyId || !token) {
        setFetchingTowers(false);
        return;
      }

      const response = await fetch(`${config.apiUrl}/customer/societies/${societyId}/towers`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const result = await response.json();
        const towersData = Array.isArray(result) ? result : (result?.towers || result?.data || []);
        setTowers(towersData);
      }
    } catch (err) {
      console.log("Error fetching towers:", err);
    } finally {
      setFetchingTowers(false);
    }
  };

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

      if (!societyId || !token) {
        setError("Missing society or token. Please restart onboarding.");
        return;
      }

      // Final onboarding via enter-flat
      const response = await fetch(
        `${config.apiUrl}/customer/enter-flat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            society_id: societyId,
            flat_number: towerNumber.trim(),
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Failed to save flat details");
        return;
      }

      // Success! Proceed to dashboard
      await AsyncStorage.setItem("selected_tower_id", towerNumber.trim());
      await AsyncStorage.setItem("flat_number", towerNumber.trim());

      router.replace("/dashboard");
    } catch (err) {
      setError("Network error. Failed to complete onboarding");
      console.log("Onboarding error:", err);
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
