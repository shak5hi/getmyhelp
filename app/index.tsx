import { Image, Text, View, Pressable, Modal } from "react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../src/i18n";
import PrimaryButton from "../components/PrimaryButton";
import { homeStyles as styles } from "../styles/home.styles";
import { useRouter } from "expo-router";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
  { code: "mr", label: "मराठी" },
  { code: "ta", label: "தமிழ்" },
];

export default function HomeScreen() {
  const router = useRouter();
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // 🔹 Show modal only first time
  useEffect(() => {
    const checkLanguage = async () => {
      const lang = await AsyncStorage.getItem("LANGUAGE");
      if (!lang) {
        setShowLanguageModal(true);
      }
    };
    checkLanguage();
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
