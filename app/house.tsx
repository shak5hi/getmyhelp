import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { houseStyles as styles } from "../styles/house.styles";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";

export default function HouseScreen() {
  useLanguage();
  const router = useRouter();

  const [houseNumber, setHouseNumber] = useState("");
  const [error, setError] = useState("");

  const isValid = houseNumber.trim().length > 0;

  const handleContinue = () => {
    if (!isValid) {
      setError(i18n.t("houseError"));
      return;
    }

    setError("");
    router.replace("/subscription");
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
          !isValid && styles.buttonDisabled,
        ]}
        disabled={!isValid}
        onPress={handleContinue}
      >
        <Text
          style={[
            styles.buttonText,
            !isValid && styles.buttonTextDisabled,
          ]}
        >
          {i18n.t("continue")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
