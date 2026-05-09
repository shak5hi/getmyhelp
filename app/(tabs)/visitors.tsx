import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VisitorHistoryScreen from "../visitor/visitor-history";
import QRInviteListScreen from "../visitor/qr-invite-list";
import OTPInviteListScreen from "../visitor/otp-invite-list";
import { colors } from "../../constants/tokens";

const TABS = ["History", "QR Invites", "OTP Invites"] as const;

export default function VisitorsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("History");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visitors</Text>
        {activeTab === "QR Invites" && (
          <TouchableOpacity onPress={() => router.push("/visitor/generate-qr")}>
            <Ionicons name="add-circle-outline" size={26} color={colors.accent} />
          </TouchableOpacity>
        )}
        {activeTab === "OTP Invites" && (
          <TouchableOpacity onPress={() => router.push("/visitor/generate-otp")}>
            <Ionicons name="add-circle-outline" size={26} color={colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.tabItemActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "History" && <VisitorHistoryScreen />}
        {activeTab === "QR Invites" && <QRInviteListScreen />}
        {activeTab === "OTP Invites" && <OTPInviteListScreen />}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 22, fontWeight: "700", color: colors.textPrimary },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabItemActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabText: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
  tabTextActive: { color: colors.accent, fontWeight: "700" },
});
