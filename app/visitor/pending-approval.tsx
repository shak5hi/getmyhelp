import AsyncStorage from "@react-native-async-storage/async-storage";
import { fonts } from "../../constants/tokens";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { useGuardVisitorSocket } from "../../hooks/useGuardVisitorSocket";
import { getVisitorDetail } from "../../src/api/visitorApi";
import { useFeatureGuard } from "../../src/useFeatureGuard";
import { MODULES } from "../../src/featureRegistry";

export default function PendingApprovalScreen() {
  useFeatureGuard(MODULES.visitors);
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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
          <ActivityIndicator color={theme.accent} size="large" />
          <Text style={styles.waitText}>Waiting for resident approval...</Text>
          <Text style={styles.waitHint}>You can go back and add more visitors</Text>
        </View>
      )}

      {approvalStatus === "approved" && (
        <View style={[styles.resultBox, { backgroundColor: theme.successTint }]}>
          <Text style={[styles.resultText, { color: theme.success }]}>✓ Approved — Let visitor in</Text>
          <TouchableOpacity
            style={styles.exitBtn}
            onPress={() => router.replace(`/visitor/exit-entry?id=${id}`)}
          >
            <Text style={styles.exitBtnText}>Mark Exit When Done</Text>
          </TouchableOpacity>
        </View>
      )}

      {approvalStatus === "rejected" && (
        <View style={[styles.resultBox, { backgroundColor: theme.dangerTint }]}>
          <Text style={[styles.resultText, { color: theme.danger }]}>✗ Rejected by resident</Text>
          {rejectionNote ? <Text style={styles.rejectNote}>{rejectionNote}</Text> : null}
        </View>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, padding: 20 },
  backBtn: { marginBottom: 16 },
  backText: { fontSize: 14, color: t.accent, fontFamily: fonts.semibold },
  card: {
    backgroundColor: t.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  visitorName: { fontSize: 18, fontFamily: fonts.bold, color: t.text, marginBottom: 4 },
  info: { fontSize: 14, color: t.textSecondary, marginBottom: 2 },
  waitBox: { alignItems: "center", marginTop: 32, gap: 12 },
  waitText: { fontSize: 16, color: t.textSecondary },
  waitHint: { fontSize: 13, color: t.textTertiary },
  resultBox: { borderRadius: 12, padding: 20, alignItems: "center", gap: 12 },
  resultText: { fontSize: 18, fontFamily: fonts.bold },
  rejectNote: { fontSize: 14, color: t.textSecondary },
  exitBtn: {
    marginTop: 8,
    backgroundColor: t.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  exitBtnText: { color: "#fff", fontFamily: fonts.bold, fontSize: 14 },
});
