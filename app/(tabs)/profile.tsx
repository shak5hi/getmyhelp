import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import config from "../../src/config";
import { makeStyles } from "../../styles/profile.styles";
import { useTheme } from "../../src/ThemeContext";

// --- TYPES ---
type UserData = {
  name: string;
  phone: string;
  society: string;
  tower: string;
};

// --- COMPONENTS ---
const ProfileHeader = ({ user }: { user: UserData | null }) => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerTopRow}>
        <Text style={styles.headerKicker}>Profile</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => router.push("/(tabs)/settings")}>
          <Ionicons name="settings-outline" size={20} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user?.name || "Guest User"}</Text>
          <Text style={styles.userPhone}>{user?.phone || "Please log in"}</Text>
          {user?.society && user?.tower && (
            <View style={styles.addressBadge}>
              <Ionicons name="location-sharp" size={11} color={theme.accent} />
              <Text style={styles.userAddress} numberOfLines={1}>
                {user.society}, {user.tower}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const SectionCard = ({ title, children }: { title?: string; children: React.ReactNode }) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <View style={styles.sectionContainer}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  );
};

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
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <>
      <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
            <Ionicons name={icon} size={20} color={danger ? theme.danger : theme.textSecondary} />
          </View>
          <Text style={[styles.menuItemTitle, danger && styles.menuItemTitleDanger]}>{title}</Text>
        </View>
        {showChevron && <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />}
      </TouchableOpacity>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};

// --- MAIN SCREEN ---
export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* 1. GRADIENT PROFILE HEADER */}
      <ProfileHeader user={user} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* ACCOUNT */}
        <SectionCard title="ACCOUNT">
          <MenuItem
            icon="card-outline"
            title="Manage Subscription"
            onPress={() => router.push("/(tabs)/subscriptions")}
          />
          <MenuItem
            icon="settings-outline"
            title="Settings"
            isLast
            onPress={() => router.push("/(tabs)/settings")}
          />
        </SectionCard>

        {/* LOGOUT */}
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
    </View>
  );
}