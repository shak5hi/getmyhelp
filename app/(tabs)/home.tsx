/* PRODUCTION ARCHITECTURE UPGRADE — moved from app/dashboard.tsx */
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import config from "../../src/config";
import { useLanguage } from "../../src/LanguageContext";
import { dashboardStyles as styles } from "../../styles/dashboard.styles";

const PLANS = [
  { name: "Basic", price: 499 },
  { name: "Standard", price: 599 },
  { name: "Gold", price: 699 },
  { name: "Platinum", price: 899 },
];

export default function HomeScreen() {
  useLanguage();
  const router = useRouter();

  /* UPDATED LOGIC */
  const [customerName, setCustomerName] = useState("there");
  const [greeting, setGreeting] = useState("Hello");
  const [societyName, setSocietyName] = useState("");
  const [flatNumber, setFlatNumber] = useState("");

  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          const customer = JSON.parse(raw);
          if (customer?.first_name) setCustomerName(customer.first_name);
        }
      } catch (_) { }

      // Derive greeting from current hour
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");

      /* UPDATED LOGIC — fetch society & flat from profile API */
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (token) {
          // 1️⃣ Get the user's profile (flat_number + society_id)
          const profileRes = await fetch(
            `${config.apiUrl}/customer/profile`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (profileRes.ok) {
            const json = await profileRes.json();
            const p = json?.data;
            if (p?.flat_number) setFlatNumber(p.flat_number);

            // 2️⃣ Look up society name from the societies list API
            if (p?.society_id) {
              let societyList: { id: string; name: string }[] = [];
              const cached = await AsyncStorage.getItem("societies_data");
              if (cached) {
                societyList = JSON.parse(cached);
              } else {
                const socRes = await fetch(
                  `${config.apiUrl}/customer/societies`,
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                if (socRes.ok) {
                  const socJson = await socRes.json();
                  societyList = socJson?.data?.societies || [];
                }
              }
              const found = societyList.find((s) => s.id === p.society_id);
              if (found?.name) setSocietyName(found.name);
            }
          }
        }
      } catch (_) { }
    };
    loadCustomer();
  }, []);

  const [activePlan, setActivePlan] = useState("Basic");

  const currentPlan = PLANS.find((p) => p.name === activePlan)!;

  return (
    <>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GetMyHelp</Text>
        <Pressable style={styles.profileButton} onPress={() => router.push("/(tabs)/profile")}>
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
          <Text style={styles.greeting}>{greeting}, {customerName} 👋</Text>
          {(societyName || flatNumber) ? (
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
              <Ionicons name="location-outline" size={14} color="#6B7280" />
              <Text style={[styles.subGreeting, { marginLeft: 4 }]}>
                {[societyName, flatNumber].filter(Boolean).join(" · ")}
              </Text>
            </View>
          ) : null}
          <Text style={[styles.subGreeting, { marginTop: 2 }]}>
            Here's a quick overview of your service
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
          onPress={() => router.push("/(tabs)/subscription")}
        >
          <View style={styles.subscriptionGradientBorder}>
            <View style={styles.subscriptionContent}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionIconContainer}>
                  <Ionicons name="diamond" size={24} color="#6366F1" />
                </View>
                <Text style={styles.currentPlanLabel}>CURRENT PLAN</Text>
              </View>

              <View style={styles.subscriptionInfo}>
                <View style={styles.subscriptionLeft}>
                  <Text style={styles.planName}>{activePlan}</Text>
                  <Text style={styles.planPrice}>
                    ₹{currentPlan.price}
                    <Text style={styles.planPriceMonth}> /month</Text>
                  </Text>
                </View>
                <View style={styles.subscriptionRight}>
                  <Text style={styles.daysLeftNumber}>23</Text>
                  <Text style={styles.daysLeftText}>days left</Text>
                </View>
              </View>

              <View style={styles.subscriptionFooter}>
                <Text style={styles.tapToManageText}>Tap to manage subscription</Text>
                <Ionicons name="chevron-forward" size={20} color="#6366F1" />
              </View>
            </View>
          </View>
        </Pressable>
      </ScrollView>
    </>
  );
}
/* END PRODUCTION ARCHITECTURE UPGRADE */
