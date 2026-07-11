import { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";

/**
 * Whether the device currently has a usable internet connection.
 *
 * `isConnected` alone lies on captive-portal Wi-Fi (connected to a router, no
 * actual internet), so we also require `isInternetReachable !== false`. It starts
 * optimistic — `true` — so the app never flashes an offline banner on a cold
 * start before NetInfo has had a chance to report.
 */
export function useNetworkStatus(): boolean {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setOnline(state.isConnected === true && state.isInternetReachable !== false);
    });
    return unsubscribe;
  }, []);

  return online;
}
