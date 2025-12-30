import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { otpStyles as styles } from "../styles/otp.styles";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import { useLocalSearchParams } from "expo-router";

export default function OtpScreen() {
  useLanguage(); // 🔥 forces re-render on language change

  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const [loading, setLoading] = useState(false);


  const handleOtpChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    const trimmed = digitsOnly.slice(0, 6);
    setOtp(trimmed);

    if (trimmed.length === 6) setError("");
  };

  const handleVerify = async () => {
  if (otp.length !== 6) {
    setError(i18n.t("otpError"));
    return;
  }

  try {
    setLoading(true);

    const response = await fetch("https://your-server.com/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        otp,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.message || "Invalid OTP");
      return;
    }

    // ✅ OTP verified successfully
    setError("");
    router.push("/location");
  } catch (err) {
    setError("Something went wrong. Try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t("otpTitle")}</Text>
      <Text style={styles.subtitle}>{i18n.t("otpSubtitle")}</Text>

      <Pressable
        style={styles.otpContainer}
        onPress={() => inputRef.current?.focus()}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            style={[
              styles.otpBox,
              otp[index] && styles.otpBoxFilled,
              error && styles.otpBoxError,
            ]}
          >
            <Text style={styles.otpText}>{otp[index] || ""}</Text>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={otp}
        onChangeText={handleOtpChange}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        style={styles.hiddenInput}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        disabled={otp.length !== 6 || loading}
        style={[
          styles.button,
          (otp.length !== 6 || loading) && styles.buttonDisabled,
        ]}
        onPress={handleVerify}
      >
        <Text
          style={[
            styles.buttonText,
            (otp.length !== 6 || loading) && styles.buttonTextDisabled,
          ]}
        >
          {loading ? "Verifying..." : i18n.t("verifyContinue")}
        </Text>
      </TouchableOpacity>


      <Text style={styles.resendText}>
        {i18n.t("didntReceive")}{" "}
        <Text style={styles.resendLink}>
          {i18n.t("resend")}
        </Text>
      </Text>
    </View>
  );
}
