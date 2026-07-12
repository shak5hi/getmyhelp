import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Text } from "./Text";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { fonts } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

/**
 * Floating tab bar.
 *
 * A single accent pill slides between items rather than each icon changing
 * colour on its own — one moving object is easier to track than five static
 * states, and it makes the selection read as a place you are rather than a
 * colour you happen to be.
 *
 * Routing note: expo-router implements `href: null` (a disabled feature module)
 * by setting `tabBarItemStyle: { display: "none" }` on the descriptor. A custom
 * bar has to honour that itself, or disabled modules reappear in the bar.
 */
export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(theme), [theme]);

  // Only the routes that are actually navigable for this society.
  const routes = state.routes.filter((route) => {
    const style = descriptors[route.key]?.options?.tabBarItemStyle as
      | { display?: string }
      | undefined;
    return style?.display !== "none";
  });

  const activeIndex = routes.findIndex(
    (route) => route.key === state.routes[state.index]?.key
  );

  const [barWidth, setBarWidth] = useState(0);
  const itemWidth = routes.length > 0 ? barWidth / routes.length : 0;

  const pillX = useSharedValue(0);
  const pillStyle = useAnimatedStyle(() => ({
    width: itemWidth,
    transform: [{ translateX: pillX.value }],
  }));

  // Drive the pill from the active index. Spring, not linear — the settle is
  // what makes it feel responsive rather than mechanical. In an effect, not the
  // render body: writing a shared value while rendering is a side effect, and
  // it re-animates on every unrelated re-render.
  useEffect(() => {
    if (itemWidth > 0 && activeIndex >= 0) {
      pillX.value = withSpring(activeIndex * itemWidth, {
        damping: 20,
        stiffness: 180,
        mass: 0.6,
      });
    }
  }, [activeIndex, itemWidth, pillX]);

  return (
    <View
      style={[s.wrap, { bottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <View
        style={s.bar}
        onLayout={(e) => setBarWidth(e.nativeEvent.layout.width - 8)}
      >
        {/* The selection. Sits under the items so labels stay legible. */}
        {itemWidth > 0 && activeIndex >= 0 && (
          <Animated.View style={[s.pill, pillStyle]} pointerEvents="none" />
        )}

        {routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const focused = index === activeIndex;
          const label = (options.title ?? route.name) as string;
          const color = focused ? theme.accent : theme.textTertiary;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: "tabLongPress", target: route.key });
          };

          return (
            <TabItem
              key={route.key}
              theme={theme}
              focused={focused}
              label={label}
              color={color}
              icon={options.tabBarIcon?.({ focused, color, size: 22 })}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

/**
 * One tab. Presses scale the content down a touch — the whole item is the
 * target, so the feedback has to come from the content, not a ripple.
 */
function TabItem({
  theme,
  focused,
  label,
  color,
  icon,
  onPress,
  onLongPress,
}: {
  theme: Theme;
  focused: boolean;
  label: string;
  color: string;
  icon: React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const s = useMemo(() => makeStyles(theme), [theme]);
  const scale = useSharedValue(1);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      style={s.item}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        scale.value = withTiming(0.92, { duration: 120 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={label}
      // A 44pt target is the accessibility floor; the bar is 60 tall so the
      // whole column already clears it.
      hitSlop={4}
    >
      <Animated.View style={[s.itemInner, style]}>
        {icon}
        <Text
          style={[
            s.label,
            { color },
            focused && { fontFamily: fonts.displayBold },
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

const makeStyles = (t: Theme) => {
  const isLight = t.mode === "light";
  return StyleSheet.create({
    wrap: {
      position: "absolute",
      left: 0,
      right: 0,
      alignItems: "center",
    },
    bar: {
      flexDirection: "row",
      alignItems: "center",
      width: "92%",
      maxWidth: 440,
      height: 60,
      padding: 4,
      borderRadius: 22,
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.border,
      // One soft shadow, tinted in light mode so it reads as depth rather than
      // dirt. Heavy drop-shadows are the fastest way to look dated.
      shadowColor: isLight ? "#3B2A6B" : "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: isLight ? 0.1 : 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
    pill: {
      position: "absolute",
      left: 4,
      top: 4,
      bottom: 4,
      borderRadius: 18,
      backgroundColor: t.accentTint,
    },
    item: {
      flex: 1,
      height: "100%",
      alignItems: "center",
      justifyContent: "center",
    },
    itemInner: {
      alignItems: "center",
      justifyContent: "center",
      gap: 3,
    },
    label: {
      fontFamily: fonts.displayMedium,
      fontSize: 10.5,
      letterSpacing: -0.1,
      includeFontPadding: false,
    },
  });
};
