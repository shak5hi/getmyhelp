/**
 * Single declarative registry mapping feature modules to UI surfaces.
 *
 * This is the "register a UI component" step of the feature-permission system:
 * navigation, route guards and quick-actions read from here instead of
 * scattering hard-coded `if` checks. Adding a future module is a new entry here
 * (+ a backend guard + a catalog row) — nothing else.
 *
 * Keys mirror the backend `ModuleKey` enum / `modules` catalog.
 */

export const MODULES = {
  visitors: "visitors",
  community: "community",
  announcements: "announcements",
  polls: "polls",
  attendance: "attendance",
  providerAttendance: "provider_attendance",
  finance: "finance",
  tickets: "tickets",
  subscriptions: "subscriptions",
  chatbot: "chatbot",
  reports: "reports",
  notifications: "notifications",
} as const;

export type ModuleKey = (typeof MODULES)[keyof typeof MODULES];

/**
 * Resident bottom-tab → required module. Tabs not listed (dashboard, society,
 * profile) are always available. A tab whose module is disabled is removed from
 * the bar (and deep-linking blocked) via `href: null`.
 */
export const RESIDENT_TAB_MODULE: Record<string, ModuleKey | undefined> = {
  community: MODULES.community,
  visitors: MODULES.visitors,
  subscriptions: MODULES.subscriptions,
  chatbot: MODULES.chatbot,
};

/**
 * Guard bottom-tab → required module. All visitor screens hinge on the
 * `visitors` module; only the profile tab is always available.
 */
export const GUARD_TAB_MODULE: Record<string, ModuleKey | undefined> = {
  "visitor-list": MODULES.visitors,
  "new-visitor": MODULES.visitors,
  "qr-scanner": MODULES.visitors,
  "verify-otp": MODULES.visitors,
};
