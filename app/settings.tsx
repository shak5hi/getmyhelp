/* SETTINGS + LOGOUT FEATURE */
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import config from "../src/config";

export default function SettingsScreen() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  // ── Logout ──────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Log Out", style: "destructive", onPress: performLogout },
      ]
    );
  };

  const performLogout = async () => {
    try {
      setLoggingOut(true);

      // 1️⃣ Call backend logout (fire & forget — client always clears token)
      const token = await AsyncStorage.getItem("access_token");
      if (token) {
        try {
          await fetch(`${config.apiUrl}/customer/logout`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
        } catch {
          // Network error — still proceed with local logout
        }
      }

      // 2️⃣ Clear all stored auth data
      await AsyncStorage.multiRemove(["access_token", "user"]);

      // 3️⃣ Navigate to phone (login) and clear the entire stack
      router.replace("/phone");
    } catch {
      // Fallback — always clear and redirect
      await AsyncStorage.multiRemove(["access_token", "user"]).catch(() => {});
      router.replace("/phone");
    } finally {
      setLoggingOut(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* HEADER — matches profile/dashboard header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#2E3A46" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <View style={styles.container}>
        {/* ACCOUNT SECTION */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionLabel}>Account</Text>

          <View style={styles.card}>
            {/* Logout row */}
            <TouchableOpacity
              style={styles.menuRow}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              <View style={styles.menuRowLeft}>
                <View style={[styles.menuIcon, styles.menuIconDanger]}>
                  <Ionicons name="log-out-outline" size={20} color="#DC2626" />
                </View>
                <Text style={styles.menuRowTextDanger}>
                  {loggingOut ? "Logging out…" : "Log Out"}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D1D5DB" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  /* HEADER — identical to profile screen */
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    padding: 20,
    gap: 8,
  },

  /* SECTION */
  sectionContainer: {
    gap: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    paddingHorizontal: 4,
  },

  /* CARD — matches profile screen card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
    overflow: "hidden",
  },

  /* MENU ROWS */
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconDanger: {
    backgroundColor: "#FEE2E2",
  },
  menuRowTextDanger: {
    fontSize: 16,
    fontWeight: "600",
    color: "#DC2626",
  },
});
/* END SETTINGS + LOGOUT FEATURE */
