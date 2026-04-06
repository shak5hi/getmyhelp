import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import config from "../src/config";
import styles from "../styles/societyDetectedStyles";

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
        const token = await AsyncStorage.getItem("access_token");
        const response = await fetch(`${config.apiUrl}/customer/societies`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const result = await response.json();
          const societiesData = Array.isArray(result) ? result : (result?.societies || result?.data?.societies || []);
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
      const token = await AsyncStorage.getItem("access_token");
      
      // Call backend to save selection
      await fetch(`${config.apiUrl}/customer/select-society`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ society_id: selectedSociety }),
      });

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
        <ActivityIndicator size="large" color="#1E293B" />
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