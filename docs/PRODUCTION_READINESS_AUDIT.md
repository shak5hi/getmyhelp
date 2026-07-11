# Production Readiness Audit

**App:** GetMyHelp Mobile (`com.getmyhelp.mobile`)
**Stack:** React Native 0.81 · Expo SDK 54 · expo-router
**Audit date:** 11 July 2026
**Verdict:** ❌ **Not ready for release**

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
| 1 | **TLS on the API host** | ❌ **NOT DONE — blocks release.** See below. |
| 2 | `versionCode` / `buildNumber` / `autoIncrement` | ✅ Done |
| 3 | `POST_NOTIFICATIONS` declared | ✅ Done — verified in merged release manifest |
| 4 | `SYSTEM_ALERT_WINDOW` removed | ✅ Done — via `android.blockedPermissions` |
| 4b | `SCHEDULE_EXACT_ALARM` / `RECEIVE_BOOT_COMPLETED` removed | ✅ Done — notifee pulled these in; `SCHEDULE_EXACT_ALARM` is Play-restricted |

#### ❌ Blocker 1 — TLS is not done

Verified: `https://admin.getmyhelp.in` serves the admin **frontend HTML**. The API
answers only on `http://31.97.239.190:9001`. There is no HTTPS path to the API.

Server topology (confirmed): **nginx on the host** owns :80/:443; the backend runs
in Docker publishing `9001 → 8000`.

Remaining work, on the server:

1. DNS `A` record: `api.getmyhelp.in → 31.97.239.190` (Hostinger hPanel → DNS Zone
   Editor; the Name field takes `api`, not the FQDN).
2. nginx site for `api.getmyhelp.in` proxying to `127.0.0.1:9001`, **including the
   `Upgrade` / `Connection` headers** — without them the notification WebSocket
   fails — and `client_max_body_size 25M` for attendance photos.
3. `sudo certbot --nginx -d api.getmyhelp.in`, choosing HTTP→HTTPS redirect.
4. Verify `curl -i https://api.getmyhelp.in/customer/features` returns **JSON**
   `401 {"detail":"Could not validate credentials"}` — not HTML.
5. Re-bind the container to `127.0.0.1:9001:8000` so the plaintext port is no
   longer reachable from the internet.

Then, in the app: point `config.ts` at `https://api.getmyhelp.in` and delete the
iOS `NSAllowsArbitraryLoads` + IP exception from `app.json`. The WebSocket upgrades
to `wss://` for free — `useNotificationSocket` derives its URL from `apiUrl` by
swapping the scheme.

**Until this is done, a release build cannot talk to the backend at all.**

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
| 9 | Crash reporting (Sentry) | ✅ **Done.** DSN wired in `src/sentry.ts`; `@sentry/react-native/expo` plugin registered (org `priya-sharma`, project `react-native`); `SENTRY_AUTH_TOKEN` in EAS secrets for source-map upload. Reports in release only (`enabled: !__DEV__`). Events appear only from release/preview builds, not `expo run`. |
| 10 | Root `ErrorBoundary` | ✅ Done — `components/ErrorBoundary.tsx`, outermost in `_layout` |
| 11 | Fetch timeouts | ✅ Done — 20s `AbortController` in `apiRequest`, typed `NetworkError` (distinguishes timeout vs no-connection) |
| 11b | Offline handling | ✅ Done — `useNetworkStatus` + `OfflineBanner`; captive-portal aware |
| 12 | Migrate the 12 raw-`fetch` screens onto `apiRequest` | ❌ Outstanding — they still skip the timeout, the 401 guard and the 403 handling |

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

### Phases 4–5

Outstanding. See the action plan at the end of this document.

---

## 🚨 Critical Issues

Must be fixed. Each one either blocks upload, fails at runtime in a release build,
or is a serious data exposure.

### 1. The entire API runs over plaintext HTTP

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

### 2. `POST_NOTIFICATIONS` is not declared in the manifest

`src/push.ts:33` requests it at runtime on Android 13+. Without the manifest
declaration the request **fails immediately**, `registerForPush` returns at
`if (!granted) return`, and — because the whole function is wrapped in a fail-safe
catch — it fails *silently*.

Push is therefore broken for every Android 13+ user, i.e. most of the install base.
It appears to work on the test device only because the permission was already
granted there.

### 3. `SYSTEM_ALERT_WINDOW` ships in the release manifest

"Draw over other apps" is a high-scrutiny permission and a common rejection cause.

Root cause: **`expo-dev-client` is in `dependencies`, not `devDependencies`.** That
also means the production bundle ships the dev menu and launcher.

**Fix:** move `expo-dev-client` to `devDependencies`; confirm the permission
disappears from the generated release manifest.

### 4. No `versionCode` / `buildNumber`

`app.json` sets `version: "1.0.0"` but no `android.versionCode`, no
`ios.buildNumber`, and `eas.json` has no `autoIncrement`.

**Play will not accept an upload without a `versionCode`**, and every subsequent
upload must increment it.

### 5. The JWT is passed in the WebSocket URL query string

`hooks/useNotificationSocket.ts:26`:

```
${host}/ws/notifications/customer/${customerId}?token=${token}
```

Query strings are written to server logs, proxy logs and crash reports. Full JWTs
were observed in plain `docker compose logs` output during this session.

**Fix:** send the token in a header, or mint a short-lived single-use ticket.

### 6. Access tokens are stored unencrypted

`app/otp.tsx:134` writes `access_token` to `AsyncStorage`, which is plaintext on
disk. Combined with **`android:allowBackup="true"`**, the token is synced to the
user's Google Drive backup.

**Fix:** `expo-secure-store` (Keychain / Keystore) and `allowBackup="false"`.

### 7. The customer app calls an admin endpoint

`app/(tabs)/dashboard.tsx:100`:

```
GET /admin/customers/${user.id}/subscriptions
```

Either the backend authorises **customer** tokens against `/admin/*` routes — an
authorisation hole worth auditing today — or this is the wrong endpoint and works
by accident. Both are bad.

### 8. No crash reporting, no analytics, no OTA updates

No Sentry, no Crashlytics, no `expo-updates`. The app would ship with **zero
visibility into production crashes** and no way to hotfix without a full store
release.

---

## ⚠ High Priority

| Issue | Detail |
|---|---|
| **No `ErrorBoundary`** | A single render exception is a permanent white screen. There is no browser to reload. |
| **23 empty `catch {}` blocks** | Errors are swallowed app-wide. This pattern hid both the push bug and the Firebase credential bug for hours during this session — the app kept "working" while doing nothing. |
| **No timeouts / retry / offline handling** | No `AbortController` anywhere; `netinfo` is not installed. On a flaky connection the app hangs on a spinner forever. A resident in a basement lobby is the literal use case. |
| **12 screens bypass `apiRequest`** | `dashboard`, `society`, `chatbot`, `otp`, `index`, `tower`, `society-detected`, `create-ticket`, `ticket-details`, `assignment-details`, and both guard screens use raw `fetch`. They skip the 401 session guard, the JSON-parse safety and the 403 feature-disabled handling that `src/api/client.ts` exists to provide. |
| **74 `console.*` calls ship in release** | No `babel.config.js`, so no `transform-remove-console`. Two log auth tokens: `app/location.tsx:150` and `app/manual-location.tsx:84` (`"🔐 USING TOKEN:"`). |
| **Zero tests, zero CI** | No test files, no `.github/workflows`. Nothing stops a regression reaching the store. |
| **No notification icon** | `app.json` has no `notification.icon`, so Android renders every push with a grey square. Prebuild warns about this on every run. |

---

## 🟡 Medium Priority

- **`READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE`** are declared and
  deprecated. Play flags broad storage access; scoped storage does not need them.
- **`RECORD_AUDIO`** is declared. If audio isn't recorded, remove it — microphone
  access requires justification and is an easy rejection.
- **i18n is ~10% complete.** Only home / phone / OTP use `i18n.t()`. Dashboard,
  society, visitors, community and notifications are hardcoded English, so the
  Hindi toggle yields a half-translated app.
- **iOS Firebase will not initialise.** `GoogleService-Info.plist` declares bundle
  id `getmyhelp.ios`; `app.json` declares `com.getmyhelp.mobile`. Blocking for iOS,
  not for this Android release.
- **No `runtimeVersion` / `updates` config** — prerequisite for `expo-updates`.
- **No app lifecycle handling** — no refetch or socket reconnect on foreground.
- **No tablet layout work**, despite `supportsTablet: true` on iOS.

---

## 💡 Nice to Have

- Haptics on primary actions (`expo-haptics` is already a dependency, unused).
- Pull-to-refresh on the dashboard (present on society, absent on home).
- Skeleton loaders beyond `TodaysHelp`, which is currently the only one.
- A force-update / maintenance-mode gate driven by a version check.

---

## 🧹 Cleanup

- **`assets/home.png` is unused** — dead since the get-started redesign.
- **`assets/` is 6.9 MB**, dominated by `splash.mp4` (2.5 MB) and `splash.png`
  (1.2 MB). The video plays once, on launch, and inflates every download.
- **`constants/tokens.ts` exports `colors` and `palette` that nothing imports** —
  superseded by the theme system.
- **`expo-av` and `expo-video` are both installed.** `expo-av` is deprecated and
  appears unused.
- Three near-identical `fetch` + `JSON.parse` + error-state blocks in
  `society.tsx`, `chatbot.tsx` and `ticket-details.tsx`.

---

## 🔒 Security Findings

| Finding | Severity |
|---|---|
| Plaintext HTTP for all API traffic | **Critical** |
| JWT in WebSocket query string (lands in logs) | **Critical** |
| Access token in unencrypted `AsyncStorage` | **High** |
| `allowBackup="true"` → token synced to Google Drive | **High** |
| Token prefix logged to console in two files | **High** |
| Customer app calling `/admin/*` | **High** — audit backend authz |
| `SYSTEM_ALERT_WINDOW` granted | **High** |
| iOS `NSAllowsArbitraryLoads: true` | **High** — Apple rejection risk |
| `DISABLE_APP_VERIFICATION` | ✅ Resolved — now bound to `__DEV__`, cannot ship enabled |

**Secrets hygiene is good.** `google-services.json`, `GoogleService-Info.plist`,
`*.jks` and `.env*` are correctly gitignored and untracked. No secrets in history.

---

## ⚡ Performance Findings

- **Startup is gated on a 2.5 MB video** that must decode before the first frame.
- `TodaysHelp` refetches on **every** screen focus (`useFocusEffect`), uncached.
- `dashboard.load()` depends on `refreshFeatures`, `visitorsEnabled` and
  `subscriptionsEnabled`, so it re-runs as each feature flag resolves — firing
  duplicate network calls on mount. `/customer/features` was observed being
  fetched twice per launch.
- Provider avatars use RN `Image` with no caching, despite `expo-image` being
  installed and supporting it.
- No `React.memo` / `useCallback` discipline in list rendering.

---

## 🎨 UI/UX Findings

- **Two typography systems coexist.** `fonts.semibold` (Inter) and
  `fonts.displaySemibold` (Plus Jakarta). Dashboard and TodaysHelp were migrated;
  everything else is still Inter.
- **Error states are inconsistent.** A few screens use `ErrorState`; most silently
  render empty.
- **No keyboard avoidance** on the OTP or ticket-creation forms.
- **Empty states exist on ~3 of ~20 screens.**
- **Dark mode is genuinely strong** — consistent and well-tokenised. A real
  strength of the codebase.

---

## 📱 Play Store Readiness

| Item | Status |
|---|---|
| `versionCode` | ❌ Missing — **blocks upload** |
| `versionName` | ✅ `1.0.0` |
| Package name | ✅ `com.getmyhelp.mobile` |
| Signing config | ✅ EAS-managed keystore |
| App icon | ✅ Present |
| Adaptive icon | ✅ Configured |
| Splash screen | ✅ Present (oversized) |
| Release build type | ✅ `app-bundle` |
| ProGuard / R8 | ✅ Enabled in release |
| Cleartext traffic | ❌ Release build will fail — no HTTPS |
| `allowBackup` | ⚠ `true` — leaks tokens to Drive |
| Permissions | ⚠ `SYSTEM_ALERT_WINDOW`, `RECORD_AUDIO`, legacy storage |
| `POST_NOTIFICATIONS` | ❌ Missing — push broken on Android 13+ |
| Notification icon | ❌ Missing |
| Data Safety form | ❌ Not started — app collects phone, location, camera, photos |
| Privacy policy URL | ❌ Required for this permission set |
| Crash reporting | ❌ None |
| Target SDK | ✅ Expo 54 defaults are current |
| Tests / CI | ❌ None |

---

## 📋 Final Verdict

### ❌ Not ready for release

Not because the code is bad. The architecture is genuinely sound — the
feature-permission system, the API client's 401 handling and the theme system are
better than typical for a first release.

It is not ready because of **four specific things that will either be rejected or
will not function**:

1. no HTTPS,
2. no `versionCode`,
3. push broken on Android 13+,
4. `SYSTEM_ALERT_WINDOW` shipping from a dev dependency.

### Prioritised action plan

**Phase 1 — Blockers.** Nothing ships without these.

1. **TLS on the API host.** Put a domain in front of `31.97.239.190:9001`, switch
   `config.ts` to `https://`, remove the iOS ATS exception. *Start this first — it
   is the only item with an external dependency.*
2. Add `android.versionCode` + `ios.buildNumber`; set `autoIncrement` in `eas.json`.
3. Declare `POST_NOTIFICATIONS` in the manifest.
4. Move `expo-dev-client` to `devDependencies`; verify `SYSTEM_ALERT_WINDOW` is
   gone from the release manifest.

**Phase 2 — Security.** Before real users.

5. Token → `expo-secure-store`; set `allowBackup="false"`.
6. JWT out of the WebSocket URL.
7. Remove the two token `console.log`s; add `transform-remove-console` for release.
8. Audit why a customer token can call `/admin/customers/*`.

**Phase 3 — Survivability.** Before you can support it in production.

9. Sentry or Crashlytics.
10. Root `ErrorBoundary`.
11. Fetch timeouts + `NetInfo` offline handling.
12. Migrate the 12 raw-`fetch` screens onto `apiRequest`.

**Phase 4 — Store submission.**

13. Notification icon, privacy policy URL, Data Safety declaration, prune
    unjustified permissions.

**Phase 5 — Durability.**

14. `expo-updates` (hotfix without a store round-trip), CI, and tests on the auth
    and feature-gating paths.

Phases 1 and 2 are a few days of focused work. Phase 1 item 1 (TLS) has a real
external dependency — begin it today.
