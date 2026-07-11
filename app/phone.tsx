import { getAuth, signInWithPhoneNumber } from "@react-native-firebase/auth";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import i18n from "../src/i18n";
import { DISABLE_APP_VERIFICATION } from "../src/config";
import { setConfirmation } from "../src/firebaseConfirmation";
import { makePhoneStyles } from "../styles/phone.styles";
import { useTheme } from "../src/ThemeContext";

export default function PhoneScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makePhoneStyles(theme), [theme]);

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
      setError("");

      const phoneWithCode = `+91${phone}`;

      // Dev/test builds: bypass reCAPTCHA/Play Integrity so Firebase test
      // numbers work on locally-signed APKs (SHA not registered in Firebase).
      if (DISABLE_APP_VERIFICATION) {
        getAuth().settings.appVerificationDisabledForTesting = true;
      }

      const confirmation = await signInWithPhoneNumber(getAuth(), phoneWithCode);
      setConfirmation(confirmation);

      router.push({
        pathname: "/otp",
        params: { phone: phoneWithCode },
      });
    } catch (err: any) {
      console.error("❌ Firebase OTP error:", err);
      if (err.code === "auth/invalid-phone-number") {
        setError("Invalid phone number. Please check and try again.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Failed to send OTP. Please try again.");
      }
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
          placeholderTextColor={theme.textTertiary}
        />
      </View>

      {error ? (
        <Text style={[styles.errorText, { marginTop: 8, fontSize: 13 }]}>
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
