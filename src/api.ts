/* PRODUCTION ARCHITECTURE UPGRADE */
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import config from "./config";

/**
 * Centralized fetch wrapper.
 * - Auto-attaches Authorization header from AsyncStorage
 * - Handles 401 globally: clears auth and redirects to /phone
 * - Handles 500: logs a warning
 * - Re-throws network errors so screens can show UI feedback
 */
export async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await AsyncStorage.getItem("access_token");

  let response: Response;

  try {
    response = await fetch(`${config.apiUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch (networkError) {
    // Network-level failure (no connection, DNS, timeout)
    throw networkError;
  }

  if (response.status === 401) {
    // Token expired or invalid — clear auth and kick to login
    await AsyncStorage.multiRemove(["access_token", "user"]);
    router.replace("/phone");
    return response;
  }

  if (response.status >= 500) {
    console.warn(`[apiFetch] Server error ${response.status} on ${endpoint}`);
  }

  return response;
}
/* END PRODUCTION ARCHITECTURE UPGRADE */
