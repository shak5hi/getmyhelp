import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, StyleSheet, TouchableOpacity, View } from "react-native";
import { Text } from "./Text";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { fonts, radii, spacing } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

export type PopoverAction = {
  key: string;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

/**
 * Three-dot overflow trigger + anchored popover (reference: "Three Dots"
 * panel — a kebab icon opening a floating action card). `hitSlop` keeps the
 * trigger's tap target comfortable even though the icon itself is small.
 */
export default function PopoverMenu({
  actions,
  accessibilityLabel = "More actions",
}: {
  actions: PopoverAction[];
  accessibilityLabel?: string;
}) {
  const { theme } = useTheme();
  const s = useMemo(() => makeStyles(theme), [theme]);
  const [open, setOpen] = useState(false);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: 160 });
  }, [open, progress]);

  const menuStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.85 + 0.15 * progress.value }],
  }));

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        style={s.trigger}
      >
        <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none" onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <View style={s.anchorRow}>
            <Animated.View style={[s.menu, menuStyle]}>
              {actions.map((action, i) => (
                <TouchableOpacity
                  key={action.key}
                  style={[s.item, i === actions.length - 1 && s.itemLast]}
                  onPress={() => {
                    setOpen(false);
                    action.onPress();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                >
                  <Ionicons
                    name={action.icon}
                    size={16}
                    color={action.destructive ? theme.danger : theme.text}
                  />
                  <Text style={[s.itemLabel, action.destructive && { color: theme.danger }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    trigger: {
      width: 32,
      height: 32,
      alignItems: "center",
      justifyContent: "center",
    },
    backdrop: { flex: 1, backgroundColor: "transparent" },
    anchorRow: {
      alignItems: "flex-end",
      paddingTop: 56,
      paddingRight: spacing.lg,
    },
    menu: {
      minWidth: 180,
      backgroundColor: t.card,
      borderRadius: radii.md,
      borderWidth: 1,
      borderColor: t.border,
      paddingVertical: spacing.xs,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: t.divider,
    },
    itemLast: { borderBottomWidth: 0 },
    itemLabel: {
      fontFamily: fonts.medium,
      fontSize: 13.5,
      color: t.text,
    },
  });
