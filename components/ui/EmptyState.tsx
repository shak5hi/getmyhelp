import React, { useMemo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Text } from "./Text";
import { Ionicons } from "@expo/vector-icons";
import { fonts, radii, spacing } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon = "document-text-outline",
  actionText,
  onAction,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={30} color={theme.textTertiary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{actionText}</Text>
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
      marginTop: spacing.xl,
      height: 44,
      paddingHorizontal: 22,
      borderRadius: radii.full,
      backgroundColor: t.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonText: { fontFamily: fonts.semibold, fontSize: 14, color: t.onAccent },
  });
