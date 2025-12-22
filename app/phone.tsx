import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import { phoneStyles as styles } from "../styles/phone.styles";
import { useRouter } from "expo-router";

export default function PhoneScreen() {
  const router = useRouter(); // ✅ CORRECT PLACE

  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handlePhoneChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    const trimmed = digitsOnly.slice(0, 10);
    setPhone(trimmed);

    if (trimmed.length === 10) {
      setError("");
    }
  };

  const isPhoneValid = phone.length === 10;

  const handleGetOtp = () => {
    if (!isPhoneValid) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    setError("");

    // ✅ NAVIGATE TO OTP SCREEN
    router.push("/otp");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Your Phone Number</Text>
      <Text style={styles.subtitle}>
        We’ll send you an OTP to continue.
      </Text>

      {/* ERROR ABOVE INPUT */}
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      <View
        style={[
          styles.inputContainer,
          error && styles.inputError,
        ]}
      >
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          placeholder="Enter phone number"
          keyboardType="number-pad"
          value={phone}
          onChangeText={handlePhoneChange}
          style={styles.input}
        />
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          !isPhoneValid && styles.buttonDisabled,
        ]}
        onPress={handleGetOtp}
      >
        <Text
          style={[
            styles.buttonText,
            !isPhoneValid && styles.buttonTextDisabled,
          ]}
        >
          Get OTP
        </Text>
      </TouchableOpacity>
    </View>
  );
}
