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
  const [loading, setLoading] = useState(false);

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    setPhone(digitsOnly);

    if (error) setError("");
  };

  const handleGetOtp = async () => {
    if (phone.length !== 10) {
      setError(i18n.t("phoneError"));
      return;
    }

    try {
      setLoading(true);

      await fetch("https://your-server.com/auth/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: "+91" + phone,
        }),
      });

      // ✅ navigate to otp.tsx
      router.push({
        pathname: "/otp",
        params: {
          phone: "+91" + phone,
        },
      });
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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

      {error ? (
        <Text style={{ color: "red", marginTop: 8, fontSize: 13 }}>
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        disabled={loading || phone.length !== 10}
        style={[
          styles.button,
          (phone.length !== 10 || loading) && styles.buttonDisabled,
        ]}
        onPress={handleGetOtp}
      >
        <Text style={styles.buttonText}>
          {loading ? "Please wait..." : i18n.t("getOtp")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
