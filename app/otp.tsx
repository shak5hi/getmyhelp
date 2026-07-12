import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAuth, signInWithPhoneNumber } from "@react-native-firebase/auth";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Alert, Pressable, TouchableOpacity, View, KeyboardAvoidingView, Platform } from "react-native";
import { Text, TextInput } from "../components/ui/Text"
import type { TextInputHandle } from "../components/ui/Text";
import config from "../src/config";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";
import { useRefreshFeatures } from "../src/FeatureContext";
import { registerForPush } from "../src/push";
import { getConfirmation, setConfirmation } from "../src/firebaseConfirmation";

import { makeOtpStyles } from "../styles/otp.styles";
import { useTheme } from "../src/ThemeContext";
import { setToken } from "../src/api/tokenStore";
import { apiGet } from "../src/api/client";

export default function OtpScreen() {
  useLanguage();

  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeOtpStyles(theme), [theme]);
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const inputRef = useRef<TextInputHandle>(null);
  const refreshFeatures = useRefreshFeatures();

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

      let user = getAuth().currentUser;
      const targetPhone = phone.startsWith("+91") ? phone : `+91${phone}`;

      // If Android auto-retrieved the SMS, the user might already be authenticated in the background.
      if (!user || user.phoneNumber !== targetPhone) {
        try {
          const credential = await confirmation.confirm(otp);
          user = credential.user;
        } catch (confirmErr: any) {
          // Check one more time if auto-verify finished exactly as we clicked verify
          user = getAuth().currentUser;
          if (!user || user.phoneNumber !== targetPhone) {
            throw confirmErr;
          }
        }
      }

      if (!user) {
        throw new Error("Authentication failed. Please try again.");
      }

      const idToken = await user.getIdToken();

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
      } catch (e) {
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
        return;
      }

      // ✅ STORE TOKEN
      await setToken(accessToken);

      // Store customer data (include phone for fallback)
      const userToSave = { ...(customer || {}), phone };
      await AsyncStorage.setItem("user", JSON.stringify(userToSave));


      // Register this device for OS-level push now that we have a session.
      // Fail-safe: never blocks login.
      registerForPush();

      // Resolve this society's enabled modules before we navigate, so the tab
      // bar and dashboard render against the real permission set on first paint
      // rather than an empty map. Awaited but never fatal — a failure here just
      // leaves the provider optimistic until the dashboard retries.
      await refreshFeatures().catch(() => {});



      // ── Decide whether to skip onboarding ──
      // The login response now includes society_id, tower_id, flat_number
      // when the phone was pre-registered by admin as a resident.
      // No second API call needed.

      const societyId  = customer?.society_id  ?? customer?.societyId;
      const towerId    = customer?.tower_id     ?? customer?.towerId;
      const flatNumber = customer?.flat_number  ?? customer?.flatNumber;

      if (societyId && flatNumber) {
        // Pre-registered resident — all details already on the account
        await AsyncStorage.setItem("selected_society_id", String(societyId));
        if (towerId) {
          await AsyncStorage.setItem("selected_tower_id", String(towerId));
        }
        await AsyncStorage.setItem("flat_number", String(flatNumber));
        cleanupOtpState();
        router.replace("/(tabs)/dashboard");
        return;
      }

      // Fallback: profile API for accounts created before this change.
      // setToken was already called above, so apiGet picks up the new token automatically.
      try {
        const profileJson = await apiGet("/customer/profile");
        const p = profileJson?.data || profileJson;

        const pSociety = p?.society_id ?? p?.societyId;
        const pFlat    = p?.flat_number ?? p?.flatNumber;

        if (pSociety && pFlat) {
          await AsyncStorage.setItem("selected_society_id", String(pSociety));
          if (p?.tower_id ?? p?.towerId) {
            await AsyncStorage.setItem("selected_tower_id", String(p.tower_id ?? p.towerId));
          }
          await AsyncStorage.setItem("flat_number", String(pFlat));
          cleanupOtpState();
          router.replace("/(tabs)/dashboard");
          return;
        }
      } catch (profileErr) {
      }

      // New unknown user — send to location/onboarding
      cleanupOtpState();
      router.replace("/location");
    } catch (err: any) {
      const code: string = err?.code || "";
      let msg = "Something went wrong. Please try again.";
      if (code.includes("invalid-verification-code")) {
        msg = "Incorrect OTP. Please check the code and try again.";
      } else if (code.includes("session-expired") || code.includes("code-expired")) {
        msg = `This OTP has expired (Raw: ${err?.message || code}). Tap Resend.`;
      } else if (code.includes("network-request-failed")) {
        msg = "Can't reach the verification server. Check your internet and try again.";
      } else if (code.includes("too-many-requests")) {
        msg = "Too many attempts. Please wait a while and try again.";
      } else if (code.includes("missing-client-identifier") || code.includes("app-not-authorized")) {
        msg = "App verification failed (Firebase SHA / config). Contact support.";
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND OTP
  const handleResend = async () => {
    try {
      setLoading(true);
      setError("");


      const confirmation = await signInWithPhoneNumber(getAuth(), phone);
      setConfirmation(confirmation);

      setOtp("");
      setTimer(40);
      setResendActive(true);
      Alert.alert("Success", "New OTP has been sent!");
    } catch (err: any) {
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
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
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
    </KeyboardAvoidingView>
  );
}
