import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../constants/tokens";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Share, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "../../components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { getOTPInvites, revokeOTPInvite } from "../../src/api/visitorApi";

export default function OTPInviteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);

  useEffect(() => {
    if (id) {
      // Fetch single invite by listing and finding the ID (no dedicated get endpoint needed)
      getOTPInvites(0, 50)
        .then((res) => {
          const list = res?.invites ?? res?.data?.invites ?? [];
          const found = list.find((i: any) => i.id === id);
          setInvite(found ?? null);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const isExpired = invite && new Date(invite.expires_at) < new Date();
  const isActive = invite && !invite.is_used && !invite.is_revoked && !isExpired;

  const handleRevoke = () => {
    Alert.alert("Revoke OTP", "Are you sure? The guest will no longer be able to use this OTP.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          setRevoking(true);
          try {
            await revokeOTPInvite(id!);
            setInvite((prev: any) => ({ ...prev, is_revoked: true }));
          } catch {
            Alert.alert("Error", "Failed to revoke OTP invite");
          } finally {
            setRevoking(false);
          }
        },
      },
    ]);
  };

  const handleShare = () => {
    if (!invite) return;
    const expiresAt = new Date(invite.expires_at).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const flat = invite.flat_number ? `Flat ${invite.flat_number}` : "";
    const message =
      `Your entry OTP is: ${invite.otp_code}\n\n` +
      `Guest: ${invite.visitor_name}\n` +
      `Purpose: ${invite.purpose}\n` +
      (flat ? `${flat}\n` : "") +
      `Valid until: ${expiresAt}\n\n` +
      `Show this OTP to the guard at the gate.`;
    Share.share({ message });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={theme.accent} />
      </SafeAreaView>
    );
  }

  if (!invite) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={{ color: theme.textSecondary }}>Invite not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* OTP display card */}
      <View style={[styles.otpCard, !isActive && styles.otpCardInactive]}>
        <Text style={styles.otpHint}>Entry OTP</Text>
        <Text style={[styles.otpCode, !isActive && styles.otpCodeInactive]}>{invite.otp_code}</Text>
        {invite.is_used && <Text style={styles.statusBadge}>USED</Text>}
        {invite.is_revoked && <Text style={[styles.statusBadge, { backgroundColor: "#fee2e2", color: theme.danger }]}>REVOKED</Text>}
        {isExpired && !invite.is_used && !invite.is_revoked && (
          <Text style={[styles.statusBadge, { backgroundColor: "#fef9c3", color: "#92400e" }]}>EXPIRED</Text>
        )}
        {isActive && (
          <Text style={styles.validUntil}>
            Valid until {new Date(invite.expires_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
          </Text>
        )}
      </View>

      {isActive && (
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Ionicons name="share-outline" size={18} color={theme.accent} />
          <Text style={styles.shareBtnText}>Share OTP with Guest</Text>
        </TouchableOpacity>
      )}

      <View style={styles.card}>
        <Text style={styles.name}>{invite.visitor_name}</Text>
        <Text style={styles.info}>{invite.visitor_mobile}</Text>
        <Text style={styles.info}>Purpose: {invite.purpose}</Text>
        {invite.flat_number && <Text style={styles.info}>Flat: {invite.flat_number}</Text>}
        <Text style={styles.info}>
          Expires: {new Date(invite.expires_at).toLocaleString("en-IN")}
        </Text>
        <Text style={styles.info}>Created: {new Date(invite.created_at).toLocaleString("en-IN")}</Text>
      </View>

      {isActive && (
        <TouchableOpacity style={styles.revokeBtn} onPress={handleRevoke} disabled={revoking}>
          {revoking ? <ActivityIndicator color="#fff" /> : <Text style={styles.revokeBtnText}>Revoke OTP</Text>}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  otpCard: {
    alignItems: "center",
    backgroundColor: t.accent,
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  otpCardInactive: { backgroundColor: t.card },
  otpHint: { fontSize: 13, fontFamily: fonts.semibold, color: "rgba(255,255,255,0.8)", marginBottom: 8, letterSpacing: 1 },
  otpCode: { fontSize: 52, fontFamily: fonts.extrabold, color: "#fff", letterSpacing: 10 },
  otpCodeInactive: { color: t.textSecondary },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 4,
    backgroundColor: "#dcfce7",
    color: "#166534",
    borderRadius: 20,
    fontSize: 12,
    fontFamily: fonts.bold,
    overflow: "hidden",
  },
  validUntil: { marginTop: 8, fontSize: 13, color: "rgba(255,255,255,0.9)" },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: t.accent,
    borderRadius: 10,
    paddingVertical: 10,
    marginBottom: 16,
  },
  shareBtnText: { color: t.accent, fontFamily: fonts.bold, fontSize: 15 },
  card: { backgroundColor: t.card, borderRadius: 12, padding: 16, marginBottom: 24 },
  name: { fontSize: 18, fontFamily: fonts.bold, color: t.text, marginBottom: 4 },
  info: { fontSize: 14, color: t.textSecondary, marginBottom: 2 },
  revokeBtn: { backgroundColor: t.danger, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  revokeBtnText: { color: "#fff", fontFamily: fonts.bold, fontSize: 16 },
});
