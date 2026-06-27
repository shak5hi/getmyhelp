import React, { useMemo } from "react";
import { fonts } from "../../constants/tokens";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";

type Props = {
  name: string;
  timestamp: string;
};

export function AuthorTag({ name, timestamp }: Props) {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const initials = name
    ? name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  const timeStr = (() => {
    try {
      return new Date(timestamp).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return timestamp;
    }
  })();

  return (
    <View style={styles.container}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View>
        <Text style={styles.name}>{name || "Unknown"}</Text>
        <Text style={styles.time}>{timeStr}</Text>
      </View>
    </View>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: t.accent,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: {
      color: t.onAccent,
      fontSize: 13,
      fontFamily: fonts.bold,
    },
    name: {
      fontSize: 14,
      fontFamily: fonts.semibold,
      color: t.text,
    },
    time: {
      fontSize: 12,
      color: t.textTertiary,
      marginTop: 1,
    },
  });
