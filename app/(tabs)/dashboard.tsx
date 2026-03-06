import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import config from "../../src/config";
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

export default function DashboardScreen() {
  useLanguage();

  // API state
  const [customerName, setCustomerName] = useState("user");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // UI state
  const [activePlan, setActivePlan] = useState("");
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [flowState, setFlowState] = useState<FlowState>("main");
  const [replacementData, setReplacementData] = useState({ when: "", type: "" });
  const [selectedService, setSelectedService] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;

      // Prefer common name fields, fall back to 'user'
      const rawName =
        (user?.first_name && user.first_name.trim()) ||
        (user?.firstName && user.firstName.trim()) ||
        (user?.name && user.name.trim()) ||
        "user";

      const formattedName =
        rawName.length > 0 ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "User";

      setCustomerName(formattedName);

      const customerId = user?.id;
      if (!customerId || !token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Fetch current subscription
      const subRes = await fetch(
        `${config.apiUrl}/admin/customers/${customerId}/subscriptions`,
        { headers }
      );
      const subData = await subRes.json();
      console.log("📦 Subscription data:", subData);

      const activeSub =
        subData?.subscriptions?.find((s: any) => s.status === "active") ||
        subData?.subscriptions?.[0];

      if (activeSub) {
        setCurrentSubscription(activeSub);
        setActivePlan(activeSub.plan_name);
      }

      // Fetch available plans
      const plansRes = await fetch(
        `${config.apiUrl}/admin/subscriptions/available-for-customer/${customerId}`,
        { headers }
      );
      const plansData = await plansRes.json();
      console.log("📦 Available plans:", plansData);

      if (plansData?.subscriptions) setAvailablePlans(plansData.subscriptions);
      else if (Array.isArray(plansData)) setAvailablePlans(plansData);
    } catch (err) {
      console.log("❌ Dashboard fetch error:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleUpdateSubscription = () => {
    Alert.alert(
      "Request Sent ✅",
      "Your request to update the subscription has been sent. Our team will contact you shortly.",
      [{ text: "Okay" }]
    );
  };

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
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const addUserMessage = (text: string) => {
    messageCounter++;
    const newMessage: MessageType = {
      id: `user-${Date.now()}-${messageCounter}`,
      text,
      isBot: false,
    };
    setMessages((prev) => [...prev, newMessage]);
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const handleOptionClick = (option: string) => {
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
              "What happens if plan expires",
              "Go back",
            ]);
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
      } else if (flowState === "maid_attendance") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "Where is my maid?") {
          addBotMessage("Your maid Aaradhya Singh is currently Inside. She checked in at 9:02 AM.", ["Check another maid", "Go back"]);
        } else if (option === "Today's attendance") {
          addBotMessage("✅ Aaradhya Singh - Present (9:02 AM)\n✅ Sunita - Present (8:45 AM)", ["View full attendance", "Go back"]);
        } else if (option === "Maid timings") {
          addBotMessage("Aaradhya Singh:\nCheck-in: 9:02 AM\nCheck-out: Not yet", ["Set reminder", "Go back"]);
        } else if (option === "Add or remove a maid") {
          addBotMessage("To add or remove a maid, please contact our support team at 1800-XXX-XXXX", ["Talk to support", "Go back"]);
        } else if (option === "Check another maid") {
          addBotMessage("Which maid would you like to check?", ["Aaradhya Singh", "Sunita", "Go back"]);
        }
      } else if (flowState === "replacement_backup") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "Request replacement") {
          setFlowState("replacement_when");
          addBotMessage("When do you need a replacement?", ["Today", "Tomorrow", "Choose date", "Go back"]);
        } else if (option === "Backup days remaining") {
          addBotMessage(`You have ${currentSubscription?.days_remaining ?? "—"} backup days remaining in your current plan.`, ["Use backup day", "Go back"]);
        } else if (option === "Use backup day") {
          addBotMessage("Backup day requested successfully! ✅\n\nA backup maid will be assigned to you shortly.", ["Request another", "Go back"]);
        } else if (option === "Why replacement was rejected") {
          addBotMessage("Your recent replacement request was rejected because no backup staff was available on that date. Please try selecting a different date.", ["Request replacement", "Go back"]);
        }
      } else if (flowState === "replacement_when") {
        if (option === "Go back") {
          setFlowState("replacement_backup");
          addBotMessage("I can help you with replacements and backup days.", [
            "Request replacement", "Backup days remaining", "Use backup day", "Why replacement was rejected", "Go back",
          ]);
        } else {
          setReplacementData({ ...replacementData, when: option });
          setFlowState("replacement_type");
          addBotMessage("What type of help do you need?", ["Full-day maid", "Cook", "Babysitter", "Cleaning help", "Go back"]);
        }
      } else if (flowState === "replacement_type") {
        if (option === "Go back") {
          setFlowState("replacement_when");
          addBotMessage("When do you need a replacement?", ["Today", "Tomorrow", "Choose date", "Go back"]);
        } else {
          setReplacementData({ ...replacementData, type: option });
          setFlowState("replacement_confirm");
          addBotMessage(
            `Confirm your request:\n\nWhen: ${replacementData.when}\nType: ${option}\n\nShall I proceed?`,
            ["Yes, request replacement", "Go back"]
          );
        }
      } else if (flowState === "replacement_confirm") {
        if (option === "Go back") {
          setFlowState("replacement_type");
          addBotMessage("What type of help do you need?", ["Full-day maid", "Cook", "Babysitter", "Cleaning help", "Go back"]);
        } else {
          addBotMessage("✅ Replacement requested successfully!\n\nOur team will confirm and assign a replacement soon.", ["Request another", "Go back to main menu"]);
          setFlowState("main");
        }
      } else if (flowState === "services_hub") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "View all services") {
          addBotMessage("Here are all our services:\n\n• Cleaning services\n• Pet care\n• Elderly care\n• Babysitting\n• One-day maid help\n• Gardening\n• Laundry service", ["Select a service", "Go back"]);
        } else if (option === "Select a service") {
          addBotMessage("What service are you looking for?", ["Cleaning services", "Pet care", "Elderly care", "Babysitting", "One-day maid help", "Go back"]);
        } else {
          setSelectedService(option);
          setFlowState("service_detail");
          addBotMessage(`${option}\n\nThis includes professional help tailored to your needs. Starting from ₹500.`, ["Check price", "Book service", "Go back"]);
        }
      } else if (flowState === "service_detail") {
        if (option === "Go back") {
          setFlowState("services_hub");
          addBotMessage("What service are you looking for?", ["Cleaning services", "Pet care", "Elderly care", "Babysitting", "One-day maid help", "View all services", "Go back"]);
        } else if (option === "Check price") {
          addBotMessage(`${selectedService} pricing:\n\n• Basic: ₹500\n• Standard: ₹800\n• Premium: ₹1200`, ["Book service", "Go back"]);
        } else if (option === "Book service") {
          addBotMessage("Service booking request sent! ✅\n\nOur team will contact you to confirm the booking.", ["Book another service", "Go back to main menu"]);
          setFlowState("main");
        }
      } else if (flowState === "subscription_plan") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "My current plan") {
          addBotMessage(
            `You are currently on the ${currentSubscription?.plan_name || activePlan} plan (₹${currentSubscription?.amount_paid || "—"}/month).`,
            ["Upgrade plan", "Go back"]
          );
        } else if (option === "Days left") {
          addBotMessage(`You have ${currentSubscription?.days_remaining ?? "—"} days left in your current billing cycle.`, ["Extend plan", "Go back"]);
        } else if (option === "Backup days") {
          addBotMessage(`You have ${currentSubscription?.days_remaining ?? "—"} backup days remaining.`, ["Use backup day", "Go back"]);
        } else if (option === "Upgrade plan") {
          addBotMessage("To upgrade your plan, please contact our support team or visit the subscription page.", ["Contact support", "Go back"]);
        } else if (option === "What happens if plan expires") {
          addBotMessage("If your plan expires:\n\n• Services will be paused\n• You'll receive reminders before expiry\n• You can renew anytime", ["Renew now", "Go back"]);
        }
      } else if (flowState === "payments_billing") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "View invoices") {
          addBotMessage("Your recent invoices:\n\n• Jan 2025 - ₹699\n• Dec 2024 - ₹699\n• Nov 2024 - ₹699", ["Download invoice", "Go back"]);
        } else if (option === "Recent payments") {
          addBotMessage("Last payment: ₹699 on Jan 1, 2025\nStatus: Success ✅", ["View all payments", "Go back"]);
        } else if (option === "Charged twice" || option === "Payment failed") {
          addBotMessage("I'm escalating this to our support team. You'll receive a call within 24 hours.", ["Talk to support now", "Go back"]);
        } else if (option === "Download bill") {
          addBotMessage("Bill download link has been sent to your registered email.", ["Download another", "Go back"]);
        }
      } else if (flowState === "profile_settings") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "Change phone number") {
          addBotMessage("To change your phone number, please contact our support team for verification.", ["Contact support", "Go back"]);
        } else if (option === "Update address") {
          addBotMessage("To update your address, please contact our support team.", ["Contact support", "Go back"]);
        } else if (option === "Notification preferences") {
          addBotMessage("Current preferences:\n\n✅ SMS notifications\n✅ Email alerts\n❌ Push notifications", ["Change preferences", "Go back"]);
        } else if (option === "View backup days") {
          addBotMessage(`You have ${currentSubscription?.days_remaining ?? "—"} backup days remaining.`, ["Use backup day", "Go back"]);
        }
      } else if (flowState === "help_support") {
        if (option === "Go back") {
          resetToMain();
        } else if (option === "Raise a complaint") {
          addBotMessage("Please describe your complaint and our team will get back to you within 24 hours.", ["Submit complaint", "Go back"]);
        } else if (option === "Talk to support") {
          addBotMessage("You can reach our support team at:\n\n📞 1800-XXX-XXXX\n✉️ support@getmyhelp.com\n\nAvailable 24/7", ["Call now", "Go back"]);
        } else if (option === "FAQs") {
          addBotMessage("Popular FAQs:\n\n• How to request replacement?\n• What are backup days?\n• How to upgrade plan?\n• Payment methods accepted", ["View more FAQs", "Go back"]);
        } else if (option === "Emergency help") {
          addBotMessage("🚨 EMERGENCY CONTACT:\n\n📞 1800-XXX-XXXX\n📞 +91-XXXXX-XXXXX\n\nAvailable 24/7 for urgent assistance", ["Go back"]);
        }
      } else if (
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
      <View style={[styles.messageBubble, item.isBot ? styles.botMessage : styles.userMessage]}>
        <Text style={[styles.messageText, item.isBot ? styles.botMessageText : styles.userMessageText]}>
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

      <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* GREETING */}
        <View>
          <Text style={styles.greeting}>{getGreeting()}, {customerName} 👋</Text>
          <Text style={styles.subGreeting}>Here's a quick overview of your service</Text>
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
          <Image source={{ uri: "https://i.pravatar.cc/150?img=47" }} style={styles.heroImage} />
        </View>

        {/* SUBSCRIPTION CARD */}
        <Pressable style={styles.subscriptionCard} onPress={() => setSubscriptionModalVisible(true)}>
          <View style={styles.subscriptionGradientBorder}>
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionIconContainer}>
                  <Ionicons name="diamond" size={24} color="#6366F1" />
                </View>
                <Text style={styles.currentPlanLabel}>CURRENT PLAN</Text>
              </View>

              {loadingSubscription ? (
                <ActivityIndicator color="#6366F1" style={{ marginVertical: 12 }} />
              ) : (
                <View style={styles.subscriptionInfo}>
                  <View style={styles.subscriptionLeft}>
                    <Text style={styles.planName}>{currentSubscription?.plan_name || "No Plan"}</Text>
                    <Text style={styles.planPrice}>
                      ₹{currentSubscription?.amount_paid || "—"}
                      <Text style={styles.planPriceMonth}> /month</Text>
                    </Text>
                  </View>
                  <View style={styles.subscriptionRight}>
                    <Text style={styles.daysLeftNumber}>{currentSubscription?.days_remaining ?? "—"}</Text>
                    <Text style={styles.daysLeftText}>days left</Text>
                  </View>
                </View>
              )}

              <View style={styles.subscriptionFooter}>
                <Text style={styles.tapToManageText}>Tap to manage subscription</Text>
                <Ionicons name="chevron-forward" size={20} color="#6366F1" />
              </View>
            </View>
          </View>
        </Pressable>
      </ScrollView>

      {/* CHAT BUTTON */}
      <Pressable style={styles.chatButton} onPress={openChat}>
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
      </Pressable>

      {/* SUBSCRIPTION MODAL */}
      <Modal
        visible={subscriptionModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSubscriptionModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setSubscriptionModalVisible(false)}>
          <Pressable style={styles.subscriptionModalContainer} onPress={(e) => e.stopPropagation()}>

            <View style={styles.subscriptionModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.subscriptionModalTitle}>Manage Subscription</Text>
                <Text style={styles.subscriptionModalSubtitle}>Choose the plan that fits your needs</Text>
              </View>
              <Pressable onPress={() => setSubscriptionModalVisible(false)} hitSlop={8}>
                <Ionicons name="close-circle" size={32} color="#64748B" />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              <View style={{ padding: 24 }}>

                {/* Current Plan Info */}
                <View style={styles.currentPlanSection}>
                  <View style={styles.currentPlanBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    <Text style={styles.currentPlanBadgeText}>Active Plan</Text>
                  </View>
                  <Text style={styles.modalCurrentPlanName}>{currentSubscription?.plan_name || "No Plan"}</Text>
                  <Text style={styles.modalCurrentPlanPrice}>₹{currentSubscription?.amount_paid || "—"}/month</Text>
                  <View style={styles.planValidityContainer}>
                    <Ionicons name="time-outline" size={18} color="#6366F1" />
                    <Text style={styles.planValidityText}>Valid for {currentSubscription?.days_remaining ?? "—"} more days</Text>
                  </View>
                </View>

                {/* Available Plans */}
                <Text style={styles.sectionTitle}>Available Plans</Text>

                {availablePlans.length > 0 ? (
                  availablePlans.map((plan: any) => (
                    <Pressable
                      key={plan.id || plan.name}
                      style={[styles.planCard, activePlan === plan.name && styles.planCardActive]}
                      onPress={() => setActivePlan(plan.name)}
                    >
                      {activePlan === plan.name && (
                        <View style={styles.activePlanIndicator}>
                          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        </View>
                      )}
                      <View style={styles.planCardHeader}>
                        <Text style={[styles.planCardName, activePlan === plan.name && styles.planCardNameActive]}>
                          {plan.name}
                        </Text>
                      </View>
                      <View style={styles.planCardPricing}>
                        <Text style={[styles.planCardPrice, activePlan === plan.name && styles.planCardPriceActive]}>
                          ₹{plan.price ?? plan.base_price ?? "—"}
                        </Text>
                        <Text style={styles.planCardPeriod}>/month</Text>
                      </View>
                      <View style={styles.planCardFeatures}>
                        <View style={styles.featureItem}>
                          <Ionicons name="checkmark" size={16} color="#10B981" />
                          <Text style={styles.featureText}>Daily maid service</Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Ionicons name="checkmark" size={16} color="#10B981" />
                          <Text style={styles.featureText}>24/7 support</Text>
                        </View>
                      </View>
                    </Pressable>
                  ))
                ) : (
                  !loadingSubscription && (
                    <Text style={{ color: "#64748B", textAlign: "center", marginVertical: 16 }}>
                      No plans available at the moment.
                    </Text>
                  )
                )}

                {/* Update Button */}
                <Pressable
                  style={styles.modalUpdateButton}
                  onPress={() => {
                    handleUpdateSubscription();
                    setSubscriptionModalVisible(false);
                  }}
                >
                  <Text style={styles.modalUpdateButtonText}>Update Subscription</Text>
                  <Ionicons name="arrow-forward" size={20} color="#fff" />
                </Pressable>

                <View style={styles.modalFooterInfo}>
                  <Ionicons name="information-circle-outline" size={20} color="#64748B" />
                  <Text style={styles.modalFooterText}>Changes will take effect in the next billing cycle</Text>
                </View>

              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      {/* CHAT MODAL */}
      <Modal
        visible={chatVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setChatVisible(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalContainer}>
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