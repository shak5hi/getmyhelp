import { Stack, useRouter } from "expo-router";
import { useFonts } from "expo-font";
import { TouchableOpacity, View } from "react-native";
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
      }}
    >
      {/* Landing */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Phone screen */}
      <Stack.Screen
        name="phone"
        options={{
          headerTitle: "GetMyHelp",

          // 🚫 disable default iOS back button completely
          headerBackVisible: false,

          // 🚫 remove default paddings that create ghost bubbles
          headerLeftContainerStyle: { padding: 0 },
          headerRightContainerStyle: { padding: 0 },

          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              style={{ marginLeft: 16 }}
              hitSlop={10}
            >
              <View style={styles.iconBubble}>
                <Ionicons name="chevron-back" size={20} color="#2E3A46" />
              </View>
            </TouchableOpacity>
          ),

          headerRight: () => (
            <TouchableOpacity
              style={{ marginRight: 16 }}
              hitSlop={10}
            >
              <View style={styles.iconBubble}>
                <Ionicons
                  name="help-circle-outline"
                  size={20}
                  color="#2E3A46"
                />
              </View>
            </TouchableOpacity>
          ),
        }}
      />

    </Stack>
  );
}
const styles = {
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5F7F9",
    justifyContent: "center",
    alignItems: "center",
  },
};
