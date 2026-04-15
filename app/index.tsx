/* PRODUCTION ARCHITECTURE UPGRADE — startup auth guard added */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Image, Modal, Pressable, Text, View, ActivityIndicator } from "react-native";
import { useEffect, useState } from "react";
import i18n from "../src/i18n";
import PrimaryButton from "../components/PrimaryButton";
import { homeStyles as styles } from "../styles/home.styles";
import config from "../src/config";
import { apiFetch } from "../src/api";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

export default function IndexScreen() {
  const router = useRouter();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  /* PRODUCTION ARCHITECTURE UPGRADE */
  const [checking, setChecking] = useState(true);
  /* END PRODUCTION ARCHITECTURE UPGRADE */

  useEffect(() => {
    /* PRODUCTION ARCHITECTURE UPGRADE — startup auth guard */
    const checkAuthAndRoute = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");

        if (!token) {
          // No token — show welcome screen, check language preference
          const lang = await AsyncStorage.getItem("LANGUAGE");
          if (!lang) setShowLanguageModal(true);
          setChecking(false);
          return;
        }

        const res = await apiFetch("/customer/profile");

        if (!res.ok) {
          // Token invalid / expired — clear and show welcome
          setChecking(false);
          return;
        }

        const json = await res.json();
        const customer = json?.data;

        if (customer?.is_active === true) {
          router.replace("/(tabs)/home");
        } else {
          // Incomplete profile — resume onboarding
          router.replace("/location");
        }
      } catch {
        // Network error — fallback to welcome screen
        const lang = await AsyncStorage.getItem("LANGUAGE");
        if (!lang) setShowLanguageModal(true);
        setChecking(false);
      }
    };

    checkAuthAndRoute();
    /* END PRODUCTION ARCHITECTURE UPGRADE */
  }, []);

  const selectLanguage = async (code: string) => {
    i18n.locale = code;
    await AsyncStorage.setItem("LANGUAGE", code);
    setShowLanguageModal(false);
  };

  /* PRODUCTION ARCHITECTURE UPGRADE — show spinner while checking token */
  if (checking) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }
  /* END PRODUCTION ARCHITECTURE UPGRADE */

  return (
    <View style={styles.container}>

      {/* 🌐 CHANGE LANGUAGE BUTTON */}
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
/* END PRODUCTION ARCHITECTURE UPGRADE */
