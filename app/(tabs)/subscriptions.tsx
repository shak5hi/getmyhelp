import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  getAvailablePlans,
  getMySubscriptions,
  selectSubscription,
  requestSubscriptionCancellation,
  requestAbsenceCredit,
} from "../../src/api/subscriptionApi";
import { makeStyles } from "../../styles/subscriptions.styles";
import { fonts } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { useFeatureGuard } from "../../src/useFeatureGuard";
import { MODULES } from "../../src/featureRegistry";

export default function SubscriptionsScreen() {
  useFeatureGuard(MODULES.subscriptions);
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [currentSubscriptions, setCurrentSubscriptions] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Maid-absence credit request modal
  const [absenceSubId, setAbsenceSubId] = useState<string | null>(null);
  const [absenceDays, setAbsenceDays] = useState("");
  const [absenceReason, setAbsenceReason] = useState("");
  const [submittingAbsence, setSubmittingAbsence] = useState(false);

  // Refetch every time the tab gains focus (tab screens stay mounted, so a
  // mount-only effect would keep showing stale data after a backend change).
  useFocusEffect(
    useCallback(() => {
      fetchSubscriptionData();
    }, [])
  );

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // 1. Fetch current subscriptions for this customer
      const subData = await getMySubscriptions();
      const allSubs = subData?.data?.items || [];
      console.log("🔬 SUB object keys:", JSON.stringify(allSubs[0] ?? {}, null, 2));
      const activeSubs = allSubs.filter((s: any) => s.status === "active" || s.status === "pending_payment");
      setCurrentSubscriptions(activeSubs);

      // 2. Fetch available plans
      const plansData = await getAvailablePlans();
      if (plansData?.data?.items) {
        setAvailablePlans(plansData.data.items);
        console.log("🔬 PLAN object keys:", JSON.stringify(plansData.data.items[0] ?? {}, null, 2));
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = (planId?: string, planName?: string) => {
    if (!planId) return;

    // Guard against duplicate active subscriptions: the customer already has an
    // ongoing plan, so block a second one instead of silently creating it.
    if (currentSubscriptions.length > 0) {
      Alert.alert(
        "Active Plan Exists",
        "You already have an active subscription. Please cancel it before subscribing to a new plan."
      );
      return;
    }

    Alert.alert(
      "Subscribe",
      `Are you sure you want to subscribe to ${planName || "this plan"}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: async () => {
             try {
               const response = await selectSubscription(planId);
               if (response.message) {
                 Alert.alert("Success", response.message);
                 fetchSubscriptionData(); // Refresh list
               } else {
                 Alert.alert("Error", response.detail || "Failed to subscribe");
               }
             } catch (err) {
               Alert.alert("Error", "Network error. Please try again.");
             }
          }
        }
      ]
    );
  };

  const handleCancelRequest = (subscriptionId: string) => {
    Alert.alert(
      "Request Cancellation",
      "Our team will process your cancellation request. Do you want to proceed?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes, Request", 
          style: "destructive",
          onPress: async () => {
            try {
              const response = await requestSubscriptionCancellation(subscriptionId);
              if (response.message) {
                Alert.alert("Request Sent", response.message);
                fetchSubscriptionData(); // Refresh list
              } else {
                Alert.alert("Error", response.detail || "Failed to request cancellation");
              }
            } catch (err) {
              Alert.alert("Error", "Network error. Please try again.");
            }
          }
        }
      ]
    );
  };

  const closeAbsenceModal = () => {
    setAbsenceSubId(null);
    setAbsenceDays("");
    setAbsenceReason("");
  };

  const submitAbsenceCredit = async () => {
    const days = parseInt(absenceDays, 10);
    if (!days || days < 1) {
      Alert.alert("Invalid days", "Please enter how many days the maid was absent.");
      return;
    }
    setSubmittingAbsence(true);
    try {
      const response = await requestAbsenceCredit(absenceSubId!, days, absenceReason);
      if (response.message) {
        closeAbsenceModal();
        Alert.alert("Request Sent", response.message);
        fetchSubscriptionData();
      } else {
        Alert.alert("Error", response.detail || "Failed to submit request");
      }
    } catch {
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setSubmittingAbsence(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top", "bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.header}>Subscriptions</Text>
        <Text style={styles.subHeader}>Manage your plans and billing</Text>

        {/* --- SECTION: ACTIVE SUBSCRIPTIONS --- */}
        <Text style={styles.sectionTitle}>Your Active Plans</Text>

        {currentSubscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color={theme.textTertiary} />
            <Text style={styles.emptyStateTitle}>No Active Subscriptions</Text>
            <Text style={styles.emptyStateText}>
              You don't have any ongoing plans. Explore our deals below to get started.
            </Text>
          </View>
        ) : (
          currentSubscriptions.map((sub, index) => (
            <View key={sub.id || index} style={styles.activeCard}>
              <View style={styles.activeCardHeader}>
                <View style={styles.activeBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={theme.success} />
                  <Text style={styles.activeBadgeText}>{sub.status?.toUpperCase() || "ACTIVE"}</Text>
                </View>
              </View>
              
              <Text style={styles.planName}>{sub.plan?.name || "Custom Plan"}</Text>
              <Text style={styles.planPrice}>
                ₹{sub.amount_paid || sub.plan?.base_price || "—"} / month
              </Text>

              <View style={[styles.actionRow, { gap: 10 }]}>
                <TouchableOpacity
                  style={[styles.deleteButton, { flex: 1, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, backgroundColor: theme.surfaceAlt }]}
                  onPress={() => setAbsenceSubId(sub.id)}
                >
                  <Ionicons name="calendar-outline" size={15} color={theme.text} />
                  <Text style={[styles.deleteButtonText, { color: theme.text }]}>Report Absence</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.deleteButton, { flex: 1 }]}
                  onPress={() => handleCancelRequest(sub.id)}
                >
                  <Text style={styles.deleteButtonText}>Cancel Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        {/* --- SECTION: AVAILABLE PLANS --- */}
        <Text style={styles.sectionTitle}>Available Plans</Text>

        {availablePlans.length === 0 ? (
          <Text style={{ color: theme.textSecondary, textAlign: "center", marginVertical: 16 }}>
            No standard plans loaded.
          </Text>
        ) : (
          availablePlans.map((plan, index) => (
            <View key={plan.id || index} style={styles.availableCard}>
              <Text style={styles.availablePlanName}>{plan.name || "Plan"}</Text>
              <Text style={styles.availablePlanPrice}>
                ₹{plan.price ?? plan.base_price ?? "—"} <Text style={{ fontSize: 16, color: theme.textSecondary, fontFamily: fonts.semibold }}>/month</Text>
              </Text>

              <TouchableOpacity 
                style={styles.subscribeButton}
                onPress={() => handleAddSubscription(plan.id, plan.name)}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                <Ionicons name="arrow-forward" size={16} color={theme.accent} />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Maid-absence credit request modal */}
      <Modal
        visible={!!absenceSubId}
        transparent
        animationType="fade"
        onRequestClose={closeAbsenceModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1, justifyContent: "center", backgroundColor: "rgba(0,0,0,0.45)", padding: 24 }}
        >
          <View style={{ backgroundColor: theme.card, borderRadius: 16, padding: 20 }}>
            <Text style={{ fontFamily: fonts.bold, fontSize: 18, color: theme.text, marginBottom: 6 }}>
              Report Maid Absence
            </Text>
            <Text style={{ fontSize: 13.5, color: theme.textSecondary, marginBottom: 16, lineHeight: 19 }}>
              Tell us how many days the maid was absent. The admin will review and, if approved, add those days back to your subscription.
            </Text>

            <Text style={{ fontSize: 12, fontFamily: fonts.semibold, color: theme.textSecondary, marginBottom: 6 }}>
              Days absent *
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: theme.text, backgroundColor: theme.bg, marginBottom: 14 }}
              placeholder="e.g. 3"
              placeholderTextColor={theme.textTertiary}
              keyboardType="number-pad"
              value={absenceDays}
              onChangeText={setAbsenceDays}
            />

            <Text style={{ fontSize: 12, fontFamily: fonts.semibold, color: theme.textSecondary, marginBottom: 6 }}>
              Reason (optional)
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: theme.text, backgroundColor: theme.bg, minHeight: 70, textAlignVertical: "top", marginBottom: 18 }}
              placeholder="Add any details for the admin..."
              placeholderTextColor={theme.textTertiary}
              multiline
              value={absenceReason}
              onChangeText={setAbsenceReason}
            />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: "center", backgroundColor: theme.surfaceAlt }}
                onPress={closeAbsenceModal}
                disabled={submittingAbsence}
              >
                <Text style={{ color: theme.text, fontFamily: fonts.semibold, fontSize: 15 }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: "center", backgroundColor: theme.accent, opacity: submittingAbsence ? 0.7 : 1 }}
                onPress={submitAbsenceCredit}
                disabled={submittingAbsence}
              >
                {submittingAbsence ? (
                  <ActivityIndicator color={theme.onAccent ?? "#fff"} />
                ) : (
                  <Text style={{ color: theme.onAccent ?? "#fff", fontFamily: fonts.bold, fontSize: 15 }}>Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
