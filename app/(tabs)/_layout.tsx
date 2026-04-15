/* PRODUCTION ARCHITECTURE UPGRADE */
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#6366F1",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: "#E5E7EB",
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 25 : 10,
          paddingTop: 10,
          height: Platform.OS === "ios" ? 88 : 68,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          title: "Plans",
          tabBarIcon: ({ color }) => (
            <Ionicons name="diamond-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chatbot"
        options={{
          title: "Assistant",
          tabBarIcon: ({ color }) => (
            <Ionicons name="chatbubble-ellipses-outline" size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <Ionicons name="person-outline" size={22} color={color} />
          ),
        }}
      />
      {/* Hide the old explore stub from the tab bar */}
      <Tabs.Screen
        name="explore"
        options={{ href: null }}
      />
    </Tabs>
  );
}
/* END PRODUCTION ARCHITECTURE UPGRADE */
