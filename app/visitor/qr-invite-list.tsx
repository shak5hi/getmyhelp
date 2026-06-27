import { useRouter } from "expo-router";
import { fonts } from "../../constants/tokens";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { getQRInvites } from "../../src/api/visitorApi";

export default function QRInviteListScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getQRInvites(0, 50);
      setInvites(res.invites ?? res.data?.invites ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.accent} />;

  return (
    <FlatList
      data={invites}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingVertical: 8 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} />}
      ListEmptyComponent={<Text style={styles.empty}>No QR invites yet</Text>}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => router.push(`/visitor/qr-invite-detail?id=${item.id}`)}>
          <Text style={styles.name}>{item.visitor_name}</Text>
          <Text style={styles.meta}>{item.visitor_mobile} · {item.purpose}</Text>
          <Text style={styles.meta}>
            Valid: {new Date(item.valid_from).toLocaleDateString()} – {new Date(item.valid_until).toLocaleDateString()}
          </Text>
          {item.is_revoked && <Text style={styles.revoked}>Revoked</Text>}
        </TouchableOpacity>
      )}
    />
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  card: {
    backgroundColor: t.card, borderRadius: 16, padding: 16,
    marginHorizontal: 16, marginBottom: 10,
  },
  name: { fontSize: 14, fontFamily: fonts.semibold, color: t.text },
  meta: { fontSize: 12, color: t.textSecondary, marginTop: 2 },
  revoked: { fontSize: 12, color: t.danger, fontFamily: fonts.semibold, marginTop: 4 },
  empty: { textAlign: "center", color: t.textSecondary, marginTop: 40 },
});
