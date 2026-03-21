import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import config from "../src/config";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import { otpStyles as styles } from "../styles/otp.styles";

export default function OtpScreen() {
  useLanguage();

  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [resendActive, setResendActive] = useState(true);
  const [timer, setTimer] = useState(40);

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

  // ✅ VERIFY OTP + SAVE ACCESS TOKEN
  const handleVerify = async () => {
    console.log("INSIDE handleVerify🔍 VERIFYING OTP:", otp, "FOR PHONE:", phone);
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

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
        console.log("🔍 FULL VERIFY OTP RESPONSE:", data);
      } catch (e) {
        console.log("⚠️ Response is not JSON. Raw text start:", text.substring(0, 100));
        data = { message: "Server error: The backend API returned HTML instead of JSON. Ensure the server at " + config.apiUrl + " is running and accessible." };
      }

      if (!response.ok) {
        setError(data.message || "Invalid or expired OTP");
        return;
      }

      // ✅ CORRECT TOKEN PATH
      const accessToken = data?.data?.access_token;
      const customer = data?.data?.customer;

      if (!accessToken) {
        setError("Login failed: No access token received");
        console.log("❌ No access token in response:", data);
        return;
      }

      // ✅ STORE TOKEN
      await AsyncStorage.setItem("access_token", accessToken);

      // (optional) store customer data
      if (customer) {
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(customer)
        );
      }

      console.log("🔐 ACCESS TOKEN SAVED:", accessToken);

      // ✅ VERIFIED → MOVE TO LOCATION
      cleanupOtpState();
      router.replace("/location");
    } catch (err) {
      console.log("❌ OTP VERIFY ERROR:", err);
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
