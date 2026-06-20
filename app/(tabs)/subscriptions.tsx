import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { 
  getAvailablePlans, 
  getMySubscriptions, 
  selectSubscription, 
  requestSubscriptionCancellation 
} from "../../src/api/subscriptionApi";
import { styles } from "../../styles/subscriptions.styles";

export default function SubscriptionsScreen() {
  const [currentSubscriptions, setCurrentSubscriptions] = useState<any[]>([]);
  const [availablePlans, setAvailablePlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);

      // 1. Fetch current subscriptions for this customer
      const subData = await getMySubscriptions();
      const allSubs = subData?.data?.items || [];
      const activeSubs = allSubs.filter((s: any) => s.status === "active" || s.status === "pending_payment");
      setCurrentSubscriptions(activeSubs);

      // 2. Fetch available plans
      const plansData = await getAvailablePlans();
      if (plansData?.data?.items) {
        setAvailablePlans(plansData.data.items);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = (planId?: string, planName?: string) => {
    if (!planId) return;

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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.header}>Subscriptions</Text>
        <Text style={styles.subHeader}>Manage your plans and billing</Text>

        {/* --- SECTION: ACTIVE SUBSCRIPTIONS --- */}
        <Text style={styles.sectionTitle}>Your Active Plans</Text>

        {currentSubscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="card-outline" size={48} color="#9CA3AF" />
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
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.activeBadgeText}>{sub.status?.toUpperCase() || "ACTIVE"}</Text>
                </View>
              </View>
              
              <Text style={styles.planName}>{sub.plan?.name || "Custom Plan"}</Text>
              <Text style={styles.planPrice}>
                ₹{sub.amount_paid || sub.plan?.base_price || "—"} / month
              </Text>

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.deleteButton}
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
          <Text style={{ color: "#64748B", textAlign: "center", marginVertical: 16 }}>
            No standard plans loaded.
          </Text>
        ) : (
          availablePlans.map((plan, index) => (
            <View key={plan.id || index} style={styles.availableCard}>
              <Text style={styles.availablePlanName}>{plan.name || "Plan"}</Text>
              <Text style={styles.availablePlanPrice}>
                ₹{plan.price ?? plan.base_price ?? "—"} <Text style={{ fontSize: 16, color: "#64748B", fontWeight: "600" }}>/month</Text>
              </Text>

              <TouchableOpacity 
                style={styles.subscribeButton}
                onPress={() => handleAddSubscription(plan.id, plan.name)}
              >
                <Text style={styles.subscribeButtonText}>Subscribe Now</Text>
                <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
