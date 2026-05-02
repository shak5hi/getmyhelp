import React from "react";
import { View, Text, StyleSheet } from "react-native";

const COLORS: Record<string, { bg: string; text: string }> = {
  high:   { bg: "#FEE2E2", text: "#991B1B" },
  medium: { bg: "#FEF3C7", text: "#92400E" },
  low:    { bg: "#D1FAE5", text: "#065F46" },
  urgent: { bg: "#FEE2E2", text: "#991B1B" },
  normal: { bg: "#DBEAFE", text: "#1D4ED8" },
};

type Props = { priority: string };

export function PriorityBadge({ priority }: Props) {
  const key = (priority ?? "normal").toLowerCase();
  const colors = COLORS[key] ?? COLORS.normal;
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
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
