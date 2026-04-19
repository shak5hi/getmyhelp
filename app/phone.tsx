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

      const apiUrl = `${config.apiUrl}/customer/login`;
      console.log("🔄 Sending OTP request to:", apiUrl);
      console.log("📱 Phone number:", "+91" + phone);

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone, // Use 10 digits to match verification steps
        }),
      });

      console.log("📊 Response status:", response.status);
      console.log("✅ Response ok:", response.ok);

      const text = await response.text();
      let data;
      try {
        data = text ? JSON.parse(text) : {};
        console.log("📦 Response data:", JSON.stringify(data, null, 2));
      } catch (e) {
        console.log("⚠️ Response is not JSON. Raw text start:", text.substring(0, 100));
        data = { message: "Server error: The backend API returned HTML instead of JSON. Ensure the server at " + config.apiUrl + " is running and accessible." };
      }

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
        params: { phone: "+91" + phone },
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