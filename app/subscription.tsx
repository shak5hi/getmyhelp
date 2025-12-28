import { View, Text, Pressable } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { subscriptionStyles as styles } from "../styles/subscription.styles";
import i18n from "../src/i18n";
import { useLanguage } from "../src/LanguageContext";

const PLANS = ["Basic", "Standard", "Gold", "Platinum"];

export default function SubscriptionScreen() {
  useLanguage();
  const router = useRouter();

  const [activePlan, setActivePlan] = useState("Gold");
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{i18n.t("selectPlan")}</Text>
      <Text style={styles.subtitle}>{i18n.t("planSubtitle")}</Text>

      <View style={styles.slider}>
        {PLANS.map((plan) => {
          const isActive = activePlan === plan;

          return (
            <Pressable
              key={plan}
              onPress={() => {
                setActivePlan(plan);
                setExpanded(false);
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

      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {i18n.t("mostPopular")}
          </Text>
        </View>

        <Text style={styles.planTitle}>{activePlan}</Text>
        <Text style={styles.price}>
          ₹699 {i18n.t("perMonth")}
        </Text>

        <Text style={styles.feature}>• 24/7 customer support</Text>
        <Text style={styles.feature}>• Priority service scheduling</Text>
        <Text style={styles.feature}>• Exclusive discounts</Text>

        {expanded && (
          <Pressable
            style={styles.button}
            onPress={() => router.replace("/dashboard")}
          >
            <Text style={styles.buttonText}>
              {i18n.t("getPlan")} {activePlan}
            </Text>
          </Pressable>
        )}

        <Pressable onPress={() => setExpanded(!expanded)}>
          <Text style={styles.seeMore}>
            {expanded ? i18n.t("showLess") : i18n.t("seeMore")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
