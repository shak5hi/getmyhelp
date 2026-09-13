import { useMemo } from "react";
import { Pressable, StyleSheet, View, ViewStyle } from "react-native";
import { Text } from "./Text";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { fonts, radii, spacing } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

/**
 * One rounded tile in a card grid (reference: "Grid" panel — a rounded
 * 2-column grid of solid tiles). Same press-scale feel as TabBar's items.
 */
export function GridCard({
  icon,
  label,
  badge,
  onPress,
  style,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  badge?: string | number;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withTiming(0.96, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[s.tileWrap, style]}
    >
      <Animated.View style={[s.tile, animStyle]}>
        <View style={s.iconWrap}>
          <Ionicons name={icon} size={19} color={theme.accent} />
        </View>
        <Text style={s.label} numberOfLines={1}>
          {label}
        </Text>
        {badge != null && (
          <View style={s.badge}>
            <Text style={s.badgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

/** Wraps GridCards into a responsive, wrapping row. */
export function CardGrid({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.grid, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    tileWrap: {
      flexBasis: "48%",
      flexGrow: 1,
      minWidth: 150,
    },
    tile: {
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radii.lg,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      gap: spacing.md,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radii.sm + 1,
      backgroundColor: t.accentTint,
      alignItems: "center",
      justifyContent: "center",
    },
    label: {
      fontFamily: fonts.displaySemibold,
      fontSize: 13.5,
      color: t.text,
      letterSpacing: -0.2,
    },
    badge: {
      position: "absolute",
      top: spacing.sm,
      right: spacing.sm,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      paddingHorizontal: 4,
      backgroundColor: t.danger,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: { fontFamily: fonts.displayBold, fontSize: 9, color: "#FFFFFF" },
  });
