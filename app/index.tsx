import { Image, Text, View, Pressable, Modal } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../src/i18n";
import config from "../src/config";
import PrimaryButton from "../components/PrimaryButton";
import { homeStyles as styles } from "../styles/home.styles";
import { useRouter } from "expo-router";

const APP_CONFIG = config;


const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // 🔹 Check for existing session and onboarding status
  useEffect(() => {
    const checkAuth = async () => {
      console.log("🔍 [index] Checking Auth...");
      // 1. Language Check
      const lang = await AsyncStorage.getItem("LANGUAGE");
      if (!lang) {
        setShowLanguageModal(true);
      }

      // 2. Session Check
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        console.log("🎫 [index] Token found, fetching profile...");
        try {
          const res = await fetch(`${APP_CONFIG.apiUrl}/customer/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const profileResponse = await res.json();
            const profile = profileResponse?.data || profileResponse;
            console.log("👤 [index] Profile data:", JSON.stringify(profile));
            
            const hasSociety = profile?.society_id || profile?.societyId;
            const hasTower = profile?.tower_id || profile?.towerId || profile?.flat_number || profile?.flatNumber;

            if (profile && hasSociety && hasTower) {
              console.log("🚀 [index] Onboarded user, redirecting to dashboard");

              // Pre-populate storage
              await AsyncStorage.setItem("selected_society_id", String(hasSociety));
              if (profile.tower_id || profile.towerId) await AsyncStorage.setItem("selected_tower_id", String(profile.tower_id || profile.towerId));
              if (profile.flat_number || profile.flatNumber) await AsyncStorage.setItem("flat_number", String(profile.flat_number || profile.flatNumber));
              if (profile.user_role) await AsyncStorage.setItem("user_role", String(profile.user_role));

              const userRole = profile.user_role ?? await AsyncStorage.getItem("user_role");
              if (userRole === "guard") {
                router.replace("/(guard-tabs)/visitor-list");
              } else {
                router.replace("/(tabs)/dashboard");
              }
            } else {
              console.log("🧭 [index] New user/Not onboarded, staying at index/location");
            }
          } else {
            console.log("❌ [index] Profile fetch failed with status:", res.status);
          }
        } catch (e) {
          console.log("❌ [index] Auth auto-login error:", e);
        }
      }
    };
    checkAuth();
  }, []);

  const selectLanguage = async (code: string) => {
    i18n.locale = code;
    await AsyncStorage.setItem("LANGUAGE", code);
    setShowLanguageModal(false);
  };

  return (
    <View style={styles.container}>

      {/* 🌐 CHANGE LANGUAGE BUTTON (NEW) */}
      <Pressable
        onPress={() => setShowLanguageModal(true)}
        style={{
          position: "absolute",
          top: 50,
          right: 20,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 14, color: "#2E3A46" }}>
          🌐 Language
        </Text>
      </Pressable>

      {/* 🌐 LANGUAGE MODAL */}
      <Modal visible={showLanguageModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                marginBottom: 12,
              }}
            >
              Choose Language
            </Text>

            {LANGUAGES.map((lang) => (
              <Pressable
                key={lang.code}
                onPress={() => selectLanguage(lang.code)}
                style={{ paddingVertical: 12 }}
              >
                <Text style={{ fontSize: 16 }}>
                  {lang.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>

      {/* MAIN CONTENT */}
      <View style={styles.textBlock}>
        <Text style={styles.title}>{i18n.t("appName")}</Text>
        <Text style={styles.subtitle}>{i18n.t("tagline")}</Text>
      </View>

      <Image
        source={require("../assets/home.png")}
        style={styles.image}
      />

      <View style={styles.buttonBlock}>
        <PrimaryButton
          title={i18n.t("getStarted")}
          onPress={() => router.push("/phone")}
        />
      </View>
    </View>
  );
}
