import { Stack } from "expo-router";
import { useFonts } from "expo-font";

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "Newsreader-Regular": require("../assets/fonts/Newsreader-Regular.ttf"),
    "Newsreader-SemiBold": require("../assets/fonts/Newsreader-SemiBold.ttf"),
  });

  if (!fontsLoaded) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
