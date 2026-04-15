import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
  ActivityIndicator,
} from "react-native";
import { useLanguage } from "../../src/LanguageContext";
import { dashboardStyles as styles } from "../../styles/dashboard.styles";
import { apiFetch } from "../../src/api";

/* SUBSCRIPTION FEATURE */
type Subscription = {
  id: string;
  plan_name: string;
  amount_paid: number;
  start_date: string;
  end_date: string;
  status: string;
};

type Plan = {
  id: string;
  name: string;
  description: string;
  base_price: number;
  final_price: number;
  duration_days: number;
};

export default function SubscriptionScreen() {
  useLanguage();

  const [loading, setLoading] = useState(true);
  const [activeSubscription, setActiveSubscription] = useState<Subscription | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [subscribing, setSubscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscriptionState();
  }, []);

  const fetchSubscriptionState = async () => {
    try {
      setLoading(true);
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        // Redirection handled by apiFetch globally if token missing, 
        // but checking user object for ID
        return;
      }

      const user = JSON.parse(userStr);
      const customerId = user.id;

      // 1️⃣ Get active subscriptions
      const subRes = await apiFetch(`/admin/customers/${customerId}/subscriptions`);
      if (subRes.ok) {
        const subData = await subRes.json();
        const active = subData.subscriptions?.find((s: Subscription) => s.status === "active");

        if (active) {
          setActiveSubscription(active);
          setLoading(false);
          return;
        }
      }

      // 2️⃣ If no active sub, get available plans
      const plansRes = await apiFetch(`/admin/subscriptions/available-for-customer/${customerId}`);
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setAvailablePlans(plansData);
      }
      setActiveSubscription(null);
    } catch (err) {
      console.error("❌ Failed to fetch subscription state:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      setSubscribing(planId);
      const response = await apiFetch("/customer/select-subscription", {
        method: "POST",
        body: JSON.stringify({ plan_id: planId }),
      });

      if (response.ok) {
        Alert.alert("Success ✅", "Subscription activated successfully!");
        await fetchSubscriptionState();
      } else {
        const errorData = await response.json().catch(() => ({}));
        Alert.alert("Error", errorData.message || "Failed to activate subscription.");
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSubscribing(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Subscription</Text>
        <Pressable style={styles.profileButton}>
          <Ionicons name="diamond" size={20} color="#6366F1" />
        </Pressable>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={[styles.content, { paddingBottom: 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {activeSubscription ? (
          <>
            <View>
              <Text style={styles.greeting}>Your Active Plan</Text>
              <Text style={styles.subGreeting}>Manage your premium access</Text>
            </View>

            {/* ACTIVE PLAN CARD */}
            <View style={styles.subscriptionCard}>
              <View style={[styles.subscriptionGradientBorder, { backgroundColor: "#6366F1" }]}>
                <View style={styles.subscriptionContent}>
                  <View style={styles.subscriptionHeader}>
                    <View style={styles.subscriptionIconContainer}>
                      <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                    </View>
                    <Text style={styles.currentPlanLabel}>CURRENTLY ACTIVE</Text>
                  </View>

                  <View style={styles.subscriptionInfo}>
                    <View style={styles.subscriptionLeft}>
                      <Text style={styles.planName}>{activeSubscription.plan_name}</Text>
                      <Text style={styles.planPrice}>
                        ₹{activeSubscription.amount_paid}
                        <Text style={styles.planPriceMonth}> / paid</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.modalFooterInfo, { marginTop: 10, backgroundColor: "#EEF2FF" }]}>
                    <Ionicons name="calendar-outline" size={18} color="#4338CA" />
                    <Text style={[styles.modalFooterText, { color: "#4338CA" }]}>
                      Starts: {formatDate(activeSubscription.start_date)} · Ends: {formatDate(activeSubscription.end_date)}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            <View>
              <Text style={styles.greeting}>Available Plans</Text>
              <Text style={styles.subGreeting}>Choose the best plan for your needs</Text>
            </View>

            {availablePlans.length > 0 ? (
              availablePlans.map((plan) => (
                <Pressable
                  key={plan.id}
                  style={styles.planCard}
                  onPress={() => handleSubscribe(plan.id)}
                  disabled={!!subscribing}
                >
                  <View style={styles.planCardHeader}>
                    <Text style={styles.planCardName}>{plan.name}</Text>
                    {plan.duration_days === 30 && (
                      <View style={[styles.popularBadge, { backgroundColor: "#EEF2FF" }]}>
                        <Text style={[styles.popularBadgeText, { color: "#6366F1" }]}>{plan.duration_days} Days</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.planCardPricing}>
                    <Text style={styles.planCardPrice}>₹{plan.final_price}</Text>
                    {plan.final_price < plan.base_price && (
                      <Text style={{ fontSize: 14, color: "#9CA3AF", textDecorationLine: 'line-through', marginLeft: 8 }}>
                        ₹{plan.base_price}
                      </Text>
                    )}
                    <Text style={styles.planCardPeriod}>/ cycle</Text>
                  </View>

                  <Text style={[styles.featureText, { marginBottom: 12, marginLeft: 0 }]}>
                    {plan.description}
                  </Text>

                  <View style={[styles.modalUpdateButton, { marginBottom: 0, paddingVertical: 12 }]}>
                    {subscribing === plan.id ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Text style={styles.modalUpdateButtonText}>Subscribe Now</Text>
                        <Ionicons name="arrow-forward" size={18} color="#fff" />
                      </>
                    )}
                  </View>
                </Pressable>
              ))
            ) : (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Ionicons name="information-circle-outline" size={48} color="#9CA3AF" />
                <Text style={{ marginTop: 12, color: "#6B7280", fontSize: 16 }}>No plans available at the moment.</Text>
              </View>
            )}
          </>
        )}

        <View style={[styles.modalFooterInfo, { marginTop: 20 }]}>
          <Ionicons name="shield-checkmark-outline" size={20} color="#92400E" />
          <Text style={styles.modalFooterText}>
            Secure payment processing. You can manage your subscription anytime from settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
/* END SUBSCRIPTION FEATURE */
