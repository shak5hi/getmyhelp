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
  Alert,
} from "react-native";
import { useState } from "react";
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

export default function DashboardScreen() {
  useLanguage();

  const [activePlan, setActivePlan] = useState("Basic");
  const [showPlanDetails, setShowPlanDetails] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);

  const currentPlan = PLANS.find((p) => p.name === activePlan)!;

  const handleUpdateSubscription = () => {
    Alert.alert(
      "Request Sent ✅",
      "Your request to update the subscription has been sent. Our team will contact you shortly.",
      [{ text: "Okay" }]
    );
  };

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
                    activePlan === plan.name &&
                      styles.planDetailCardActive,
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
      <Pressable
        style={styles.chatButton}
        onPress={() => setChatVisible(true)}
      >
        <Ionicons name="chatbubble-ellipses" size={26} color="#fff" />
      </Pressable>
    </>
  );
}
