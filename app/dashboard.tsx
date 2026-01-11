import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useState } from "react";
import { dashboardStyles as styles } from "../styles/dashboard.styles";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";

const PLANS = [
  { 
    name: "Basic", 
    price: 499, 
    features: ["Standard support", "Basic scheduling", "1 maid"]
  },
  { 
    name: "Standard", 
    price: 599, 
    features: ["Priority support", "Advanced scheduling", "2 maids", "Weekly reports"]
  },
  { 
    name: "Gold", 
    price: 699, 
    features: ["24/7 customer support", "Priority service scheduling", "Exclusive discounts"],
    popular: true
  },
  { 
    name: "Platinum", 
    price: 899, 
    features: ["Dedicated manager", "Instant scheduling", "Unlimited maids", "Premium discounts"]
  }
];

export default function DashboardScreen() {
  useLanguage();
  const [activePlan, setActivePlan] = useState("Gold");
  const [showPlanDetails, setShowPlanDetails] = useState(false);

  const currentPlan = PLANS.find(p => p.name === activePlan);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      
    >
      {/* SUBSCRIPTION SECTION */}
      <Pressable 
        style={styles.subscriptionCard}
        onPress={() => setShowPlanDetails(!showPlanDetails)}
      >
        <View style={styles.subscriptionHeader}>
          <View>
            <View style={styles.currentPlanBadge}>
              <Text style={styles.currentPlanText}>
                {i18n.t("currentPlan") || "Current Plan"}
              </Text>
            </View>
            <Text style={styles.planName}>{activePlan}</Text>
            <Text style={styles.planPrice}>
              ₹{currentPlan.price}
              <Text style={styles.planPriceMonth}>
                {i18n.t("perMonth") || "/month"}
              </Text>
            </Text>
          </View>
          <Text style={styles.chevron}>{showPlanDetails ? "▲" : "▼"}</Text>
        </View>

        {/* Plan Pills */}
        <View style={styles.planPills}>
          {PLANS.map((plan) => (
            <Pressable
              key={plan.name}
              onPress={(e) => {
                e.stopPropagation();
                setActivePlan(plan.name);
              }}
              style={[
                styles.planPill,
                activePlan === plan.name && styles.planPillActive
              ]}
            >
              <Text
                style={[
                  styles.planPillText,
                  activePlan === plan.name && styles.planPillTextActive
                ]}
              >
                {plan.name}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Expanded Plan Details */}
        {showPlanDetails && (
          <View style={styles.planDetailsContainer}>
            {PLANS.map((plan) => (
              <Pressable
                key={plan.name}
                onPress={(e) => {
                  e.stopPropagation();
                  setActivePlan(plan.name);
                }}
                style={[
                  styles.planDetailCard,
                  activePlan === plan.name && styles.planDetailCardActive
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>
                      {i18n.t("mostPopular") || "Most Popular"}
                    </Text>
                  </View>
                )}
                <Text style={styles.planDetailName}>{plan.name}</Text>
                <Text style={styles.planDetailPrice}>₹{plan.price}</Text>
                {plan.features.map((feature, idx) => (
                  <Text key={idx} style={styles.planFeature}>
                    • {feature}
                  </Text>
                ))}
              </Pressable>
            ))}
            <Pressable style={styles.getPlanButton}>
              <Text style={styles.getPlanButtonText}>
                {i18n.t("getPlan") || "Get"} {activePlan} {i18n.t("plan") || "Plan"}
              </Text>
            </Pressable>
          </View>
        )}
      </Pressable>

      {/* GREETING */}
      <Text style={styles.greeting}>Good Morning, Shakshi!</Text>
      <Text style={styles.subGreeting}>
        Here's your home help overview.
      </Text>

      {/* HERO CARD */}
      <View style={styles.heroCard}>
        <View style={styles.heroText}>
          <Text style={styles.heroLabel}>Your Maid</Text>
          <Text style={styles.heroName}>Aaradhya Singh</Text>
          <Text style={styles.heroRole}>Everyday Maid</Text>
          <Text style={styles.heroDate}>Entry: 07 Jul 2024</Text>

          <Pressable style={styles.heroButton}>
            <Text style={styles.heroButtonText}>View Details</Text>
          </Pressable>
        </View>

        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=47" }}
          style={styles.heroImage}
        />
      </View>

      {/* BACKUP CARD */}
      <View style={styles.backupCard}>
        <Text style={styles.backupNumber}>12</Text>
        <View>
          <Text style={styles.backupLabel}>Backup days left</Text>
          <Pressable>
            <Text style={styles.backupAction}>Request Backup</Text>
          </Pressable>
        </View>
      </View>

      {/* ACTIVE MAIDS */}
      <Text style={styles.sectionTitle}>Active Maids</Text>

      <View style={styles.activeMaidsCard}>
        {[
          { name: "Anjali", role: "Househelp" },
          { name: "Sunita", role: "Cook" },
        ].map((maid) => (
          <Pressable key={maid.name} style={styles.maidRow}>
            <Image
              source={{ uri: `https://i.pravatar.cc/150?img=${maid.name === 'Anjali' ? '12' : '25'}` }}
              style={styles.maidAvatar}
            />
            <View>
              <Text style={styles.maidName}>{maid.name}</Text>
              <Text style={styles.maidRole}>{maid.role}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* TIMELINE */}
      <Text style={styles.sectionTitle}>Today's Timeline</Text>

      <View style={styles.timelineCard}>
        <View style={styles.timelineItem}>
          <Text style={styles.timelineTime}>09:02 AM</Text>
          <Text style={styles.timelineText}>
            Anjali (Househelp) Entered
          </Text>
        </View>

        <View style={styles.timelineItem}>
          <Text style={styles.timelineTime}>08:30 AM</Text>
          <Text style={styles.timelineText}>
            Society Alert: Water Supply
          </Text>
        </View>
      </View>

      {/* QUICK ACTIONS */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <View style={styles.quickActions}>
        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>Add New Maid</Text>
        </Pressable>

        <Pressable style={styles.actionButton}>
          <Text style={styles.actionText}>Request Replacement</Text>
        </Pressable>
      </View>

      <Pressable style={styles.emergencyButton}>
        <Text style={styles.emergencyText}>Emergency Help</Text>
      </Pressable>
    </ScrollView>
  );
}