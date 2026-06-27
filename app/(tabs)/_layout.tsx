import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../constants/tokens";
import { Tabs } from "expo-router";
import { useTheme } from "../../src/ThemeContext";
import { useFeature } from "../../src/FeatureContext";
import { MODULES } from "../../src/featureRegistry";

const icon =
  (name: keyof typeof Ionicons.glyphMap, filled: keyof typeof Ionicons.glyphMap) =>
  ({ color, focused }: { color: string; focused: boolean }) =>
    <Ionicons name={focused ? filled : name} size={23} color={color} />;

// A disabled module's tab is removed from the bar and its route blocked by
// setting `href: null` (the same mechanism already used for chatbot/subscriptions).
const tabHref = (enabled: boolean) => (enabled ? undefined : null);

export default function TabLayout() {
  const { theme } = useTheme();
  const community = useFeature(MODULES.community);
  const visitors = useFeature(MODULES.visitors);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 18,
          height: 66,
          borderRadius: 26,
          backgroundColor: theme.surface,
          borderTopWidth: theme.mode === "light" ? 1 : 0,
          borderColor: theme.border,
          paddingTop: 10,
          paddingBottom: 10,
          paddingHorizontal: 8,
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: theme.mode === "light" ? 0.1 : 0.4,
          shadowRadius: 24,
          elevation: 16,
        },
        tabBarItemStyle: { borderRadius: 18, marginHorizontal: 2 },
        tabBarLabelStyle: { fontSize: 12, fontFamily: fonts.semibold, marginTop: 1 },
      }}
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
