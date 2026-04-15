/* AI ASSISTANT NAVIGATION CHANGE */
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLanguage } from "../../src/LanguageContext";
import { dashboardStyles as styles } from "../../styles/dashboard.styles";

// Chatbot Types
type MessageType = {
  id: string;
  text: string;
  isBot: boolean;
  options?: string[];
};

type FlowState =
  | "main"
  | "maid_attendance"
  | "replacement_backup"
  | "replacement_when"
  | "replacement_type"
  | "replacement_confirm"
  | "services_hub"
  | "service_detail"
  | "subscription_plan"
  | "payments_billing"
  | "profile_settings"
  | "help_support";

let messageCounter = 0;

export default function ChatbotScreen() {
  useLanguage();

  const [messages, setMessages] = useState<MessageType[]>([]);
  const [flowState, setFlowState] = useState<FlowState>("main");
  const [replacementData, setReplacementData] = useState({ when: "", type: "" });
  const [selectedService, setSelectedService] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length === 0) {
      addBotMessage(
        "Hi 👋 I'm here to help you manage maids, services, and subscriptions.\n\nWhat would you like to do?",
        [
          "Maid & Attendance",
          "Replacement / Backup",
          "Services Hub",
          "Subscription & Plan",
          "Payments & Billing",
          "Profile & Settings",
          "Help & Support",
        ]
      );
    }
  }, []);

  const addBotMessage = (text: string, options?: string[]) => {
    messageCounter++;
    const newMessage: MessageType = {
      id: `bot-${Date.now()}-${messageCounter}`,
      text,
      isBot: true,
      options,
    };
    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const addUserMessage = (text: string) => {
    messageCounter++;
    const newMessage: MessageType = {
      id: `user-${Date.now()}-${messageCounter}`,
      text,
      isBot: false,
    };
    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleOptionKeyClick = (option: string) => {
    addUserMessage(option);

    setTimeout(() => {
      if (flowState === "main") {
        switch (option) {
          case "Maid & Attendance":
            setFlowState("maid_attendance");
            addBotMessage("What would you like to check or manage?", [
              "Where is my maid?",
              "Today's attendance",
              "Maid timings",
              "Add or remove a maid",
              "Go back",
            ]);
            break;
          case "Replacement / Backup":
            setFlowState("replacement_backup");
            addBotMessage("I can help you with replacements and backup days.", [
              "Request replacement",
              "Backup days remaining",
              "Use backup day",
              "Why replacement was rejected",
              "Go back",
            ]);
            break;
          case "Services Hub":
            setFlowState("services_hub");
            addBotMessage("What service are you looking for?", [
              "Cleaning services",
              "Pet care",
              "Elderly care",
              "Babysitting",
              "One-day maid help",
              "View all services",
              "Go back",
            ]);
            break;
          case "Subscription & Plan":
            setFlowState("subscription_plan");
            addBotMessage("Here's what I can help you with regarding your plan.", [
              "My current plan",
              "Days left",
              "Backup days",
              "Upgrade plan",
              "Go back",
            ]);
            break;
          case "Payments & Billing":
            setFlowState("payments_billing");
            addBotMessage("What would you like to check?", [
              "View invoices",
              "Recent payments",
              "Payment failed",
              "Go back",
            ]);
            break;
          case "Help & Support":
            setFlowState("help_support");
            addBotMessage("I'm here to help. What's the issue?", [
              "Raise a complaint",
              "Talk to support",
              "FAQs",
              "Go back",
            ]);
            break;
          case "Profile & Settings":
            setFlowState("profile_settings");
            addBotMessage("What would you like to update?", [
              "Update address",
              "Notification preferences",
              "Go back",
            ]);
            break;
        }
      } else if (option === "Go back" || option === "Go back to main menu") {
        resetToMain();
      } else {
        // Simple mock responses for these secondary options
        addBotMessage(`I've noted your interest in "${option}". One of our executives will contact you shortly if action is required.`, ["Go back to main menu"]);
      }
    }, 300);
  };

  const resetToMain = () => {
    setFlowState("main");
    setReplacementData({ when: "", type: "" });
    setSelectedService("");
    addBotMessage("What would you like to do?", [
      "Maid & Attendance",
      "Replacement / Backup",
      "Services Hub",
      "Subscription & Plan",
      "Payments & Billing",
      "Profile & Settings",
      "Help & Support",
    ]);
  };

  const renderMessage = ({ item }: { item: MessageType }) => (
    <View style={{ marginBottom: 16 }}>
      <View style={[styles.messageBubble, item.isBot ? styles.botMessage : styles.userMessage]}>
        <Text style={[styles.messageText, item.isBot ? styles.botMessageText : styles.userMessageText]}>
          {item.text}
        </Text>
      </View>
      {item.isBot && item.options && (
        <View style={styles.optionsContainer}>
          {item.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionButton}
              onPress={() => handleOptionKeyClick(option)}
            >
              <Text style={styles.optionButtonText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GetMyHelp Assistant</Text>
          <Text style={styles.subGreeting}>AI Support Specialist</Text>
        </View>
        <Ionicons name="chatbubbles" size={24} color="#6366F1" />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.content, { paddingBottom: 20 }]}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      </KeyboardAvoidingView>
    </View>
  );
}
/* END AI ASSISTANT NAVIGATION CHANGE */
