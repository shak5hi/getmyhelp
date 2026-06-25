import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../src/config";
import { fonts, radii } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { useFeatureGuard } from "../../src/useFeatureGuard";
import { MODULES } from "../../src/featureRegistry";
import { Theme } from "../../constants/themes";

type MessageType = {
  id: string;
  text: string;
  isBot: boolean;
  options?: string[];
};

export default function ChatbotScreen() {
  useFeatureGuard(MODULES.chatbot);
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      // Start or resume session
      const response = await fetch(`${config.apiUrl}/chatbot/sessions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resume: true }),
      });

      const data = await response.json();
      if (data.session_id) {
        setSessionId(data.session_id);

        // Fetch history for this session
        const historyRes = await fetch(`${config.apiUrl}/chatbot/sessions/${data.session_id}/messages`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const historyData = await historyRes.json();

        if (historyData.messages && historyData.messages.length > 0) {
          const formattedMessages = historyData.messages.map((msg: any) => ({
            id: msg.id,
            text: msg.text,
            isBot: msg.sender === "bot",
            options: msg.options || [],
          }));
          setMessages(formattedMessages);
        } else if (data.greeting) {
          setMessages([{
            id: data.greeting.id || "welcome",
            text: data.greeting.text,
            isBot: true,
            options: data.greeting.options || [],
          }]);
        }
      }
    } catch (err) {
      console.error("Chat init error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = async (option: string) => {
    if (!sessionId) return;

    const userMsgId = `user-${Date.now()}`;
    setMessages(prev => [...prev, { id: userMsgId, text: option, isBot: false }]);
    setIsTyping(true);

    try {
      const token = await AsyncStorage.getItem("access_token");
      const response = await fetch(`${config.apiUrl}/chatbot/sessions/${sessionId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: option }),
      });

      const data = await response.json();
      if (data.bot_message) {
        setMessages(prev => [...prev, {
          id: data.bot_message.id || `bot-${Date.now()}`,
          text: data.bot_message.text,
          isBot: true,
          options: data.bot_message.options || [],
        }]);
      }
    } catch (err) {
      console.error("Send message error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const resetChat = async () => {
    if (!sessionId) return;
    try {
      const token = await AsyncStorage.getItem("access_token");
      await fetch(`${config.apiUrl}/chatbot/sessions/${sessionId}?mode=reset`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      initChat();
    } catch (err) {
      console.error("Reset chat error:", err);
    }
  };

  const renderMessage = ({ item }: { item: MessageType }) => (
    <View style={{ marginBottom: 16 }}>
      <View style={[styles.messageBubble, item.isBot ? styles.botMessage : styles.userMessage]}>
        <Text style={[styles.messageText, item.isBot ? styles.botMessageText : styles.userMessageText]}>
          {item.text}
        </Text>
      </View>
      {item.isBot && item.options && item.options.length > 0 && (
        <View style={styles.optionsContainer}>
          {item.options.map((option, index) => (
            <Pressable
              key={`${item.id}-option-${index}`}
              style={styles.optionButton}
              onPress={() => handleOptionClick(option)}
            >
              <Text style={styles.optionButtonText}>{option}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.screen} edges={["top", "bottom"]}>
      <View style={styles.chatHeader}>
        <View>
          <Text style={styles.chatHeaderTitle}>AI Assistant</Text>
          <Text style={styles.chatHeaderSubtitle}>Powered by GetMyHelp</Text>
        </View>
        <Pressable onPress={resetChat} style={{ padding: 8 }}>
          <Ionicons name="refresh-outline" size={24} color={theme.onAccent} />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[styles.messagesList, { paddingBottom: 40 }]}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            isTyping ? (
              <View style={[styles.messageBubble, styles.botMessage, { width: 60, paddingVertical: 8 }]}>
                <ActivityIndicator size="small" color={theme.accent} />
              </View>
            ) : null
          }
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            loading ? (
              <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: 20 }} />
            ) : null
          }
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.bg },
    chatHeader: {
      backgroundColor: t.accent,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 16,
    },
    chatHeaderTitle: { fontFamily: fonts.bold, fontSize: 18, color: t.onAccent },
    chatHeaderSubtitle: {
      fontFamily: fonts.medium,
      fontSize: 13,
      color: t.onAccent,
      opacity: 0.85,
      marginTop: 2,
    },
    messagesList: { padding: 20 },
    messageBubble: {
      maxWidth: "80%",
      padding: 12,
      borderRadius: radii.lg,
      marginBottom: 4,
    },
    botMessage: {
      backgroundColor: t.surfaceAlt,
      alignSelf: "flex-start",
      borderBottomLeftRadius: 4,
    },
    userMessage: {
      backgroundColor: t.accent,
      alignSelf: "flex-end",
      borderBottomRightRadius: 4,
    },
    messageText: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 20 },
    botMessageText: { color: t.text },
    userMessageText: { color: t.onAccent },
    optionsContainer: {
      marginTop: 8,
      marginBottom: 12,
      gap: 8,
      alignItems: "flex-start",
    },
    optionButton: {
      backgroundColor: t.card,
      borderWidth: 1.5,
      borderColor: t.accent,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: radii.lg,
      alignSelf: "flex-start",
    },
    optionButtonText: { fontFamily: fonts.semibold, color: t.accent, fontSize: 14 },
  });
