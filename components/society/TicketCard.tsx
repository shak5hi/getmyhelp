import React from "react";
import { View, Text, Pressable } from "react-native";
import { societyStyles as styles } from "../../styles/society.styles";

interface TicketProps {
  id: string;
  title: string;
  status: "Open" | "In Progress" | "Closed" | "Resolved";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  type?: "common" | "private";
  onPress: () => void;
}

const STATUS_CONFIG: Record<string, { bg: string; text: string }> = {
  "Open":        { bg: "#F3F4F6", text: "#374151" },
  "In Progress": { bg: "#FEF3C7", text: "#92400E" },
  "Resolved":    { bg: "#D1FAE5", text: "#065F46" },
  "Closed":      { bg: "#F3F4F6", text: "#6B7280" },
};

const PRIORITY_DOT_COLOR: Record<string, string> = {
  "High":   "#F87171",
  "Medium": "#FCD34D",
  "Low":    "#34D399",
};

export const TicketCard: React.FC<TicketProps> = ({
  id,
  title,
  status,
  priority,
  createdAt,
  onPress,
}) => {
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG["Closed"];
  const dotColor = PRIORITY_DOT_COLOR[priority] ?? PRIORITY_DOT_COLOR["Medium"];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ticketCard, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: statusCfg.bg }]}>
          <Text style={[styles.statusText, { color: statusCfg.text }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.ticketFooter}>
        <View style={styles.priorityContainer}>
          <View style={[styles.priorityDot, { backgroundColor: dotColor }]} />
          <Text style={styles.priorityText}>{priority}</Text>
        </View>
        <Text style={styles.ticketDate}>
          {new Date(createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          })}
        </Text>
      </View>
    </Pressable>
  );
};
