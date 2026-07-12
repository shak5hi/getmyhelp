import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Image, View, Pressable, Modal, ActivityIndicator } from "react-native";
import { Text } from "../components/ui/Text";
import { useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../src/i18n";
import PrimaryButton from "../components/PrimaryButton";
import { makeHomeStyles, splash } from "../styles/home.styles";
import { useTheme } from "../src/ThemeContext";
import { useRouter } from "expo-router";
import { getToken } from "../src/api/tokenStore";
import { apiGet } from "../src/api/client";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeHomeStyles(theme), [theme]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [sessionChecking, setSessionChecking] = useState(true);

  // 🔹 Check for existing session and onboarding status
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Language Check
      const lang = await AsyncStorage.getItem("LANGUAGE");
      if (!lang) {
        setShowLanguageModal(true);
      }

      // 2. Session Check
      const token = await getToken();
      if (token) {
        try {
          // apiGet injects auth header, applies 20s timeout, and handles 401 session expiry.
          const profileResponse = await apiGet("/customer/profile");
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
            return;
          }
        } catch (e) {
          console.warn("Session check failed", e);
        }
      }
      // Only reached when we are NOT redirecting — the redirect paths above
      // return early, so the landing page never flashes behind a replace().
      setSessionChecking(false);
    };
    checkAuth();
  }, []);

  const selectLanguage = async (code: string) => {
    i18n.locale = code;
    await AsyncStorage.setItem("LANGUAGE", code);
    setShowLanguageModal(false);
  };

  if (sessionChecking) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* The splash's violet field — this screen is the frame after the video,
          so it carries the same gradient rather than the app theme. */}
      <LinearGradient
        colors={[...splash.gradient]}
        locations={[0, 0.45, 1]}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={styles.field}
      />
      {/* The splash's top-right light source. */}
      <LinearGradient
        colors={[...splash.bloom]}
        start={{ x: 0.8, y: 0 }}
        end={{ x: 0.1, y: 1 }}
        style={styles.bloom}
        pointerEvents="none"
      />

      <View style={styles.content}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <View style={styles.brandRow}>
            <Image
              source={require("../assets/images/icon.png")}
              style={styles.brandLogo}
            />
            <Text style={styles.brandWord}>{i18n.t("appName")}</Text>
          </View>

          <Pressable onPress={() => setShowLanguageModal(true)} style={styles.langPill}>
            <Ionicons name="globe-outline" size={13} color={splash.ink} />
            <Text style={styles.langPillText}>
              {i18n.locale?.startsWith("hi") ? "हिंदी" : "English"}
            </Text>
          </Pressable>
        </View>

        <Modal visible={showLanguageModal} transparent animationType="fade">
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Choose Language</Text>
              {LANGUAGES.map((lang) => (
                <Pressable
                  key={lang.code}
                  onPress={() => selectLanguage(lang.code)}
                  style={styles.modalOption}
                >
                  <Text style={styles.modalOptionText}>{lang.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Modal>

        {/* HEADLINE */}
        <View style={styles.headline}>
          <Text style={styles.headlineLine}>{i18n.t("heroLine1")}</Text>
          <Text style={styles.headlineAccent}>{i18n.t("heroLine2")}</Text>
        </View>

        {/* THE MOMENT — the maid module: attendance marked, month totalled. */}
        <View style={styles.frame}>
          <View style={styles.bubbleRow}>
            <View style={styles.bubble}>
              <Text style={styles.bubbleText}>{i18n.t("heroCardBubble")}</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>S</Text>
            </View>
          </View>

          <View style={styles.dashed} />

          <Text style={styles.result}>
            <Text style={styles.resGreat}>{i18n.t("heroCardGreat")}</Text>{" "}
            <Text style={styles.resWarm}>{i18n.t("heroCardTotal")}</Text>{" "}
            {i18n.t("heroCardMid")}{" "}
            <Ionicons name="calendar" size={15} color={splash.lilac} />{" "}
            <Text style={styles.resPurple}>{i18n.t("heroCardMonth")}</Text>{" "}
            <Text style={styles.resValue}>{i18n.t("heroCardValue")}</Text>
          </Text>

          <View style={styles.chip}>
            <Ionicons name="checkmark" size={20} color="#5B21D6" />
          </View>
        </View>



        {/* FOOTER — on the panel, so type flips to violet ink. */}
        <View style={styles.footer}>
          <Text style={styles.tagline}>
            {i18n.t("heroTaglineA")}{"\n"}{i18n.t("heroTaglineB")}
          </Text>

          <PrimaryButton
            title={i18n.t("getStarted")}
            onPress={() => router.push("/phone")}
            style={styles.cta}
          />

          <Text style={styles.terms}>
            {i18n.t("termsNote")}{" "}
            <Text style={styles.termsLink}>{i18n.t("terms")}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
