import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import config from "../../src/config";
import { styles } from "../../styles/profile.styles";

// --- TYPES ---
type UserData = {
  name: string;
  phone: string;
  society: string;
  tower: string;
};

// --- COMPONENTS ---
const ProfileHeader = ({ user }: { user: UserData | null }) => {
  if (!user) {
    return (
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={24} color="#4F46E5" />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>Guest User</Text>
          <Text style={styles.userPhone}>Please log in</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.headerCard}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name?.charAt(0)?.toUpperCase() || "U"}</Text>
      </View>
      <View style={styles.headerInfo}>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.userPhone}>{user.phone}</Text>
        {user.society && user.tower && (
          <View style={styles.addressBadge}>
            <Ionicons name="location-outline" size={12} color="#4B5563" />
            <Text style={styles.userAddress}>
              {user.society}, {user.tower}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const SectionCard = ({ title, children }: { title?: string; children: React.ReactNode }) => (
  <View style={styles.sectionContainer}>
    {title && <Text style={styles.sectionTitle}>{title}</Text>}
    <View style={styles.card}>{children}</View>
  </View>
);

const MenuItem = ({
  icon,
  title,
  onPress,
  showChevron = true,
  danger = false,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  danger?: boolean;
  isLast?: boolean;
}) => (
  <>
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuItemLeft}>
        <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
          <Ionicons name={icon} size={20} color={danger ? "#EF4444" : "#111827"} />
        </View>
        <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>{title}</Text>
      </View>
      {showChevron && <Ionicons name="chevron-forward" size={20} color="#D1D5DB" />}
    </TouchableOpacity>
    {!isLast && <View style={styles.divider} />}
  </>
);

// --- MAIN SCREEN ---
export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      const userStr = await AsyncStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      const customerId = userObj?.id;

      let rawName = "Guest";
      let rawPhone = "No Phone";
      let societyName = "No Society";
      let storedFlat = "No Tower";

      if (token) {
        // 1. Fetch real customer data from API
        try {
          const headers = { Authorization: `Bearer ${token}` };
          
          const res = await fetch(`${config.apiUrl}/customer/profile`, { headers });
          const apiUser = await res.json();
          
          if (apiUser) {
            rawName = apiUser.first_name || apiUser.name || userObj?.first_name || userObj?.name || rawName;
            rawPhone = apiUser.phone || apiUser.phoneNumber || apiUser.mobile || apiUser.user_phone || userObj?.phone || userObj?.phoneNumber || rawPhone;
          }
        } catch (apiErr) {
          console.log("Profile API error, falling back to storage:", apiErr);
          rawName = userObj?.first_name || userObj?.name || rawName;
          rawPhone = userObj?.phone || userObj?.phoneNumber || rawPhone;
        }
      } else if (userObj) {
        // No token or not logged in properly, but have user data in storage
        rawName = userObj.first_name || userObj.name || rawName;
        rawPhone = userObj.phone || userObj.phoneNumber || rawPhone;
      }

      // Load flat/tower selection from local storage
      storedFlat = (await AsyncStorage.getItem("flat_number")) || (await AsyncStorage.getItem("selected_tower_id")) || "No Tower";

      // Load society data from local storage (or API if you prefer)
      const selectedSocietyId = await AsyncStorage.getItem("selected_society_id");
      const societiesJson = await AsyncStorage.getItem("societies_data");
      
      if (selectedSocietyId && societiesJson) {
        const societiesData = JSON.parse(societiesJson);
        const match = societiesData.find((s: any) => s.id === selectedSocietyId);
        if (match && match.name) {
          societyName = match.name;
        }
      }

      setUser({
        name: rawName,
        phone: rawPhone,
        society: societyName,
        tower: storedFlat,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(["access_token", "user", "selected_society_id", "selected_tower_id", "flat_number"]);
      router.replace("/"); 
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const handleActionPress = (action: string) => {
    // TODO: Add API endpoint or Navigation logic here
    console.log(`Action triggered: ${action}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. USER INFO CARD */}
        <ProfileHeader user={user} />

        {/* 2. YOUR SUBSCRIPTION */}
        <SectionCard title="YOUR SUBSCRIPTION">
          <MenuItem
            icon="card-outline"
            title="View Current Subscription"
            onPress={() => handleActionPress("View Subscription")}
          />
          <MenuItem
            icon="add-circle-outline"
            title="Add Subscription"
            onPress={() => handleActionPress("Add Subscription")}
          />
          <MenuItem
            icon="refresh-circle-outline"
            title="Update Subscription"
            isLast
            onPress={() => handleActionPress("Update Subscription")}
          />
        </SectionCard>

        {/* 3. PAYMENTS & BILLING */}
        <SectionCard title="PAYMENTS & BILLING">
          <MenuItem
            icon="receipt-outline"
            title="Payment History"
            onPress={() => handleActionPress("Payment History")}
          />
          <MenuItem
            icon="document-text-outline"
            title="Billing Details"
            isLast
            onPress={() => handleActionPress("Billing Details")}
          />
        </SectionCard>

        {/* 4. HELP & SUPPORT */}
        <SectionCard title="HELP & SUPPORT">
          <MenuItem
            icon="alert-circle-outline"
            title="Raise a Complaint"
            onPress={() => handleActionPress("Raise Complaint")}
          />
          <MenuItem
            icon="chatbubbles-outline"
            title="Chat Support"
            onPress={() => handleActionPress("Chat Support")}
          />
          <MenuItem
            icon="call-outline"
            title="Call Support"
            onPress={() => handleActionPress("Call Support")}
          />
          <MenuItem
            icon="help-circle-outline"
            title="FAQs"
            isLast
            onPress={() => handleActionPress("FAQs")}
          />
        </SectionCard>

        {/* 5. ABOUT GETMYHELP */}
        <SectionCard title="ABOUT GETMYHELP">
          <MenuItem
            icon="document-lock-outline"
            title="Terms & Conditions"
            onPress={() => handleActionPress("Terms & Conditions")}
          />
          <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            isLast
            onPress={() => handleActionPress("Privacy Policy")}
          />
        </SectionCard>

        {/* 6. LOGOUT BUTTON */}
        <SectionCard>
          <MenuItem
            icon="log-out-outline"
            title="Logout"
            danger
            showChevron={false}
            isLast
            onPress={handleLogout}
          />
        </SectionCard>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}