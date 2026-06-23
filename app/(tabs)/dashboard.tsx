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

type SummaryLine = { icon: keyof typeof Ionicons.glyphMap; text: string; onPress?: () => void };

// translucent foregrounds that always sit on the terracotta gradient hero
const ON_HERO = "rgba(255,250,245,0.95)";
const ON_HERO_DIM = "rgba(255,247,240,0.70)";
const HERO_GLASS = "rgba(255,255,255,0.16)";

export default function DashboardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  useLanguage();

  const [name, setName] = useState("there");
  const [image, setImage] = useState<string | null>(null);
  const [location, setLocation] = useState("");
  const [assignmentsCount, setAssignmentsCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
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
      setLocation(
        [user?.society_name, user?.tower_name, user?.flat_number ? `Flat ${user.flat_number}` : null]
          .filter(Boolean)
          .join("  ·  ") || "Your home"
      );

      try {
        const r = await fetch(`${config.apiUrl}/customer/assignments`, { headers });
        const j = await r.json();
        setAssignmentsCount(Array.isArray(j?.data) ? j.data.length : 0);
      } catch {}

      try {
        const p = await getPendingApprovals();
        const list = p?.data?.items ?? p?.data ?? p?.items ?? [];
        setPendingCount(Array.isArray(list) ? list.length : 0);
      } catch {}

      try {
        const sr = await fetch(`${config.apiUrl}/admin/customers/${user.id}/subscriptions`, { headers });
        const sj = await sr.json();
        const active = sj?.subscriptions?.find((x: any) => x.status === "active") || sj?.subscriptions?.[0];
        setDaysRemaining(active?.days_remaining ?? null);
      } catch {}
    } catch {}
  }, []);

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

  const summary: SummaryLine[] = [];
  if (assignmentsCount > 0) summary.push({ icon: "sparkles-outline", text: "Home help scheduled today" });
  if (pendingCount > 0)
    summary.push({
      icon: "person-add-outline",
      text: `${pendingCount} visitor approval${pendingCount > 1 ? "s" : ""} pending`,
      onPress: () => router.push("/(tabs)/visitors"),
    });
  if (daysRemaining != null && daysRemaining <= 7)
    summary.push({
      icon: "card-outline",
      text: `Plan renews in ${daysRemaining} days`,
      onPress: () => router.push("/(tabs)/subscriptions"),
    });

  const quick: { label: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }[] = [
    { label: "Invite Visitor", icon: "person-add", onPress: () => router.push("/(tabs)/visitors") },
    { label: "Raise Ticket", icon: "construct", onPress: () => router.push("/society/create-ticket") },
    { label: "Community", icon: "chatbubbles", onPress: () => router.push("/(tabs)/community") },
    { label: "Attendance", icon: "calendar", onPress: () => router.push("/attendance-history") },
  ];

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

        {/* GREETING — editorial serif */}
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

        {/* TODAY HERO — terracotta gradient */}
        <Animated.View entering={FadeInDown.delay(120).duration(500)}>
          <LinearGradient
            colors={theme.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.hero}
          >
            <View style={s.heroCircle} pointerEvents="none" />
            <View style={s.heroCircleSm} pointerEvents="none" />
            <Text style={s.heroLabel}>TODAY</Text>
            {summary.length === 0 ? (
              <View style={{ marginTop: 10 }}>
                <Text style={s.heroBig}>You&apos;re all caught up.</Text>
                <Text style={s.heroSub}>Nothing needs your attention right now. Enjoy the calm. ☀️</Text>
              </View>
            ) : (
              <View style={{ gap: 12, marginTop: 16 }}>
                {summary.map((line, i) => (
                  <TouchableOpacity
                    key={i}
                    disabled={!line.onPress}
                    onPress={line.onPress}
                    activeOpacity={0.7}
                    style={s.heroLine}
                  >
                    <View style={s.heroDot}>
                      <Ionicons name={line.icon} size={15} color={theme.onAccent} />
                    </View>
                    <Text style={s.heroText} numberOfLines={1}>{line.text}</Text>
                    {line.onPress && <Ionicons name="arrow-forward" size={16} color={ON_HERO_DIM} />}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* TODAY'S HELP */}
        <Animated.View entering={FadeInDown.delay(180).duration(500)}>
          <SectionTitle theme={theme}>Today&apos;s Help</SectionTitle>
          <TodaysHelp />
        </Animated.View>

        {/* QUICK ACTIONS — 2×2 grid */}
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

        <View style={{ height: 56 }} />
      </ScrollView>

      {/* AI ASSISTANT — labelled pill FAB */}
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

    greetBlock: { marginBottom: 24 },
    eyebrow: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      letterSpacing: 1.4,
      color: t.textTertiary,
      marginBottom: 8,
    },
    greetLine: {
      fontFamily: fonts.serif,
      fontSize: 30,
      lineHeight: 36,
      color: t.text,
      letterSpacing: -0.3,
    },
    greetName: { fontFamily: fonts.serifSemibold, color: t.accent },
    locRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 8 },
    location: { fontFamily: fonts.regular, fontSize: 12.5, color: t.textSecondary, flexShrink: 1 },

    hero: {
      borderRadius: 28,
      padding: 24,
      marginBottom: 34,
      overflow: "hidden",
      ...t.heroShadow,
    },
    heroCircle: {
      position: "absolute",
      top: -54,
      right: -34,
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: "rgba(255,255,255,0.10)",
    },
    heroCircleSm: {
      position: "absolute",
      bottom: -30,
      right: 44,
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.07)",
    },
    heroLabel: {
      fontFamily: fonts.semibold,
      fontSize: 11,
      letterSpacing: 2,
      color: ON_HERO_DIM,
    },
    heroBig: {
      fontFamily: fonts.serifSemibold,
      fontSize: 24,
      lineHeight: 30,
      color: ON_HERO,
      letterSpacing: -0.3,
    },
    heroSub: {
      fontFamily: fonts.regular,
      fontSize: 13.5,
      lineHeight: 19,
      color: ON_HERO_DIM,
      marginTop: 7,
    },
    heroLine: { flexDirection: "row", alignItems: "center", gap: 12 },
    heroDot: {
      width: 32,
      height: 32,
      borderRadius: 11,
      backgroundColor: HERO_GLASS,
      alignItems: "center",
      justifyContent: "center",
    },
    heroText: { flex: 1, fontFamily: fonts.medium, fontSize: 15, color: ON_HERO },

    sectionRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 15 },
    sectionBar: { width: 3, height: 17, borderRadius: 2, backgroundColor: t.accent },
    section: { fontFamily: fonts.serifSemibold, fontSize: 19, color: t.text, letterSpacing: -0.2 },

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
    // (quick labels already 14 — comfortably above the a11y floor)
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
