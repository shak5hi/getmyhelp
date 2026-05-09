import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/tokens";
import { getOTPInvites } from "../../src/api/visitorApi";

export default function OTPInviteListScreen() {
  const router = useRouter();
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const res = await getOTPInvites(0, 50);
      setInvites(res?.invites ?? res?.data?.invites ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const statusColor = (invite: any) => {
    if (invite.is_revoked) return colors.danger;
    if (invite.is_used) return "#6b7280";
    if (new Date(invite.expires_at) < new Date()) return "#d97706";
    return "#16a34a";
  };

  const statusLabel = (invite: any) => {
    if (invite.is_revoked) return "Revoked";
    if (invite.is_used) return "Used";
    if (new Date(invite.expires_at) < new Date()) return "Expired";
    return "Active";
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/visitor/otp-invite-detail?id=${item.id}`)}
    >
      <View style={styles.otpBadge}>
        <Text style={styles.otpCode}>{item.otp_code}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.visitor_name}</Text>
        <Text style={styles.sub}>{item.purpose} · {item.visitor_mobile}</Text>
        <Text style={styles.sub}>
          Expires {new Date(item.expires_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
      <View style={[styles.statusPill, { borderColor: statusColor(item) }]}>
        <Text style={[styles.statusText, { color: statusColor(item) }]}>{statusLabel(item)}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <FlatList
      data={invites}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
      contentContainerStyle={invites.length === 0 ? styles.empty : { paddingVertical: 8 }}
      ListEmptyComponent={
        <View style={styles.center}>
          <Ionicons name="keypad-outline" size={40} color={colors.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={{ color: colors.textSecondary, fontSize: 15 }}>No OTP invites yet</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  empty: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 14,
  },
  otpBadge: {
    backgroundColor: colors.accent + "18",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
  },
  otpCode: { fontSize: 16, fontWeight: "800", color: colors.accent, letterSpacing: 3 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: "600", color: colors.textPrimary },
  sub: { fontSize: 12, color: colors.textSecondary, marginTop: 1, textTransform: "capitalize" },
  statusPill: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statusText: { fontSize: 11, fontWeight: "700" },
});
