import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/tokens";
import { verifyOTP } from "../../src/api/visitorApi";

export default function VerifyOTPScreen() {
  const router = useRouter();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const ref0 = useRef<TextInput>(null);
  const ref1 = useRef<TextInput>(null);
  const ref2 = useRef<TextInput>(null);
  const ref3 = useRef<TextInput>(null);
  const ref4 = useRef<TextInput>(null);
  const ref5 = useRef<TextInput>(null);
  const refs = [ref0, ref1, ref2, ref3, ref4, ref5];

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = cleaned;
    setOtp(next);
    if (cleaned && index < 5) {
      refs[index + 1].current?.focus();
    }
    if (!cleaned && index > 0) {
      refs[index - 1].current?.focus();
    }
  };

  const otpCode = otp.join("");

  const handleVerify = async () => {
    if (otpCode.length < 6) {
      Alert.alert("Incomplete", "Please enter the full 6-digit OTP");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await verifyOTP(otpCode);
      if (res.detail) throw new Error(res.detail);
      setResult(res);
    } catch (e: any) {
      Alert.alert("Invalid OTP", e.message ?? "OTP verification failed. Check the code and try again.");
      setOtp(["", "", "", "", "", ""]);
      refs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setOtp(["", "", "", "", "", ""]);
    setTimeout(() => refs[0].current?.focus(), 100);
  };

  if (result) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={56} color="#16a34a" />
          </View>
          <Text style={styles.successTitle}>OTP Verified!</Text>
          <Text style={styles.successName}>{result.name}</Text>
          <Text style={styles.successSub}>{result.mobile}</Text>
          <Text style={[styles.successSub, { textTransform: "capitalize" }]}>Purpose: {result.purpose}</Text>
          {result.flat_number && (
            <Text style={styles.successSub}>Flat: {result.flat_number}</Text>
          )}
          <View style={styles.checkedInBadge}>
            <Text style={styles.checkedInText}>Checked In</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.actionBtn} onPress={handleReset}>
          <Text style={styles.actionBtnText}>Verify Another OTP</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.exitBtn]}
          onPress={() => router.replace("/(guard-tabs)/visitor-list")}
        >
          <Text style={[styles.actionBtnText, { color: colors.textPrimary }]}>Go to Visitor List</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="keypad-outline" size={40} color={colors.accent} style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Enter Visitor OTP</Text>
        <Text style={styles.subtitle}>Ask the visitor for their 6-digit OTP shared by the resident</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={refs[i]}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              keyboardType="number-pad"
              maxLength={2}
              selectTextOnFocus
              textAlign="center"
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, (loading || otpCode.length < 6) && styles.verifyBtnDisabled]}
          onPress={handleVerify}
          disabled={loading || otpCode.length < 6}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify & Allow Entry</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 14, color: colors.textSecondary, textAlign: "center", marginBottom: 36, lineHeight: 20 },
  otpRow: { flexDirection: "row", gap: 10, marginBottom: 40 },
  otpBox: {
    width: 44,
    height: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  otpBoxFilled: { borderColor: colors.accent, backgroundColor: colors.accent + "10" },
  verifyBtn: {
    width: "100%",
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
  },
  verifyBtnDisabled: { opacity: 0.45 },
  verifyBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  // success state
  successCard: {
    margin: 24,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
  },
  successIcon: { marginBottom: 12 },
  successTitle: { fontSize: 22, fontWeight: "800", color: "#16a34a", marginBottom: 16 },
  successName: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  successSub: { fontSize: 14, color: colors.textSecondary, marginBottom: 2, textAlign: "center" },
  checkedInBadge: {
    marginTop: 16,
    backgroundColor: "#dcfce7",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  checkedInText: { fontSize: 13, fontWeight: "700", color: "#166534" },
  actionBtn: {
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: colors.accent,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  exitBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  actionBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});
