import {
  View,
  Text,
  ScrollView,
  Pressable,
  Image,
  Modal,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Alert,
} from "react-native";
import { useState, useRef } from "react";
import { dashboardStyles as styles } from "../styles/dashboard.styles";
import { Ionicons } from "@expo/vector-icons";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";

const PLANS = [
  { name: "Basic", price: 499 },
  { name: "Standard", price: 599 },
  { name: "Gold", price: 699 },
  { name: "Platinum", price: 899 },
];

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

export default function DashboardScreen() {
  useLanguage();

  const [activePlan, setActivePlan] = useState("Basic");
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [flowState, setFlowState] = useState<FlowState>("main");
  const [replacementData, setReplacementData] = useState({
    when: "",
    type: "",
  });
  const [selectedService, setSelectedService] = useState("");
  const flatListRef = useRef<FlatList>(null);

  const currentPlan = PLANS.find((p) => p.name === activePlan)!;

  const handleUpdateSubscription = () => {
    Alert.alert(
      "Request Sent ✅",
      "Your request to update the subscription has been sent. Our team will contact you shortly.",
      [{ text: "Okay" }]
    );
  };

  // Initialize chat when opened
  const openChat = () => {
    setChatVisible(true);
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
  };

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

  const handleOptionClick = (option: string) => {
    addUserMessage(option);

    setTimeout(() => {
      // Main menu routing
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
            addBotMessage(
              "Here's what I can help you with regarding your plan.",
              [
                "My current plan",
                "Days left",
                "Backup days",
                "Upgrade plan",
                "What happens if plan expires",
                "Go back",
              ]
            );
            break;

          case "Payments & Billing":
            setFlowState("payments_billing");
            addBotMessage("What would you like to check?", [
              "View invoices",
              "Recent payments",
              "Charged twice",
              "Payment failed",
              "Download bill",
              "Go back",
            ]);
            break;

          case "Profile & Settings":
            setFlowState("profile_settings");
            addBotMessage("What would you like to update?", [
              "Change phone number",
              "Update address",
              "Notification preferences",
              "View backup days",
              "Go back",
            ]);
            break;

          case "Help & Support":
            setFlowState("help_support");
            addBotMessage("I'm here to help. What's the issue?", [
              "Raise a complaint",
              "Talk to support",
              "FAQs",
              "Emergency help",
              "Go back",
            ]);
            break;
        }
      }
      // Maid & Attendance flow
      else if (flowState === "maid_attendance") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "Where is my maid?") {
          addBotMessage(
            "Your maid Aaradhya Singh is currently Inside. She checked in at 9:02 AM.",
            ["Check another maid", "Go back"]
          );
        } else if (option === "Today's attendance") {
          addBotMessage(
            "✅ Aaradhya Singh - Present (9:02 AM)\n✅ Sunita - Present (8:45 AM)",
            ["View full attendance", "Go back"]
          );
        } else if (option === "Maid timings") {
          addBotMessage(
            "Aaradhya Singh:\nCheck-in: 9:02 AM\nCheck-out: Not yet",
            ["Set reminder", "Go back"]
          );
        } else if (option === "Add or remove a maid") {
          addBotMessage(
            "To add or remove a maid, please contact our support team at 1800-XXX-XXXX",
            ["Talk to support", "Go back"]
          );
        } else if (option === "Check another maid") {
          addBotMessage("Which maid would you like to check?", [
            "Aaradhya Singh",
            "Sunita",
            "Go back",
          ]);
        }
      }
      // Replacement / Backup flow
      else if (flowState === "replacement_backup") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "Request replacement") {
          setFlowState("replacement_when");
          addBotMessage("When do you need a replacement?", [
            "Today",
            "Tomorrow",
            "Choose date",
            "Go back",
          ]);
        } else if (option === "Backup days remaining") {
          addBotMessage(
            "You have 12 backup days remaining in your current plan.",
            ["Use backup day", "Go back"]
          );
        } else if (option === "Use backup day") {
          addBotMessage(
            "Backup day requested successfully! ✅\n\nA backup maid will be assigned to you shortly.",
            ["Request another", "Go back"]
          );
        } else if (option === "Why replacement was rejected") {
          addBotMessage(
            "Your recent replacement request was rejected because no backup staff was available on that date. Please try selecting a different date.",
            ["Request replacement", "Go back"]
          );
        }
      }
      // Replacement When flow
      else if (flowState === "replacement_when") {
        if (option === "Go back") {
          setFlowState("replacement_backup");
          addBotMessage("I can help you with replacements and backup days.", [
            "Request replacement",
            "Backup days remaining",
            "Use backup day",
            "Why replacement was rejected",
            "Go back",
          ]);
        } else {
          setReplacementData({ ...replacementData, when: option });
          setFlowState("replacement_type");
          addBotMessage("What type of help do you need?", [
            "Full-day maid",
            "Cook",
            "Babysitter",
            "Cleaning help",
            "Go back",
          ]);
        }
      }
      // Replacement Type flow
      else if (flowState === "replacement_type") {
        if (option === "Go back") {
          setFlowState("replacement_when");
          addBotMessage("When do you need a replacement?", [
            "Today",
            "Tomorrow",
            "Choose date",
            "Go back",
          ]);
        } else {
          setReplacementData({ ...replacementData, type: option });
          setFlowState("replacement_confirm");
          addBotMessage(
            `Confirm your request:\n\nWhen: ${replacementData.when}\nType: ${option}\n\nShall I proceed?`,
            ["Yes, request replacement", "Go back"]
          );
        }
      }
      // Replacement Confirm flow
      else if (flowState === "replacement_confirm") {
        if (option === "Go back") {
          setFlowState("replacement_type");
          addBotMessage("What type of help do you need?", [
            "Full-day maid",
            "Cook",
            "Babysitter",
            "Cleaning help",
            "Go back",
          ]);
        } else {
          addBotMessage(
            "✅ Replacement requested successfully!\n\nOur team will confirm and assign a replacement soon.",
            ["Request another", "Go back to main menu"]
          );
          setFlowState("main");
        }
      }
      // Services Hub flow
      else if (flowState === "services_hub") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "View all services") {
          addBotMessage(
            "Here are all our services:\n\n• Cleaning services\n• Pet care\n• Elderly care\n• Babysitting\n• One-day maid help\n• Gardening\n• Laundry service",
            ["Select a service", "Go back"]
          );
        } else if (option === "Select a service") {
          addBotMessage("What service are you looking for?", [
            "Cleaning services",
            "Pet care",
            "Elderly care",
            "Babysitting",
            "One-day maid help",
            "Go back",
          ]);
        } else {
          setSelectedService(option);
          setFlowState("service_detail");
          addBotMessage(
            `${option}\n\nThis includes professional help tailored to your needs. Starting from ₹500.`,
            ["Check price", "Book service", "Go back"]
          );
        }
      }
      // Service Detail flow
      else if (flowState === "service_detail") {
        if (option === "Go back") {
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
        } else if (option === "Check price") {
          addBotMessage(
            `${selectedService} pricing:\n\n• Basic: ₹500\n• Standard: ₹800\n• Premium: ₹1200`,
            ["Book service", "Go back"]
          );
        } else if (option === "Book service") {
          addBotMessage(
            "Service booking request sent! ✅\n\nOur team will contact you to confirm the booking.",
            ["Book another service", "Go back to main menu"]
          );
          setFlowState("main");
        }
      }
      // Subscription & Plan flow
      else if (flowState === "subscription_plan") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "My current plan") {
          addBotMessage(
            `You are currently on the ${activePlan} plan (₹${currentPlan.price}/month).`,
            ["Upgrade plan", "Go back"]
          );
        } else if (option === "Days left") {
          addBotMessage(
            "You have 23 days left in your current billing cycle.",
            ["Extend plan", "Go back"]
          );
        } else if (option === "Backup days") {
          addBotMessage("You have 12 backup days remaining.", [
            "Use backup day",
            "Go back",
          ]);
        } else if (option === "Upgrade plan") {
          addBotMessage(
            "To upgrade your plan, please contact our support team or visit the subscription page.",
            ["Contact support", "Go back"]
          );
        } else if (option === "What happens if plan expires") {
          addBotMessage(
            "If your plan expires:\n\n• Services will be paused\n• You'll receive reminders before expiry\n• You can renew anytime",
            ["Renew now", "Go back"]
          );
        }
      }
      // Payments & Billing flow
      else if (flowState === "payments_billing") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "View invoices") {
          addBotMessage(
            "Your recent invoices:\n\n• Jan 2025 - ₹699\n• Dec 2024 - ₹699\n• Nov 2024 - ₹699",
            ["Download invoice", "Go back"]
          );
        } else if (option === "Recent payments") {
          addBotMessage(
            "Last payment: ₹699 on Jan 1, 2025\nStatus: Success ✅",
            ["View all payments", "Go back"]
          );
        } else if (option === "Charged twice" || option === "Payment failed") {
          addBotMessage(
            "I'm escalating this to our support team. You'll receive a call within 24 hours.",
            ["Talk to support now", "Go back"]
          );
        } else if (option === "Download bill") {
          addBotMessage(
            "Bill download link has been sent to your registered email.",
            ["Download another", "Go back"]
          );
        }
      }
      // Profile & Settings flow
      else if (flowState === "profile_settings") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "Change phone number") {
          addBotMessage(
            "To change your phone number, please contact our support team for verification.",
            ["Contact support", "Go back"]
          );
        } else if (option === "Update address") {
          addBotMessage(
            "To update your address, please contact our support team.",
            ["Contact support", "Go back"]
          );
        } else if (option === "Notification preferences") {
          addBotMessage(
            "Current preferences:\n\n✅ SMS notifications\n✅ Email alerts\n❌ Push notifications",
            ["Change preferences", "Go back"]
          );
        } else if (option === "View backup days") {
          addBotMessage("You have 12 backup days remaining.", [
            "Use backup day",
            "Go back",
          ]);
        }
      }
      // Help & Support flow
      else if (flowState === "help_support") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "Raise a complaint") {
          addBotMessage(
            "Please describe your complaint and our team will get back to you within 24 hours.",
            ["Submit complaint", "Go back"]
          );
        } else if (option === "Talk to support") {
          addBotMessage(
            "You can reach our support team at:\n\n📞 1800-XXX-XXXX\n✉️ support@getmyhelp.com\n\nAvailable 24/7",
            ["Call now", "Go back"]
          );
        } else if (option === "FAQs") {
          addBotMessage(
            "Popular FAQs:\n\n• How to request replacement?\n• What are backup days?\n• How to upgrade plan?\n• Payment methods accepted",
            ["View more FAQs", "Go back"]
          );
        } else if (option === "Emergency help") {
          addBotMessage(
            "🚨 EMERGENCY CONTACT:\n\n📞 1800-XXX-XXXX\n📞 +91-XXXXX-XXXXX\n\nAvailable 24/7 for urgent assistance",
            ["Go back"]
          );
        }
      }
      // Generic navigation
      else if (
        option === "Go back to main menu" ||
        option === "Request another" ||
        option === "Book another service"
      ) {
        resetToMain();
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

      {item.options && item.options.length > 0 && (
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
    <>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GetMyHelp</Text>
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
            Here's a quick overview of your service
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

        {/* SUBSCRIPTION CARD */}
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

              {/* UPDATE SUBSCRIPTION */}
              <Pressable
                style={styles.updatePlanButton}
                onPress={handleUpdateSubscription}
              >
                <Text style={styles.updatePlanButtonText}>
                  Update Subscription
                </Text>
              </Pressable>
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
                    activePlan === plan.name && styles.planDetailCardActive,
                  ]}
                  onPress={() => setActivePlan(plan.name)}
                >
                  <Text style={styles.planDetailName}>{plan.name}</Text>
                  <Text style={styles.planDetailPrice}>₹{plan.price}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </Pressable>
      </ScrollView>

      {/* CHAT BUTTON */}
      <Pressable style={styles.chatButton} onPress={openChat}>
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
      </Pressable>

      {/* CHAT MODAL */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChatVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalContainer}
        >
          <View style={styles.chatContainer}>
            <View style={styles.chatHeader}>
              <View>
                <Text style={styles.chatHeaderTitle}>GetMyHelp Assistant</Text>
                <Text style={styles.chatHeaderSubtitle}>Online</Text>
              </View>
              <Pressable onPress={() => setChatVisible(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </Pressable>
            </View>

            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}