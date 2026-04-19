import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { societyStyles as styles } from "../../styles/society.styles";

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
  return (
    <View style={styles.emptyContainer}>
      <Ionicons name={icon} size={64} color="#CBD5E1" />
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyText}>{message}</Text>
      {actionText && onAction && (
        <TouchableOpacity style={styles.submitButton} onPress={onAction}>
          <Text style={styles.submitButtonText}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
