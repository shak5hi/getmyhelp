import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../src/api/communityApi";
import { useNotifications } from "../src/NotificationContext";
import { radii, shadows, fonts } from "../constants/tokens";
import { useTheme } from "../src/ThemeContext";
import { Theme } from "../constants/themes";

/**
 * The API sends naive UTC timestamps ("2026-07-11T10:30:00") with no offset.
 * ECMAScript parses a date-time with no timezone as *local*, so in IST every
 * timestamp read as 5h30m earlier than it was — a notification that just landed
 * showed as "5h ago". Pin it to UTC when the string carries no zone of its own.
 */
const parseServerDate = (s: string): number => {
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/i.test(s.trim());
  return new Date(hasZone ? s : `${s.trim()}Z`).getTime();
};

const formatRelative = (s: string) => {
  try {
    const t = parseServerDate(s);
    if (!Number.isFinite(t)) return "";
    // Clock skew between server and phone can make a fresh row look faintly
    // in the future; clamp so it never renders as a negative age.
    const diff = Math.max(0, (Date.now() - t) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  } catch {
    return "";
  }
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { decrement, clear } = useNotifications();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [localUnread, setLocalUnread] = useState(0);
  const skipRef = useRef(0);

  const load = useCallback(async (reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    const skip = reset ? 0 : skipRef.current;
    try {
      const res = await listNotifications(skip, 30);
      const items =
        res?.data?.notifications ?? res?.notifications ?? res?.data ?? [];
      const total = res?.data?.total ?? res?.total ?? 0;
      const unread = res?.data?.unread_count ?? res?.unread_count ?? 0;
      setLocalUnread(unread);
      if (reset) {
        setNotifications(items);
        skipRef.current = items.length;
      } else {
        setNotifications((prev) => [...prev, ...items]);
        skipRef.current += items.length;
      }
      setHasMore(skipRef.current < total);
    } catch {}
    finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    load(true);
  }, [load]);

  const handlePress = async (item: any) => {
    if (!item.is_read) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n))
      );
      setLocalUnread((c) => Math.max(0, c - 1));
      decrement();
      try { await markNotificationRead(item.id); } catch {}
    }
    if (item.link_type === "forum_post") {
      router.push(`/community/forum-thread?id=${item.link_id}`);
    } else if (item.link_type === "announcement") {
      router.push(`/community/announcement-detail?id=${item.link_id}`);
    } else if (
      item.link_type === "visitor" ||
      item.type === "visitor_approval_request"
    ) {
      router.push(`/visitor/resident-detail?id=${item.link_id}`);
    } else if (
      item.link_type === "subscription" ||
      item.type === "subscription_request"
    ) {
      router.push("/(tabs)/subscriptions");
    } else if (
      item.link_type === "provider" ||
      item.type === "provider_assigned" ||
      item.type === "provider_reassigned"
    ) {
      // No provider-detail screen exists. The dashboard hosts TodaysHelp, which
      // answers the question the notification actually raises — who is coming
      // today. link_id (the ServiceProvider id) is carried on the payload, so
      // pointing this at a detail screen later is a one-line change.
      router.push("/(tabs)/dashboard");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setLocalUnread(0);
      clear();
    } catch {}
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.card, !item.is_read && styles.cardUnread]}
      onPress={() => handlePress(item)}
      activeOpacity={0.7}
    >
      {!item.is_read && <View style={styles.unreadDot} />}
      <View style={{ flex: 1, paddingRight: 8 }}>
        <Text
          style={[styles.title, !item.is_read && styles.titleUnread]}
          numberOfLines={2}
        >
          {item.title ?? item.subject ?? "Notification"}
        </Text>
        {!!item.body && (
          <Text style={styles.body} numberOfLines={2}>
            {item.body}
          </Text>
        )}
        <Text style={styles.time}>{formatRelative(item.created_at ?? "")}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView edges={["bottom"]} style={styles.container}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <FlatList
        data={notifications}
        keyExtractor={(item, i) =>
          item?.id != null ? String(item.id) : `notif-${i}`
        }
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          localUnread > 0 ? (
            <TouchableOpacity style={styles.markAllBtn} onPress={handleMarkAllRead}>
              <Text style={styles.markAllText}>Mark all as read</Text>
            </TouchableOpacity>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-off-outline" size={48} color={theme.textTertiary} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        onEndReached={() => {
          if (hasMore && !loadingMore) load();
        }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator style={{ padding: 16 }} color={theme.accent} />
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: t.card,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    ...shadows.sm,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: t.accent,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: t.accent,
    marginRight: 10,
    flexShrink: 0,
  },
  title: {
    fontSize: 14,
    fontFamily: fonts.medium,
    color: t.textSecondary,
    marginBottom: 3,
  },
  titleUnread: {
    fontFamily: fonts.bold,
    color: t.text,
  },
  body: {
    fontSize: 13,
    color: t.textSecondary,
    lineHeight: 18,
    marginBottom: 5,
  },
  time: {
    fontSize: 12,
    color: t.textTertiary,
    fontFamily: fonts.medium,
  },
  markAllBtn: {
    paddingVertical: 10,
    alignItems: "flex-end",
    marginBottom: 4,
  },
  markAllText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    color: t.accent,
  },
  empty: {
    alignItems: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: t.textTertiary,
    fontFamily: fonts.medium,
  },
});
