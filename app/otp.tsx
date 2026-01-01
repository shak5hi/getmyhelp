import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
} from "react-native";
import { useState, useRef, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { otpStyles as styles } from "../styles/otp.styles";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import config from "../src/config";

export default function OtpScreen() {
  useLanguage();

  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 🔁 Resend + timer
  const [resendActive, setResendActive] = useState(true);
  const [timer, setTimer] = useState(40);

  // ⏱️ Timer logic
  useEffect(() => {
    if (!resendActive) return;

    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setResendActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendActive]);

  const cleanupOtpState = () => {
    setOtp("");
    setError("");
    setResendActive(false);
    setTimer(0);
  };

  const handleOtpChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    setOtp(digitsOnly.slice(0, 6));
    if (error) setError("");
  };

  // ✅ VERIFY OTP (BACKEND)
  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError(i18n.t("otpError"));
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${config.apiUrl}/customer/verify-otp`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone,
            otp,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid or expired OTP");
        return;
      }

      // ✅ VERIFIED
      cleanupOtpState();
      router.replace("/location");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND OTP
  const handleResend = async () => {
    try {
      setLoading(true);
      setError("");

      await fetch(`${config.apiUrl}/customer/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone }),
      });

      setOtp("");
      setResendActive(true);
      setTimer(40);
    } catch (err) {
      setError("Failed to resend OTP");
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

      {/* 🔁 RESEND */}
      <Text style={styles.resendText}>
        {i18n.t("didntReceive")}{" "}
        {resendActive ? (
          <Text style={[styles.resendLink, { opacity: 0.6 }]}>
            Resend in {timer}s
          </Text>
        ) : (
          <Text style={styles.resendLink} onPress={handleResend}>
            {i18n.t("resend")}
          </Text>
        )}
      </Text>
    </View>
  );
}
