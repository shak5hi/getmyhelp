import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getTodaysProviders,
  markAttendance,
  AttendanceStatus,
  AttendancePhoto,
  TodayProvider,
} from "../src/api/attendanceApi";
import { mediaUrl } from "../src/config";
import { colors, radii, spacing } from "../constants/tokens";

const statusColor = (status: AttendanceStatus) =>
  status === "absent" ? colors.danger : status === "late" ? colors.warning : colors.success;

// Optionally capture a proof photo. Never blocks marking if camera is denied/cancelled.
const capturePhoto = async (): Promise<AttendancePhoto | null> => {
  try {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    const asset = res.canceled ? null : res.assets?.[0];
    if (!asset) return null;
    return { uri: asset.uri, name: asset.fileName ?? undefined, type: asset.mimeType ?? undefined };
  } catch {
    return null;
  }
};

export default function TodaysHelp() {
  const router = useRouter();
  const [items, setItems] = useState<TodayProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTodaysProviders();
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      console.log("Today's Help fetch error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const mark = async (item: TodayProvider, status: AttendanceStatus) => {
    const providerId = item.provider.id;
    setMarkingId(providerId);
    try {
      const photo = status === "present" ? await capturePhoto() : null;
      const res = await markAttendance(providerId, status, photo);
      const updated = res?.data;
      if (updated?.status) {
        setItems((prev) =>
          prev.map((x) =>
            x.provider.id === providerId
              ? { ...x, status: updated.status, marked_at: updated.marked_at, photo_url: updated.photo_url }
              : x
          )
        );
      } else {
        // 403 (maid no longer assigned) or other error — refresh from server.
        load();
      }
    } catch (err) {
      console.log("Mark attendance error:", err);
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.card, styles.centered]}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (items.length === 0) {
    return null; // dashboard already shows a "No Maid Assigned" hero when there's nothing scheduled
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Today's Help</Text>
        <TouchableOpacity onPress={() => router.push("/attendance-history" as any)} hitSlop={8}>
          <Text style={styles.historyLink}>History</Text>
        </TouchableOpacity>
      </View>

      {items.map((item, index) => {
        const { provider } = item;
        const img = mediaUrl(provider.profile_image);
        const busy = markingId === provider.id;
        return (
          <View
            key={item.assignment_id ?? `${item.provider.id}-${index}`}
            style={[styles.row, index < items.length - 1 && styles.rowDivider]}
          >
            {img ? (
              <Image source={{ uri: img }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback]}>
                <Ionicons name="person" size={18} color={colors.accent} />
              </View>
            )}

            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>
                {provider.first_name} {provider.last_name || ""}
              </Text>
              <Text style={styles.services} numberOfLines={1}>
                {item.assigned_services?.join(", ") || "Daily Help"}
              </Text>
            </View>

            {item.status ? (
              <TouchableOpacity
                style={[styles.statusPill, { backgroundColor: `${statusColor(item.status)}1A` }]}
                onPress={() =>
                  setItems((prev) => prev.map((x, i) => (i === index ? { ...x, status: null } : x)))
                }
              >
                <Text style={[styles.statusText, { color: statusColor(item.status) }]}>
                  {item.status.toUpperCase()}
                </Text>
                <Ionicons
                  name="pencil"
                  size={11}
                  color={statusColor(item.status)}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            ) : busy ? (
              <ActivityIndicator color={colors.accent} style={{ marginLeft: spacing.sm }} />
            ) : (
              <View style={styles.actions}>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.presentBtn]}
                  onPress={() => mark(item, "present")}
                >
                  <Text style={styles.presentText}>Present</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.absentBtn]}
                  onPress={() => mark(item, "absent")}
                >
                  <Text style={styles.absentText}>Absent</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 80,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.textPrimary,
  },
  historyLink: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.accent,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    backgroundColor: colors.accentLight,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    marginLeft: spacing.md,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.textPrimary,
  },
  services: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radii.full,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radii.sm,
  },
  presentBtn: {
    backgroundColor: colors.success,
  },
  presentText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  absentBtn: {
    backgroundColor: colors.dangerLight,
  },
  absentText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
});
