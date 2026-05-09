import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/tokens";
import { useGuardVisitorSocket } from "../../hooks/useGuardVisitorSocket";
import { getVisitorDetail } from "../../src/api/visitorApi";

export default function PendingApprovalScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [visitor, setVisitor] = useState<any>(null);
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "rejected">("pending");
  const [rejectionNote, setRejectionNote] = useState<string>("");
  const [guardId, setGuardId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const tok = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user");
      setToken(tok);
      if (userStr) {
        try { setGuardId(JSON.parse(userStr).id); } catch {}
      }
    })();
    if (id) {
      getVisitorDetail(id).then((res) => setVisitor(res?.data ?? res)).catch(() => {});
    }
  }, [id]);

  useGuardVisitorSocket(guardId, token, (data) => {
    if (!data || data.visitor_id !== id) return;
    if (data.event === "visitor_approved") setApprovalStatus("approved");
    else if (data.event === "visitor_rejected") {
      setApprovalStatus("rejected");
      setRejectionNote(data.note ?? "");
    }
  });

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/(guard-tabs)/visitor-list")}>
        <Text style={styles.backText}>← Back to list</Text>
      </TouchableOpacity>

      {visitor && (
        <View style={styles.card}>
          <Text style={styles.visitorName}>{visitor.name}</Text>
          <Text style={styles.info}>{visitor.mobile}</Text>
          <Text style={styles.info}>Purpose: {visitor.purpose}</Text>
          {visitor.flat_number && <Text style={styles.info}>Flat: {visitor.flat_number}</Text>}
        </View>
      )}

      {approvalStatus === "pending" && (
        <View style={styles.waitBox}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.waitText}>Waiting for resident approval...</Text>
          <Text style={styles.waitHint}>You can go back and add more visitors</Text>
        </View>
      )}

      {approvalStatus === "approved" && (
        <View style={[styles.resultBox, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.resultText, { color: colors.success }]}>✓ Approved — Let visitor in</Text>
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={() => router.replace(`/visitor/exit-entry?id=${id}`)}
          >
            <Text style={styles.exitBtnText}>Mark Exit When Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {approvalStatus === "rejected" && (
        <View style={[styles.resultBox, { backgroundColor: colors.dangerLight }]}>
          <Text style={[styles.resultText, { color: colors.danger }]}>✗ Rejected by resident</Text>
          {rejectionNote ? <Text style={styles.rejectNote}>{rejectionNote}</Text> : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 20 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 14, color: colors.accent, fontWeight: "600" },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  visitorName: { fontSize: 18, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  info: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
  waitBox: { alignItems: "center", marginTop: 32, gap: 12 },
  waitText: { fontSize: 16, color: colors.textSecondary },
  waitHint: { fontSize: 13, color: colors.textTertiary },
  resultBox: { borderRadius: 12, padding: 20, alignItems: "center", gap: 12 },
  resultText: { fontSize: 18, fontWeight: "700" },
  rejectNote: { fontSize: 14, color: colors.textSecondary },
  exitBtn: {
    marginTop: 8,
    backgroundColor: colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exitBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
