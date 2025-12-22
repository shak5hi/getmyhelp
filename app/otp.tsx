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

export default function OtpScreen() {
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");

  const handleOtpChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, "");
    const trimmed = digitsOnly.slice(0, 6);
    setOtp(trimmed);

    if (trimmed.length === 6) {
      setError("");
    }
  };

  const isOtpValid = otp.length === 6;

  const handleVerify = () => {
    if (!isOtpValid) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    setError("");

    // TEMP: go to location screen
    router.push("/location");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>
        We've sent a 6-digit code to your phone.
      </Text>

      {/* OTP BOXES */}
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
            <Text style={styles.otpText}>
              {otp[index] || ""}
            </Text>
          </View>
        ))}
      </Pressable>

      {/* Hidden Input */}
      <TextInput
        ref={inputRef}
        value={otp}
        onChangeText={handleOtpChange}
        keyboardType="number-pad"
        maxLength={6}
        autoFocus
        style={styles.hiddenInput}
      />

      {/* ERROR */}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {/* VERIFY BUTTON */}
      <TouchableOpacity
        style={[
          styles.button,
          !isOtpValid && styles.buttonDisabled,
        ]}
        onPress={handleVerify}
      >
        <Text
          style={[
            styles.buttonText,
            !isOtpValid && styles.buttonTextDisabled,
          ]}
        >
          Verify & Continue
        </Text>
      </TouchableOpacity>

      {/* RESEND */}
      <Text style={styles.resendText}>
        Didn’t receive the code?{" "}
        <Text style={styles.resendLink}>Resend</Text>
      </Text>
    </View>
  );
}
