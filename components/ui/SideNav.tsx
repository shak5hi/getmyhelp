import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { fonts, radii, spacing } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import { useResponsive } from "../../src/useResponsive";

/** Rail width at each breakpoint — exported so the layout can reserve
 *  matching space via `sceneContainerStyle` (the tab navigator stacks its
 *  custom `tabBar` below the scene by default; docking it to the side
 *  instead means positioning it absolutely and margining the scene). */
export const SIDE_NAV_WIDTH = { tablet: 84, desktop: 220 };

/**
 * Persistent vertical nav for tablet/desktop widths (reference: "Side Menu" /
 * "Rectangular" panels — a rounded rail docked to one edge). Reads the exact
 * same filtered `routes`/`descriptors` as `TabBar`, so `href: null`
 * feature-gating and navigation behave identically — only the chrome differs.
 * Icon-only rail at `tablet` width, labeled at `desktop` width.
 */
export default function SideNav({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { breakpoint } = useResponsive();
  const expanded = breakpoint === "desktop";
  const s = useMemo(() => makeStyles(theme, expanded), [theme, expanded]);

  const routes = state.routes.filter((route) => {
    const style = descriptors[route.key]?.options?.tabBarItemStyle as
      | { display?: string }
      | undefined;
    return style?.display !== "none";
  });

  return (
    <View
      style={[s.rail, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}
    >
      {routes.map((route) => {
        const { options } = descriptors[route.key];
        const focused = route.key === state.routes[state.index]?.key;
        const label = (options.title ?? route.name) as string;
        const color = focused ? theme.accent : theme.textTertiary;

        const onPress = () => {
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={label}
            style={[s.item, focused && s.itemActive]}
          >
            {options.tabBarIcon?.({ focused, color, size: 20 })}
            {expanded && (
              <Text style={[s.label, { color }]} numberOfLines={1}>
                {label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const makeStyles = (t: Theme, expanded: boolean) =>
  StyleSheet.create({
    rail: {
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: expanded ? SIDE_NAV_WIDTH.desktop : SIDE_NAV_WIDTH.tablet,
      backgroundColor: t.surface,
      borderRightWidth: 1,
      borderRightColor: t.border,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      height: 48,
      borderRadius: radii.md,
      paddingHorizontal: expanded ? spacing.md : 0,
      justifyContent: expanded ? "flex-start" : "center",
    },
    itemActive: {
      backgroundColor: t.accentTint,
    },
    label: {
      fontFamily: fonts.displaySemibold,
      fontSize: 13.5,
      letterSpacing: -0.1,
    },
  });
