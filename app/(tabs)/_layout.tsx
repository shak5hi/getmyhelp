import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../constants/tokens";
import { Tabs } from "expo-router";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/ThemeContext";
import { useFeature } from "../../src/FeatureContext";
import { MODULES } from "../../src/featureRegistry";

const icon =
  (name: keyof typeof Ionicons.glyphMap, filled: keyof typeof Ionicons.glyphMap) =>
  ({ color, focused }: { color: string; focused: boolean }) =>
    <Ionicons name={focused ? filled : name} size={22} color={color} />;

// A disabled module's tab is removed from the bar and its route blocked by
// setting `href: null` (the same mechanism already used for chatbot/subscriptions).
const tabHref = (enabled: boolean) => (enabled ? undefined : null);

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const community = useFeature(MODULES.community);
  const visitors = useFeature(MODULES.visitors);

  const isLight = theme.mode === "light";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          // Sit just above the home indicator rather than a fixed 18px, which
          // collided with the gesture bar on some devices and floated too high
          // on others.
          bottom: Math.max(insets.bottom, 10),
          // Cap the width and centre it: with only three enabled modules a
          // full-bleed bar left the items marooned at the far edges.
          alignSelf: "center",
          width: "92%",
          maxWidth: 420,
          height: 64,
          borderRadius: 24,
          backgroundColor: theme.surface,
          // A hairline on all sides reads as a lifted object; a top-only border
          // reads as a docked bar that failed to reach the bottom.
          borderWidth: isLight ? 1 : 0,
          borderTopWidth: isLight ? 1 : 0,
          borderColor: theme.border,
          paddingTop: 8,
          paddingBottom: 8,
          paddingHorizontal: 6,
          shadowColor: isLight ? "#3B2A6B" : "#000000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: isLight ? 0.12 : 0.45,
          shadowRadius: 20,
          elevation: 12,
        },
        // The active item gets a tinted capsule — the accent then reads as a
        // deliberate selection rather than one icon happening to be a different
        // colour from the others.
        tabBarActiveBackgroundColor: theme.accentTint,
        tabBarItemStyle: {
          borderRadius: 16,
          marginHorizontal: 4,
          marginVertical: 4,
          paddingTop: 6,
          paddingBottom: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.semibold,
          letterSpacing: -0.1,
          marginTop: 2,
          // Android clips descenders in tab labels without a little headroom.
          includeFontPadding: false,
          ...(Platform.OS === "android" ? { paddingBottom: 2 } : null),
        },
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
