import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { useTheme } from "../../src/ThemeContext";

const icon =
  (name: keyof typeof Ionicons.glyphMap, filled: keyof typeof Ionicons.glyphMap) =>
  ({ color, focused }: { color: string; focused: boolean }) =>
    <Ionicons name={focused ? filled : name} size={23} color={color} />;

export default function TabLayout() {
  const { theme } = useTheme();
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
        tabBarLabelStyle: { fontSize: 12, fontWeight: "600", marginTop: 1 },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Home", tabBarIcon: icon("home-outline", "home") }} />
      <Tabs.Screen name="society" options={{ title: "Society", tabBarIcon: icon("business-outline", "business") }} />
      <Tabs.Screen name="community" options={{ title: "Community", tabBarIcon: icon("people-outline", "people") }} />
      <Tabs.Screen name="visitors" options={{ title: "Visitors", tabBarIcon: icon("walk-outline", "walk") }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: icon("person-outline", "person") }} />
      <Tabs.Screen name="chatbot" options={{ href: null }} />
      <Tabs.Screen name="subscriptions" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
  );
}
