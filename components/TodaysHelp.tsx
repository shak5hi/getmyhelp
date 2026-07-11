import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
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
  normalizeStatus,
  AttendanceStatus,
  AttendancePhoto,
  TodayProvider,
} from "../src/api/attendanceApi";
import { mediaUrl } from "../src/config";
import { fonts } from "../constants/tokens";
import { useTheme } from "../src/ThemeContext";
import { Theme } from "../constants/themes";

// The API's days_of_week is 0=Sun…6=Sat — the same indexing as JS getDay().
// (Confirmed against real data: a maid scheduled Saturday comes back as [6].)
const todayIndex = () => new Date().getDay();

/**
 * Is this assignment actually due today?
 *
 * The endpoint returns the resident's assignments, and each carries the weekdays
 * that maid is scheduled to come. Without this check every assigned provider
 * shows up every day, so you'd be marking attendance for someone who was never
 * due — which is what was happening.
 *
 * Fail-open on a missing/empty schedule: if the backend can't tell us which days
 * an assignment covers, we'd rather show it than silently hide real work.
 */
const isScheduledToday = (item: TodayProvider): boolean => {
  if (!item.assignment_id) return false;
  const days = item.days_of_week;
  if (!Array.isArray(days) || days.length === 0) return true;
  return days.includes(todayIndex());
};

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
  const statusLabel = (status: AttendanceStatus) =>
    status === "present" ? "Present" : status === "absent" ? "Absent" : "Late";

  const [items, setItems] = useState<TodayProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingId, setMarkingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTodaysProviders();
      const all: TodayProvider[] = Array.isArray(res?.data) ? res.data : [];

      // Only the maids actually due today — see isScheduledToday.
      //
      // Both the maid on leave and her stand-in are shown. Hiding the absent one
      // would leave the resident wondering why a stranger is at the door; naming
      // her, and naming who is covering, is the whole point.
      const list = all.filter(isScheduledToday);
      // Guard against duplicate assignment rows for the same maid: collapse to
      // one card per provider so a backend duplicate can't show twice (or let
      // attendance be marked twice for one person). Merge their services.
      const byProvider = new Map<string, TodayProvider>();
      for (const item of list) {
        const id = item.provider?.id;
        if (!id) continue;
        const existing = byProvider.get(id);
        if (existing) {
          existing.assigned_services = Array.from(
            new Set([...(existing.assigned_services || []), ...(item.assigned_services || [])])
          );
        } else {
          // status stays the attendance mark. on_leave rides alongside it — see
          // the note on AttendanceStatus for why they must not be merged.
          byProvider.set(id, { ...item, status: normalizeStatus(item.status) });
        }
      }
      setItems(Array.from(byProvider.values()));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Reload whenever the host screen regains focus so a backend change (e.g. a
  // removed duplicate assignment) is reflected without restarting the app.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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

  // Loading: a skeleton in the shape of the card that's coming, so the layout
  // doesn't jump. A spinner tells you nothing about what's about to appear.
  if (loading) {
    return (
      <View style={s.card}>
        <View style={s.row}>
          <View style={[s.avatar, s.skeleton]} />
          <View style={s.info}>
            <View style={[s.skeleton, s.skelLine, { width: "55%" }]} />
            <View style={[s.skeleton, s.skelLine, { width: "35%", height: 10, marginTop: 8 }]} />
          </View>
        </View>
        <View style={[s.skeleton, { height: 44, borderRadius: 14, marginTop: 16 }]} />
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[s.card, s.empty]}>
        <View style={s.emptyIcon}>
          <Ionicons name="cafe-outline" size={20} color={theme.textTertiary} />
        </View>
        <Text style={s.emptyTitle}>Nothing scheduled today</Text>
        <Text style={s.emptyText}>Your help isn&apos;t due to visit.</Text>
      </View>
    );
  }

  // Who is standing in for whom. A substitute row names the provider it covers,
  // and being covered is itself proof that person isn't coming — independent of
  // `on_leave`, which only flips for *approved* time-off and so can still read
  // false while a stand-in has already been assigned.
  const coveredBy = new Map<string, string>();
  for (const item of items) {
    const target = item.substitute_for;
    if (!target) continue;
    const name = `${item.provider.first_name} ${item.provider.last_name || ""}`.trim();
    coveredBy.set(target, name);
  }

  return (
    <View style={{ gap: 12 }}>
      {items.map((item, index) => {
        const { provider } = item;
        const img = mediaUrl(provider.profile_image);
        const busy = markingId === provider.id;
        const cover = coveredBy.get(provider.id);
        // Not coming today, for either reason. Both suppress the attendance
        // controls — marking someone present who was never expected is wrong
        // regardless of *why* they were not expected.
        const onLeave = !!item.on_leave || !!cover;
        const fmtTime = item.marked_at
          ? new Date(item.marked_at).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })
          : null;
        return (
          <View key={item.assignment_id ?? `${provider.id}-${index}`} style={s.card}>
            {/* A maid who isn't coming is dimmed — present on the card so the
                resident knows who is off, but visibly not today's business. */}
            <View style={[s.row, onLeave && s.dimmed]}>
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
                  {item.substitute_for_name
                    ? `Covering for ${item.substitute_for_name}`
                    : item.assigned_services?.join(", ") || "Home help"}
                </Text>
              </View>

              {/* Leave outranks the attendance badge in the corner slot: "not
                  expected" is the more important fact. The underlying status is
                  untouched and still whatever the server said. */}
              {onLeave ? (
                <View style={[s.badge, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={[s.badgeText, { color: theme.textSecondary }]}>
                    {item.on_leave ? "On leave" : "Away"}
                  </Text>
                </View>
              ) : item.status ? (
                <View style={[s.badge, { backgroundColor: statusTint(item.status) }]}>
                  <Text style={[s.badgeText, { color: statusColor(item.status) }]}>
                    {statusLabel(item.status)}
                  </Text>
                </View>
              ) : (
                <Text style={s.scheduled}>Scheduled</Text>
              )}
            </View>

            {/* Approved time-off, set by an admin. Terminal: no Mark Present, and
                no tap-to-change — a resident must not be able to record
                attendance for someone who was never expected. The backend would
                accept it. */}
            {onLeave ? (
              <View style={s.amendRow}>
                <Ionicons name="calendar-outline" size={15} color={theme.textTertiary} />
                <Text style={s.amendText}>
                  {cover ? `Not visiting today · ${cover} is covering` : "Not visiting today"}
                </Text>
              </View>
            ) : item.status ? (
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
                  <Text style={[s.actionText, { color: theme.onAccent }]}>Mark Present</Text>
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
    // One border treatment in both themes: on dark the lifted surface alone was
    // too soft to separate the card from the page.
    card: {
      backgroundColor: t.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: t.border,
      padding: 16,
    },

    /* EMPTY */
    empty: { alignItems: "center", paddingVertical: 28 },
    emptyIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: t.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    emptyTitle: {
      fontFamily: fonts.displaySemibold,
      fontSize: 14,
      color: t.text,
      letterSpacing: -0.2,
    },
    emptyText: {
      fontFamily: fonts.displayMedium,
      fontSize: 12.5,
      color: t.textTertiary,
      marginTop: 4,
    },

    /* LOADING */
    skeleton: { backgroundColor: t.surfaceAlt, overflow: "hidden" },
    skelLine: { height: 12, borderRadius: 6 },

    /* CARD */
    row: { flexDirection: "row", alignItems: "center" },
    dimmed: { opacity: 0.55 },
    avatar: { width: 44, height: 44, borderRadius: 14 },
    avatarFallback: { backgroundColor: t.accentTint, alignItems: "center", justifyContent: "center" },
    info: { flex: 1, marginLeft: 12 },
    name: {
      fontFamily: fonts.displayBold,
      fontSize: 15,
      color: t.text,
      letterSpacing: -0.3,
    },
    role: {
      fontFamily: fonts.displayMedium,
      fontSize: 12.5,
      color: t.textTertiary,
      marginTop: 2,
    },
    scheduled: {
      fontFamily: fonts.displaySemibold,
      fontSize: 12,
      color: t.textTertiary,
    },
    badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
    badgeText: { fontFamily: fonts.displayBold, fontSize: 11, letterSpacing: -0.1 },

    /* ACTIONS — primary is filled, secondary is a quiet ghost. The destructive
       reading of "Absent" comes from context, not from colouring it red. */
    actions: { flexDirection: "row", gap: 8, marginTop: 16 },
    actionBtn: {
      flex: 1,
      height: 44,
      borderRadius: 13,
      alignItems: "center",
      justifyContent: "center",
    },
    actionGhost: {
      flex: 0,
      paddingHorizontal: 20,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: t.border,
    },
    actionText: { fontFamily: fonts.displayBold, fontSize: 13.5, letterSpacing: -0.2 },

    amendRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 14 },
    amendText: { fontFamily: fonts.displayMedium, fontSize: 12.5, color: t.textTertiary },
  });
