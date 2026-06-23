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
import { SafeAreaView } from "react-native-safe-area-context";
import { useMemo } from "react";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { getVisitorList } from "../../src/api/visitorApi";

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

const today = () => new Date().toISOString().split("T")[0];

export default function GuardVisitorList() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const load = async (silent = false, all = showAll) => {
    if (!silent) setLoading(true);
    try {
      const params: any = { limit: 100 };
      if (!all) params.date = today();
      const res = await getVisitorList(params);
      setVisitors(res.visitors ?? res.data?.visitors ?? []);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { load(false, showAll); }, [showAll]));

  const handleToggle = (all: boolean) => {
    setShowAll(all);
    load(false, all);
  };

  const handlePress = (item: any) => {
    if (item.status === "pending") {
      router.push(`/visitor/pending-approval?id=${item.id}`);
    } else {
      router.push(`/visitor/exit-entry?id=${item.id}`);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <View style={styles.cardLeft}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.meta}>{item.mobile} · {item.purpose}</Text>
        {item.flat_number && <Text style={styles.meta}>Flat: {item.flat_number}</Text>}
      </View>
      <View style={[styles.badge, { backgroundColor: STATUS_COLOR[item.status] ?? "#888" }]}>
        <Text style={styles.badgeText}>{STATUS_LABEL[item.status] ?? item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visitors</Text>
        <View style={styles.toggle}>
          <TouchableOpacity
            style={[styles.toggleBtn, !showAll && styles.toggleBtnActive]}
            onPress={() => handleToggle(false)}
          >
            <Text style={[styles.toggleText, !showAll && styles.toggleTextActive]}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, showAll && styles.toggleBtnActive]}
            onPress={() => handleToggle(true)}
          >
            <Text style={[styles.toggleText, showAll && styles.toggleTextActive]}>All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={theme.accent} />
      ) : (
        <FlatList
          data={visitors}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(true, showAll); }}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="people-outline" size={40} color={theme.border} />
              <Text style={styles.empty}>
                {showAll ? "No visitors yet" : "No visitors today"}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: t.card,
    borderBottomWidth: 1,
    borderBottomColor: t.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 22, fontWeight: "700", color: t.text },
  toggle: {
    flexDirection: "row",
    backgroundColor: t.surfaceAlt,
    borderRadius: 8,
    padding: 2,
  },
  toggleBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6 },
  toggleBtnActive: { backgroundColor: t.accent },
  toggleText: { fontSize: 13, fontWeight: "600", color: t.textSecondary },
  toggleTextActive: { color: "#fff" },
  card: {
    backgroundColor: t.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLeft: { flex: 1, marginRight: 8 },
  name: { fontSize: 15, fontWeight: "600", color: t.text, marginBottom: 2 },
  meta: { fontSize: 13, color: t.textSecondary },
  badge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  emptyBox: { alignItems: "center", marginTop: 60, gap: 12 },
  empty: { textAlign: "center", color: t.textSecondary, fontSize: 15 },
});
