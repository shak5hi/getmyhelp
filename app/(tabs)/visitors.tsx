import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import VisitorHistoryScreen from "../visitor/visitor-history";
import ActiveInvitesScreen from "../visitor/active-invites";
import { fonts } from "../../constants/tokens";
import { useTheme } from "../../src/ThemeContext";
import { Theme } from "../../constants/themes";
import SegmentedControl from "../../components/ui/SegmentedControl";
import { useFeatureGuard } from "../../src/useFeatureGuard";
import { MODULES } from "../../src/featureRegistry";

const TABS = ["Active", "History"] as const;

export default function VisitorsScreen() {
  useFeatureGuard(MODULES.visitors);
  const router = useRouter();
  const { theme } = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("Active");

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visitors</Text>
      </View>

      {/* One clear primary action: invite a guest. QR vs OTP is chosen inside. */}
      <TouchableOpacity
        style={styles.inviteBtn}
        onPress={() => router.push("/visitor/invite")}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={20} color={theme.onAccent} />
        <Text style={styles.inviteBtnText}>Invite a guest</Text>
      </TouchableOpacity>

      <View style={styles.segmentWrap}>
        <SegmentedControl
          segments={TABS as unknown as string[]}
          value={TABS.indexOf(activeTab)}
          onChange={(i) => setActiveTab(TABS[i])}
        />
      </View>

      <View style={{ flex: 1 }}>
        {activeTab === "Active" && <ActiveInvitesScreen />}
        {activeTab === "History" && <VisitorHistoryScreen />}
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
  inviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: t.accent,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
  },
  inviteBtnText: { color: t.onAccent, fontSize: 16, fontFamily: fonts.bold },
  segmentWrap: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: t.bg,
  },
});
