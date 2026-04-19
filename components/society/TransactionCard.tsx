import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { societyStyles as styles } from "../../styles/society.styles";

interface TransactionProps {
  amount: number;
  category: string;
  date: string;
  type: "income" | "expense";
  note?: string;
  hasAttachment?: boolean;
  attachments?: any[];
  onPress?: () => void;
}

export const TransactionCard: React.FC<TransactionProps> = ({
  amount,
  category,
  date,
  type,
  note,
  hasAttachment,
  attachments,
  onPress,
}) => {
  const isIncome = type === "income";

  return (
    <TouchableOpacity 
      style={styles.transactionCard} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, isIncome ? styles.incomeIcon : styles.expenseIcon]}>
        <Ionicons
          name={isIncome ? "arrow-down-circle" : "arrow-up-circle"}
          size={24}
          color={isIncome ? "#10B981" : "#EF4444"}
        />
      </View>
      <View style={styles.transactionInfo}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Text style={styles.transactionCategory}>{category}</Text>
          {(hasAttachment || (attachments && attachments.length > 0)) && (
            <Ionicons name="attach" size={16} color="#94A3B8" style={{ marginLeft: 4 }} />
          )}
        </View>
        <Text style={styles.transactionDate}>
          {new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </Text>
        {note && (
          <Text 
            style={[styles.transactionDate, { marginTop: 4, fontStyle: "italic" }]}
            numberOfLines={1}
          >
            {note}
          </Text>
        )}
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, isIncome ? styles.incomeAmount : styles.expenseAmount]}>
          {isIncome ? "+" : "-"} ₹{Math.abs(amount).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
