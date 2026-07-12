# Production Readiness Audit

**App:** GetMyHelp Mobile (`com.getmyhelp.mobile`)
**Stack:** React Native 0.81 · Expo SDK 54 · expo-router
**Audit date:** 11 July 2026 · **Re-audited:** 12 July 2026 (morning + evening)
**Verdict:** ⚠️ **Ready after the production build is proven.** All three missing
backend routes now exist, the silent-404 root cause is fixed, and the tree is green
behind CI. What remains is a hard gate rather than a code defect: nobody has yet
installed a production AAB and logged into it. See [Open blockers](#-open-blockers).

> Note: this project is **React Native / Expo**, not Flutter. The audit covers the
> stack that is actually here.

Findings below were verified against the code, the generated `AndroidManifest.xml`,
`app.json`, `eas.json` and `package.json` — not assumed.

---

## 📌 Status board

Updated as work lands. Everything not ticked is still outstanding.

### Phase 1 — Blockers

| # | Item | Status |
|---|---|---|
| 1 | **TLS on the API host** | ✅ Done — verified 12 July: `curl https://api.getmyhelp.in/customer/features` returns a JSON `401` over a valid certificate. `config.ts` points at `https://api.getmyhelp.in`; the iOS ATS exception is gone from `app.json`; sockets derive `wss://` from `apiUrl`. |
| 2 | `versionCode` / `buildNumber` / `autoIncrement` | ✅ Done |
| 3 | `POST_NOTIFICATIONS` declared | ✅ Done — verified in merged release manifest |
| 4 | `SYSTEM_ALERT_WINDOW` removed | ✅ Done — via `android.blockedPermissions` |
| 4b | `SCHEDULE_EXACT_ALARM` / `RECEIVE_BOOT_COMPLETED` removed | ✅ Done — notifee pulled these in; `SCHEDULE_EXACT_ALARM` is Play-restricted |

#### ✅ Blocker 1 — TLS is live

`api.getmyhelp.in` now terminates TLS in nginx and proxies to the backend container.
Confirmed 12 July from a clean client: a valid certificate chain, and
`/customer/features` answering JSON `401` rather than the admin frontend's HTML.

One server-side item is worth confirming separately, because it is not observable
from the app: the plaintext port should be re-bound to `127.0.0.1:9001:8000` so
`31.97.239.190:9001` is no longer reachable from the internet. TLS on the domain
does not help if the raw port is still open.

### Phase 2 — Security

| # | Item | Status |
|---|---|---|
| 5 | Access token → `expo-secure-store` | ✅ Done — `src/api/tokenStore.ts`; all 22 call sites migrated |
| 5b | `allowBackup="false"` | ✅ Done — verified in generated manifest |
| 6 | JWT out of the WebSocket URL | ❌ **Blocked on backend** — the server must accept the token in a header or via a short-lived ticket. The client cannot change this unilaterally. |
| 7 | Token `console.log`s removed | ✅ Done — `location.tsx`, `manual-location.tsx` |
| 7b | `transform-remove-console` in release | ✅ Done — verified against an actual production Hermes bundle |
| 8 | Audit why a customer token can call `/admin/customers/*` | ❌ **Backend** — `app/(tabs)/dashboard.tsx:100` calls an admin route. Either an authz hole or the wrong endpoint. |

**Note:** `expo-secure-store` is a native module — a **rebuild is required** before the
token migration takes effect on a device.

The migration is non-destructive: `getToken()` reads SecureStore first, and on a
miss falls back to the old AsyncStorage key, copies it into SecureStore and deletes
the plaintext original. Existing sessions survive the upgrade instead of everyone
being silently logged out.

### Phase 3 — Survivability

| # | Item | Status |
|---|---|---|
| 9 | Crash reporting (Sentry) | ⚠️ **Mostly done.** DSN wired in `src/sentry.ts`; `@sentry/react-native/expo` plugin registered (org `priya-sharma`, project `react-native`). Reports in release only (`enabled: !__DEV__`), so events appear from release/preview builds, not `expo run`. **Unverified: source-map upload.** `SENTRY_AUTH_TOKEN` is not referenced in `eas.json`; if it is not set as an EAS secret, every production stack trace arrives minified and unreadable. Confirm before relying on it. |
| 10 | Root `ErrorBoundary` | ✅ Done — `components/ErrorBoundary.tsx`, outermost in `_layout` |
| 11 | Fetch timeouts | ✅ Done — 20s `AbortController` in `apiRequest`, typed `NetworkError` (distinguishes timeout vs no-connection) |
| 11b | Offline handling | ✅ Done — `useNetworkStatus` + `OfflineBanner`; captive-portal aware |
| 12 | Migrate the 12 raw-`fetch` screens onto `apiRequest` | ✅ **Done** — verified 12 July. One raw `fetch` remains, `otp.tsx:88`, the unauthenticated `/customer/firebase-verify`, which is correct: no token exists at that point. |

### WebSocket authorization (was Phase 2 #6, backend)

✅ **Resolved on the backend** (commits `4749b12`, `536406d`).

- Identity sockets now bind the connection to the token's `sub` **and** `role`,
  rejecting a path-id mismatch — closing a broadcast IDOR where any resident could
  subscribe to another's live notification stream (including visitor-at-gate
  alerts).
- Society sockets use a DB membership lookup (not a token-field compare), which
  additionally re-checks `is_active` — closing a second gap where a deactivated
  account's unexpired token still worked.

**Query-string half — intentionally deferred.** Exploiting it needs WS-log access,
and anyone with that can likely read `SECRET_KEY` and mint tokens anyway. The cheap
mitigation is `access_log off` on the WS location in nginx (no client change). The
`Sec-WebSocket-Protocol` migration is hygiene for next time the four socket hooks
are touched — not a release blocker.

### Phase 4 — Store submission

| # | Item | Status |
|---|---|---|
| 13a | Notification icon wired into `app.json` | ✅ **Fixed.** Was a 1024×1024 JPEG with a baked-in checkerboard; now a genuine 96×96 white-on-transparent RGBA PNG (1.8 KB). Still worth an eyeball on a physical Android 13+ device. |
| 13b | `RECORD_AUDIO` pruned | ✅ Removed from `permissions`, added to `blockedPermissions` |
| 13c | `privacyPolicyUrl` | ✅ Set, and the page returns `200` to an anonymous client (verified 12 July) |
| 13d | Data Safety declaration | ⚠️ Not submitted. Simpler now that Nominatim is gone from the client — once `/customer/geocode/reverse` exists, our backend is the only recipient of location data — but the doc has not been updated to say so. |
| 13e | Account deletion | ✅ UI + `DELETE /customer/account` both live. The client now throws on a failed delete instead of falsely reporting success. Worth one end-to-end run on a real account. |
| 13f | Adaptive icon | ⚠️ Foreground reuses the full-bleed `icon.png`; Android masks to a circle and only the centre ~66% is safe, so the edges will crop. |

### Phase 5 — Durability

| # | Item | Status |
|---|---|---|
| 14 | `expo-updates` for OTA hotfixes | ✅ Configured (`updates.url` + `runtimeVersion: appVersion`) |
| 14b | Force-update gate | ✅ `GET /app/version` live and env-driven; the client renders a working "Update now" button. Safe to arm. |
| 15 | CI | ✅ `ci.yml` runs `tsc --noEmit` → lint → test on every push and PR. (The old `main`-only, no-typecheck version is why a non-compiling tree reached the working directory.) A separate `eas-build.yml` is manual-dispatch only. |
| 16 | Tests on critical paths | ⚠️ 9 tests across 2 suites, all passing. Covers the API client's auth/401/timeout/403 paths and `index.tsx` session routing. Still **no coverage** of push routing or visitor approval — the most time-critical feature in the app. |

---

## 🛑 Open blockers

Re-verified against the code and the live API on **12 July (evening)**.

### 1. The production build is still unproven — the last hard gate

Nobody has yet installed a production AAB and logged into it. Three things must be
confirmed in the EAS dashboard, none of which are visible from the repo:

- `GOOGLE_SERVICES_JSON` and `GOOGLE_SERVICES_INFO_PLIST` registered as **file
  secrets**. `eas.json` now sets `"environment": "production"`, but without the
  secrets the build falls back to the gitignored on-disk files and ships with **no
  Firebase — no login, no push**.
- `SENTRY_AUTH_TOKEN` set, or every production stack trace arrives minified.

Then: build, install, log in, receive a push, and confirm a thrown error reaches
Sentry with a readable stack. **Until that passes, everything else is theory.**

### 2. Data Safety form not submitted

The declaration is now simple — with the Nominatim call moved behind our own backend,
our server is the only recipient of location data — but `docs/DATA_SAFETY.md` has not
been updated to say so, and the form has not been filled in Play Console.

### 3. Residual gaps (not launch-blocking, but known)

| Item | State |
|---|---|
| Feature-gate flash | `src/FeatureContext.tsx:183` still returns `true` while loading, so gated features render then vanish on cold start |
| Assets | ~6.3 MB uncompressed: `splash.mp4` 2.5 MB, `doorbell.wav` 1.6 MB (WAV), `splash.png` 1.1 MB, `icon.png` 864 KB |
| Adaptive icon | Full-bleed `icon.png` foreground; will crop under the circular mask |
| WS token in query string | Deferred by decision; the free mitigation (`access_log off` on the WS nginx location) is still not applied |
| `/admin/customers/*` authz | Backend question still open — can a customer token call an admin route? |
| Analytics | None. `Sentry.wrap` is crash reporting, not analytics |
| Test coverage | Push routing and visitor approval — the most time-critical feature — remain uncovered |

---

## 🔑 The root fix: `apiRequest` now throws on non-2xx

Three features (account deletion, reverse geocoding, the version gate) shipped against
endpoints **that had never been built**, and every one of them 404'd *silently*.
Account deletion went furthest: it logged the user out and reported success having
deleted nothing.

The cause was a client design choice, not a backend gap. `apiRequest` returned the
parsed body for any status below 500, so a caller could not distinguish "this route
does not exist" from "there is no data".

`src/api/client.ts` now throws `ApiError` on any non-2xx, carrying the server's
`detail` as the message. The two deliberate exceptions remain: a 401 still drives the
session-expiry flow (and now also rejects, so the screen cannot carry on as if the
call succeeded), and a 403 whose detail says "not enabled" still returns the benign
feature-disabled shape.

An `errorMessage(err, fallback)` helper surfaces the server's own wording, so a
rejected QR reads "expired" rather than "Something went wrong". Call sites that used
to read `.detail` off a failed body (`subscriptions`, `qr-scanner`, `new-visitor`,
`verify-otp`) were migrated with it.

This is the finding worth carrying forward: **a silent 404 is how three broken
features passed review.**

---

## ✅ Resolved since the morning re-audit

Verified in code and against the live API, not taken on trust.

| Item | Evidence |
|---|---|
| `DELETE /customer/account` | ✅ Live (401 unauthenticated). Anonymise + deactivate; blocks on a live subscription |
| `GET /customer/geocode/reverse` | ✅ Live (401 unauthenticated). Backend Nominatim proxy — raises on failure rather than returning empty |
| `GET /app/version` | ✅ Live, **200 unauthenticated**, env-driven (`APP_REQUIRED_VERSION` etc). Returns `required_version` aliased to `min_supported_version`, plus `update_url` and `message` |
| Force-update screen was a dead end | ✅ Fixed. It rendered "Update Required" with **no button and no dismiss** — raising `APP_REQUIRED_VERSION` would have stranded every user on that build. It now renders "Update now" off the server-supplied `update_url`, with a hardcoded Play fallback. **The gate is now safe to arm.** |
| Notification icon | ✅ Fixed. It was a 1024×1024 **JPEG** whose "transparent" background was a *checkerboard baked in as grey pixels* — Android would have masked the whole thing to a white square. Now a genuine 96×96 white-on-transparent RGBA PNG (80% transparent, antialiased edges). 343 KB → **1.8 KB** |
| Silent 404s | ✅ Fixed at the root — see above |
| Font override no-op | ✅ `defaultProps` gone; `components/ui/Text.tsx` is now the only file importing `Text` from `react-native` |
| Raw `fetch` migration | ✅ One left, `otp.tsx:88` — the unauthenticated firebase-verify, which is correct |
| Nominatim in the client | ✅ Zero references anywhere in the codebase |
| Cold-start white flash | ✅ `SplashScreen.preventAutoHideAsync()` / `hideAsync()` wired |
| Role gating | ✅ `useRoleGuard` on both `(tabs)` and `(guard-tabs)` |
| Dependency pruning | ✅ `expo-av`, `expo-image`, `react-native-google-places-autocomplete` removed; `@expo/ngrok` + `expo-dev-client` moved to `devDependencies` |
| The doorbell alarm | ✅ Was silently dead — `expo-av` uninstalled while the modal still `require`d it, pointing at `dorbell.wav` (typo). Now on `expo-audio`'s `useAudioPlayer` |
| Build health | ✅ `tsc --noEmit` clean, ESLint 0 errors, **11/11 tests passing** |
| CI actually gates | ✅ `ci.yml` runs typecheck → lint → test on every push and PR (was `main`-only with no typecheck — which is why a non-compiling tree reached the working directory) |

---

## 🚨 Critical Issues — original findings, 11 July

> **Historical.** Items 1–8 below are the findings from the first audit. Most are
> now fixed — the status board above is the source of truth for what is still open.
> They are kept for the record and for the reasoning, not as a live worklist.

### 1. The entire API runs over plaintext HTTP — ✅ fixed

`src/config.ts` points production at `http://31.97.239.190:9001`. JWTs, OTP
exchanges, phone numbers, flat numbers and visitor records all travel unencrypted.

Two consequences:

- **Privacy.** This is a residential-security app. Who is at whose gate, and when,
  is exactly the data that must not be readable on the wire.
- **It will not run.** Android blocks cleartext traffic by default from API 28.
  It works today only because *debug* manifests permit it. The release build fails.

**Fix:** terminate TLS in front of the API (e.g. behind `admin.getmyhelp.in`),
switch `config.ts` to `https://`, then delete the iOS `NSAllowsArbitraryLoads`
escape hatch in `app.json`.

### 2. `POST_NOTIFICATIONS` is not declared in the manifest — ✅ fixed

`src/push.ts:33` requests it at runtime on Android 13+. Without the manifest
declaration the request **fails immediately**, `registerForPush` returns at
`if (!granted) return`, and — because the whole function is wrapped in a fail-safe
catch — it fails *silently*.

Push is therefore broken for every Android 13+ user, i.e. most of the install base.
It appears to work on the test device only because the permission was already
granted there.

### 3. `SYSTEM_ALERT_WINDOW` ships in the release manifest — ✅ fixed (but see note)

"Draw over other apps" is a high-scrutiny permission and a common rejection cause.

Root cause: **`expo-dev-client` is in `dependencies`, not `devDependencies`.** That
also means the production bundle ships the dev menu and launcher.

**Fix:** move `expo-dev-client` to `devDependencies`; confirm the permission
disappears from the generated release manifest.

### 4. No `versionCode` / `buildNumber` — ✅ fixed

`app.json` sets `version: "1.0.0"` but no `android.versionCode`, no
`ios.buildNumber`, and `eas.json` has no `autoIncrement`.

**Play will not accept an upload without a `versionCode`**, and every subsequent
upload must increment it.

### 5. The JWT is passed in the WebSocket URL query string — ⚠️ still open, deliberately deferred

`hooks/useNotificationSocket.ts:26`:

```
${host}/ws/notifications/customer/${customerId}?token=${token}
```

Query strings are written to server logs, proxy logs and crash reports. Full JWTs
were observed in plain `docker compose logs` output during this session.

**Fix:** send the token in a header, or mint a short-lived single-use ticket.

### 6. Access tokens are stored unencrypted — ✅ fixed

`app/otp.tsx:134` writes `access_token` to `AsyncStorage`, which is plaintext on
disk. Combined with **`android:allowBackup="true"`**, the token is synced to the
user's Google Drive backup.

**Fix:** `expo-secure-store` (Keychain / Keystore) and `allowBackup="false"`.

### 7. The customer app calls an admin endpoint — ⚠️ backend, still open

`app/(tabs)/dashboard.tsx:100`:

```
GET /admin/customers/${user.id}/subscriptions
```

Either the backend authorises **customer** tokens against `/admin/*` routes — an
authorisation hole worth auditing today — or this is the wrong endpoint and works
by accident. Both are bad.

### 8. No crash reporting, no analytics, no OTA updates — ⚠️ partly fixed (Sentry + `expo-updates` in; **no analytics**)

No Sentry, no Crashlytics, no `expo-updates`. The app would ship with **zero
visibility into production crashes** and no way to hotfix without a full store
release.

---
## ⚠ High Priority

Current as of the 12 July re-audit.

| Issue | Detail |
|---|---|
| **Socket reconnect storm + battery drain** | All five hooks (`useNotificationSocket`, `useForumSocket`, `usePostSocket`, `useAnnouncementSocket`, `useGuardVisitorSocket`) retry on a fixed 5s timer with no backoff, no jitter, and no `AppState` awareness. If the backend goes down, every installed device reconnects every 5 seconds forever, in the background, on cellular — hammering a backend that is already down, and burning battery. Add capped exponential backoff and disconnect on background. |
| **`apiRequest` never throws on non-2xx** | By design (`src/api/client.ts`), any status returns the parsed body. Screens read `data.items ?? data.results ?? …` defensively, so a 500 renders as an **empty list**, indistinguishable from "you have no tickets". `components/ui/ErrorState.tsx` exists but can rarely be triggered. Users see silently-wrong empty states instead of an error with a retry. |
| **No force-update / maintenance mode** | `expo-updates` covers JS hotfixes, but nothing can tell a user on a broken *native* build to update, and there is no kill switch for a backend window. Cheap insurance for a first release on an unproven backend. |
| **Feature gating flashes** | `useFeature` returns `true` while the map loads (`src/FeatureContext.tsx`), so on a cold start every gated feature renders and then vanishes when `/customer/features` resolves. Visible pop on a slow connection. |
| **Cold-start UX** | `_layout.tsx` returns `null` until fonts load with no native splash held (`expo-splash-screen` is a dependency but never called) → white flash before `VideoSplash`. Then `index.tsx` swallows every session-check error in an empty `catch {}` and shows the marketing landing page while the profile fetch runs, so a returning user sees "Get Started" and is then yanked to the dashboard. |
| **Assets are ~6.3 MB of avoidable download** | `splash.mp4` 2.5 MB, `doorbell.wav` 1.6 MB (uncompressed WAV), `splash.png` 1.1 MB, `icon.png` 864 KB, `notification-icon.png` 343 KB. |
| **Guard/resident routes aren't gated client-side** | `app/(tabs)/_layout.tsx` has no role check, so a guard arriving on a resident deep link (e.g. from a push) renders resident UI that then 403s. The server enforces it — this is UX, not a hole — but it looks broken. |
| **No FCM background message handler** | `src/push.ts` registers `onNotificationOpenedApp` and `getInitialNotification` but never `setBackgroundMessageHandler`. This works only while the backend always sends a `notification` payload. If it ever sends data-only messages, background pushes vanish silently. Verify against the backend contract. |

---

## 🟡 Medium Priority

- **`expo-av` and `expo-video` are both installed.** `expo-av` is deprecated and
  removed in SDK 55 — this will bite on the next upgrade. Only
  `components/VideoSplash.tsx` uses video; consolidate on `expo-video`.
- **Dev tooling in `dependencies`.** `@expo/ngrok` and `expo-dev-client` both sit in
  `dependencies`; the latter was moved there on this branch. Both belong in
  `devDependencies`.
- **`expo-image` is installed but unused** in app code — screens use RN `Image`,
  giving up caching and placeholders on avatar- and attachment-heavy screens.
- **`react-native-google-places-autocomplete` appears unused.** Confirm and remove.
- **`societyApi.ts` fetches `?limit=1000`** in one shot. Fine at 50 societies, a
  problem at 5,000.
- **No analytics.** We ship blind: no funnel, no retention, no idea which gated
  modules anyone actually uses.
- **i18n is ~10% complete.** Only home / phone / OTP use `i18n.t()`, so the Hindi
  toggle yields a half-translated app.
- **`.idea/` is committed** — 25 IDE files in version control.
- **iOS Firebase bundle-id mismatch.** `GoogleService-Info.plist` declares
  `getmyhelp.ios`; `app.json` declares `com.getmyhelp.mobile`. Blocking for iOS,
  not for this Android release.

---

## 💡 Nice to Have

- Haptics on primary actions (`expo-haptics` is a dependency, unused).
- Pull-to-refresh on the dashboard (present on society, absent on home).
- Skeleton loaders beyond `TodaysHelp`, which is still the only one.
- FlashList for the forum and visitor-history lists.

---

## 🧹 Cleanup

- **`assets/home.png` (253 KB) is unused** — dead since the get-started redesign.
- **The five WebSocket hooks are near-identical** — same reconnect and ping logic,
  copied five times. Extract one `useSocket`.
- **Geocoding logic is duplicated** between `location.tsx` and `manual-location.tsx`.
- **`app/community/forum-thread.tsx` is 869 lines**, `app/(tabs)/community.tsx` 641.
- **`constants/tokens.ts` exports `colors` and `palette` that nothing imports** —
  superseded by the theme system.

No `TODO` / `FIXME` / `HACK` comments anywhere in the codebase — genuinely clean on
that axis.

---

## 🔒 Security Findings

The baseline is now genuinely solid: token in SecureStore with a non-destructive
AsyncStorage migration, a real app-wide 401 guard, request timeouts, `allowBackup`
off, cleartext gone from both `config.ts` and iOS ATS, `SYSTEM_ALERT_WINDOW` and
`RECORD_AUDIO` blocked, `DISABLE_APP_VERIFICATION` bound to `__DEV__` so it cannot
ship enabled, and 71 `console.*` calls stripped from release by
`transform-remove-console`. **No hardcoded secrets, API keys or credentials anywhere**
in `app/`, `src/`, `components/` or `hooks/`; `google-services.json`,
`GoogleService-Info.plist`, `*.jks` and `.env*` are gitignored and untracked, with
no secrets in history.

Remaining:

| Finding | Severity |
|---|---|
| Location sent to Nominatim, undeclared in Data Safety | **High** — see open blocker 3 |
| Customer app calling `/admin/customers/*` | **High** — backend authz audit still open |
| JWT in WebSocket query string (lands in proxy/access logs) | **Medium** — deferred by decision; mitigate with `access_log off` on the WS location |
| No token refresh — a 401 hard-logs-out | **Medium** — confirm JWT lifetime with the backend; short-lived tokens mean constant re-OTP |
| No certificate pinning | **Low** — defensible for v1, but this app carries home addresses and visitor logs |
| Sentry DSN hardcoded in `src/sentry.ts` | **Low** — client DSNs are not secret, but it belongs in `EXPO_PUBLIC_SENTRY_DSN` |

---

## ⚡ Performance Findings

- **Startup is gated on a 2.5 MB video** that must decode before the first frame.
- **FlatLists carry only `keyExtractor`** — no `initialNumToRender`, `windowSize`,
  `maxToRenderPerBatch`, `removeClippedSubviews` or `getItemLayout`. On the forum and
  visitor-history lists this is the difference between smooth and janky on the
  low-end Android devices our users actually carry.
- **No `React.memo` on any list row** (`TicketCard`, `CommentItem`,
  `TransactionCard`, `AuthorTag`), so every parent state change re-renders every
  visible row.
- **Pagination is partial** — present on notifications, visitor history and forum
  posts; absent on community, society tickets and the invite lists.
- `TodaysHelp` refetches on **every** screen focus (`useFocusEffect`), uncached.
- Provider avatars use RN `Image` with no caching, despite `expo-image` being
  installed.
- `reactCompiler` is enabled and `babel-plugin-react-compiler` is in the lockfile, so
  auto-memoisation is active — **measure before hand-adding `useMemo`.**

---

## 🎨 UI/UX Findings

- **78 hardcoded hex colours** across `app/` and `components/` despite
  `constants/themes.ts` + `ThemeContext`. Dark mode is visibly broken in those spots.
- **Keyboard handling covers 8 of the 16 screens with text inputs.** Missing on
  `phone.tsx`, `otp.tsx`, `tower.tsx`, `location.tsx` and
  `visitor/resident-detail.tsx` — and phone/OTP are the *first* thing every user
  touches, where the keyboard can cover the submit button on a small device.
- **No font-scaling defence.** No `maxFontSizeMultiplier` anywhere; large system text
  will clip and overlap, especially in `components/ui/TabBar.tsx` and the dashboard
  stat tiles.
- **Accessibility is thin** — 22 accessibility props against 309 touchables, so the
  overwhelming majority of controls are unlabelled for screen readers.
- **Tablet:** `supportsTablet: true` on iOS but every layout is phone-width with no
  breakpoints. Play surfaces this in the tablet quality report.
- **Two typography systems coexist** — `fonts.semibold` (Inter) and
  `fonts.displaySemibold` (Plus Jakarta); only dashboard and TodaysHelp were migrated.
- **Dark mode is genuinely strong** where it is tokenised — a real strength of the
  codebase.

---

## 📱 Play Store Readiness

Verified 12 July (evening).

| Item | Status |
|---|---|
| Package name | ✅ `com.getmyhelp.mobile` |
| `versionCode` / `versionName` | ✅ EAS `autoIncrement` + remote version source |
| Signing config | ✅ EAS-managed keystore |
| Release build type | ✅ `app-bundle` |
| ProGuard / R8 | ✅ Enabled in release |
| Target SDK | ✅ Expo 54 / RN 0.81 defaults are current |
| Cleartext traffic | ✅ HTTPS everywhere; TLS verified live on `api.getmyhelp.in` |
| `allowBackup` | ✅ `false` |
| Permissions | ✅ Camera + notifications only |
| `POST_NOTIFICATIONS` | ✅ Declared |
| App icon | ✅ Present |
| Splash screen | ✅ Present (oversized) |
| Privacy policy URL | ✅ Set, and live (`200`) |
| Build is green | ✅ `tsc` clean, ESLint 0 errors, 9/9 tests pass |
| CI gates merges | ✅ typecheck → lint → test on every push and PR |
| Crash reporting | ⚠ Sentry wired; `SENTRY_AUTH_TOKEN` unverified → stack traces may be minified |
| EAS Firebase file secrets | ⚠ **Unverified.** `"environment": "production"` is set, but if the secrets are absent the build ships with no Firebase — **no login, no push** |
| Adaptive icon | ⚠ Full-bleed foreground; will crop under the circular mask |
| Data Safety form | ⚠ Not submitted |
| Assets | ⚠ ~6.3 MB uncompressed (`splash.mp4`, `doorbell.wav`, `splash.png`, `icon.png`) |
| Tests on critical paths | ⚠ Push routing and visitor approval still uncovered |
| **Notification icon** | ❌ It is a **JPEG** with no alpha — ships as a white square |
| **In-app account deletion** | ❌ UI shipped, `DELETE /customer/account` 404s, client reports false success |
| **Reverse geocoding** | ❌ `/customer/geocode/reverse` 404s — **GPS onboarding is broken** |
| Force-update gate | ❌ Wired, but `/app/version` 404s — inert |
| Analytics | ❌ None |

---

## 📋 Final Verdict

### ⚠️ Ready after the production build is proven

Every code-level blocker raised across the 11 and 12 July audits is now closed. TLS is
live, tokens are in the Keychain, the 401 guard and timeouts work, the raw-`fetch`
migration is finished, the font system is fixed, role gating and the splash sequence
are in, the dependency tree is pruned, the doorbell actually rings, the notification
icon is a real alpha mask, all three previously-missing backend routes exist, and the
client no longer treats a 404 as an empty result. The tree compiles green behind CI
that gates every PR on typecheck, lint and tests.

What stands between here and the store is **not a code defect — it is a gate nobody
has walked through yet**: no one has installed a production AAB and logged into it.
Given that the entire login path depends on Firebase config being injected by EAS at
build time, and that failure mode is *silent*, this cannot be reasoned about. It has
to be run.

### Prioritised action plan

**Step 0 — prove the build. Nothing else is meaningful until this passes.**

1. Confirm `GOOGLE_SERVICES_JSON` + `GOOGLE_SERVICES_INFO_PLIST` are registered as EAS
   **file secrets**, and `SENTRY_AUTH_TOKEN` is set.
2. `eas build -p android --profile production`, install the AAB on a real device, and
   verify **all four**: phone-OTP login completes; a backgrounded push arrives; a
   thrown error reaches Sentry with a readable stack; the notification icon is a glyph,
   not a white square.
3. Exercise the three new routes end-to-end on that build with a real account: GPS
   society selection, account deletion, and (with `APP_REQUIRED_VERSION` temporarily
   raised) the update gate.

**Then — store submission.**

4. Update `docs/DATA_SAFETY.md` (our backend is now the only recipient of location
   data) and submit the Data Safety form.
5. Padded adaptive-icon foreground.
6. Compress the assets (~6.3 MB of avoidable download).

**Then — the known residue.**

7. Feature-gate flash (`FeatureContext.tsx:183`).
8. Analytics — we would otherwise launch blind on funnel and retention.
9. Tests on push routing and visitor approval.
10. Backend: close the plaintext port; answer the `/admin/customers/*` authz question;
    `access_log off` on the WS nginx location.

**Before rollout:** internal testing track → Play pre-launch report → staged rollout
(10% → 50% → 100%), watching Sentry between steps.
