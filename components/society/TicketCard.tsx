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
  type?: "common" | "private";
  onPress: () => void;
}

export const TicketCard: React.FC<TicketProps> = ({
  id,
  title,
  status,
  priority,
  createdAt,
  type,
  onPress,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "Open":        return "#818CF8"; // indigo-400 — readable on dark
      case "In Progress": return "#FCD34D"; // amber-300
      case "Closed":      return "#94A3B8"; // slate-400
      case "Resolved":    return "#34D399"; // emerald-400
      default:            return "#94A3B8";
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case "High":   return { name: "flash",              color: "#F87171" }; // red-400
      case "Medium": return { name: "alert-circle",       color: "#FCD34D" }; // amber-300
      case "Low":    return { name: "information-circle", color: "#34D399" }; // emerald-400
      default:       return { name: "information-circle", color: "#94A3B8" };
    }
  };

  const statusColor  = getStatusColor();
  const priorityInfo = getPriorityIcon();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ticketCard,
        { borderLeftColor: statusColor, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {title}
        </Text>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + "22" }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
          </View>
          {type && (
            <View style={[styles.statusBadge, { backgroundColor: type === "private" ? "#FEF3C720" : "#EEF2FF33" }]}>
              <Ionicons
                name={type === "private" ? "lock-closed" : "people"}
                size={9}
                color={type === "private" ? "#FCD34D" : "#818CF8"}
                style={{ marginRight: 3 }}
              />
              <Text style={[styles.statusText, { color: type === "private" ? "#FCD34D" : "#818CF8" }]}>
                {type}
              </Text>
            </View>
          )}
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
