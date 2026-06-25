import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { getVisitorHistory } from "../../src/api/visitorApi";
import { StatusPill, visitorStatusTone } from "../../components/ui/StatusPill";

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
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} color={theme.accent} />;

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
        loadingMore ? <ActivityIndicator style={{ padding: 16 }} color={theme.accent} /> : null
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
          <StatusPill
            tone={visitorStatusTone(item.status)}
            label={STATUS_LABEL[item.status] ?? item.status}
          />
        </TouchableOpacity>
      )}
    />
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  card: {
    backgroundColor: t.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: { flex: 1, marginRight: 8 },
  name: { fontSize: 14, fontWeight: "600", color: t.text },
  meta: { fontSize: 12, color: t.textSecondary, marginTop: 1 },
  date: { fontSize: 11, color: t.textTertiary, marginTop: 2 },
  empty: { textAlign: "center", color: t.textSecondary, marginTop: 40 },
});
