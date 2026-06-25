import React from "react";
import { fonts } from "../../constants/tokens";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

// Priority is meaningful, so it maps to the semantic theme tones (which are
// designed for both light & dark) rather than hardcoded light-mode pastels.
const tone = (key: string, t: Theme): { bg: string; text: string } => {
  switch (key) {
    case "high":
    case "urgent":
      return { bg: t.dangerTint, text: t.danger };
    case "low":
      return { bg: t.successTint, text: t.success };
    case "medium":
      return { bg: t.warningTint, text: t.warning };
    default:
      return { bg: t.surfaceAlt, text: t.textSecondary };
  }
};

type Props = { priority: string };

export function PriorityBadge({ priority }: Props) {
  const { theme } = useTheme();
  const key = (priority ?? "normal").toLowerCase();
  const colors = tone(key, theme);
  const label = key.charAt(0).toUpperCase() + key.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  text: {
    fontSize: 10,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
  },
});
