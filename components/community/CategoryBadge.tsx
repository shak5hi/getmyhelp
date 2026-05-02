import React from "react";
import { View, Text, StyleSheet } from "react-native";

const PALETTE: { bg: string; text: string }[] = [
  { bg: "#EDE9FE", text: "#6D28D9" },
  { bg: "#DBEAFE", text: "#1D4ED8" },
  { bg: "#D1FAE5", text: "#065F46" },
  { bg: "#FEF3C7", text: "#92400E" },
  { bg: "#FCE7F3", text: "#9D174D" },
  { bg: "#E0F2FE", text: "#075985" },
];

const pickColor = (s: string) =>
  PALETTE[
    Math.abs((s ?? "").split("").reduce((a, c) => a + c.charCodeAt(0), 0)) %
      PALETTE.length
  ];

type Props = { category: string };

export function CategoryBadge({ category }: Props) {
  const colors = pickColor(category);
  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.text, { color: colors.text }]}>{category}</Text>
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
