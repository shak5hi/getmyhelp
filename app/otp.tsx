import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
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
            phone: phone.replace(/^\+91/, "").replace("+", ""),
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
        let errorMessage = "Invalid or expired OTP";
        
        if (data?.detail) {
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail[0]?.msg || errorMessage;
          } else if (typeof data.detail === "string") {
            errorMessage = data.detail;
          }
        } else if (data?.message) {
          errorMessage = data.message;
        }

        setError(errorMessage);
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
        // Ensure phone is included for profile fallback
        const userToSave = { ...customer, phone: phone };
        await AsyncStorage.setItem(
          "user",
          JSON.stringify(userToSave)
        );
      } else {
        // Even if no customer object, save the phone for fallback
        await AsyncStorage.setItem("user", JSON.stringify({ phone }));
      }

      console.log("🔐 ACCESS TOKEN SAVED:", accessToken);

      // ✅ CHECK IF ONBOARDING SHOULD BE SKIPPED
      try {
        console.log("🔍 [otp] Checking onboarding status...");
        
        // 1. First check if the login response itself has the info
        const hasSocInLogin = customer?.society_id || customer?.societyId;
        const hasTowerInLogin = customer?.tower_id || customer?.towerId || customer?.flat_number || customer?.flatNumber;

        if (hasSocInLogin && hasTowerInLogin) {
          console.log("✅ [otp] Info found in login response!");
          await AsyncStorage.setItem("selected_society_id", String(hasSocInLogin));
          if (customer?.tower_id || customer?.towerId) {
             await AsyncStorage.setItem("selected_tower_id", String(customer?.tower_id || customer?.towerId));
          }
          if (customer?.flat_number || customer?.flatNumber) {
             await AsyncStorage.setItem("flat_number", String(customer?.flat_number || customer?.flatNumber));
          }
          cleanupOtpState();
          router.replace("/(tabs)/dashboard");
          return;
        }

        // 2. Fallback to Profile API
        console.log("🔍 [otp] Checking via profile API...");
        const profileRes = await fetch(`${config.apiUrl}/customer/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        const profileResponse = await profileRes.json();
        
        // Handle if response is wrapped in { data: ... }
        const profileData = profileResponse?.data || profileResponse;
        console.log("👤 [otp] Profile data:", JSON.stringify(profileData));
        
        const hasSociety = profileData?.society_id || profileData?.societyId;
        const hasTower = profileData?.tower_id || profileData?.towerId || profileData?.flat_number || profileData?.flatNumber;

        if (profileData && hasSociety && hasTower) {
          console.log("✅ [otp] Returning user detected via Profile API");
          
          await AsyncStorage.setItem("selected_society_id", String(hasSociety));
          if (profileData.tower_id || profileData.towerId) {
             await AsyncStorage.setItem("selected_tower_id", String(profileData.tower_id || profileData.towerId));
          }
          if (profileData.flat_number || profileData.flatNumber) {
             await AsyncStorage.setItem("flat_number", String(profileData.flat_number || profileData.flatNumber));
          }
          
          cleanupOtpState();
          router.replace("/(tabs)/dashboard");
          return;
        } else {
          console.log("🧭 [otp] Incomplete profile (missing society/tower/flat)");
        }
      } catch (profileErr) {
        console.log("⚠️ [otp] Could not determine onboarding status:", profileErr);
      }

      // ✅ VERIFIED BUT NEW → MOVE TO LOCATION
      console.log("🚀 [otp] Navigating to /location");
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

      const cleanPhone = phone.replace(/^\+91/, "").replace("+", "");
      console.log("🔄 Resending OTP to:", cleanPhone);

      const response = await fetch(`${config.apiUrl}/customer/resend-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend OTP");
      }

      setOtp("");
      setTimer(40);
      setResendActive(true);
      Alert.alert("Success", "New OTP has been sent!");
    } catch (err) {
      console.log("❌ Resend error:", err);
      setError("Failed to resend OTP. Please try again.");
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
