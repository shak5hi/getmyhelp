import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/tokens";
import { getQRInvites } from "../../src/api/visitorApi";

export default function QRInviteListScreen() {
  const router = useRouter();
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

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;

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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff", borderRadius: 10, padding: 12,
    marginHorizontal: 16, marginBottom: 8,
  },
  name: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  revoked: { fontSize: 12, color: colors.danger, fontWeight: "600", marginTop: 4 },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
});
