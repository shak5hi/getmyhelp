import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, FlatList, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet, Alert } from "react-native";
import { Text } from "../../components/ui/Text";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { fonts, radii, spacing } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { useFeatureGuard } from "../../src/useFeatureGuard";
import { MODULES } from "../../src/featureRegistry";
import { Theme } from "../../constants/themes";
import { apiGet, apiPost, apiDelete, errorMessage } from "../../src/api/client";

type MessageType = {
  id: string;
  text: string;
  isBot: boolean;
  options?: string[];
};

export default function ChatbotScreen() {
  useFeatureGuard(MODULES.chatbot);
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initChat();
  }, []);

  const initChat = async () => {
    try {
      setLoading(true);

      // Start or resume session. apiPost injects auth header and 20s timeout.
      const data = await apiPost("/chatbot/sessions", { resume: true });
      if (data.session_id) {
        setSessionId(data.session_id);

        // Fetch history for this session
        const historyData = await apiGet(`/chatbot/sessions/${data.session_id}/messages`);

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
      Alert.alert("Couldn't load chat", errorMessage(err, "Please try again."));
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
      // apiPost injects auth header, timeout, and 401 guard automatically.
      const data = await apiPost(`/chatbot/sessions/${sessionId}/messages`, { text: option });
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
    if (!sessionId || resetting) return;
    setResetting(true);
    try {
      // apiDelete injects auth header, timeout, and 401 guard automatically.
      // Throws on any non-2xx response (see api/client.ts), so a failed reset
      // lands in the catch below instead of silently leaving the old session
      // in place — previously that silent failure was the whole bug: tapping
      // reset (or leaving and reopening the screen) just kept showing the same
      // conversation with no sign anything had gone wrong.
      await apiDelete(`/chatbot/sessions/${sessionId}?mode=reset`);
      setSessionId(null);
      setMessages([]);
      await initChat();
    } catch (err) {
      Alert.alert("Couldn't reset chat", errorMessage(err, "Please try again."));
    } finally {
      setResetting(false);
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
        <Pressable onPress={() => router.back()} style={styles.headerIconButton} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={theme.text} />
        </Pressable>
        <View style={styles.chatHeaderTitleWrap}>
          <Text style={styles.chatHeaderTitle} numberOfLines={1}>AI Assistant</Text>
          <Text style={styles.chatHeaderSubtitle} numberOfLines={1}>Powered by GetMyHelp</Text>
        </View>
        <Pressable onPress={resetChat} disabled={resetting} style={styles.headerIconButton} hitSlop={8}>
          {resetting ? (
            <ActivityIndicator size="small" color={theme.accent} />
          ) : (
            <Ionicons name="refresh-outline" size={20} color={theme.text} />
          )}
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
      backgroundColor: t.bg,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingHorizontal: 12,
      paddingTop: 12,
      paddingBottom: 12,
      borderBottomWidth: 1,
      borderBottomColor: t.border,
    },
    headerIconButton: {
      width: 36,
      height: 36,
      borderRadius: radii.md,
      alignItems: "center",
      justifyContent: "center",
    },
    chatHeaderTitleWrap: { flex: 1 },
    chatHeaderTitle: { fontFamily: fonts.extrabold, fontSize: 17, color: t.text, letterSpacing: -0.3 },
    chatHeaderSubtitle: {
      fontFamily: fonts.medium,
      fontSize: 12.5,
      color: t.textSecondary,
      marginTop: 1,
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
