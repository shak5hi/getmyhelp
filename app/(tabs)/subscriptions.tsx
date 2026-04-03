import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import config from "../../src/config";
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
      const token = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      const customerId = user?.id;

      if (!customerId || !token) {
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // 1. Fetch current subscriptions
      const subRes = await fetch(
        `${config.apiUrl}/admin/customers/${customerId}/subscriptions`,
        { headers }
      );
      const subData = await subRes.json();
      
      const activeSubs = subData?.subscriptions?.filter((s: any) => s.status === "active") || [];
      const pastSubs = subData?.subscriptions || [];
      // Combine gracefully if no active, just to show fallback (optional logic, we stick to active)
      setCurrentSubscriptions(activeSubs.length > 0 ? activeSubs : (pastSubs.length > 0 ? [pastSubs[0]] : []));

      // 2. Fetch available plans
      const plansRes = await fetch(
        `${config.apiUrl}/admin/subscriptions/available-for-customer/${customerId}`,
        { headers }
      );
      const plansData = await plansRes.json();

      if (plansData?.subscriptions) {
        setAvailablePlans(plansData.subscriptions);
      } else if (Array.isArray(plansData)) {
        setAvailablePlans(plansData);
      }
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubscription = (planName?: string) => {
    Alert.alert(
      "Subscribe",
      `Are you sure you want to subscribe to ${planName || "a new plan"}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          onPress: () => {
            // TODO: POST /admin/customers/{customerId}/subscriptions
            Alert.alert("Success", "Subscription added successfully! (Mocked)");
          }
        }
      ]
    );
  };

  const handleUpdateSubscription = (subRef: string) => {
    Alert.alert(
      "Update Plan",
      "Do you want to change your billing cycle or upgrade this plan?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Proceed", 
          onPress: () => {
            // TODO: PUT or similar endpoint
            Alert.alert("Request Sent", "Our team will help you update your plan.");
          }
        }
      ]
    );
  };

  const handleDeleteSubscription = (subRef: string) => {
    Alert.alert(
      "Cancel Subscription",
      "Are you absolutely sure you want to cancel this subscription? This action cannot be undone.",
      [
        { text: "No, Keep it", style: "cancel" },
        { 
          text: "Yes, Cancel", 
          style: "destructive",
          onPress: () => {
            // TODO: DELETE config.apiUrl/admin/subscriptions/{id}
            Alert.alert("Cancelled", "Your subscription has been removed. (Mocked)");
            setCurrentSubscriptions([]); // optimistically clear
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
    <SafeAreaView style={styles.container}>
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
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => handleAddSubscription()}
            >
              <Text style={styles.addButtonText}>Add Subscription</Text>
            </TouchableOpacity>
          </View>
        ) : (
          currentSubscriptions.map((sub, index) => (
            <View key={sub.id || index} style={styles.activeCard}>
              <View style={styles.activeCardHeader}>
                <View style={styles.activeBadge}>
                  <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                  <Text style={styles.activeBadgeText}>{sub.status || "ACTIVE"}</Text>
                </View>
              </View>
              
              <Text style={styles.planName}>{sub.plan_name || "Custom Plan"}</Text>
              <Text style={styles.planPrice}>
                ₹{sub.amount_paid || "—"} / month
              </Text>
              {sub.days_remaining !== undefined && (
                <Text style={styles.planInfo}>
                  Valid for {sub.days_remaining} more days
                </Text>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity 
                  style={styles.updateButton} 
                  onPress={() => handleUpdateSubscription(sub.id)}
                >
                  <Text style={styles.updateButtonText}>Update</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => handleDeleteSubscription(sub.id)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
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
                onPress={() => handleAddSubscription(plan.name)}
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