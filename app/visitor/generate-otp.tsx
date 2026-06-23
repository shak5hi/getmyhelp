import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { createOTPInvite } from "../../src/api/visitorApi";

const PURPOSES = ["delivery", "guest", "domestic", "vendor", "interview", "other"];

export default function GenerateOTPScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [visitorName, setVisitorName] = useState("");
  const [visitorMobile, setVisitorMobile] = useState("");
  const [purpose, setPurpose] = useState("guest");
  const [flatNumber, setFlatNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!visitorName.trim() || !visitorMobile.trim()) {
      Alert.alert("Required", "Visitor name and mobile number are required");
      return;
    }
    setLoading(true);
    try {
      const res = await createOTPInvite({
        visitor_name: visitorName.trim(),
        visitor_mobile: visitorMobile.trim(),
        purpose,
        flat_number: flatNumber.trim() || undefined,
      });
      if (res.detail) throw new Error(res.detail);
      const otpId = res.id ?? res.data?.id;
      if (!otpId) throw new Error("Failed to create OTP invite");
      router.replace(`/visitor/otp-invite-detail?id=${otpId}`);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to create OTP invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Generate OTP Invite</Text>
          <Text style={styles.subtitle}>
            A 6-digit OTP will be created. Share it with your guest — they give it to the guard at entry.
          </Text>

          <Text style={styles.label}>Guest Name *</Text>
          <TextInput
            style={styles.input}
            value={visitorName}
            onChangeText={setVisitorName}
            placeholder="Full name"
            placeholderTextColor={theme.textSecondary}
          />

          <Text style={styles.label}>Mobile Number *</Text>
          <TextInput
            style={styles.input}
            value={visitorMobile}
            onChangeText={setVisitorMobile}
            placeholder="10-digit mobile"
            placeholderTextColor={theme.textSecondary}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Purpose</Text>
          <View style={styles.purposeRow}>
            {PURPOSES.map((p) => (
              <TouchableOpacity
                key={p}
                style={[styles.chip, purpose === p && styles.chipActive]}
                onPress={() => setPurpose(p)}
              >
                <Text style={[styles.chipText, purpose === p && styles.chipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Flat Number (optional)</Text>
          <TextInput
            style={styles.input}
            value={flatNumber}
            onChangeText={setFlatNumber}
            placeholder="e.g. 301"
            placeholderTextColor={theme.textSecondary}
          />

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitBtnText}>Generate OTP</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "700", color: t.text, marginBottom: 8 },
  subtitle: { fontSize: 13, color: t.textSecondary, marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 13, fontWeight: "600", color: t.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: t.text,
    backgroundColor: t.card,
  },
  purposeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: t.border,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: t.card,
  },
  chipActive: { backgroundColor: t.accent, borderColor: t.accent },
  chipText: { fontSize: 13, color: t.textSecondary },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  submitBtn: {
    marginTop: 32,
    backgroundColor: t.accent,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
