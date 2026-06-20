import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  TouchableOpacity,
  View,
} from "react-native";
import config from "../../src/config";
import { useLanguage } from "../../src/LanguageContext";
import { dashboardStyles as styles } from "../../styles/dashboard.styles";
import { colors } from "../../constants/tokens";
import TodaysHelp from "../../components/TodaysHelp";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  useLanguage();

  // API state
  const [customerName, setCustomerName] = useState("user");
  const [customerImage, setCustomerImage] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState("Your Home");
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);

  // UI state
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [subscriptionModalVisible, setSubscriptionModalVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const customerId = user?.id;

      if (!customerId || !token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 1. Fetch active assignments
      console.log(`🔍 Fetching assignments for customer`);
      const assignmentsRes = await fetch(
        `${config.apiUrl}/customer/assignments`,
        { headers }
      );
      
      console.log(`📊 Assignments Status: ${assignmentsRes.status}`);
      
      if (!assignmentsRes.ok) {
        console.log(`⚠️ Assignments fetch failed: ${assignmentsRes.status}`);
        setAssignments([]);
      } else {
        const assignmentsData = await assignmentsRes.json();
        const assignmentsList = assignmentsData.data || [];
        console.log("🔍 Assignments Response:", JSON.stringify(assignmentsList, null, 2));

        if (assignmentsList.length > 0) {
          const mappedAssignments = assignmentsList.map((acc: any) => {
            const provider = acc.provider;
            const fullName = `${provider.first_name} ${provider.last_name}`.trim() || "Assigned Maid";
            const profileImage = provider.profile_image || null;
            
            return {
              id: acc.id,
              name: fullName,
              role: acc.assigned_services?.[0] || "Daily Help",
              since: acc.start_date
                ? new Date(acc.start_date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                : "Active",
              image: profileImage,
              daysPresent: "—",
              nextService: "—",
              providerId: provider.id
            };
          });
          setAssignments(mappedAssignments);
        } else {
          setAssignments([]);
        }
      }


      // 3. Prefer common name fields, fall back to 'user'
      const rawName =
        (user?.first_name && user.first_name.trim()) ||
        (user?.firstName && user.firstName.trim()) ||
        (user?.name && user.name.trim()) ||
        "user";

      const formattedName =
        rawName.length > 0 ? rawName.charAt(0).toUpperCase() + rawName.slice(1) : "User";

      setCustomerName(formattedName);
      setCustomerImage(user?.profile_image || null);
      setLocationLabel(user?.flat_number ? `Flat ${user.flat_number}` : "Your Home");

      // 4. Fetch current subscription
      const subRes = await fetch(
        `${config.apiUrl}/admin/customers/${customerId}/subscriptions`,
        { headers }
      );
      const subData = await subRes.json();

      const activeSub =
        subData?.subscriptions?.find((s: any) => s.status === "active") ||
        subData?.subscriptions?.[0];

      if (activeSub) {
        setCurrentSubscription(activeSub);
        setSelectedPlanId(activeSub.plan_id || activeSub.id);
      }

      // 5. Fetch available plans
      const plansRes = await fetch(
        `${config.apiUrl}/admin/subscriptions/available-for-customer/${customerId}`,
        { headers }
      );
      const plansData = await plansRes.json();

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

  const getInitials = (name: string) => {
    if (!name) return "?";
    const names = name.trim().split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].substring(0, 2).toUpperCase();
  };

  const handleUpdateSubscription = async () => {
    if (!selectedPlanId) {
      Alert.alert("Select a Plan", "Please choose a subscription plan first.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        Alert.alert("Error", "You are not logged in.");
        return;
      }

      const response = await fetch(`${config.apiUrl}/customer/select-subscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan_id: selectedPlanId }),
      });

      if (response.ok) {
        Alert.alert(
          "Success ✅",
          "Your subscription has been updated successfully!",
          [{ text: "Great!" }]
        );
        fetchDashboardData(); // Refresh current subscription
        setSubscriptionModalVisible(false);
      } else {
        const data = await response.json();
        Alert.alert("Error", data.detail || "Failed to update subscription. Please try again.");
      }
    } catch (err) {
      Alert.alert("Error", "Network error. Please check your connection.");
    }
  };

  const openChat = () => {
    router.push("/(tabs)/chatbot");
  };

  const resetToMain = () => {
    // Legacy reset logic removed
  };

  const renderMessage = ({ item }: { item: any }) => null; // Legacy renderer removed

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* GRADIENT HEADER */}
        <LinearGradient
          colors={[colors.gradientStart, colors.gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerGradient, { paddingTop: insets.top + 14 }]}
        >
          <View style={styles.headerTopRow}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.push("/(tabs)/settings")}>
              <Ionicons name="menu" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.headerLocation}>
              <Ionicons name="location-sharp" size={14} color="#FFFFFF" />
              <Text style={styles.headerLocationText} numberOfLines={1}>{locationLabel}</Text>
              <Ionicons name="chevron-down" size={14} color="#FFFFFF" />
            </View>

            <TouchableOpacity style={styles.headerAvatar} onPress={() => router.push("/(tabs)/profile")}>
              {customerImage ? (
                <Image source={{ uri: customerImage }} style={styles.avatarImage} />
              ) : (
                <View style={styles.headerAvatarInitials}>
                  <Text style={styles.headerAvatarInitialsText}>{getInitials(customerName)}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          <Text style={styles.headerGreeting}>Hi {customerName}!</Text>
          <Text style={styles.headerSubtitle}>What can we help you with today?</Text>

          <Pressable style={styles.searchBar} onPress={openChat}>
            <Ionicons name="search" size={18} color={colors.textTertiary} />
            <Text style={styles.searchPlaceholder}>Search services, tickets…</Text>
          </Pressable>
        </LinearGradient>

        {/* BODY */}
        <View style={styles.body}>

          {/* SERVICES LIST */}
          <View>
            <Text style={styles.sectionLabel}>Services</Text>
            <View style={styles.serviceList}>
              {[
                { label: "My Society", desc: "Notices, payments & contacts", icon: "business", color: "#2563EB", bg: "#EFF6FF", onPress: () => router.push("/(tabs)/society") },
                { label: "Raise a Ticket", desc: "Report an issue to your society", icon: "construct", color: "#EA580C", bg: "#FFF7ED", onPress: () => router.push("/society/create-ticket") },
                { label: "Subscription Plans", desc: "Manage your home help plan", icon: "diamond", color: "#9333EA", bg: "#F5EBFF", onPress: () => router.push("/(tabs)/subscriptions") },
                { label: "Visitors", desc: "Invite & approve your guests", icon: "people", color: "#16A34A", bg: "#F0FDF4", onPress: () => router.push("/(tabs)/visitors") },
                { label: "Support", desc: "Chat with our help assistant", icon: "headset", color: "#E11D48", bg: "#FFF1F2", onPress: openChat },
              ].map((s, i, arr) => (
                <TouchableOpacity
                  key={s.label}
                  style={[styles.serviceRow, i < arr.length - 1 && styles.serviceRowDivider]}
                  activeOpacity={0.7}
                  onPress={s.onPress}
                >
                  <View style={[styles.serviceIcon, { backgroundColor: s.bg }]}>
                    <Ionicons name={s.icon as any} size={20} color={s.color} />
                  </View>
                  <View style={styles.serviceTextWrap}>
                    <Text style={styles.serviceTitle}>{s.label}</Text>
                    <Text style={styles.serviceDesc} numberOfLines={1}>{s.desc}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* HERO SECTION / ALERT */}
          {assignments.length > 0 ? (
            assignments.map((assignedMaid) => (
              <View key={assignedMaid.id} style={styles.heroCard}>
                <View style={styles.heroText}>
                  <Text style={styles.heroLabel}>Your Maid</Text>
                  <Text style={styles.heroName}>{assignedMaid.name}</Text>
                  <Text style={styles.heroRole}>{assignedMaid.role}</Text>
                  <Text style={styles.heroDate}>Since {assignedMaid.since}</Text>
                  <Pressable
                    style={styles.heroButton}
                    onPress={() => router.push({
                      pathname: "/assignment-details",
                      params: { id: assignedMaid.id }
                    })}
                  >
                    <Text style={styles.heroButtonText}>View Details</Text>
                  </Pressable>
                </View>
                {assignedMaid.image ? (
                  <Image source={{ uri: assignedMaid.image }} style={styles.heroImage} />
                ) : (
                  <View style={[styles.heroImage, styles.heroInitials]}>
                    <Text style={styles.heroInitialsText}>{getInitials(assignedMaid.name)}</Text>
                  </View>
                )}
              </View>
            ))
          ) : (
            <View style={styles.alertCard}>
              <View style={styles.alertIconContainer}>
                <Ionicons name="alert-circle" size={28} color="#9A3412" />
              </View>
              <View style={styles.alertContent}>
                <Text style={styles.alertTitle}>No Maid Assigned</Text>
                <Text style={styles.alertText}>It looks like you don't have a maid assigned to your flat yet.</Text>
                <Pressable
                  style={styles.alertButton}
                  onPress={() => Alert.alert("Contact AOA", "Please contact the Apartment Owners Association (AOA) to assign a maid.")}
                >
                  <Text style={styles.alertButtonText}>Contact AOA</Text>
                </Pressable>
              </View>
            </View>
          )}

          {/* TODAY'S HELP — resident-marked maid attendance */}
          <TodaysHelp />

          {/* SUBSCRIPTION PROMO BANNER */}
          <Pressable style={styles.promoBanner} onPress={() => setSubscriptionModalVisible(true)}>
            <View style={styles.promoTextWrap}>
              <Text style={styles.promoLabel}>YOUR PLAN</Text>
              <Text style={styles.promoTitle} numberOfLines={1}>
                {loadingSubscription ? "Loading…" : currentSubscription?.plan_name || "No active plan"}
              </Text>
              <Text style={styles.promoSubtitle}>
                {currentSubscription?.days_remaining != null
                  ? `${currentSubscription.days_remaining} days remaining`
                  : "Tap to explore plans"}
              </Text>
              <View style={styles.promoButton}>
                <Text style={styles.promoButtonText}>Manage Plan</Text>
              </View>
            </View>
            <View style={styles.promoIconCircle}>
              <Ionicons name="diamond" size={30} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>
      </ScrollView>

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
                  availablePlans.map((plan: any, index: number) => (
                    <Pressable
                      key={plan.id || index}
                      style={[styles.planCard, selectedPlanId === (plan.id) && styles.planCardActive]}
                      onPress={() => setSelectedPlanId(plan.id)}
                    >
                      {selectedPlanId === (plan.id) && (
                        <View style={styles.activePlanIndicator}>
                          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                        </View>
                      )}
                      <View style={styles.planCardHeader}>
                        <Text style={[styles.planCardName, selectedPlanId === (plan.id) && styles.planCardNameActive]}>
                          {plan.name}
                        </Text>
                      </View>
                      <View style={styles.planCardPricing}>
                        <Text style={[styles.planCardPrice, selectedPlanId === (plan.id) && styles.planCardPriceActive]}>
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

      {/* Legacy Chat Modal Removed */}
    </View>
  );
}