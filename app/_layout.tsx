import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";
import { LanguageProvider } from "../src/LanguageContext";

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "Newsreader-Regular": require("../assets/fonts/Newsreader-Regular.ttf"),
    "Newsreader-SemiBold": require("../assets/fonts/Newsreader-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <LanguageProvider>
      <Stack
        screenOptions={{
          headerShadowVisible: false,
          headerTitleAlign: "center",

          headerTitle: "GetMyHelp",
          headerBackVisible: false,


          headerLeft: () => (
            <View style={styles.headerBubble}>
              <Ionicons
                name="chevron-back"
                size={20}
                color="#2E3A46"
                onPress={() => router.back()}
                style={{ marginLeft: -2 }}
              />
            </View>
          ),

          headerRight: () => (
            <View style={styles.headerBubble}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color="#2E3A46"
              />
            </View>
          ),
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="phone" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="location" />
        <Stack.Screen name="society-detected" />
        <Stack.Screen name="tower" />
        <Stack.Screen name="house" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        {/* Redirect wrappers for backward compatibility */}
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="subscription" options={{ headerShown: false }} />
        
        {/* SETTINGS + LOGOUT FEATURE */}
        <Stack.Screen name="settings" options={{ headerShown: false }} />
      </Stack>
    </LanguageProvider>
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
});