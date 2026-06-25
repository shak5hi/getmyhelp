import * as Sharing from "expo-sharing";
import { fonts } from "../../constants/tokens";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import ViewShot, { captureRef } from "react-native-view-shot";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { getQRInviteDetail, revokeQRInvite } from "../../src/api/visitorApi";

export default function QRInviteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [invite, setInvite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [sharing, setSharing] = useState(false);
  const qrRef = useRef<any>(null);

  useEffect(() => {
    if (id) {
      getQRInviteDetail(id)
        .then((res) => setInvite(res?.data ?? res))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleRevoke = () => {
    Alert.alert("Revoke QR", "Are you sure you want to revoke this QR invite?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Revoke",
        style: "destructive",
        onPress: async () => {
          setRevoking(true);
          try {
            await revokeQRInvite(id!);
            setInvite((prev: any) => ({ ...prev, is_revoked: true }));
          } catch {
            Alert.alert("Error", "Failed to revoke QR invite");
          } finally {
            setRevoking(false);
          }
        },
      },
    ]);
  };

  const handleShareImage = async () => {
    if (!qrRef.current) return;
    setSharing(true);
    try {
      const uri = await captureRef(qrRef, { format: "png", quality: 1.0 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: "image/png", dialogTitle: "Share QR Invite" });
      } else {
        Alert.alert("Sharing not available", "Your device does not support file sharing.");
      }
    } catch {
      Alert.alert("Error", "Could not capture QR code image.");
    } finally {
      setSharing(false);
    }
  };

  const handleShareText = () => {
    const validFrom = new Date(invite.valid_from).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const validUntil = new Date(invite.valid_until).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    const flat = invite.flat_number ? `Flat ${invite.flat_number}` : "";
    const entryLabel = invite.entry_type === "multi" ? "Multiple entries" : "Single entry";

    const message =
      `You're invited!\n\n` +
      `Guest: ${invite.visitor_name}\n` +
      `Mobile: ${invite.visitor_mobile}\n` +
      `Purpose: ${invite.purpose}\n` +
      (flat ? `Flat: ${flat}\n` : "") +
      `Valid: ${validFrom} – ${validUntil}\n` +
      `Entry: ${entryLabel}\n\n` +
      `Show this message at the gate along with the QR code.`;

    Share.share({ message });
  };

  const handleShare = () => {
    Alert.alert("Share Invite", "How would you like to share?", [
      { text: "Share QR Image", onPress: handleShareImage },
      { text: "Share as Text", onPress: handleShareText },
      { text: "Cancel", style: "cancel" },
    ]);
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
      <ViewShot ref={qrRef} style={styles.qrBox} options={{ format: "png", quality: 1.0 }}>
        {invite.is_revoked ? (
          <View style={styles.revokedOverlay}>
            <Text style={styles.revokedText}>REVOKED</Text>
          </View>
        ) : (
          <>
            <QRCode value={invite.qr_token} size={200} />
            <Text style={styles.qrLabel}>{invite.visitor_name}</Text>
            <Text style={styles.qrSub}>{invite.flat_number ? `Flat ${invite.flat_number} · ` : ""}{invite.purpose}</Text>
          </>
        )}
      </ViewShot>

      {!invite.is_revoked && (
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare} disabled={sharing}>
          {sharing ? (
            <ActivityIndicator color={theme.accent} size="small" />
          ) : (
            <>
              <Ionicons name="share-outline" size={18} color={theme.accent} />
              <Text style={styles.shareBtnText}>Share Invite</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.card}>
        <Text style={styles.name}>{invite.visitor_name}</Text>
        <Text style={styles.info}>{invite.visitor_mobile}</Text>
        <Text style={styles.info}>Purpose: {invite.purpose}</Text>
        <Text style={styles.info}>
          Valid: {new Date(invite.valid_from).toLocaleString()} – {new Date(invite.valid_until).toLocaleString()}
        </Text>
        <Text style={styles.info}>Entry Type: {invite.entry_type}</Text>
        <Text style={styles.info}>Used: {invite.use_count} times</Text>
      </View>

      {!invite.is_revoked && (
        <TouchableOpacity style={styles.revokeBtn} onPress={handleRevoke} disabled={revoking}>
          {revoking ? <ActivityIndicator color="#fff" /> : <Text style={styles.revokeBtnText}>Revoke QR Invite</Text>}
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg, padding: 20 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  qrBox: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 12,
  },
  qrLabel: { marginTop: 12, fontSize: 15, fontFamily: fonts.bold, color: "#1a1a1a" },
  qrSub: { marginTop: 2, fontSize: 12, color: "#666", textTransform: "capitalize" },
  revokedOverlay: {
    width: 200,
    height: 200,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
  },
  revokedText: { fontSize: 24, fontFamily: fonts.extrabold, color: t.danger },
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
