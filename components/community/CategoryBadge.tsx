import React, { useMemo } from "react";
import { fonts } from "../../constants/tokens";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

// Category is an arbitrary label, not a status — per the design language we use a
// single restrained branded chip (readable in both themes) rather than a rainbow
// of hardcoded light-mode pastels that broke in dark mode.
type Props = { category: string };

export function CategoryBadge({ category }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{category}</Text>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      alignSelf: "flex-start",
      backgroundColor: t.accentTint,
    },
    text: {
      fontSize: 10,
      fontFamily: fonts.bold,
      letterSpacing: 0.2,
      color: t.accent,
      textTransform: "uppercase",
    },
  });
