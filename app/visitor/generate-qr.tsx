import AsyncStorage from "@react-native-async-storage/async-storage";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
import { colors } from "../../constants/tokens";
import { createQRInvite } from "../../src/api/visitorApi";

const PURPOSES = ["delivery", "guest", "domestic", "vendor", "interview", "other"];

export default function GenerateQRScreen() {
  const router = useRouter();
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
      Alert.alert("Required", "Visitor name and mobile are required");
      return;
    }
    if (validFrom >= validUntil) {
      Alert.alert("Invalid dates", "Valid From must be before Valid Until");
      return;
    }
    setLoading(true);
    try {
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
      router.push(`/visitor/qr-invite-detail?id=${id}`);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Failed to create QR invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.title}>Create QR Invite</Text>

          <Text style={styles.label}>Visitor Name *</Text>
          <TextInput style={styles.input} value={visitorName} onChangeText={setVisitorName} placeholder="Full name" />

          <Text style={styles.label}>Mobile *</Text>
          <TextInput style={styles.input} value={visitorMobile} onChangeText={setVisitorMobile} placeholder="Mobile number" keyboardType="phone-pad" />

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
          <TextInput style={styles.input} value={flatNumber} onChangeText={setFlatNumber} placeholder="e.g. 301" />

          <Text style={styles.label}>Entry Type</Text>
          <View style={styles.toggleRow}>
            {(["single", "multi"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.chip, styles.toggleChip, entryType === t && styles.chipActive]}
                onPress={() => setEntryType(t)}
              >
                <Text style={[styles.chipText, entryType === t && styles.chipTextActive]}>{t === "single" ? "Single Use" : "Multi Use"}</Text>
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

          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Generate QR</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: colors.textSecondary, marginBottom: 6, marginTop: 14 },
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: 8,
    padding: 12, fontSize: 15, color: colors.textPrimary, backgroundColor: colors.surface,
  },
  purposeRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  toggleRow: { flexDirection: "row", gap: 12 },
  chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: colors.surface },
  toggleChip: { flex: 1, alignItems: "center" },
  chipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: "#fff", fontWeight: "600" },
  dateBtn: { borderWidth: 1, borderColor: colors.border, borderRadius: 8, padding: 12, backgroundColor: colors.surface },
  dateBtnText: { fontSize: 14, color: colors.textPrimary },
  submitBtn: { marginTop: 28, backgroundColor: colors.accent, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
