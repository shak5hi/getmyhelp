import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { houseStyles as styles } from "../styles/house.styles";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import config from "../src/config";
import { apiFetch } from "../src/api";

export default function HouseScreen() {
  useLanguage();
  const router = useRouter();

  const [houseNumber, setHouseNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = houseNumber.trim().length > 0;

  const handleContinue = async () => {
    if (!isValid) {
      setError(i18n.t("houseError"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const societyId = await AsyncStorage.getItem("selected_society_id");
      const towerId = await AsyncStorage.getItem("selected_tower_id");
      const token = await AsyncStorage.getItem("access_token");

      if (!societyId || !towerId || !token) {
        setError("Missing society or tower information");
        return;
      }

      const response = await apiFetch("/customer/validate-tower-number", {
        method: "POST",
        body: JSON.stringify({
          society_id: societyId,
          tower_id: towerId,
          flat_number: houseNumber.trim(),
        }),
      });

      const result = await response.json();

      /**
       * API behavior:
       * - If customer exists → result.data.customer_info present
       * - If flat is free → success message, no data
       */
      if (result?.data?.customer_info) {
        setError(i18n.t("flatAlreadyExists"));
        return;
      }

      // ✅ Flat available → continue
      await AsyncStorage.setItem(
        "flat_number",
        houseNumber.trim()
      );

      router.replace("/(tabs)/home");
    } catch (err) {
      setError("Failed to validate flat number");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.step}>{i18n.t("step3")}</Text>

      <Text style={styles.title}>{i18n.t("houseTitle")}</Text>
      <Text style={styles.subtitle}>{i18n.t("houseSubtitle")}</Text>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TextInput
        placeholder={i18n.t("housePlaceholder")}
        value={houseNumber}
        onChangeText={(text) => {
          setHouseNumber(text);
          if (text.trim()) setError("");
        }}
        style={[styles.input, error && styles.inputError]}
        autoCapitalize="characters"
      />

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
            {i18n.t("continue")}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
