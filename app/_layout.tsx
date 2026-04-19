import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import { View } from "react-native";
import { LanguageProvider } from "../src/LanguageContext";

import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "Newsreader-Regular": require("../assets/fonts/Newsreader-Regular.ttf"),
    "Newsreader-SemiBold": require("../assets/fonts/Newsreader-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <Stack
          screenOptions={{
            headerShadowVisible: false,
            headerTitleAlign: "center",
            headerBackTitleVisible: false,
            headerPressColor: "transparent",
            headerPressOpacity: 1,

            headerTitle: "GetMyHelp",
            headerBackVisible: false,

            headerLeftContainerStyle: { paddingLeft: 16 },
            headerRightContainerStyle: { paddingRight: 16 },

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
          <Stack.Screen name="subscription" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="assignment-details" options={{ headerTitle: "Assignment Details" }} />
        </Stack>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}

const styles = {
  headerBubble: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0)",
    justifyContent: "center",
    alignItems: "center",
  },
};