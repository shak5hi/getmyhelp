import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VisitorHistoryScreen from "../visitor/visitor-history";
import QRInviteListScreen from "../visitor/qr-invite-list";
import OTPInviteListScreen from "../visitor/otp-invite-list";
import { fonts } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import SegmentedControl from "../../components/ui/SegmentedControl";

const TABS = ["History", "QR Invites", "OTP Invites"] as const;

export default function VisitorsScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("History");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visitors</Text>
        {activeTab === "QR Invites" && (
          <TouchableOpacity onPress={() => router.push("/visitor/generate-qr")}>
            <Ionicons name="add-circle-outline" size={26} color={theme.accent} />
          </TouchableOpacity>
        )}
        {activeTab === "OTP Invites" && (
          <TouchableOpacity onPress={() => router.push("/visitor/generate-otp")}>
            <Ionicons name="add-circle-outline" size={26} color={theme.accent} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.segmentWrap}>
        <SegmentedControl
          segments={TABS as unknown as string[]}
          value={TABS.indexOf(activeTab)}
          onChange={(i) => setActiveTab(TABS[i])}
        />
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "History" && <VisitorHistoryScreen />}
        {activeTab === "QR Invites" && <QRInviteListScreen />}
        {activeTab === "OTP Invites" && <OTPInviteListScreen />}
      </View>
    </SafeAreaView>
  );
}

const makeStyles = (t: Theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: t.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 26,
    paddingBottom: 8,
    backgroundColor: t.bg,
  },
  title: { fontSize: 26, fontFamily: fonts.extrabold, color: t.text, letterSpacing: -0.5 },
  segmentWrap: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 24,
    backgroundColor: t.bg,
  },
});
