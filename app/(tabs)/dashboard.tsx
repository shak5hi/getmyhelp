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
import { MODULES } from "../../src/featureRegistry";

// Foreground accents that sit on top of the solid accent surface (banner/FAB).
// Neutral white, not the old warm cream — the accent is now violet→magenta.
const HERO_GLASS = "rgba(255,255,255,0.16)";
const ON_HERO_DIM = "rgba(255,255,255,0.78)";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  useLanguage();

  // Feature flags drive what this screen surfaces. Refresh the set on mount so
  // the right modules show immediately after login.
  const refreshFeatures = useRefreshFeatures();
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
    visitorsEnabled && { label: "Invite Guest", icon: "person-add", onPress: () => router.push("/visitor/invite") },
    ticketsEnabled && { label: "Raise Ticket", icon: "construct", onPress: () => router.push("/society/create-ticket") },
    communityEnabled && { label: "Community", icon: "chatbubbles", onPress: () => router.push("/(tabs)/community") },
    attendanceEnabled && { label: "Attendance", icon: "calendar", onPress: () => router.push("/attendance-history") },
  ].filter(Boolean) as { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      {/* atmospheric warm glow anchored top-right */}
      <LinearGradient
        colors={[theme.accentTint, "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.1, y: 0.55 }}
        style={s.glow}
        pointerEvents="none"
      />

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingTop: insets.top + 14 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* TOP BAR */}
        <Animated.View entering={FadeInDown.duration(450)} style={s.topBar}>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.85} style={s.avatar}>
            {image ? <Image source={{ uri: image }} style={s.avatarImg} /> : <Text style={s.avatarText}>{initials}</Text>}
          </TouchableOpacity>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={s.iconBtn} onPress={() => router.push("/notifications")} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
          </TouchableOpacity>
          <View style={{ width: 10 }} />
          <ThemeToggle />
        </Animated.View>

        {/* GREETING — compact, secondary to the day's actions */}
        <Animated.View entering={FadeInDown.delay(60).duration(500)} style={s.greetBlock}>
          <Text style={s.eyebrow}>{today}</Text>
          <Text style={s.greetLine}>
            {greeting()}, <Text style={s.greetName}>{name}.</Text>
          </Text>
          <View style={s.locRow}>
            <Ionicons name="location-outline" size={13} color={theme.textTertiary} />
            <Text style={s.location} numberOfLines={1}>{location}</Text>
          </View>
        </Animated.View>

        {/* PENDING GATE APPROVAL — the urgent, time-sensitive action, up top */}
        {pendingCount > 0 && (
          <Animated.View entering={FadeInDown.delay(100).duration(450)}>
            <TouchableOpacity
              style={s.pendingBanner}
              activeOpacity={0.85}
              onPress={() => router.push("/notifications")}
            >
              <View style={s.pendingIcon}>
                <Ionicons name="person-add" size={18} color={theme.onAccent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.pendingText}>
                  {pendingCount} {pendingCount > 1 ? "people" : "person"} at the gate
                </Text>
                <Text style={s.pendingSub}>Tap to review and approve</Text>
              </View>
              <Ionicons name="arrow-forward" size={18} color={ON_HERO_DIM} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* TODAY'S HELP — the daily core, now the hero of the screen */}
        {attendanceEnabled && (
        <Animated.View entering={FadeInDown.delay(140).duration(500)}>
          <SectionTitle theme={theme}>Today&apos;s Help</SectionTitle>
          <TodaysHelp />
        </Animated.View>
        )}

        {/* Slim plan-renewal chip — only when actually relevant */}
        {daysRemaining != null && daysRemaining <= 7 && (
          <Animated.View entering={FadeInDown.delay(200).duration(450)}>
            <TouchableOpacity
              style={s.planChip}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/subscriptions")}
            >
              <Ionicons name="card-outline" size={15} color={theme.warning} />
              <Text style={s.planChipText}>
                Plan renews in {daysRemaining} {daysRemaining === 1 ? "day" : "days"}
              </Text>
              <Ionicons name="chevron-forward" size={15} color={theme.warning} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* QUICK ACTIONS — 2×2 grid, secondary (only enabled modules) */}
        {quick.length > 0 && (
        <Animated.View entering={FadeInDown.delay(240).duration(500)} style={{ marginTop: 30 }}>
          <SectionTitle theme={theme}>Quick actions</SectionTitle>
          <View style={s.quickGrid}>
            {quick.map((q) => (
              <TouchableOpacity key={q.label} style={s.quick} activeOpacity={0.8} onPress={q.onPress}>
                <View style={s.quickIcon}>
                  <Ionicons name={q.icon} size={21} color={theme.accent} />
                </View>
                <Text style={s.quickLabel} numberOfLines={1}>{q.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={theme.textTertiary} style={s.quickChevron} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        )}

        <View style={{ height: 56 }} />
      </ScrollView>

      {/* AI ASSISTANT — labelled pill FAB (only when the chatbot module is on) */}
      {chatbotEnabled && (
      <TouchableOpacity
        style={[s.fabWrap, { bottom: insets.bottom + 88 }]}
        activeOpacity={0.9}
        onPress={() => router.push("/(tabs)/chatbot")}
      >
        <LinearGradient colors={theme.accentGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.fab}>
          <Ionicons name="sparkles" size={18} color={theme.onAccent} />
          <Text style={s.fabText}>Ask AI</Text>
        </LinearGradient>
      </TouchableOpacity>
      )}
    </View>
  );
}

function SectionTitle({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={s.sectionRow}>
      <View style={s.sectionBar} />
      <Text style={s.section}>{children}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    scroll: { paddingHorizontal: 20, paddingBottom: 40 },
    glow: { position: "absolute", top: 0, right: 0, left: 0, height: 320 },

    topBar: { flexDirection: "row", alignItems: "center", marginBottom: 22 },
    avatar: {
      width: 46,
      height: 46,
      borderRadius: 16,
      backgroundColor: t.accentTint,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarImg: { width: "100%", height: "100%" },
    avatarText: { fontFamily: fonts.semibold, fontSize: 15, color: t.accent },
    iconBtn: {
      width: 42,
      height: 42,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.surface,
      alignItems: "center",
      justifyContent: "center",
    },

    greetBlock: { marginBottom: 22 },
    eyebrow: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      letterSpacing: 1.4,
      color: t.textTertiary,
      marginBottom: 8,
    },
    greetLine: {
      fontFamily: fonts.serif,
      fontSize: 28,
      lineHeight: 34,
      color: t.text,
      letterSpacing: -0.3,
    },
    greetName: { fontFamily: fonts.serifSemibold, color: t.accent },
    locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
    location: { fontFamily: fonts.regular, fontSize: 12.5, color: t.textSecondary, flexShrink: 1 },

    // Pending gate approval — solid accent surface (urgent, top of content)
    pendingBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: t.accent,
      borderRadius: 18,
      padding: 16,
      marginBottom: 24,
      ...t.heroShadow,
    },
    pendingIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: HERO_GLASS,
      alignItems: "center",
      justifyContent: "center",
    },
    pendingText: { fontFamily: fonts.semibold, fontSize: 15.5, color: t.onAccent, letterSpacing: -0.2 },
    pendingSub: { fontFamily: fonts.regular, fontSize: 12.5, color: ON_HERO_DIM, marginTop: 2 },

    sectionRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 15 },
    sectionBar: { width: 3, height: 17, borderRadius: 2, backgroundColor: t.accent },
    section: { fontFamily: fonts.serifSemibold, fontSize: 19, color: t.text, letterSpacing: -0.2 },

    // Slim plan-renewal chip
    planChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      alignSelf: "flex-start",
      backgroundColor: t.warningTint,
      borderRadius: 999,
      paddingHorizontal: 14,
      paddingVertical: 9,
      marginTop: 18,
    },
    planChipText: { fontFamily: fonts.medium, fontSize: 13, color: t.warning },

    quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
    quick: {
      flexBasis: "47%",
      flexGrow: 1,
      backgroundColor: t.card,
      borderWidth: t.mode === "light" ? 1 : 0,
      borderColor: t.border,
      borderRadius: 20,
      padding: 16,
      ...(t.mode === "light" ? {} : { backgroundColor: t.surface }),
    },
    quickIcon: {
      width: 44,
      height: 44,
      borderRadius: 13,
      backgroundColor: t.accentTint,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 12,
    },
    quickLabel: { fontFamily: fonts.semibold, fontSize: 14, color: t.text, letterSpacing: -0.2 },
    quickChevron: { position: "absolute", top: 18, right: 16 },

    fabWrap: {
      position: "absolute",
      right: 20,
      borderRadius: 26,
      shadowColor: t.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.45,
      shadowRadius: 16,
      elevation: 8,
    },
    fab: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      height: 52,
      paddingHorizontal: 20,
      borderRadius: 26,
    },
    fabText: { fontFamily: fonts.semibold, fontSize: 14.5, color: t.onAccent, letterSpacing: -0.2 },
  });
