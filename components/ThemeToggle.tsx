import React, { useRef } from "react";
import { Pressable, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../src/ThemeContext";

/**
 * Premium light/dark toggle. Spins + cross-fades the sun/moon on press (250ms).
 */
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const spin = useRef(new Animated.Value(0)).current;
  const isDark = theme.mode === "dark";

  const onPress = () => {
    spin.setValue(0);
    Animated.timing(spin, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
    toggle();
  };

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityLabel={isDark ? "Switch to light theme" : "Switch to dark theme"}
      style={[styles.btn, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Animated.View style={{ transform: [{ rotate }] }}>
        <Ionicons
          name={isDark ? "moon" : "sunny"}
          size={20}
          color={theme.text}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
