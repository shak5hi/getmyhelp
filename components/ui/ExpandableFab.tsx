import { useMemo, useState } from "react";
import { Pressable, StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { Text } from "./Text";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { fonts, radii, spacing } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

export type FabAction = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
};

/**
 * Floating action button (reference: "FAB" panel — a stack of circular
 * mini-buttons fanning up from a corner). With a single action it renders as
 * one pill button (matches the existing dashboard "Ask AI" button); with
 * more than one it fans the extra actions open above the main button.
 */
export default function ExpandableFab({
  actions,
  style,
}: {
  actions: FabAction[];
  style?: ViewStyle;
}) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);

  if (actions.length === 0) return null;
  const primary = actions[0];
  const rest = actions.slice(1);

  const toggle = () => {
    const next = !open;
    setOpen(next);
    progress.value = withSpring(next ? 1 : 0, { damping: 16, stiffness: 200, mass: 0.7 });
  };

  const handlePrimaryPress = () => {
    if (rest.length === 0) {
      primary.onPress();
      return;
    }
    toggle();
  };

  return (
    <>
      {rest.length > 0 && open && (
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={toggle}
          accessibilityLabel="Close actions"
        />
      )}

      <View style={[s.wrap, style]} pointerEvents="box-none">
        {rest.map((action, i) => (
          <MiniAction
            key={action.key}
            theme={theme}
            action={action}
            index={i}
            progress={progress}
            onPress={() => {
              toggle();
              action.onPress();
            }}
          />
        ))}

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePrimaryPress}
          accessibilityRole="button"
          accessibilityLabel={primary.label}
          style={s.primaryShadow}
        >
          <LinearGradient
            colors={theme.accentGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={rest.length > 0 ? s.primaryRound : s.primaryPill}
          >
            <Ionicons
              name={rest.length > 0 && open ? "close" : primary.icon}
              size={rest.length > 0 ? 22 : 16}
              color={theme.onAccent}
            />
            {rest.length === 0 && <Text style={s.primaryLabel}>{primary.label}</Text>}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </>
  );
}

function MiniAction({
  theme,
  action,
  index,
  progress,
  onPress,
}: {
  theme: Theme;
  action: FabAction;
  index: number;
  progress: SharedValue<number>;
  onPress: () => void;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  // Each mini-button stacks 56px above the previous one once fully open.
  const offset = (index + 1) * 56;

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateY: -offset * progress.value },
      { scale: 0.6 + 0.4 * progress.value },
    ],
  }));

  return (
    <Animated.View style={[s.miniWrap, style]} pointerEvents="box-none">
      <View style={s.miniLabelWrap}>
        <Text style={s.miniLabel} numberOfLines={1}>
          {action.label}
        </Text>
      </View>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={action.label}
        style={s.miniButton}
      >
        <Ionicons name={action.icon} size={18} color={theme.accent} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    wrap: {
      position: "absolute",
      right: spacing.xl,
      alignItems: "flex-end",
    },
    primaryShadow: {
      borderRadius: radii.full,
      shadowColor: t.accent,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 14,
      elevation: 8,
    },
    primaryPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      height: 48,
      paddingHorizontal: spacing.xl - 2,
      borderRadius: radii.full,
    },
    primaryRound: {
      width: 56,
      height: 56,
      borderRadius: radii.full,
      alignItems: "center",
      justifyContent: "center",
    },
    primaryLabel: {
      fontFamily: fonts.displayBold,
      fontSize: 14,
      color: t.onAccent,
      letterSpacing: -0.2,
    },
    miniWrap: {
      position: "absolute",
      right: 8,
      bottom: 0,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    miniButton: {
      width: 44,
      height: 44,
      borderRadius: radii.full,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 5,
    },
    miniLabelWrap: {
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
      borderRadius: radii.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
    },
    miniLabel: {
      fontFamily: fonts.displaySemibold,
      fontSize: 11.5,
      color: t.text,
    },
  });
