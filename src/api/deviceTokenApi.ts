import { apiDelete, apiPost } from "./client";

/**
 * FCM device-token registration (push notifications).
 *
 * Mirrors the backend contract in getmyhelp-admin/PUSH_NOTIFICATIONS_CONTRACT.md:
 * register/refresh a token on login + token-refresh, unregister on logout.
 * Both require the customer Bearer JWT (handled by the shared client).
 */

export type DevicePlatform = "android" | "ios";

// POST /customer/device-tokens — idempotent (token is globally unique).
export const registerDeviceToken = (token: string, platform: DevicePlatform) =>
  apiPost("/customer/device-tokens", { token, platform });

// DELETE /customer/device-tokens/{token} — stop pushes to this device.
export const unregisterDeviceToken = (token: string) =>
  apiDelete(`/customer/device-tokens/${encodeURIComponent(token)}`);
