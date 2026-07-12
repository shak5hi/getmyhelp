# Production Readiness — Implementation Plan

**App:** GetMyHelp Mobile (`com.getmyhelp.mobile`)
**Written:** 12 July 2026
**Source of findings:** [`PRODUCTION_READINESS_AUDIT.md`](./PRODUCTION_READINESS_AUDIT.md)
**Goal:** a signed AAB on the Play Store internal-testing track that a real user can
install, log in to, receive a push on, and delete their account from.

Work is sequenced so that each milestone is *verifiable* before the next starts. The
ordering is deliberate: M0 exists because every other task is wasted effort if the
production build cannot talk to Firebase.

Backend work is called out separately in [§ Backend dependencies](#backend-dependencies) —
it has lead time and should be requested on day 1, not when we reach it.

---

## M0 — Prove the production build works

**Why first:** `app.config.js` resolves the Firebase config from `GOOGLE_SERVICES_JSON`
/ `GOOGLE_SERVICES_INFO_PLIST`, but `eas.json` sets `"environment"` only on the
`development` profile. The production profile gets no env injection, falls back to
`./google-services.json` (gitignored, not in the uploaded project), and produces a
build where phone-OTP login and FCM both fail — silently, because `registerForPush`
is wrapped in a fail-safe catch. Nothing else in this plan is worth doing until we
have disproved that.

| # | Task | File / surface |
|---|---|---|
| 0.1 | Add `"environment": "production"` to the `production` build profile | `eas.json` |
| 0.2 | Upload `google-services.json` + `GoogleService-Info.plist` as EAS **file** secrets, named to match `app.config.js` | EAS dashboard |
| 0.3 | Add `SENTRY_AUTH_TOKEN` as an EAS secret so the Sentry plugin uploads source maps | EAS dashboard |
| 0.4 | Run `eas build -p android --profile production`, install the AAB on a real device | — |

**Exit criteria — all four, on the installed production artifact:**
- Phone-OTP login completes end-to-end against `api.getmyhelp.in`.
- A push sent from the backend arrives while the app is backgrounded.
- A deliberately-thrown error appears in Sentry **with a readable, un-minified stack**.
- The build does not fall back to an on-disk Firebase file (check the build log).

If any fail, stop and fix. Do not proceed on a build we cannot log in to.

---

## M1 — Play-policy blockers

These are rejections, not bugs. Each one is sufficient on its own to fail review.

### 1.1 In-app account deletion *(requires backend)*
Play's User Data policy requires an in-app path to request deletion for any app with
account creation. We have logout only.

- Add "Delete my account" to `app/(tabs)/profile.tsx` and `app/(guard-tabs)/profile.tsx`.
- Two-step confirm (type the flat number, or a typed "DELETE"), then
  `apiDelete("/customer/account")`, then `clearSession()` → `/phone`.
- Copy must state what is deleted and what is retained (visitor logs are society
  records — say so explicitly rather than implying a full purge).
- **Fallback if the backend endpoint is not ready:** a linked web deletion form
  reachable from the profile screen satisfies the policy. Ship the in-app flow when
  the endpoint lands.

### 1.2 Replace Nominatim geocoding *(requires backend)*
`app/location.tsx:117` and `app/manual-location.tsx:51` send exact GPS coordinates to
`nominatim.openstreetmap.org`. This is both an undeclared third-party disclosure and
an operational time bomb — OSM's policy forbids keyless traffic from end-user devices
and they block by User-Agent (ours is the static `"GetMyHelp/1.0"`).

- Move reverse-geocoding behind our own backend: `GET /customer/geocode/reverse?lat=&lon=`.
- Delete both direct Nominatim calls; the shared client-side helper goes with them
  (the logic is currently duplicated across the two screens — extract one function).

### 1.3 Data Safety declaration
- Update `docs/DATA_SAFETY.md`: remove the stale "TLS pending" note (TLS is live as of
  12 July), and list **every** third-party recipient of location data. If 1.2 lands,
  the only recipient is our own backend and this gets simpler.
- Submit the form in Play Console. It must match the shipped app, not the intended one.

### 1.4 Icons
- `notification-icon.png` is a 343 KB PNG. Android renders the notification icon as a
  **monochrome alpha mask** — a full-colour logo becomes a solid white square.
  Regenerate as a small white-on-transparent glyph and **verify on a real Android 13+
  device**, not an emulator.
- `adaptiveIcon.foregroundImage` reuses the full-bleed `icon.png`. Android masks to a
  circle and only the centre ~66% survives. Produce a padded foreground layer.

**Exit criteria:** account deletion reachable in ≤3 taps from the profile tab; no
outbound request to any host other than `api.getmyhelp.in` / Firebase / Sentry
(verify with a proxy); Data Safety form submitted; notification icon correct in the
status bar on a physical device.

---

## M2 — Correctness

Bugs that will fire for real users on the release build.

| # | Task | Detail |
|---|---|---|
| 2.1 | Migrate the last 3 raw `fetch` calls | `location.tsx:61`, `location.tsx:164`, `manual-location.tsx:98` → `apiGet` / `apiPost`. They currently skip the 20s timeout, the 401 guard and the 403 handling, **on the onboarding path** — a stalled request strands a brand-new user on an infinite spinner. Leave `otp.tsx:93` (unauthenticated firebase-verify) raw. |
| 2.2 | Fix the global font override | `app/_layout.tsx:157-160` mutates `(Text as any).defaultProps` during render. React 19 dropped `defaultProps` for function components and RN's `Text` is a forwardRef — so it is a no-op, and every unstyled `<Text>` is silently rendering in the system font. Replace with a wrapper component (or set `fontFamily` in the theme's base text style). Re-screenshot the app afterwards: **this will change how every screen looks**, and some layouts may need adjusting. |
| 2.3 | Make `apiRequest` surface failures | Today any status returns a parsed body, so a 500 renders as an empty list — indistinguishable from "you have no tickets". Add an `ok`/status signal (or throw `ApiError` on ≥500 and let screens catch), then wire `components/ui/ErrorState.tsx` into the list screens. Do this **behind the existing defensive readers** so no screen breaks: change the client, then migrate screens one at a time. |
| 2.4 | JWT out of the WebSocket URL *(requires backend)* | Five hooks pass `?token=`, which lands in proxy access logs. Interim mitigation costs nothing and needs no client change: `access_log off` on the WS location in nginx. Real fix: `Sec-WebSocket-Protocol` or a short-lived ticket. |
| 2.5 | Close the `/admin/customers/*` authz question *(backend)* | `app/(tabs)/dashboard.tsx:100` calls an admin route with a customer token. Either the backend authorises it (a hole) or it works by accident. Both need answering before launch. |
| 2.6 | Confirm the FCM payload contract | `src/push.ts` never registers `setBackgroundMessageHandler`. That is correct **only if** the backend always sends a `notification` payload. If it ever sends data-only, background pushes vanish silently. Verify, and add the handler if needed. |

---

## M3 — Stability at scale

Things that are fine with 10 users and hurt with 10,000.

| # | Task | Detail |
|---|---|---|
| 3.1 | Socket backoff + lifecycle | All five hooks retry on a fixed 5s timer with no backoff, no jitter, no `AppState` awareness. If the backend goes down, every device on the network reconnects every 5s forever, on cellular, in the background. Extract one `useSocket` hook (the five are near-identical), add capped exponential backoff with jitter, and disconnect when the app backgrounds. |
| 3.2 | Force-update / minimum-version gate *(requires backend)* | `expo-updates` hotfixes JS, but nothing can rescue a broken **native** build, and there is no kill switch for a backend maintenance window. Add a `GET /app/version` check on launch → blocking modal when below minimum. |
| 3.3 | Fix the feature-gate flash | `useFeature` returns `true` while loading, so every gated feature renders then vanishes on cold start. Gate the first paint on `ready` with a skeleton instead of being optimistic. |
| 3.4 | Fix cold start | Hold the native splash (`expo-splash-screen` is already a dependency and never called) instead of returning `null` from `_layout` — removes the white flash. In `index.tsx`, show a loading state during the session check rather than the marketing landing page, so a returning user is not shown "Get Started" and then yanked to the dashboard. Stop swallowing the error in the empty `catch {}`. |
| 3.5 | Role-gate the tab groups | `app/(tabs)/_layout.tsx` has no role check, so a guard landing on a resident deep link renders resident UI that then 403s. Server-enforced already — this is UX. |

---

## M4 — Quality gate before rollout

| # | Task |
|---|---|
| 4.1 | **Tests on paths that can lose money or trust:** auth (login → token → 401 → logout), push routing (`routeFromPushData`), feature gating, visitor approval. Two test files today. |
| 4.2 | **CI:** run on PRs to any branch, not just `main`; add `tsc --noEmit`. |
| 4.3 | **Assets:** ~6.3 MB avoidable. `doorbell.wav` (1.6 MB WAV) → compressed; `splash.mp4` 2.5 MB → shorter/smaller or cut; compress `splash.png`, `icon.png`. Delete unused `assets/home.png`. |
| 4.4 | **Dependencies:** move `@expo/ngrok` + `expo-dev-client` to `devDependencies`; drop `expo-av` (deprecated, removed in SDK 55 — consolidate on `expo-video`); remove `react-native-google-places-autocomplete` if confirmed unused; either use `expo-image` or drop it. |
| 4.5 | **List performance:** `React.memo` on row components (`TicketCard`, `CommentItem`, `TransactionCard`, `AuthorTag`); add `initialNumToRender` / `windowSize` / `removeClippedSubviews` to the forum and visitor-history lists. Measure first — `reactCompiler` is on. |
| 4.6 | **Accessibility:** 22 a11y props against 309 touchables. Label the primary flows (login, visitor approval, ticket creation) at minimum. |
| 4.7 | **Keyboard handling** on `phone.tsx` and `otp.tsx` — the first two screens every user touches, where the keyboard can cover the submit button. |
| 4.8 | **Dark mode:** 78 hardcoded hex colours bypass the theme. |
| 4.9 | **Analytics.** We currently ship blind — no funnel, no retention, no signal on which gated modules anyone uses. |

---

## M5 — Release

1. Internal testing track first. Real devices, real accounts, low-end Android included.
2. Read the Play **pre-launch report** (it runs automatically on upload) — it catches
   crashes, ANRs and accessibility issues we will not.
3. Store listing: screenshots from a real device, short (80 char) + full (4000 char)
   description, content rating questionnaire (IARC).
4. **Staged rollout** — 10% → 50% → 100%, watching Sentry between each step. The whole
   point of M0.3 is that this window is observable.

---

## Backend dependencies

Request these on day 1; they gate M1–M3.

| Need | Blocks | Notes |
|---|---|---|
| `DELETE /customer/account` | M1.1 | Play policy. Web form is an acceptable stopgap. |
| `GET /customer/geocode/reverse` | M1.2 | Removes the third-party disclosure *and* the Nominatim ban risk. |
| `access_log off` on the WS nginx location | M2.4 | Zero-client-change mitigation; do it this week. |
| WS token in header / short-lived ticket | M2.4 | The real fix. |
| Answer: can a customer token call `/admin/customers/*`? | M2.5 | Possible authz hole. |
| Confirm FCM payload shape (`notification` vs data-only) | M2.6 | Determines whether we need a background handler. |
| `GET /app/version` (minimum supported) | M3.2 | Force-update gate. |
| Confirm JWT lifetime | M2 / UX | Short-lived tokens with no refresh = users re-entering OTPs constantly. |
| Re-bind container to `127.0.0.1:9001:8000` | Security | TLS on the domain does not help while the raw port is internet-reachable. |

---

## Sequencing

- **M0 is a hard gate.** Do not start M1 until a production build logs in.
- **M1 and M2 can run in parallel** once M0 passes — different surfaces, no overlap.
- **M3 can start as soon as its backend dependencies land**, independently of M1.
- **M4 is the pre-rollout gate**, not a nice-to-have: shipping without tests on the
  auth path means we find out about regressions from one-star reviews.
- **M5 is staged.** A 100% day-one rollout on an unproven backend is the one
  irreversible decision in this plan.
