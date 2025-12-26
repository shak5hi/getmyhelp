import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { subscriptionStyles as styles } from "../styles/subscription.styles";

const PLANS = ["Basic", "Standard", "Gold", "Platinum"];

export default function SubscriptionScreen() {
  const router = useRouter();

  const [activePlan, setActivePlan] = useState("Gold");
  const [expanded, setExpanded] = useState(false);

  const handleGetPlan = () => {
    // 👉 After subscription selection, go to dashboard
    router.replace("/dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your plan</Text>
      <Text style={styles.subtitle}>
        Choose a membership that fits your home
      </Text>

      {/* SLIDER */}
      <View style={styles.slider}>
        {PLANS.map((plan) => {
          const isActive = activePlan === plan;

          return (
            <Pressable
              key={plan}
              onPress={() => {
                setActivePlan(plan);
                setExpanded(false); // reset expansion on plan change
              }}
              style={[
                styles.sliderItemWrapper,
                isActive && styles.sliderItemActive,
              ]}
            >
              <Text
                style={[
                  styles.sliderItemText,
                  isActive && styles.sliderItemTextActive,
                ]}
              >
                {plan}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* CARD */}
      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Most Popular</Text>
        </View>

        <Text style={styles.planTitle}>{activePlan}</Text>
        <Text style={styles.price}>₹699 / month</Text>

        <Text style={styles.feature}>• 24/7 customer support</Text>
        <Text style={styles.feature}>• Priority service scheduling</Text>
        <Text style={styles.feature}>• Exclusive discounts</Text>

        {expanded && (
          <>
            <Text style={styles.feature}>
              • Extended warranty on repairs
            </Text>
            <Text style={styles.feature}>
              • Access to premium service providers
            </Text>
            <Text style={styles.feature}>
              • Personalized service recommendations
            </Text>

            {/* CTA */}
            <Pressable style={styles.button} onPress={handleGetPlan}>
              <Text style={styles.buttonText}>
                Get {activePlan} Plan
              </Text>
            </Pressable>
          </>
        )}

        {/* SEE MORE */}
        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text style={styles.seeMore}>
            {expanded ? "Show less" : "See more"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
