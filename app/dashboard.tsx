import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useState } from "react";
import { dashboardStyles as styles } from "../styles/dashboard.styles";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";

const PLANS = [
  { name: "Basic", price: 499, features: ["Standard support", "1 maid"] },
  {
    name: "Standard",
    price: 599,
    features: ["Priority support", "2 maids"],
  },
  {
    name: "Gold",
    price: 699,
    features: ["24/7 support", "Unlimited scheduling"],
    popular: true,
  },
  {
    name: "Platinum",
    price: 899,
    features: ["Dedicated manager", "Unlimited maids"],
  },
];

export default function DashboardScreen() {
  useLanguage();

  const [activePlan, setActivePlan] = useState("Gold");
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState([
    { id: "1", text: "Hi! How can I help you today?", isBot: true },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const currentPlan = PLANS.find((p) => p.name === activePlan)!;

  const renderMessage = ({ item }: any) => (
    <View
      style={[
        styles.messageBubble,
        item.isBot ? styles.botMessage : styles.userMessage,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.isBot ? styles.botMessageText : styles.userMessageText,
        ]}
      >
        {item.text}
      </Text>
    </View>
  );

  return (
    <>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.profileButton}>
          <Ionicons name="person-outline" size={22} color="#6366F1" />
        </Pressable>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* GREETING */}
        <View>
          <Text style={styles.greeting}>Good Morning, Shakshi 👋</Text>
          <Text style={styles.subGreeting}>
            Here’s a quick overview of your service
          </Text>
        </View>

        {/* HERO CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroText}>
            <Text style={styles.heroLabel}>Your Maid</Text>
            <Text style={styles.heroName}>Aaradhya Singh</Text>
            <Text style={styles.heroRole}>Daily Help</Text>
            <Text style={styles.heroDate}>Since 07 Jul 2024</Text>

            <Pressable style={styles.heroButton}>
              <Text style={styles.heroButtonText}>View Details</Text>
            </Pressable>
          </View>

          <Image
            source={{ uri: "https://i.pravatar.cc/150?img=47" }}
            style={styles.heroImage}
          />
        </View>

        {/* SUBSCRIPTION */}
        <Pressable
          style={styles.subscriptionCard}
          onPress={() => setShowPlanDetails(!showPlanDetails)}
        >
          <View style={styles.subscriptionHeader}>
            <View>
              <Text style={styles.currentPlanText}>Current Plan</Text>
              <Text style={styles.planName}>{activePlan}</Text>
              <Text style={styles.planPrice}>
                ₹{currentPlan.price}
                <Text style={styles.planPriceMonth}> /month</Text>
              </Text>
            </View>

            <Ionicons
              name={showPlanDetails ? "chevron-up" : "chevron-down"}
              size={22}
              color="#6366F1"
            />
          </View>

          {showPlanDetails && (
            <View style={styles.planDetailsContainer}>
              {PLANS.map((plan) => (
                <Pressable
                  key={plan.name}
                  style={[
                    styles.planDetailCard,
                    activePlan === plan.name &&
                      styles.planDetailCardActive,
                  ]}
                  onPress={() => setActivePlan(plan.name)}
                >
                  {plan.popular && (
                    <Text style={styles.popularBadge}>Most Popular</Text>
                  )}
                  <Text style={styles.planDetailName}>{plan.name}</Text>
                  <Text style={styles.planDetailPrice}>₹{plan.price}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Pressable>
      </ScrollView>

      {/* CHAT BUTTON */}
      <Pressable
        style={styles.chatButton}
        onPress={() => setChatVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
      </Pressable>

      {/* CHAT MODAL */}
      <Modal visible={chatVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <Text style={styles.chatHeaderTitle}>
                GetMyHelp Assistant
              </Text>
              <Pressable onPress={() => setChatVisible(false)}>
                <Ionicons name="close" size={26} color="#fff" />
              </Pressable>
            </View>

            <FlatList
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
            />

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
              />
              <Pressable style={styles.sendButton}>
                <Ionicons name="send" size={20} color="#fff" />
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
