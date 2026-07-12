import { apiGet, apiPost } from "../src/api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";
import { Text } from "../components/ui/Text";

import { makeSocietyDetectedStyles } from "../styles/societyDetectedStyles";
import { useTheme } from "../src/ThemeContext";

type Society = {
  id: string;
  name: string;
  address: string;
  pincode: string;
  locality?: string;
  locality_id?: string;
  city_id?: string;
};

export default function SocietyDetectedScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeSocietyDetectedStyles(theme), [theme]);
  const params = useLocalSearchParams<{ societiesData?: string, address?: string }>();

  const [address, setAddress] = useState<string>(params.address || "");
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSocieties = async () => {
      try {
        console.log("🔄 Loading societies...");
        
        // 1. Try to get societies from params first
        if (params.societiesData) {
           const parsed = JSON.parse(params.societiesData);
           if (Array.isArray(parsed) && parsed.length > 0) {
             setSocieties(parsed);
             setLoading(false);
             return;
           }
        }

        // 2. Try to get societies from storage (saved by location.tsx)
        const storedSocietiesJson = await AsyncStorage.getItem("societies_data");
        const storedAddress = await AsyncStorage.getItem("user_address");
        if (storedAddress) setAddress(storedAddress);

        if (storedSocietiesJson) {
          const parsed = JSON.parse(storedSocietiesJson);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.log("✅ Using societies from storage (location search)");
            setSocieties(parsed);
            setLoading(false);
            return;
          }
        }

        // 3. Fallback: Fetch from general societies API if no location-based data
        console.log("🌐 No location data, fetching from general API...");
        // apiGet injects auth header, timeout, and 401 guard automatically.
        const result = await apiGet("/customer/societies");
        const societiesData = Array.isArray(result) ? result : (result?.societies || result?.data?.societies || []);
        if (societiesData.length > 0) {
          setSocieties(societiesData);
        } else {
          setError("No societies found in your area");
        }
      } catch (err: any) {
        console.log("❌ Error loading societies:", err);
        setError("Unable to load societies");
      } finally {
        setLoading(false);
      }
    };

    loadSocieties();
  }, []);

  const handleContinue = async () => {
    if (!selectedSociety) return;

    try {
      // apiPost injects auth header, timeout, and 401 guard automatically.
      await apiPost("/customer/select-society", { society_id: selectedSociety });

      console.log("✅ API: Selected society saved:", selectedSociety);
      await AsyncStorage.setItem("selected_society_id", selectedSociety);

      router.push({
        pathname: "/tower",
        params: { societyId: selectedSociety },
      });
    } catch (err) {
      console.log("❌ Select society API error:", err);
      // Still proceed locally if API fails but we have the ID
      await AsyncStorage.setItem("selected_society_id", selectedSociety);
      router.push({
        pathname: "/tower",
        params: { societyId: selectedSociety },
      });
    }
  };

  // ⏳ LOADING STATE
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={theme.accent} />
        <Text style={styles.loadingText}>Finding nearby societies...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>Step 1 of 3</Text>
        <Text style={styles.title}>Which society do you live in?</Text>
        <Text style={styles.subtitle}>
          Nearby societies for:{"\n"}
          {address || "your location"}
        </Text>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {societies.length === 0 && !error ? (
        <View style={styles.center}>
          <Text style={styles.noDataText}>
            No societies found in this area
          </Text>
          <Pressable style={styles.retryButton} onPress={() => router.back()}>
            <Text style={styles.retryButtonText}>Try Different Location</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            style={styles.scrollView}
          >
            <View style={styles.grid}>
              {societies.map((society) => {
                const isSelected = selectedSociety === society.id;

                return (
                  <Pressable
                    key={society.id}
                    onPress={() => {
                      console.log("🏘️ Selected society:", society.name);
                      setSelectedSociety(society.id);
                    }}
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
                      numberOfLines={2}
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

          <View style={styles.footer}>
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
        </>
      )}
    </View>
  );
}