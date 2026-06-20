import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAttendanceHistory, AttendanceStatus } from "../src/api/attendanceApi";
import { mediaUrl } from "../src/config";
import { colors, radii, spacing } from "../constants/tokens";
import { EmptyState } from "../components/ui/EmptyState";

interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  marked_at: string | null;
  photo_url: string | null;
  provider?: {
    first_name: string;
    last_name?: string | null;
    profile_image?: string | null;
  };
}

interface HistoryData {
  month: string;
  total_present: number;
  total_absent: number;
  total_late: number;
  attendance_pct: number;
  records: AttendanceRecord[];
}

const monthKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

const statusColor = (status: AttendanceStatus) =>
  status === "absent" ? colors.danger : status === "late" ? colors.warning : colors.success;

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" });
};

export default function AttendanceHistoryScreen() {
  const [data, setData] = useState<HistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const month = monthKey();

  const load = useCallback(async () => {
    try {
      const res = await getAttendanceHistory(month);
      setData(res?.data ?? null);
    } catch (err) {
      console.log("Attendance history error:", err);
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  const records = data?.records ?? [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.pctBlock}>
          <Text style={styles.pctValue}>{Math.round(data?.attendance_pct ?? 0)}%</Text>
          <Text style={styles.pctLabel}>Attendance</Text>
        </View>
        <View style={styles.statsBlock}>
          <Stat label="Present" value={data?.total_present ?? 0} color={colors.success} />
          <Stat label="Absent" value={data?.total_absent ?? 0} color={colors.danger} />
          <Stat label="Late" value={data?.total_late ?? 0} color={colors.warning} />
        </View>
      </View>

      {records.length === 0 ? (
        <EmptyState
          icon="calendar-outline"
          title="No records yet"
          message="Attendance you mark this month will show up here."
        />
      ) : (
        records.map((rec, i) => {
          const img = mediaUrl(rec.provider?.profile_image);
          return (
            <View key={`${rec.date}-${i}`} style={styles.recordRow}>
              {img ? (
                <Image source={{ uri: img }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Ionicons name="person" size={16} color={colors.accent} />
                </View>
              )}
              <View style={styles.recordInfo}>
                <Text style={styles.recordDate}>{formatDate(rec.date)}</Text>
                {rec.provider && (
                  <Text style={styles.recordProvider} numberOfLines={1}>
                    {rec.provider.first_name} {rec.provider.last_name || ""}
                  </Text>
                )}
              </View>
              {rec.photo_url ? (
                <Image source={{ uri: mediaUrl(rec.photo_url)! }} style={styles.proof} />
              ) : null}
              <View style={[styles.statusPill, { backgroundColor: `${statusColor(rec.status)}1A` }]}>
                <Text style={[styles.statusText, { color: statusColor(rec.status) }]}>
                  {rec.status.toUpperCase()}
                </Text>
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  pctBlock: {
    alignItems: "center",
    paddingRight: spacing.lg,
    marginRight: spacing.lg,
    borderRightWidth: 1,
    borderRightColor: colors.divider,
  },
  pctValue: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.accent,
  },
  pctLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  statsBlock: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  recordRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarFallback: {
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  recordInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  recordDate: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  recordProvider: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  proof: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    marginRight: spacing.sm,
  },
  statusPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
