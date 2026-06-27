import { Image, Text, View, Pressable, Modal } from "react-native";
import { fonts } from "../constants/tokens";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../src/i18n";
import config from "../src/config";
import PrimaryButton from "../components/PrimaryButton";
import { makeHomeStyles } from "../styles/home.styles";
import { useTheme } from "../src/ThemeContext";
import { useRouter } from "expo-router";

const APP_CONFIG = config;


const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeHomeStyles(theme), [theme]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // 🔹 Check for existing session and onboarding status
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Language Check
      const lang = await AsyncStorage.getItem("LANGUAGE");
      if (!lang) {
        setShowLanguageModal(true);
      }

      // 2. Session Check
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        try {
          const res = await fetch(`${APP_CONFIG.apiUrl}/customer/profile`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const profileResponse = await res.json();
            const profile = profileResponse?.data || profileResponse;
            
            const hasSociety = profile?.society_id || profile?.societyId;
            const hasTower = profile?.tower_id || profile?.towerId || profile?.flat_number || profile?.flatNumber;

            if (profile && hasSociety && hasTower) {

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
            }
          } else {
          }
        } catch (e) {
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
        <Text style={{ fontSize: 14, color: theme.text }}>
          🌐 Language
        </Text>
      </Pressable>

      {/* 🌐 LANGUAGE MODAL */}
      <Modal visible={showLanguageModal} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: theme.overlay,
            justifyContent: "center",
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontFamily: fonts.semibold,
                marginBottom: 12,
                color: theme.text,
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
                <Text style={{ fontSize: 16, color: theme.text }}>
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
