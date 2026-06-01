import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, signInWithPhoneNumber } from "@react-native-firebase/auth";
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
import { getConfirmation, setConfirmation } from "../src/firebaseConfirmation";
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

      // 1. Verify OTP with Firebase
      const confirmation = getConfirmation();
      if (!confirmation) {
        setError("Session expired. Please go back and request a new OTP.");
        return;
      }

      const credential = await confirmation.confirm(otp);
      const idToken = await credential.user.getIdToken();
      console.log("✅ Firebase OTP verified");

      // 2. Exchange Firebase ID token for app access_token
      const response = await fetch(`${config.apiUrl}/customer/firebase-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firebase_id_token: idToken,
          phone: phone.replace(/\D/g, "").slice(-10),
        }),
      });

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
        console.log("🔍 FULL FIREBASE VERIFY RESPONSE:", data);
      } catch (e) {
        console.log("⚠️ Response is not JSON. Raw text start:", text.substring(0, 100));
        data = { message: "Server error: backend returned HTML instead of JSON." };
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

      const accessToken = data?.data?.access_token;
      const customer = data?.data?.customer;

      if (!accessToken) {
        setError("Login failed: No access token received");
        console.log("❌ No access token in response:", data);
        return;
      }

      // ✅ STORE TOKEN
      await AsyncStorage.setItem("access_token", accessToken);

      // Store customer data (include phone for fallback)
      const userToSave = { ...(customer || {}), phone };
      await AsyncStorage.setItem("user", JSON.stringify(userToSave));

      // Save user_role for guard routing
      if (customer?.user_role) {
        await AsyncStorage.setItem("user_role", customer.user_role);
      }

      console.log("🔐 ACCESS TOKEN SAVED:", accessToken);

      // ── Guard: skip onboarding entirely ──
      if (customer?.user_role === "guard") {
        console.log("✅ [otp] Guard login — routing to guard tabs");
        cleanupOtpState();
        router.replace("/(guard-tabs)/visitor-list");
        return;
      }

      // ── Decide whether to skip onboarding ──
      // The login response now includes society_id, tower_id, flat_number
      // when the phone was pre-registered by admin as a resident.
      // No second API call needed.

      const societyId  = customer?.society_id  ?? customer?.societyId;
      const towerId    = customer?.tower_id     ?? customer?.towerId;
      const flatNumber = customer?.flat_number  ?? customer?.flatNumber;

      if (societyId && flatNumber) {
        // Pre-registered resident — all details already on the account
        console.log("✅ [otp] Pre-registered resident — skipping onboarding");
        await AsyncStorage.setItem("selected_society_id", String(societyId));
        if (towerId) {
          await AsyncStorage.setItem("selected_tower_id", String(towerId));
        }
        await AsyncStorage.setItem("flat_number", String(flatNumber));
        cleanupOtpState();
        router.replace("/(tabs)/dashboard");
        return;
      }

      // Fallback: profile API for accounts created before this change
      try {
        const profileRes = await fetch(`${config.apiUrl}/customer/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const profileJson = await profileRes.json();
        const p = profileJson?.data || profileJson;

        const pSociety = p?.society_id ?? p?.societyId;
        const pFlat    = p?.flat_number ?? p?.flatNumber;

        if (pSociety && pFlat) {
          console.log("✅ [otp] Returning user detected via Profile API");
          await AsyncStorage.setItem("selected_society_id", String(pSociety));
          if (p?.tower_id ?? p?.towerId) {
            await AsyncStorage.setItem("selected_tower_id", String(p.tower_id ?? p.towerId));
          }
          await AsyncStorage.setItem("flat_number", String(pFlat));
          cleanupOtpState();
          const role = p?.user_role ?? await AsyncStorage.getItem("user_role");
          if (role === "guard") {
            router.replace("/(guard-tabs)/visitor-list");
          } else {
            router.replace("/(tabs)/dashboard");
          }
          return;
        }
      } catch (profileErr) {
        console.log("⚠️ [otp] Profile check failed:", profileErr);
      }

      // New unknown user — send to location/onboarding
      console.log("🚀 [otp] New user — navigating to /location");
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

      console.log("🔄 Resending Firebase OTP to:", phone);

      const confirmation = await signInWithPhoneNumber(getAuth(), phone);
      setConfirmation(confirmation);

      setOtp("");
      setTimer(40);
      setResendActive(true);
      Alert.alert("Success", "New OTP has been sent!");
    } catch (err: any) {
      console.log("❌ Resend error:", err);
      if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Failed to resend OTP. Please try again.");
      }
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
