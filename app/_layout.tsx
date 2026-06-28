import { Ionicons } from "@expo/vector-icons";
import { fonts } from "../constants/tokens";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, TouchableOpacity, View, Text, TextInput } from "react-native";
import { setUnauthorizedHandler } from "../src/api/client";
import { usePushNotifications } from "../hooks/usePushNotifications";
import "../src/pushBackground";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from "@expo-google-fonts/inter";
import { LanguageProvider } from "../src/LanguageContext";
import { NotificationProvider, useNotifications } from "../src/NotificationContext";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, useTheme } from "../src/ThemeContext";
import { FeatureProvider } from "../src/FeatureContext";
import VisitorApprovalModal from "../components/visitor/VisitorApprovalModal";
import VideoSplash from "../components/VideoSplash";

function ThemedStatusBar() {
  const { theme } = useTheme();
  return <StatusBar style={theme.mode === "dark" ? "light" : "dark"} />;
}

function NotificationBell() {
  const router = useRouter();
  const { theme } = useTheme();
  const { unreadCount } = useNotifications();
  return (
    <TouchableOpacity
      style={[styles.headerBubble, { marginRight: 16 }]}
      onPress={() => router.push("/notifications")}
      activeOpacity={0.7}
    >
      <Ionicons name="notifications-outline" size={20} color={theme.text} />
      {unreadCount > 0 && (
        <View style={[styles.badge, { backgroundColor: theme.danger }]}>
          <Text style={styles.badgeText}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function RootNavigator() {
  const router = useRouter();
  const { theme } = useTheme();

  // OS-level push notifications (FCM): register the device token + handle taps.
  usePushNotifications();

  // App-wide session-expiry guard: any API 401 clears the session and bounces
  // the user back to the login flow instead of leaving a silently-blank screen.
  useEffect(() => {
    setUnauthorizedHandler(() => router.replace("/phone"));
    return () => setUnauthorizedHandler(null);
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: "center",

        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text },

        headerTitle: "GetMyHelp",
        headerBackVisible: false,

        headerLeft: () => (
          <View style={[styles.headerBubble, { marginLeft: 16 }]}>
            <Ionicons
              name="chevron-back"
              size={20}
              color={theme.text}
              onPress={() => router.back()}
              style={{ marginLeft: -2 }}
            />
          </View>
        ),

        headerRight: () => <NotificationBell />,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="phone" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="location" />
      <Stack.Screen name="society-detected" />
      <Stack.Screen name="tower" />
      <Stack.Screen name="assignment-details" options={{ headerTitle: "Assignment Details" }} />
      <Stack.Screen name="attendance-history" options={{ headerTitle: "Attendance History" }} />
      <Stack.Screen name="notifications" options={{ headerTitle: "Notifications" }} />
      <Stack.Screen name="community/announcement-detail" options={{ headerTitle: "Announcement" }} />
      <Stack.Screen name="community/forum-thread" options={{ headerTitle: "Discussion" }} />
      <Stack.Screen name="community/create-post" options={{ headerTitle: "New Post" }} />
      <Stack.Screen name="society/create-ticket" options={{ headerTitle: "New Ticket" }} />
      <Stack.Screen name="society/ticket-details" options={{ headerTitle: "Ticket Details" }} />
      <Stack.Screen name="(guard-tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="visitor/pending-approval" options={{ headerTitle: "Visitor Approval" }} />
      <Stack.Screen name="visitor/exit-entry" options={{ headerTitle: "Exit Visitor" }} />
      <Stack.Screen name="visitor/visitor-history" options={{ headerTitle: "Visitor History" }} />
      <Stack.Screen name="visitor/invite" options={{ headerTitle: "Invite a Guest" }} />
      <Stack.Screen name="visitor/qr-invite-list" options={{ headerTitle: "QR Invites" }} />
      <Stack.Screen name="visitor/qr-invite-detail" options={{ headerTitle: "QR Invite" }} />
      <Stack.Screen name="visitor/otp-invite-list" options={{ headerTitle: "OTP Invites" }} />
      <Stack.Screen name="visitor/otp-invite-detail" options={{ headerTitle: "OTP Invite" }} />
      <Stack.Screen name="visitor/resident-detail" options={{ headerTitle: "Visitor" }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [splashDone, setSplashDone] = useState(false);
  const [fontsLoaded] = useFonts({
    "Newsreader-Regular": require("../assets/fonts/Newsreader-Regular.ttf"),
    "Newsreader-SemiBold": require("../assets/fonts/Newsreader-SemiBold.ttf"),
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
  });

  if (!fontsLoaded) return null;

  // Global default typeface for any text that doesn't set its own family.
  (Text as any).defaultProps = (Text as any).defaultProps || {};
  (Text as any).defaultProps.style = { fontFamily: "Inter_400Regular" };
  (TextInput as any).defaultProps = (TextInput as any).defaultProps || {};
  (TextInput as any).defaultProps.style = { fontFamily: "Inter_400Regular" };

  return (
    <ThemeProvider>
    <SafeAreaProvider>
      <LanguageProvider>
        <FeatureProvider>
          <NotificationProvider>
            <ThemedStatusBar />
            <VisitorApprovalModal />
            <RootNavigator />
            {!splashDone && <VideoSplash onDone={() => setSplashDone(true)} />}
          </NotificationProvider>
        </FeatureProvider>
      </LanguageProvider>
    </SafeAreaProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  headerBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0)",
    justifyContent: "center",
    alignItems: "center",
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -4,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    fontSize: 9,
    fontFamily: fonts.bold,
    color: "#fff",
  },
});
