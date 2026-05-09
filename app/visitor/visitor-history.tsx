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
import { getVisitorHistory } from "../../src/api/visitorApi";

const STATUS_COLOR: Record<string, string> = {
  pending: "#f59e0b",
  approved: "#16a34a",
  rejected: "#dc2626",
  checked_in: "#2563eb",
  checked_out: "#6b7280",
  expired: "#9ca3af",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Waiting",
  approved: "Approved",
  rejected: "Rejected",
  checked_in: "Inside",
  checked_out: "Exited",
  expired: "Expired",
};

const PAGE_SIZE = 20;

function formatDate(s: string) {
  try {
    const d = new Date(s);
    return (
      d.toLocaleDateString(undefined, { day: "numeric", month: "short" }) +
      " · " +
      d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
    );
  } catch {
    return "";
  }
}

export default function VisitorHistoryScreen() {
  const router = useRouter();
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);

  const load = async (reset = false) => {
    const currentSkip = reset ? 0 : skip;
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const res = await getVisitorHistory(currentSkip, PAGE_SIZE);
      const items = res.visitors ?? res.data?.visitors ?? [];
      const total = res.total ?? res.data?.total ?? 0;
      if (reset) {
        setVisitors(items);
        setSkip(items.length);
      } else {
        setVisitors((prev) => [...prev, ...items]);
        setSkip(currentSkip + items.length);
      }
      setHasMore(currentSkip + items.length < total);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(useCallback(() => { load(true); }, []));

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={colors.accent} />;

  return (
    <FlatList
      data={visitors}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); load(true); }}
        />
      }
      contentContainerStyle={{ paddingVertical: 8 }}
      onEndReached={() => { if (hasMore && !loadingMore) load(); }}
      onEndReachedThreshold={0.3}
      ListEmptyComponent={<Text style={styles.empty}>No visitors yet</Text>}
      ListFooterComponent={
        loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={colors.accent} /> : null
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push(`/visitor/resident-detail?id=${item.id}`)}
        >
          <View style={styles.left}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.meta}>{item.mobile} · {item.purpose}</Text>
            {item.created_at && (
              <Text style={styles.date}>{formatDate(item.created_at)}</Text>
            )}
          </View>
          <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] ?? "#888" }]}>
            <Text style={styles.badgeText}>{STATUS_LABEL[item.status] ?? item.status}</Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flex: 1, marginRight: 8 },
  name: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  meta: { fontSize: 12, color: colors.textSecondary, marginTop: 1 },
  date: { fontSize: 11, color: colors.textTertiary, marginTop: 2 },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: "#fff", fontSize: 11, fontWeight: "600" },
  empty: { textAlign: "center", color: colors.textSecondary, marginTop: 40 },
});
