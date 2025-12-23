import { View, Text, TouchableOpacity, Pressable, Animated } from "react-native";
import { useState, useRef } from "react";
import { useRouter } from "expo-router";
import { subscriptionStyles as styles } from "../styles/subscription.styles";

const PLANS = {
  Basic: { price: "₹399", features: ["Basic support", "Standard scheduling"] },
  Standard: { price: "₹549", features: ["Faster support", "Priority scheduling"] },
  Gold: {
    price: "₹699",
    features: [
      "24/7 customer support",
      "Priority service scheduling",
      "Exclusive discounts",
      "Extended warranty",
      "Premium providers",
    ],
  },
  Platinum: {
    price: "₹999",
    features: [
      "Dedicated manager",
      "Instant service access",
      "Maximum discounts",
    ],
  },
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<keyof typeof PLANS>("Gold");

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const changePlan = (newPlan: keyof typeof PLANS) => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    setPlan(newPlan);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select your plan</Text>
      <Text style={styles.subtitle}>
        Choose a membership that fits your home
      </Text>

      {/* TOGGLE */}
      <View style={styles.toggleContainer}>
        {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((item) => {
          const active = plan === item;
          return (
            <Pressable
              key={item}
              onPress={() => changePlan(item)}
              style={[
                styles.toggleItem,
                active && styles.toggleItemActive,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  active && styles.toggleTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* CARD */}
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        {plan === "Gold" && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>Most Popular</Text>
          </View>
        )}

        <Text style={styles.planTitle}>{plan}</Text>
        <Text style={styles.price}>
          {PLANS[plan].price} / month
        </Text>

        {PLANS[plan].features.map((f) => (
          <Text key={f} style={styles.feature}>
            • {f}
          </Text>
        ))}

        <TouchableOpacity
          style={styles.cta}
          onPress={() => {
            console.log("Selected plan:", plan);
            // router.replace("/home");
          }}
        >
          <Text style={styles.ctaText}>
            Get {plan} Plan
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}
