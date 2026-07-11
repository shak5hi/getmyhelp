import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text } from "react-native";
import Animated, { FadeInDown, FadeOutDown } from "react-native-reanimated";
import { useNetworkStatus } from "../src/useNetworkStatus";

/**
 * A slim bar that appears while the device is offline and animates away when the
 * connection returns. Rendered once, near the app root.
 *
 * It only *reports* offline state — it doesn't block interaction, because cached
 * screens stay usable and any request that needs the network now fails as a
 * NetworkError (see api/client) rather than hanging. Fixed neutral colours so it
 * renders correctly even if it ends up above the theme provider.
 */
export default function OfflineBanner() {
  const online = useNetworkStatus();
  const insets = useSafeAreaInsets();

  if (online) return null;

  return (
    <Animated.View
      entering={FadeInDown}
      exiting={FadeOutDown}
      style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}
      accessibilityRole="alert"
      accessibilityLabel="You are offline"
    >
      <Ionicons name="cloud-offline-outline" size={15} color="#FFFFFF" />
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingTop: 10,
    backgroundColor: "#3B2A4F",
  },
  text: {
    fontFamily: "PlusJakartaSans_600SemiBold",
    fontSize: 13,
    color: "#FFFFFF",
    letterSpacing: -0.1,
  },
});
