import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import config from "../../src/config";
import { useLanguage } from "../../src/LanguageContext";
import { fonts } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import TodaysHelp from "../../components/TodaysHelp";
import ThemeToggle from "../../components/ThemeToggle";
import { getPendingApprovals } from "../../src/api/visitorApi";
import { getMyResidence } from "../../src/api/societyApi";
import { useFeature, useRefreshFeatures } from "../../src/FeatureContext";
import { useNotifications } from "../../src/NotificationContext";
import { MODULES } from "../../src/featureRegistry";

/**
 * Dashboard.
 *
 * Layout follows one rule: the screen answers "what needs me right now?" from
 * the top down. Anything urgent (someone at the gate) outranks the daily core
 * (today's help), which outranks navigation (quick actions).
 *
 * Restraint is deliberate — accent colour is spent only on things that are
 * actionable or urgent, so it keeps its meaning. Everything else is surface,
 * border and type.
 */

// Foreground tones that sit on the solid accent surface (the alert card).
const ON_ACCENT_GLASS = "rgba(255,255,255,0.18)";
const ON_ACCENT_DIM = "rgba(255,255,255,0.80)";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  useLanguage();

  // Feature flags drive what this screen surfaces. Refresh the set on mount so
  // the right modules show immediately after login.
  const refreshFeatures = useRefreshFeatures();
  const { unreadCount } = useNotifications();
  const visitorsEnabled = useFeature(MODULES.visitors);
  const ticketsEnabled = useFeature(MODULES.tickets);
  const communityEnabled = useFeature(MODULES.community);
  const attendanceEnabled = useFeature(MODULES.attendance);
  const chatbotEnabled = useFeature(MODULES.chatbot);
  const subscriptionsEnabled = useFeature(MODULES.subscriptions);

  const [name, setName] = useState("there");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [pendingCount, setPendingCount] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      // Make sure the society's enabled-module set is fresh (e.g. just after login).
      refreshFeatures();
      const token = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      if (!token || !user?.id) return;
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

      const raw =
        (user?.first_name && String(user.first_name).trim()) ||
        (user?.name && String(user.name).trim()) ||
        "there";
      setName(raw.charAt(0).toUpperCase() + raw.slice(1));
      setImage(user?.profile_image || null);

      // Login only caches society_id/tower_id (IDs); the names are nullable and
      // often unpopulated, so resolve them from the ids (see getMyResidence).
      const r = await getMyResidence();
      setLocation(
        [r.societyName, r.towerName, r.flatNumber ? `Flat ${r.flatNumber}` : null]
          .filter(Boolean)
          .join("  ·  ") || "Your home"
      );

      if (visitorsEnabled) {
        try {
          const p = await getPendingApprovals();
          const list = p?.data?.items ?? p?.data ?? p?.items ?? [];
          setPendingCount(Array.isArray(list) ? list.length : 0);
        } catch {}
      } else {
        setPendingCount(0);
      }

      if (subscriptionsEnabled) {
        try {
          const sr = await fetch(`${config.apiUrl}/admin/customers/${user.id}/subscriptions`, { headers });
          const sj = await sr.json();
          const active = sj?.subscriptions?.find((x: any) => x.status === "active") || sj?.subscriptions?.[0];
          setDaysRemaining(active?.days_remaining ?? null);
        } catch {}
      } else {
        setDaysRemaining(null);
      }
    } catch {}
  }, [refreshFeatures, visitorsEnabled, subscriptionsEnabled]);

  useEffect(() => {
    load();
  }, [load]);

  const greeting = () => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  };
  const today = new Date()
    .toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })
    .replace(",", " ·")
    .toUpperCase();
  const initials = name ? name.trim().split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "?";

  const quick: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    visitorsEnabled && { label: "Invite Guest", icon: "person-add-outline", onPress: () => router.push("/visitor/invite") },
    ticketsEnabled && { label: "Raise Ticket", icon: "construct-outline", onPress: () => router.push("/society/create-ticket") },
    communityEnabled && { label: "Community", icon: "chatbubbles-outline", onPress: () => router.push("/(tabs)/community") },
    attendanceEnabled && { label: "Attendance", icon: "calendar-outline", onPress: () => router.push("/attendance-history") },
  ].filter(Boolean) as { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[];

  return (
    <View style={s.root}>
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 8 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER — identity left, utilities right. Nothing else competes here. */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.header}>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            activeOpacity={0.7}
            style={s.avatar}
            accessibilityRole="button"
            accessibilityLabel="Open your profile"
          >
            {image ? <Image source={{ uri: image }} style={s.avatarImg} /> : <Text style={s.avatarText}>{initials}</Text>}
          </TouchableOpacity>

          <View style={s.headerActions}>
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => router.push("/notifications")}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={
                unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"
              }
            >
              <Ionicons name="notifications-outline" size={19} color={theme.textSecondary} />
              {unreadCount > 0 && (
                <View style={s.badge}>
                  <Text style={s.badgeText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <ThemeToggle />
          </View>
        </Animated.View>

        {/* HERO — date, greeting, place. The one moment of large type. */}
        <Animated.View entering={FadeInDown.delay(50).duration(450)} style={s.hero}>
          <Text style={s.eyebrow}>{today}</Text>
          <Text style={s.greeting}>
            {greeting()}, <Text style={s.greetingName}>{name}</Text>
          </Text>

          {!!location && (
            <View style={s.placePill}>
              <Ionicons name="location" size={12} color={theme.textTertiary} />
              <Text style={s.placeText} numberOfLines={1}>{location}</Text>
            </View>
          )}
        </Animated.View>

        {/* ALERT — the only solid-accent surface on the screen, so urgency reads
            instantly. Present only when someone is actually waiting. */}
        {pendingCount > 0 && (
          <Animated.View entering={FadeInDown.delay(90).duration(400)}>
            <TouchableOpacity
              style={s.alert}
              activeOpacity={0.9}
              onPress={() => router.push("/notifications")}
              accessibilityRole="button"
              accessibilityLabel={`${pendingCount} waiting at the gate. Review and approve.`}
            >
              <View style={s.alertIcon}>
                <Ionicons name="person-add" size={17} color={theme.onAccent} />
              </View>
              <View style={s.alertBody}>
                <Text style={s.alertTitle}>
                  {pendingCount} {pendingCount > 1 ? "people" : "person"} at the gate
                </Text>
                <Text style={s.alertSub}>Review and approve</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={ON_ACCENT_DIM} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* TODAY'S HELP — the daily core. */}
        {attendanceEnabled && (
          <Animated.View entering={FadeInDown.delay(130).duration(450)} style={s.section}>
            <SectionHeader
              theme={theme}
              title="Today's help"
              actionLabel="History"
              onAction={() => router.push("/attendance-history")}
            />
            <TodaysHelp />
          </Animated.View>
        )}

        {/* PLAN — a quiet inline notice, not a card. Only when it matters. */}
        {daysRemaining != null && daysRemaining <= 7 && (
          <Animated.View entering={FadeInDown.delay(170).duration(400)}>
            <TouchableOpacity
              style={s.notice}
              activeOpacity={0.7}
              onPress={() => router.push("/(tabs)/subscriptions")}
              accessibilityRole="button"
              accessibilityLabel={`Plan renews in ${daysRemaining} days. Manage subscription.`}
            >
              <View style={s.noticeDot} />
              <Text style={s.noticeText}>
                Plan renews in {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
              </Text>
              <Ionicons name="chevron-forward" size={14} color={theme.textTertiary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* QUICK ACTIONS — flat tiles. No chevrons: the whole tile is the target,
            and four arrows pointing nowhere in particular is just noise. */}
        {quick.length > 0 && (
          <Animated.View entering={FadeInDown.delay(210).duration(450)} style={s.section}>
            <SectionHeader theme={theme} title="Quick actions" />
            <View style={s.grid}>
              {quick.map((q) => (
                <TouchableOpacity
                  key={q.label}
                  style={s.tile}
                  activeOpacity={0.7}
                  onPress={q.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={q.label}
                >
                  <View style={s.tileIcon}>
                    <Ionicons name={q.icon} size={19} color={theme.accent} />
                  </View>
                  <Text style={s.tileLabel} numberOfLines={1}>{q.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Clearance for the floating tab bar + FAB. */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* AI ASSISTANT — only when the chatbot module is on. */}
      {chatbotEnabled && (
        <TouchableOpacity
          style={[s.fabWrap, { bottom: insets.bottom + 88 }]}
          activeOpacity={0.9}
          onPress={() => router.push("/(tabs)/chatbot")}
          accessibilityRole="button"
          accessibilityLabel="Ask the AI assistant"
        >
          <LinearGradient
            colors={theme.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.fab}
          >
            <Ionicons name="sparkles" size={16} color={theme.onAccent} />
            <Text style={s.fabText}>Ask AI</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

/**
 * Section header. Title carries the weight; the optional action is a quiet text
 * link rather than a button, so it never competes with the content beneath it.
 */
function SectionHeader({
  theme,
  title,
  actionLabel,
  onAction,
}: {
  theme: Theme;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          onPress={onAction}
          activeOpacity={0.6}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={s.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

/* 8px rhythm throughout. Values below are all multiples of 4/8. */
const makeStyles = (t: Theme) =>
  StyleSheet.create({
    root: { flex: 1, backgroundColor: t.bg },
    scroll: { paddingHorizontal: 20, paddingBottom: 32 },

    /* HEADER */
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 32,
    },
    headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: t.accentTint,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImg: { width: "100%", height: "100%" },
    avatarText: { fontFamily: fonts.displayBold, fontSize: 14, color: t.accent },
    iconBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      alignItems: "center",
      justifyContent: "center",
    },
    badge: {
      position: "absolute",
      top: -3,
      right: -3,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      paddingHorizontal: 3,
      backgroundColor: t.danger,
      alignItems: "center",
      justifyContent: "center",
      // Ringed in the page colour so it reads as lifted off the button.
      borderWidth: 2,
      borderColor: t.bg,
    },
    badgeText: { fontFamily: fonts.displayBold, fontSize: 9, color: "#FFFFFF" },

    /* HERO */
    // No bottom margin: whatever follows owns the gap. Otherwise the hero's
    // margin and the next section's stack into a 60px void when there is no
    // gate alert sitting between them.
    hero: { marginBottom: 0 },
    eyebrow: {
      fontFamily: fonts.displaySemibold,
      fontSize: 10.5,
      letterSpacing: 1.2,
      color: t.textTertiary,
      marginBottom: 10,
    },
    greeting: {
      fontFamily: fonts.displayMedium,
      fontSize: 27,
      lineHeight: 34,
      color: t.textSecondary,
      letterSpacing: -0.7,
    },
    // Only the name is full-strength — the greeting itself is a courtesy, the
    // name is the thing being said.
    greetingName: { fontFamily: fonts.displayExtrabold, color: t.text },
    placePill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      alignSelf: "flex-start",
      marginTop: 14,
      paddingLeft: 8,
      paddingRight: 12,
      paddingVertical: 6,
      borderRadius: 999,
      backgroundColor: t.surfaceAlt,
    },
    placeText: {
      fontFamily: fonts.displayMedium,
      fontSize: 12,
      color: t.textSecondary,
      flexShrink: 1,
    },

    /* ALERT */
    alert: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: t.accent,
      borderRadius: 16,
      padding: 14,
      marginTop: 24,
      ...t.heroShadow,
    },
    alertIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: ON_ACCENT_GLASS,
      alignItems: "center",
      justifyContent: "center",
    },
    alertBody: { flex: 1 },
    alertTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 15,
      color: t.onAccent,
      letterSpacing: -0.3,
    },
    alertSub: {
      fontFamily: fonts.displayMedium,
      fontSize: 12,
      color: ON_ACCENT_DIM,
      marginTop: 2,
    },

    /* SECTIONS */
    section: { marginTop: 24 },
    sectionHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 14,
    },
    // No decorative bar. Weight and spacing do the work a coloured tick was
    // doing badly.
    sectionTitle: {
      fontFamily: fonts.displayBold,
      fontSize: 16,
      color: t.text,
      letterSpacing: -0.3,
    },
    sectionAction: {
      fontFamily: fonts.displaySemibold,
      fontSize: 13,
      color: t.accent,
      letterSpacing: -0.1,
    },

    /* PLAN NOTICE */
    notice: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginTop: 16,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: t.surfaceAlt,
    },
    noticeDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: t.warning,
    },
    noticeText: {
      flex: 1,
      fontFamily: fonts.displayMedium,
      fontSize: 13,
      color: t.textSecondary,
      letterSpacing: -0.1,
    },

    /* QUICK ACTIONS */
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
    tile: {
      // Two per row with an 8px gutter, and it degrades gracefully to one wide
      // tile when a society has a single module enabled.
      flexBasis: "48%",
      flexGrow: 1,
      minWidth: 150,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: 14,
      gap: 12,
    },
    tileIcon: {
      width: 36,
      height: 36,
      borderRadius: 11,
      backgroundColor: t.accentTint,
      alignItems: "center",
      justifyContent: "center",
    },
    tileLabel: {
      fontFamily: fonts.displaySemibold,
      fontSize: 13.5,
      color: t.text,
      letterSpacing: -0.2,
    },

    /* FAB */
    fabWrap: {
      position: "absolute",
      right: 20,
      borderRadius: 24,
      shadowColor: t.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
    },
    fab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      height: 48,
      paddingHorizontal: 18,
      borderRadius: 24,
    },
    fabText: {
      fontFamily: fonts.displayBold,
      fontSize: 14,
      color: t.onAccent,
      letterSpacing: -0.2,
    },
  });
