import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../constants/tokens";
import {
  approveVisitor,
  getResidentVisitorDetail,
  rejectVisitor,
} from "../../src/api/visitorApi";
import config from "../../src/config";

const toFullUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${config.fileBaseUrl}${url}`;
};

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#16a34a",
  rejected: "#dc2626",
  checked_in: "#2563eb",
  checked_out: "#6b7280",
  expired: "#9ca3af",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting for your approval",
  approved: "You approved this visitor",
  rejected: "You rejected this visitor",
  checked_in: "Visitor is inside",
  checked_out: "Visitor has left",
  expired: "Approval expired",
};

export default function ResidentVisitorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [visitor, setVisitor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectNote, setRejectNote] = useState("");

  useEffect(() => {
    if (id) {
      getResidentVisitorDetail(id)
        .then((res) => setVisitor(res?.data ?? res))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleApprove = async () => {
    setActing(true);
    try {
      await approveVisitor(id!);
      setVisitor((v: any) => ({ ...v, status: "approved" }));
    } catch {
      Alert.alert("Error", "Failed to approve visitor");
    } finally {
      setActing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectNote.trim()) {
      Alert.alert("Required", "Please provide a reason");
      return;
    }
    setActing(true);
    try {
      await rejectVisitor(id!, rejectNote);
      setVisitor((v: any) => ({ ...v, status: "rejected" }));
      setShowReject(false);
    } catch {
      Alert.alert("Error", "Failed to reject visitor");
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </SafeAreaView>
    );
  }

  if (!visitor) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: colors.textSecondary }}>Visitor not found</Text>
      </SafeAreaView>
    );
  }

  const isPending = visitor.status === "pending";

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {visitor.selfie_url ? (
          <Image source={{ uri: toFullUrl(visitor.selfie_url)! }} style={styles.selfie} />
        ) : (
          <View style={[styles.selfie, styles.selfiePlaceholder]}>
            <Ionicons name="person-outline" size={48} color={colors.textTertiary} />
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.name}>{visitor.name}</Text>
          <Text style={styles.info}>{visitor.mobile}</Text>
          <Text style={styles.info}>Purpose: {visitor.purpose}</Text>
          {visitor.flat_number && (
            <Text style={styles.info}>Flat: {visitor.flat_number}</Text>
          )}
          {visitor.created_at && (
            <Text style={styles.date}>
              {new Date(visitor.created_at).toLocaleString()}
            </Text>
          )}
        </View>

        <View
          style={[styles.statusBox, { borderColor: STATUS_COLOR[visitor.status] ?? "#888" }]}
        >
          <Text style={[styles.statusText, { color: STATUS_COLOR[visitor.status] ?? "#888" }]}>
            {STATUS_LABEL[visitor.status] ?? visitor.status}
          </Text>
        </View>

        {isPending && !showReject && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={[styles.btn, styles.rejectBtn]}
              onPress={() => setShowReject(true)}
              disabled={acting}
            >
              <Text style={styles.btnText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.approveBtn]}
              onPress={handleApprove}
              disabled={acting}
            >
              {acting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>Approve</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {isPending && showReject && (
          <View style={{ width: "100%" }}>
            <TextInput
              style={styles.rejectInput}
              placeholder="Reason for rejection..."
              value={rejectNote}
              onChangeText={setRejectNote}
              multiline
            />
            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.btn, styles.cancelBtn]}
                onPress={() => { setShowReject(false); setRejectNote(""); }}
                disabled={acting}
              >
                <Text style={styles.cancelBtnText}>Back</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btn, styles.rejectBtn]}
                onPress={handleReject}
                disabled={acting}
              >
                {acting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.btnText}>Confirm Reject</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { padding: 20, alignItems: "center" },
  selfie: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  selfiePlaceholder: {
    backgroundColor: colors.surfaceAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "100%",
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
  },
  name: { fontSize: 20, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  info: { fontSize: 15, color: colors.textSecondary, marginBottom: 2 },
  date: { fontSize: 12, color: colors.textTertiary, marginTop: 6 },
  statusBox: {
    width: "100%",
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 24,
  },
  statusText: { fontSize: 15, fontWeight: "700" },
  actionRow: { flexDirection: "row", gap: 12, width: "100%" },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: "center" },
  approveBtn: { backgroundColor: "#16a34a" },
  rejectBtn: { backgroundColor: "#dc2626" },
  cancelBtn: { backgroundColor: colors.surfaceAlt },
  btnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  cancelBtnText: { color: colors.textPrimary, fontSize: 15, fontWeight: "600" },
  rejectInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: "top",
    backgroundColor: colors.surface,
    width: "100%",
  },
});
