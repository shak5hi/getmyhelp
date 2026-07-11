import * as Sentry from "@sentry/react-native";

/**
 * Crash + error reporting.
 *
 * Entirely gated on a DSN being present. Until one is set the module is a no-op —
 * every export is a safe stub — so the app runs identically with or without
 * reporting, and no placeholder DSN is committed. To turn it on, drop the DSN
 * from your Sentry project below (or wire it to an EAS env var) and rebuild.
 */

// Paste the DSN from Sentry → Settings → Projects → <project> → Client Keys (DSN).
// Prefer an env var in CI so it isn't committed:
//   const SENTRY_DSN = process.env.EXPO_PUBLIC_SENTRY_DSN ?? "";
const SENTRY_DSN =
  "https://93914cdb25380e0ed31e622435db2864@o4511718007832576.ingest.us.sentry.io/4511718019039232";

export const sentryEnabled = SENTRY_DSN.length > 0;

export function initSentry(): void {
  if (!sentryEnabled) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    // In dev, report to the console instead of the network so local runs don't
    // pollute the project's issue stream.
    enabled: !__DEV__,
    // Errors only for now; turn tracesSampleRate up if you add performance later.
    tracesSampleRate: 0,
    // Don't send the token or other request bodies as breadcrumbs.
    sendDefaultPii: false,
  });
}

/** Report a caught, non-fatal error (e.g. from the ErrorBoundary). Safe no-op
 *  when reporting is off. */
export function reportError(
  error: Error,
  context?: Record<string, unknown>,
): void {
  if (!sentryEnabled) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

/** Wrap the root component so native crashes and unhandled JS errors are caught.
 *  A passthrough when reporting is off. */
export const wrapRoot: typeof Sentry.wrap = sentryEnabled
  ? Sentry.wrap
  : (((component: unknown) => component) as typeof Sentry.wrap);
