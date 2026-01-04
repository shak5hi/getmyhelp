import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

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
  console.log("✅ SOCIETYDETECTED SCREEN LOADED");
  
  const router = useRouter();
  
  const [address, setAddress] = useState<string>("");
  const [societies, setSocieties] = useState<Society[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSociety, setSelectedSociety] = useState<string | null>(null);
  const [error, setError] = useState("");

  // 🔥 LOAD SOCIETIES FROM STORAGE
  useEffect(() => {
    const loadSocieties = async () => {
      try {
        console.log("🔄 Loading societies from storage...");
        
        // Get address from AsyncStorage
        const storedAddress = await AsyncStorage.getItem("user_address");
        if (storedAddress) {
          setAddress(storedAddress);
          console.log("📍 Retrieved address:", storedAddress);
        }
        
        // Get societies from AsyncStorage
        const societiesJson = await AsyncStorage.getItem("societies_data");
        
        if (!societiesJson) {
          setError("No societies data found. Please try again.");
          console.log("❌ No societies data in storage");
          setLoading(false);
          return;
        }

        const societiesData = JSON.parse(societiesJson);
        console.log("✅ Societies loaded:", societiesData.length, "societies");
        
        if (societiesData.length === 0) {
          setError("No societies found in your area");
        }
        
        setSocieties(societiesData);
      } catch (err: any) {
        console.log("❌ Load societies error:", err);
        setError(err.message || "Unable to load societies");
      } finally {
        setLoading(false);
      }
    };

    loadSocieties();
  }, []);

  const handleContinue = async () => {
    if (!selectedSociety) return;

    console.log("✅ Selected society:", selectedSociety);

    // Save selected society to storage for later use
    await AsyncStorage.setItem("selected_society_id", selectedSociety);

    router.push({
      pathname: "/tower",
      params: { societyId: selectedSociety },
    });
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