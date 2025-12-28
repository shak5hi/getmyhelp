import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { phoneStyles as styles } from "../styles/phone.styles";
import { useRouter } from "expo-router";
import i18n from "../src/i18n";

export default function PhoneScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handlePhoneChange = (text: string) => {
    // allow only numbers
    const digitsOnly = text.replace(/[^0-9]/g, "");
    setPhone(digitsOnly);

    // clear error while typing
    if (error) setError("");
  };

  const handleGetOtp = () => {
    if (phone.length !== 10) {
      setError(i18n.t("phoneError"));
      return;
    }

    router.push("/otp");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t("phoneTitle")}</Text>
      <Text style={styles.subtitle}>{i18n.t("phoneSubtitle")}</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          placeholder={i18n.t("phonePlaceholder")}
          keyboardType="number-pad"
          value={phone}
          onChangeText={handlePhoneChange}
          maxLength={10}
          style={styles.input}
        />
      </View>

      {/* 🔴 ERROR MESSAGE */}
      {error ? (
        <Text style={{ color: "red", marginTop: 8, fontSize: 13 }}>
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        style={[
          styles.button,
          phone.length !== 10 && styles.buttonDisabled,
        ]}
        onPress={handleGetOtp}
      >
        <Text style={styles.buttonText}>
          {i18n.t("getOtp")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
