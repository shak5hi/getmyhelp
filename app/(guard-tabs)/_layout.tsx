import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../../constants/tokens";
import { Tabs } from "expo-router";
import { useTheme } from "../../src/ThemeContext";
import { useFeature } from "../../src/FeatureContext";
import { MODULES } from "../../src/featureRegistry";

export default function GuardTabLayout() {
  const { theme } = useTheme();
  // All guard visitor screens hinge on the Visitor Management module.
  const visitorsHref = useFeature(MODULES.visitors) ? undefined : null;
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          height: 80,
          paddingBottom: 12,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: fonts.semibold,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="visitor-list"
        options={{
          title: "Visitors",
          href: visitorsHref,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-visitor"
        options={{
          title: "New Entry",
          href: visitorsHref,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="qr-scanner"
        options={{
          title: "Scan QR",
          href: visitorsHref,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="qr-code-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="verify-otp"
        options={{
          title: "OTP Entry",
          href: visitorsHref,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="keypad-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
