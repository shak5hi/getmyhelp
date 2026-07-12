import React, { useEffect, useMemo, useState } from "react";
import { View, ScrollView, TouchableOpacity, ActivityIndicator, Switch, Modal, Alert } from "react-native";
import { Text, TextInput } from "../../components/ui/Text";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import config from "../../src/config";
import { makeStyles } from "../../styles/profile.styles";
import { useTheme } from "../../src/ThemeContext";
import { useLanguage } from "../../src/LanguageContext";
import { clearSession, apiDelete } from "../../src/api/client";
import { registerForPush, unregisterForPush } from "../../src/push";
import { getMyResidence } from "../../src/api/societyApi";
import { getPushEnabled, setPushEnabled } from "../../src/preferences";
import ThemeToggle from "../../components/ThemeToggle";
import { getToken } from "../../src/api/tokenStore";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिंदी" },
];

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
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
      <View style={styles.headerTopRow}>
        <Text style={styles.headerKicker}>Account</Text>
      </View>

      <View style={styles.profileRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.userName} numberOfLines={1}>{user?.name || "Guest User"}</Text>
          <Text style={styles.userPhone}>{user?.phone || "Please log in"}</Text>
          {!!(user?.society || user?.tower) && (
            <View style={styles.addressBadge}>
              <Ionicons name="location-sharp" size={11} color={theme.accent} />
              <Text style={styles.userAddress} numberOfLines={1}>
                {[user.society, user.tower].filter(Boolean).join("  ·  ")}
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

// A settings row whose right side is a custom control (Switch, toggle, pills)
// rather than a navigation chevron.
const PreferenceRow = ({
  icon,
  title,
  right,
  isLast = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  right: React.ReactNode;
  isLast?: boolean;
}) => {
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  return (
    <>
      <View style={styles.menuItem}>
        <View style={styles.menuItemLeft}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon} size={20} color={theme.textSecondary} />
          </View>
          <Text style={styles.menuItemTitle}>{title}</Text>
        </View>
        {right}
      </View>
      {!isLast && <View style={styles.divider} />}
    </>
  );
};

// --- MAIN SCREEN ---
export default function ProfileScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { language, setLanguage } = useLanguage();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushEnabled, setPushEnabledState] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.trim().toUpperCase() !== "DELETE") {
      Alert.alert("Invalid input", "Please type DELETE to confirm.");
      return;
    }
    setDeleting(true);
    try {
      await apiDelete("/customer/account");
      await unregisterForPush();
      await clearSession();
      router.replace("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      Alert.alert("Error", "Failed to delete account. Please try again.");
    } finally {
      setDeleting(false);
      setDeleteModalVisible(false);
    }
  };

  useEffect(() => {
    loadUserData();
    getPushEnabled().then(setPushEnabledState);
  }, []);

  const togglePush = async (value: boolean) => {
    setPushEnabledState(value);
    // Persist first: registerForPush reads the preference and bails if it's off.
    await setPushEnabled(value);
    // Make the toggle actually take effect on the server, rather than only
    // gating a future launch — turning it off must delete the device token.
    if (value) {
      await registerForPush();
    } else {
      await unregisterForPush();
    }
  };

  const loadUserData = async () => {
    try {
      const token = await getToken();
      const userStr = await AsyncStorage.getItem("user");
      const userObj = userStr ? JSON.parse(userStr) : null;
      const customerId = userObj?.id;

      let rawName = "Guest";
      let rawPhone = "No Phone";
      let societyName = "";
      let flatNumber = userObj?.flat_number ? String(userObj.flat_number) : "";
      let towerName = "";

      if (token) {
        // One call resolves name/phone + the admin-assigned society/tower (by id,
        // since society_name/tower_name are often null) — see getMyResidence.
        try {
          const r = await getMyResidence();
          rawName = r.firstName || userObj?.first_name || userObj?.name || rawName;
          rawPhone = r.phone || userObj?.phone || userObj?.phoneNumber || rawPhone;
          societyName = r.societyName || "";
          towerName = r.towerName || "";
          if (r.flatNumber) flatNumber = r.flatNumber;
        } catch (apiErr) {
          console.log("Profile API error, falling back to storage:", apiErr);
          rawName = userObj?.first_name || userObj?.name || rawName;
          rawPhone = userObj?.phone || userObj?.phoneNumber || rawPhone;
        }
      } else if (userObj) {
        rawName = userObj.first_name || userObj.name || rawName;
        rawPhone = userObj.phone || userObj.phoneNumber || rawPhone;
      }

      if (!flatNumber) flatNumber = (await AsyncStorage.getItem("flat_number")) || "";

      // Address line shows society + tower + flat — whatever we could resolve.
      const towerLine = [towerName, flatNumber ? `Flat ${flatNumber}` : null]
        .filter(Boolean)
        .join(" · ");

      setUser({
        name: rawName,
        phone: rawPhone,
        society: societyName,
        tower: towerLine,
      });
    } catch (error) {
      console.error("Error loading user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Detach this device first — the DELETE needs the bearer token that
      // clearSession is about to wipe. Without this the next person to log in
      // on this handset keeps receiving the previous user's notifications.
      await unregisterForPush();
      await clearSession();
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
            isLast
            onPress={() => router.push("/(tabs)/subscriptions")}
          />
        </SectionCard>

        {/* PREFERENCES */}
        <SectionCard title="PREFERENCES">
          <PreferenceRow
            icon={theme.mode === "dark" ? "moon-outline" : "sunny-outline"}
            title="Appearance"
            right={<ThemeToggle />}
          />
          <PreferenceRow
            icon="notifications-outline"
            title="Push Notifications"
            right={
              <Switch
                trackColor={{ false: theme.surfaceAlt, true: theme.success }}
                thumbColor="#FFFFFF"
                onValueChange={togglePush}
                value={pushEnabled}
              />
            }
          />
          <PreferenceRow
            icon="language-outline"
            title="Language"
            isLast
            right={
              <View style={styles.langPills}>
                {LANGUAGES.map((lang) => {
                  const active = language === lang.code;
                  return (
                    <TouchableOpacity
                      key={lang.code}
                      onPress={() => setLanguage(lang.code)}
                      style={[styles.langPill, active && styles.langPillActive]}
                    >
                      <Text style={[styles.langPillText, active && styles.langPillTextActive]}>
                        {lang.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            }
          />
        </SectionCard>

        {/* SUPPORT */}
        <SectionCard title="SUPPORT">
          <MenuItem
            icon="help-buoy-outline"
            title="Help & Support"
            isLast
            onPress={() => router.push("/society/create-ticket")}
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
          <MenuItem
            icon="trash-outline"
            title="Delete my account"
            danger
            showChevron={false}
            isLast
            onPress={() => {
              setDeleteConfirmText("");
              setDeleteModalVisible(true);
            }}
          />
        </SectionCard>
        
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* DELETE ACCOUNT MODAL */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ backgroundColor: theme.surface, padding: 24, borderRadius: 12, width: "100%" }}>
            <Text style={{ fontSize: 18, fontWeight: "600", color: theme.text, marginBottom: 12 }}>Delete Account</Text>
            <Text style={{ fontSize: 14, color: theme.textSecondary, marginBottom: 20, lineHeight: 20 }}>
              This action is permanent. All your personal data will be deleted. Visitor logs are retained as society records.
              Type &quot;DELETE&quot; to confirm.
            </Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 12, color: theme.text, marginBottom: 20 }}
              placeholder="DELETE"
              placeholderTextColor={theme.textTertiary}
              onChangeText={setDeleteConfirmText}
              value={deleteConfirmText}
              autoCapitalize="characters"
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12 }}>
              <TouchableOpacity onPress={() => setDeleteModalVisible(false)} style={{ padding: 12 }}>
                <Text style={{ color: theme.textSecondary, fontWeight: "500" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDeleteAccount}
                disabled={deleting}
                style={{ padding: 12, backgroundColor: theme.danger, borderRadius: 8, marginLeft: 8 }}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={{ color: "#FFF", fontWeight: "600" }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}