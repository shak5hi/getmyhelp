import React from "react";
import { View, Text, StyleSheet } from "react-native";

type Props = {
  name: string;
  timestamp: string;
};

export function AuthorTag({ name, timestamp }: Props) {
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

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  time: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },
});
