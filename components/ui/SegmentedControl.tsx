import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { radii, fonts, shadows } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

/**
 * Pill segmented control (Active | Deactivate style).
 * Presentation only — the parent owns the selected state and handler.
 */
export default function SegmentedControl({
  segments,
  value,
  onChange,
  style,
}: {
  segments: string[];
  value: number;
  onChange: (index: number) => void;
  style?: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={[styles.track, style]}>
      {segments.map((label, i) => {
        const active = i === value;
        return (
          <Pressable
            key={label}
            style={[styles.segment, active && styles.segmentActive]}
            onPress={() => onChange(i)}
            hitSlop={4}
          >
            <Text
              style={[styles.label, active ? styles.labelActive : styles.labelInactive]}
              numberOfLines={1}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    track: {
      flexDirection: "row",
      backgroundColor: t.surfaceAlt,
      borderRadius: radii.full,
      padding: 4,
    },
    segment: {
      flex: 1,
      paddingVertical: 11,
      borderRadius: radii.full,
      alignItems: "center",
      justifyContent: "center",
    },
    segmentActive: {
      backgroundColor: t.card,
      ...(t.mode === "light" ? shadows.sm : {}),
    },
    label: {
      fontSize: 13.5,
    },
    labelActive: {
      fontFamily: fonts.bold,
      color: t.text,
    },
    labelInactive: {
      fontFamily: fonts.medium,
      color: t.textTertiary,
    },
  });
