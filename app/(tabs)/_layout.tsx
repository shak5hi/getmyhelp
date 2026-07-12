import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import TabBar from "../../components/ui/TabBar";
import { useFeature } from "../../src/FeatureContext";
import { useRoleGuard } from "../../src/useRoleGuard";
import { MODULES } from "../../src/featureRegistry";

// Outline when idle, filled when selected — weight, not just colour, carries
// the selected state, which keeps it legible for colour-blind users.
const icon = (
  name: keyof typeof Ionicons.glyphMap,
  filled: keyof typeof Ionicons.glyphMap
) => {
  const TabIcon = ({ color, focused }: { color: string; focused: boolean }) => (
    <Ionicons name={focused ? filled : name} size={21} color={color} />
  );
  TabIcon.displayName = `TabIcon(${name})`;
  return TabIcon;
};

// A disabled module's tab is removed from the bar and its route blocked by
// setting `href: null` (the same mechanism already used for chatbot/subscriptions).
const tabHref = (enabled: boolean) => (enabled ? undefined : null);

export default function TabLayout() {
  useRoleGuard("customer", "/(guard-tabs)/visitor-list");
  const community = useFeature(MODULES.community);
  const visitors = useFeature(MODULES.visitors);

  return (
    <Tabs
      // Presentation lives in components/ui/TabBar. Routing, feature gating and
      // the `href: null` contract are untouched — the custom bar reads the same
      // descriptors the default one did.
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Home", tabBarIcon: icon("home-outline", "home") }} />
      <Tabs.Screen name="society" options={{ title: "Society", tabBarIcon: icon("business-outline", "business") }} />
      <Tabs.Screen name="community" options={{ title: "Community", tabBarIcon: icon("people-outline", "people"), href: tabHref(community) }} />
      <Tabs.Screen name="visitors" options={{ title: "Visitors", tabBarIcon: icon("walk-outline", "walk"), href: tabHref(visitors) }} />
      <Tabs.Screen name="profile" options={{ title: "Account", tabBarIcon: icon("person-outline", "person") }} />
      <Tabs.Screen name="chatbot" options={{ href: null }} />
      <Tabs.Screen name="subscriptions" options={{ href: null }} />
    </Tabs>
  );
}
