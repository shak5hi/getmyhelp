import React from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { societyStyles as styles } from "../../styles/society.styles";

interface TicketProps {
  id: string;
  title: string;
  status: "Open" | "In Progress" | "Closed" | "Resolved";
  priority: "Low" | "Medium" | "High";
  createdAt: string;
  onPress: () => void;
}

export const TicketCard: React.FC<TicketProps> = ({
  id,
  title,
  status,
  priority,
  createdAt,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "Open":
        return "#6366F1"; // Indigo
      case "In Progress":
        return "#F59E0B"; // Amber
      case "Closed":
        return "#64748B"; // Slate
      case "Resolved":
        return "#10B981"; // Emerald
      default:
        return "#64748B";
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case "High":
        return { name: "flash", color: "#EF4444" };
      case "Medium":
        return { name: "alert-circle", color: "#F59E0B" };
      case "Low":
        return { name: "information-circle", color: "#10B981" };
      default:
        return { name: "information-circle", color: "#64748B" };
    }
  };

  const priorityInfo = getPriorityIcon();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ticketCard,
        { borderLeftColor: getStatusColor(), opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={1}>
          {title}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + "15" }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>{status}</Text>
        </View>
      </View>

      <View style={styles.ticketFooter}>
        <View style={styles.priorityContainer}>
          <Ionicons name={priorityInfo.name as any} size={14} color={priorityInfo.color} />
          <Text style={styles.priorityText}>{priority} Priority</Text>
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
