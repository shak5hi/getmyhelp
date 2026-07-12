import { apiDelete, apiPost } from "./client";

/**
 * Device-token registry — client side of the backend `device_tokens` table.
 *
 * One row per device, keyed by the FCM token. Both endpoints take the ordinary
 * customer bearer token, which `apiRequest` injects.
 *
 * NOTE: these are customer-only on the backend — there is no admin/guard
 * device-token router yet, so `registerForPush` deliberately skips guards.
 */

export type DevicePlatform = "android" | "ios";

/**
 * Register (or refresh) this device against the logged-in customer.
 *
 * Idempotent by design: `token` is unique server-side, so re-posting an existing
 * token reassigns it to the current customer and bumps `last_seen_at`. Safe to
 * call on every launch, every login, and on each FCM token rotation.
 */
export const registerDeviceToken = (token: string, platform: DevicePlatform) =>
  apiPost("/customer/device-tokens", { token, platform });

/**
 * Unregister this device. Must run on logout — otherwise the next person to log
 * in on this handset keeps receiving the previous user's notifications.
 */
export const unregisterDeviceToken = (token: string) =>
  apiDelete(`/customer/device-tokens/${encodeURIComponent(token)}`);
