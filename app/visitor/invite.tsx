import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  ActivityIndicator,
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
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { createQRInvite, createOTPInvite } from "../../src/api/visitorApi";
import { fonts } from "../../constants/tokens";
import { useFeatureGuard } from "../../src/useFeatureGuard";
import { MODULES } from "../../src/featureRegistry";

const PURPOSES = ["delivery", "guest", "domestic", "vendor", "interview", "other"];
type Method = "qr" | "otp";

/**
 * Unified "Invite a guest" flow. The QR-vs-OTP choice is made *inside* the
 * single screen (was two separate generate screens + two tabs). A QR pass adds
 * a validity window + single/multi use; an OTP code is short-lived and
 * server-dated, so those extra fields are hidden for it.
 */
export default function InviteScreen() {
  useFeatureGuard(MODULES.visitors);
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const [method, setMethod] = useState<Method>("qr");
  const [visitorName, setVisitorName] = useState("");
  const [visitorMobile, setVisitorMobile] = useState("");
  const [purpose, setPurpose] = useState("guest");
  const [flatNumber, setFlatNumber] = useState("");
  const [entryType, setEntryType] = useState<"single" | "multi">("single");
  const [validFrom, setValidFrom] = useState(new Date());
  const [validUntil, setValidUntil] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  });
  const [showFrom, setShowFrom] = useState(false);
  const [showUntil, setShowUntil] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profileTowerId, setProfileTowerId] = useState<string | undefined>();

  useEffect(() => {
    AsyncStorage.getItem("user").then((str) => {
      if (!str) return;
      try {
        const u = JSON.parse(str);
        if (u.flat_number && !flatNumber) setFlatNumber(u.flat_number);
        if (u.tower_id) setProfileTowerId(u.tower_id);
      } catch {}
    });
  }, []);

  const handleSubmit = async () => {
    if (!visitorName.trim() || !visitorMobile.trim()) {
      Alert.alert("Required", "Guest name and mobile are required");
      return;
    }

    setLoading(true);
    try {
      if (method === "qr") {
        if (validFrom >= validUntil) {
          Alert.alert("Invalid dates", "Valid From must be before Valid Until");
          setLoading(false);
          return;
        }
        const res = await createQRInvite({
          visitor_name: visitorName.trim(),
          visitor_mobile: visitorMobile.trim(),
          purpose,
          flat_number: flatNumber.trim() || undefined,
          tower_id: profileTowerId,
          valid_from: validFrom.toISOString(),
          valid_until: validUntil.toISOString(),
          entry_type: entryType,
        });
        const id = res.id ?? res.data?.id;
        if (!id) throw new Error(res.detail ?? "Failed to create QR invite");
        router.replace(`/visitor/qr-invite-detail?id=${id}`);
      } else {
        const res = await createOTPInvite({
          visitor_name: visitorName.trim(),
          visitor_mobile: visitorMobile.trim(),
          purpose,
          flat_number: flatNumber.trim() || undefined,
        });
        if (res.detail) throw new Error(res.detail);
        const id = res.id ?? res.data?.id;
        if (!id) throw new Error("Failed to create OTP invite");
        router.replace(`/visitor/otp-invite-detail?id=${id}`);
      }
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to create invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["bottom"]}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Invite a guest</Text>
          <Text style={styles.subtitle}>
            Pre-clear someone so the guard can let them in. Choose how they'll prove it at the gate.
          </Text>

          {/* Method choice — the QR/OTP decision now lives inside one flow */}
          <View style={styles.methodRow}>
            {([
              { key: "qr", icon: "qr-code-outline", label: "QR Pass", hint: "Scannable, time-bound" },
              { key: "otp", icon: "keypad-outline", label: "OTP Code", hint: "6-digit, short-lived" },
            ] as const).map((m) => {
              const active = method === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  style={[styles.methodCard, active && styles.methodCardActive]}
                  onPress={() => setMethod(m.key)}
                  activeOpacity={0.8}
                >
                  <Ionicons name={m.icon} size={22} color={active ? theme.onAccent : theme.accent} />
                  <Text style={[styles.methodLabel, active && styles.methodLabelActive]}>{m.label}</Text>
                  <Text style={[styles.methodHint, active && styles.methodHintActive]}>{m.hint}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Guest Name *</Text>
          <TextInput
            style={styles.input}
            value={visitorName}
            onChangeText={setVisitorName}
            placeholder="Full name"
            placeholderTextColor={theme.textTertiary}
          />

          <Text style={styles.label}>Mobile *</Text>
          <TextInput
            style={styles.input}
            value={visitorMobile}
            onChangeText={setVisitorMobile}
            placeholder="Mobile number"
            placeholderTextColor={theme.textTertiary}
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
            placeholderTextColor={theme.textTertiary}
          />

          {/* QR-only: validity window + single/multi use */}
          {method === "qr" && (
            <>
              <Text style={styles.label}>Entry Type</Text>
              <View style={styles.toggleRow}>
                {(["single", "multi"] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, styles.toggleChip, entryType === t && styles.chipActive]}
                    onPress={() => setEntryType(t)}
                  >
                    <Text style={[styles.chipText, entryType === t && styles.chipTextActive]}>
                      {t === "single" ? "Single Use" : "Multi Use"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Valid From</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowFrom(true)}>
                <Text style={styles.dateBtnText}>{validFrom.toLocaleString()}</Text>
              </TouchableOpacity>
              {showFrom && (
                <DateTimePicker
                  value={validFrom}
                  mode="datetime"
                  onChange={(_, d) => { setShowFrom(false); if (d) setValidFrom(d); }}
                />
              )}

              <Text style={styles.label}>Valid Until</Text>
              <TouchableOpacity style={styles.dateBtn} onPress={() => setShowUntil(true)}>
                <Text style={styles.dateBtnText}>{validUntil.toLocaleString()}</Text>
              </TouchableOpacity>
              {showUntil && (
                <DateTimePicker
                  value={validUntil}
                  mode="datetime"
                  onChange={(_, d) => { setShowUntil(false); if (d) setValidUntil(d); }}
                />
              )}
            </>
          )}

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.onAccent} />
            ) : (
              <Text style={styles.submitBtnText}>
                {method === "qr" ? "Create QR Pass" : "Create OTP Code"}
              </Text>
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
  title: { fontSize: 22, fontFamily: fonts.bold, color: t.text, marginBottom: 6 },
  subtitle: { fontSize: 13, color: t.textSecondary, marginBottom: 20, lineHeight: 19 },
  methodRow: { flexDirection: "row", gap: 12, marginBottom: 4 },
  methodCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: t.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: t.card,
    gap: 4,
  },
  methodCardActive: { backgroundColor: t.accent, borderColor: t.accent },
  methodLabel: { fontSize: 15, fontFamily: fonts.bold, color: t.text, marginTop: 4 },
  methodLabelActive: { color: t.onAccent },
  methodHint: { fontSize: 11.5, color: t.textSecondary },
  methodHintActive: { color: t.onAccent, opacity: 0.85 },
  label: { fontSize: 13, fontFamily: fonts.semibold, color: t.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1, borderColor: t.border, borderRadius: 8,
    padding: 12, fontSize: 15, color: t.text, backgroundColor: t.card,
  },
  purposeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  toggleRow: { flexDirection: "row", gap: 12 },
  chip: { borderWidth: 1, borderColor: t.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: t.card },
  toggleChip: { flex: 1, alignItems: "center" },
  chipActive: { backgroundColor: t.accent, borderColor: t.accent },
  chipText: { fontSize: 13, color: t.textSecondary },
  chipTextActive: { color: t.onAccent, fontFamily: fonts.semibold },
  dateBtn: { borderWidth: 1, borderColor: t.border, borderRadius: 8, padding: 12, backgroundColor: t.card },
  dateBtnText: { fontSize: 14, color: t.text },
  submitBtn: { marginTop: 28, backgroundColor: t.accent, borderRadius: 10, paddingVertical: 15, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: t.onAccent, fontSize: 16, fontFamily: fonts.bold },
});
