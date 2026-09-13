import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useRoleGuard } from "../../src/useRoleGuard";
import { useFeature } from "../../src/FeatureContext";
import { MODULES } from "../../src/featureRegistry";
import TabBar from "../../components/ui/TabBar";
import SideNav, { SIDE_NAV_WIDTH } from "../../components/ui/SideNav";
import { useResponsive } from "../../src/useResponsive";

export default function GuardTabLayout() {
  // All guard visitor screens hinge on the Visitor Management module.
  const visitorsHref = useFeature(MODULES.visitors) ? undefined : null;
  const { breakpoint, isWide } = useResponsive();

  // Brings the guard flow to the same rounded floating bar / side-nav chrome
  // the resident (tabs) flow already uses, instead of the plain default bar.
  const renderTabBar = (props: BottomTabBarProps) =>
    isWide ? <SideNav {...props} /> : <TabBar {...props} />;

  return (
    <Tabs
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: false,
        sceneStyle: isWide
          ? { marginLeft: breakpoint === "desktop" ? SIDE_NAV_WIDTH.desktop : SIDE_NAV_WIDTH.tablet }
          : undefined,
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
