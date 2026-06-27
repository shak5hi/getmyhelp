import { useRouter } from "expo-router";
import { fonts } from "../../constants/tokens";
import { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import {
  getQRInvites,
  getOTPInvites,
  revokeQRInvite,
  revokeOTPInvite,
} from "../../src/api/visitorApi";

type InviteType = "QR" | "OTP";
interface ActiveInvite {
  id: string;
  type: InviteType;
  name: string;
  mobile: string;
  purpose: string;
  expires: Date | null;
  code?: string;
}

// Both invite kinds, merged into one "Active" list so the segment answers
// "who can currently get in?" regardless of how they prove it.
export default function ActiveInvitesScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [invites, setInvites] = useState<ActiveInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const [qrRes, otpRes] = await Promise.all([
        getQRInvites(0, 50, true),
        getOTPInvites(0, 50, true),
      ]);
      const qr: ActiveInvite[] = (qrRes?.invites ?? qrRes?.data?.invites ?? []).map((i: any) => ({
        id: i.id,
        type: "QR" as const,
        name: i.visitor_name,
        mobile: i.visitor_mobile,
        purpose: i.purpose,
        expires: i.valid_until ? new Date(i.valid_until) : null,
      }));
      const otp: ActiveInvite[] = (otpRes?.invites ?? otpRes?.data?.invites ?? []).map((i: any) => ({
        id: i.id,
        type: "OTP" as const,
        name: i.visitor_name,
        mobile: i.visitor_mobile,
        purpose: i.purpose,
        expires: i.expires_at ? new Date(i.expires_at) : null,
        code: i.otp_code,
      }));
      const merged = [...qr, ...otp].sort(
        (a, b) => (a.expires?.getTime() ?? 0) - (b.expires?.getTime() ?? 0)
      );
      setInvites(merged);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(); }, []));

  const openDetail = (item: ActiveInvite) => {
    const path = item.type === "QR" ? "qr-invite-detail" : "otp-invite-detail";
    router.push(`/visitor/${path}?id=${item.id}`);
  };

  const confirmRevoke = (item: ActiveInvite) => {
    Alert.alert("Revoke invite", `Revoke the ${item.type} invite for ${item.name}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          try {
            if (item.type === "QR") await revokeQRInvite(item.id);
            else await revokeOTPInvite(item.id);
            setInvites((prev) => prev.filter((i) => !(i.id === item.id && i.type === item.type)));
          } catch {
            Alert.alert("Error", "Could not revoke this invite. Please try again.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <FlatList
      data={invites}
      keyExtractor={(item) => `${item.type}-${item.id}`}
      contentContainerStyle={invites.length === 0 ? styles.emptyWrap : { paddingVertical: 8 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Ionicons name="ticket-outline" size={40} color={theme.textSecondary} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>No active invites</Text>
          <Text style={styles.emptyHint}>Tap “Invite a guest” to pre-clear someone.</Text>
        </View>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => openDetail(item)} activeOpacity={0.8}>
          <View style={styles.cardMain}>
            <View style={styles.cardTop}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <View style={[styles.typePill, item.type === "OTP" && styles.typePillOtp]}>
                <Text style={[styles.typePillText, item.type === "OTP" && styles.typePillTextOtp]}>
                  {item.type}
                </Text>
              </View>
            </View>
            <Text style={styles.meta} numberOfLines={1}>
              {item.purpose} · {item.mobile}
            </Text>
            {item.expires && (
              <Text style={styles.meta}>
                Expires {item.expires.toLocaleString("en-IN", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </Text>
            )}
          </View>
          <TouchableOpacity style={styles.revokeBtn} onPress={() => confirmRevoke(item)} hitSlop={8}>
            <Text style={styles.revokeText}>Revoke</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    />
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  emptyWrap: { flex: 1 },
  emptyText: { color: t.text, fontSize: 16, fontFamily: fonts.semibold },
  emptyHint: { color: t.textSecondary, fontSize: 13, marginTop: 4 },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: t.card,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 14,
    padding: 14,
  },
  cardMain: { flex: 1 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 15, fontFamily: fonts.bold, color: t.text, flexShrink: 1 },
  typePill: {
    backgroundColor: t.accentTint,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typePillOtp: { backgroundColor: t.successTint },
  typePillText: { fontSize: 10.5, fontFamily: fonts.extrabold, color: t.accent, letterSpacing: 0.5 },
  typePillTextOtp: { color: t.success },
  meta: { fontSize: 12, color: t.textSecondary, marginTop: 2, textTransform: "capitalize" },
  revokeBtn: {
    borderWidth: 1,
    borderColor: t.danger,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginLeft: 10,
  },
  revokeText: { color: t.danger, fontSize: 12.5, fontFamily: fonts.bold },
});
