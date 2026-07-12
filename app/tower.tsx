import { getToken } from "../src/api/tokenStore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fonts } from "../constants/tokens";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View, ScrollView } from "react-native";
import { Text, TextInput } from "../components/ui/Text";

import { apiGet, apiPost } from "../src/api/client";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import { makeTowerStyles } from "../styles/tower.styles";
import { useTheme } from "../src/ThemeContext";

interface Tower {
  id: string;
  tower_number: string;
}

export default function TowerScreen() {
  useLanguage();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeTowerStyles(theme), [theme]);

  const [flatNumber, setFlatNumber] = useState("");
  const [selectedTowerId, setSelectedTowerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [towers, setTowers] = useState<Tower[]>([]);
  const [fetchingTowers, setFetchingTowers] = useState(true);

  const isValid = flatNumber.trim().length > 0 && (towers.length === 0 || !!selectedTowerId);

  useEffect(() => {
    fetchTowers();
  }, []);

  const fetchTowers = async () => {
    try {
      const societyId = await AsyncStorage.getItem("selected_society_id");
      // apiGet will return an empty/error shape if there's no token — no explicit
      // check needed here since towers are an optional enhancement.
      if (!societyId) {
        setFetchingTowers(false);
        return;
      }

      // apiGet injects auth header and 20s timeout automatically.
      const result = await apiGet(`/customer/societies/${societyId}/towers`);
      const towersData: Tower[] = (
        Array.isArray(result) ? result : result?.towers || result?.data || []
      ).map((t: any) => ({ id: t.id, tower_number: t.tower_number }));
      setTowers(towersData);
      // Auto-select if only one tower
      if (towersData.length === 1) setSelectedTowerId(towersData[0].id);
    } catch (err) {
      console.log("Error fetching towers:", err);
    } finally {
      setFetchingTowers(false);
    }
  };

  const handleContinue = async () => {
    if (!isValid) {
      setError(towers.length > 0 ? "Please select a tower and enter your flat number" : "Please enter your flat number");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const societyId = await AsyncStorage.getItem("selected_society_id");
      if (!societyId) {
        setError("Missing society. Please restart onboarding.");
        return;
      }

      const body: Record<string, string> = {
        society_id: societyId,
        flat_number: flatNumber.trim(),
      };
      if (selectedTowerId) body.tower_id = selectedTowerId;

      // apiPost injects auth header, timeout, and 401 guard automatically.
      const result = await apiPost("/customer/enter-flat", body);
      // apiPost doesn't throw on non-2xx; check for error in the response body.
      if (result?.detail || result?.message) {
        const errMsg = result.detail || result.message;
        if (typeof errMsg === "string" && !errMsg.toLowerCase().includes("success")) {
          setError(errMsg || "Failed to save flat details");
          return;
        }
      }

      await AsyncStorage.setItem("flat_number", flatNumber.trim());
      if (selectedTowerId) await AsyncStorage.setItem("selected_tower_id", selectedTowerId);

      router.replace("/dashboard");
    } catch (err) {
      setError("Network error. Failed to complete onboarding");
      console.log("Onboarding error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <View style={styles.container}>
        <Text style={styles.step}>{i18n.t("step2")}</Text>
        <Text style={styles.title}>{i18n.t("selectTower")}</Text>
        <Text style={styles.subtitle}>{i18n.t("towerSubtitle")}</Text>

        {error ? <Text style={{ color: theme.danger, marginBottom: 10 }}>{error}</Text> : null}

        {fetchingTowers ? (
          <ActivityIndicator style={{ marginVertical: 16 }} color={theme.accent} />
        ) : towers.length > 1 ? (
          <>
            <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: theme.textSecondary, marginBottom: 10 }}>
              Select Tower *
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
              {towers.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setSelectedTowerId(t.id)}
                  style={{
                    borderWidth: 1.5,
                    borderColor: selectedTowerId === t.id ? theme.accent : theme.border,
                    borderRadius: 8,
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    backgroundColor: selectedTowerId === t.id ? theme.accent : theme.card,
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: fonts.semibold,
                    color: selectedTowerId === t.id ? theme.onAccent : theme.textSecondary,
                  }}>
                    Tower {t.tower_number}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : null}

        <Text style={{ fontSize: 14, fontFamily: fonts.semibold, color: theme.textSecondary, marginBottom: 8 }}>
          Flat Number *
        </Text>
        <TextInput
          placeholder="e.g. 301 or A-101"
          placeholderTextColor={theme.textTertiary}
          value={flatNumber}
          onChangeText={(text) => {
            setFlatNumber(text);
            if (text.trim()) setError("");
          }}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 14,
            paddingHorizontal: 16,
            paddingVertical: 14,
            fontSize: 16,
            color: theme.text,
            backgroundColor: theme.card,
            marginBottom: 20,
          }}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={[styles.button, (!isValid || loading) && styles.buttonDisabled]}
          disabled={!isValid || loading}
          onPress={handleContinue}
        >
          {loading ? (
            <ActivityIndicator color={theme.onAccent} />
          ) : (
            <Text style={[styles.buttonText, !isValid && styles.buttonTextDisabled]}>
              {i18n.t("continue") || "Continue"}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
