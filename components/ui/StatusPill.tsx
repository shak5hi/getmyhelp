import { useMemo } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { fonts, radii } from "../../constants/tokens";

/**
 * One themed status pill for the whole app. Conveys state with **an icon AND a
 * label** (never colour alone — the a11y fix from the review) and draws its tint
 * from the theme so it reads correctly in both light and dark. Replaces the
 * per-screen hardcoded light-mode status hex.
 */
export type StatusTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_ICON: Record<StatusTone, keyof typeof Ionicons.glyphMap> = {
  success: "checkmark-circle",
  warning: "time",
  danger: "close-circle",
  info: "ellipse",
  neutral: "remove-circle",
};

const tonePalette = (t: Theme, tone: StatusTone) => {
  switch (tone) {
    case "success": return { bg: t.successTint, fg: t.success };
    case "warning": return { bg: t.warningTint, fg: t.warning };
    case "danger": return { bg: t.dangerTint, fg: t.danger };
    case "info": return { bg: t.accentTint, fg: t.accent };
    default: return { bg: t.surfaceAlt, fg: t.textSecondary };
  }
};

export function StatusPill({
  tone,
  label,
  icon,
  style,
}: {
  tone: StatusTone;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const { bg, fg } = tonePalette(theme, tone);
  return (
    <View style={[s.pill, { backgroundColor: bg }, style]}>
      <Ionicons name={icon ?? TONE_ICON[tone]} size={12} color={fg} />
      <Text style={[s.label, { color: fg }]} numberOfLines={1}>{label}</Text>
    </View>
  );
}

// Map a free-text ticket status string to a tone.
export function ticketStatusTone(status?: string): StatusTone {
  const s = (status || "").toLowerCase();
  if (s.includes("progress")) return "warning";
  if (s.includes("resolved")) return "success";
  if (s.includes("reject") || s.includes("cancel")) return "danger";
  if (s.includes("closed")) return "neutral";
  return "info"; // open / new
}

// Map a visitor lifecycle status (pending/approved/checked_in/…) to a tone.
export function visitorStatusTone(status?: string): StatusTone {
  switch ((status || "").toLowerCase()) {
    case "approved": return "success";
    case "pending": return "warning";
    case "rejected": return "danger";
    case "checked_in": return "info";
    default: return "neutral"; // checked_out / expired / unknown
  }
}

const makeStyles = (_t: Theme) =>
  StyleSheet.create({
    pill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      borderRadius: radii.full,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: "flex-start",
    },
    label: { fontFamily: fonts.semibold, fontSize: 12, letterSpacing: 0.1 },
  });
