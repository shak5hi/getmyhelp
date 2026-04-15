import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import i18n from "../src/i18n";
import config from "../src/config";
import { apiFetch } from "../src/api";
import { phoneStyles as styles } from "../styles/phone.styles";

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
      setError("");

      const response = await apiFetch("/customer/login", {
        method: "POST",
        body: JSON.stringify({
          phone: phone,
        }),
      });

      console.log("📊 Response status:", response.status);
      console.log("✅ Response ok:", response.ok);

      const data = await response.json();
      console.log("📦 Response data:", JSON.stringify(data, null, 2));

      if (!response.ok) {
        // Handle different error response formats
        let errorMessage = "Unable to send OTP";
        
        if (data.detail) {
          // FastAPI validation error format
          if (Array.isArray(data.detail)) {
            errorMessage = data.detail[0]?.msg || errorMessage;
          } else if (typeof data.detail === 'string') {
            errorMessage = data.detail;
          }
        } else if (data.message) {
          errorMessage = data.message;
        }
        
        setError(errorMessage);
        return;
      }

      // ✅ OTP sent successfully
      console.log("✅ OTP sent successfully");
      router.push({
        pathname: "/otp",
        params: { phone: phone },
      });
    } catch (err: any) {
      console.error("❌ Fetch error:", err);
      console.error("Error name:", err.name);
      console.error("Error message:", err.message);
      
      // Provide more specific error messages
      if (err.message.includes("Network request failed")) {
        setError("Cannot reach server. Please check your internet connection.");
      } else if (err.message.includes("timeout")) {
        setError("Request timeout. Server is taking too long to respond.");
      } else if (err.message.includes("JSON")) {
        setError("Invalid response from server. Please try again.");
      } else {
        setError("Network error. Please try again.");
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