import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fonts, radii, spacing } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

/**
 * Shown when a fetch fails — replaces the old pattern where errors were logged to
 * the console and the screen rendered an identical "empty" state with no recourse.
 * Always offers a retry.
 */
interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryText?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message = "We couldn't load this right now. Check your connection and try again.",
  onRetry,
  retryText = "Try again",
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={30} color={theme.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry} activeOpacity={0.85}>
          <Ionicons name="refresh" size={16} color={theme.onAccent} />
          <Text style={styles.buttonText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: { alignItems: "center", justifyContent: "center", paddingVertical: 64, paddingHorizontal: 32 },
    iconWrap: {
      width: 64,
      height: 64,
      borderRadius: radii.xl,
      backgroundColor: t.surfaceAlt,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.lg,
    },
    title: { fontFamily: fonts.bold, fontSize: 17, color: t.text, textAlign: "center" },
    message: {
      fontFamily: fonts.regular,
      fontSize: 13.5,
      lineHeight: 20,
      color: t.textSecondary,
      textAlign: "center",
      marginTop: 6,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      gap: 7,
      marginTop: spacing.xl,
      height: 44,
      paddingHorizontal: 22,
      borderRadius: radii.full,
      backgroundColor: t.accent,
    },
    buttonText: { fontFamily: fonts.semibold, fontSize: 14, color: t.onAccent },
  });
