import React, { useMemo } from "react";
import { View, Text, Pressable } from "react-native";
import { makeStyles } from "../../styles/society.styles";
import { useTheme } from "../../src/ThemeContext";
import { StatusPill, ticketStatusTone } from "../ui/StatusPill";

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
  onPress,
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const dotColor =
    priority === "High" ? theme.danger : priority === "Low" ? theme.success : theme.warning;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.ticketCard, { opacity: pressed ? 0.85 : 1 }]}
    >
      <View style={styles.ticketHeader}>
        <Text style={styles.ticketTitle} numberOfLines={2}>
          {title}
        </Text>
        <StatusPill tone={ticketStatusTone(status)} label={status} />
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
