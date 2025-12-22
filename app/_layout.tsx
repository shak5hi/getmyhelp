import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function RootLayout() {
  const router = useRouter();

  const [fontsLoaded] = useFonts({
    "Newsreader-Regular": require("../assets/fonts/Newsreader-Regular.ttf"),
    "Newsreader-SemiBold": require("../assets/fonts/Newsreader-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <Stack
      screenOptions={{
        headerShadowVisible: false,
        headerTitleAlign: "center",
        headerBackTitleVisible: false,

        // 🔥 KILLS THE GHOST BUBBLE COMPLETELY
        headerPressColor: "transparent",
        headerPressOpacity: 1,
      }}
    >
      {/* Landing */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Phone screen */}
      <Stack.Screen
        name="phone"
        options={{
          headerTitle: "GetMyHelp",
          headerBackVisible: false,

          headerLeftContainerStyle: {
            paddingLeft: 16,
            backgroundColor: "transparent",
          },
          headerRightContainerStyle: {
            paddingRight: 16,
            backgroundColor: "transparent",
          },

         headerLeft: () => (
          <View style={styles.systemBubble}>
            <Ionicons
              name="chevron-back"
              size={20}
              color="#2E3A46"
              onPress={() => router.back()}
            />
          </View>
        ),

        headerRight: () => (
          <View style={styles.systemBubble}>
            <Ionicons
              name="help-circle-outline"
              size={20}
              color="#2E3A46"
            />
          </View>
        ),
        }}
      />
    </Stack>
  );
}
const styles = {
  systemBubble: {
    width: 32,            // 🔑 smaller than system hit area
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0)", // 🔑 blends layers
    justifyContent: "center",
    alignItems: "center",
  },
};