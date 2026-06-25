import { useMemo } from "react";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { radii, fonts } from "../constants/tokens";
import { useTheme } from "../src/ThemeContext";
import { Theme } from "../constants/themes";

type Variant = "primary" | "secondary" | "ghost";

export default function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  icon,
  loading = false,
  disabled = false,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: any;
}) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const isPrimary = variant === "primary";
  const tint = isPrimary ? theme.onAccent : theme.accent;

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        isPrimary && styles.primary,
        variant === "secondary" && styles.secondary,
        variant === "ghost" && styles.ghost,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={tint} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={18} color={tint} style={{ marginRight: 8 }} />}
          <Text style={[styles.text, { color: tint }]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    button: {
      height: 54,
      borderRadius: radii.full,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    row: { flexDirection: "row", alignItems: "center" },
    primary: {
      backgroundColor: t.accent,
      shadowColor: t.accent,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 6,
    },
    secondary: {
      backgroundColor: t.accentTint,
    },
    ghost: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: t.border,
    },
    disabled: {
      opacity: 0.5,
    },
    text: {
      fontSize: 16,
      fontFamily: fonts.bold,
      letterSpacing: 0.1,
    },
  });
