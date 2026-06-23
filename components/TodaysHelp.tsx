import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import {
  getTodaysProviders,
  markAttendance,
  AttendanceStatus,
  AttendancePhoto,
  TodayProvider,
} from "../src/api/attendanceApi";
import { mediaUrl } from "../src/config";
import { fonts } from "../constants/tokens";
import { useTheme } from "../src/ThemeContext";
import { Theme } from "../constants/themes";

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
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const statusColor = (status: AttendanceStatus) =>
    status === "absent" ? theme.danger : status === "late" ? theme.warning : theme.success;
  const statusTint = (status: AttendanceStatus) =>
    status === "absent" ? theme.dangerTint : status === "late" ? theme.warningTint : theme.successTint;

  const [items, setItems] = useState<TodayProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTodaysProviders();
      setItems(Array.isArray(res?.data) ? res.data : []);
    } catch {
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
        load();
      }
    } catch {
      load();
    } finally {
      setMarkingId(null);
    }
  };

  if (loading) {
    return (
      <View style={[s.card, s.centered]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={s.card}>
        <View style={s.emptyIcon}>
          <Ionicons name="home-outline" size={22} color={theme.textTertiary} />
        </View>
        <Text style={s.emptyText}>No help scheduled today</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      {items.map((item, index) => {
        const { provider } = item;
        const img = mediaUrl(provider.profile_image);
        const busy = markingId === provider.id;
        const fmtTime = item.marked_at
          ? new Date(item.marked_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
          : null;
        return (
          <View key={item.assignment_id ?? `${provider.id}-${index}`} style={s.card}>
            <View style={s.row}>
              {img ? (
                <Image source={{ uri: img }} style={s.avatar} />
              ) : (
                <View style={[s.avatar, s.avatarFallback]}>
                  <Ionicons name="person" size={20} color={theme.accent} />
                </View>
              )}
              <View style={s.info}>
                <Text style={s.name} numberOfLines={1}>
                  {provider.first_name} {provider.last_name || ""}
                </Text>
                <Text style={s.role} numberOfLines={1}>
                  {item.assigned_services?.join(", ") || "Home help"}
                </Text>
              </View>
              {item.status ? (
                <View style={[s.badge, { backgroundColor: statusTint(item.status) }]}>
                  <Text style={[s.badgeText, { color: statusColor(item.status) }]}>
                    {item.status === "present" ? "Present" : item.status === "absent" ? "Absent" : "Late"}
                  </Text>
                </View>
              ) : (
                <Text style={s.scheduled}>Scheduled</Text>
              )}
            </View>

            {item.status ? (
              <TouchableOpacity
                style={s.amendRow}
                onPress={() =>
                  setItems((prev) => prev.map((x, i) => (i === index ? { ...x, status: null } : x)))
                }
              >
                <Ionicons name="checkmark-circle" size={16} color={statusColor(item.status)} />
                <Text style={s.amendText}>
                  {item.status === "present" && fmtTime ? `Arrived at ${fmtTime}` : "Tap to change"}
                </Text>
              </TouchableOpacity>
            ) : busy ? (
              <View style={s.amendRow}>
                <ActivityIndicator color={theme.accent} size="small" />
              </View>
            ) : (
              <View style={s.actions}>
                <TouchableOpacity
                  style={[s.actionBtn, { backgroundColor: theme.accent }]}
                  activeOpacity={0.88}
                  onPress={() => mark(item, "present")}
                >
                  <Text style={[s.actionText, { color: "#FFFFFF" }]}>Mark Present</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.actionBtn, s.actionGhost]}
                  activeOpacity={0.7}
                  onPress={() => mark(item, "absent")}
                >
                  <Text style={[s.actionText, { color: theme.textSecondary }]}>Absent</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.card,
      borderRadius: 24,
      borderWidth: t.mode === "light" ? 1 : 0,
      borderColor: t.border,
      padding: 18,
    },
    centered: { alignItems: "center", justifyContent: "center", minHeight: 90 },
    emptyIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: t.surface,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "center",
      marginBottom: 10,
    },
    emptyText: { fontFamily: fonts.medium, fontSize: 14, color: t.textSecondary, textAlign: "center" },
    row: { flexDirection: "row", alignItems: "center" },
    avatar: { width: 48, height: 48, borderRadius: 16 },
    avatarFallback: { backgroundColor: t.accentTint, alignItems: "center", justifyContent: "center" },
    info: { flex: 1, marginLeft: 14 },
    name: { fontFamily: fonts.semibold, fontSize: 16, color: t.text, letterSpacing: -0.2 },
    role: { fontFamily: fonts.regular, fontSize: 13, color: t.textSecondary, marginTop: 2 },
    scheduled: { fontFamily: fonts.medium, fontSize: 13, color: t.textTertiary },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
    badgeText: { fontFamily: fonts.semibold, fontSize: 12 },
    actions: { flexDirection: "row", gap: 10, marginTop: 16 },
    actionBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    actionGhost: { flex: 0, paddingHorizontal: 18, backgroundColor: t.surface },
    actionText: { fontFamily: fonts.semibold, fontSize: 14 },
    amendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
    amendText: { fontFamily: fonts.regular, fontSize: 13, color: t.textSecondary },
  });
