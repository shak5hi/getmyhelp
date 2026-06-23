# GetMyHelp — Full Product & Design Review

> Reviewed as a design-team gate. Resident app + Guard app, Expo Router / React Native.
> Status: audit + strategy. Last updated: 2026-06-23.

---

## Executive summary (read this first)

The product is **functionally rich but structurally fractured.** The single most
important finding is not visual — it's architectural:

> **There are two competing design systems in the codebase, and the theme toggle
> only controls one of them.**

- `constants/themes.ts` + `src/ThemeContext` (real light/dark) powers **only** the
  Home tab, `TodaysHelp`, `ThemeToggle`, and the tab bar.
- `constants/tokens.ts → colors` (a hardcoded, dark-only purple palette) powers
  **everything else**: Society, Community, Visitors, Profile, Subscriptions,
  Settings, Chatbot, the entire Guard app, plus `PrimaryButton`,
  `SegmentedControl`, `EmptyState`, and all 15 files in `styles/`.
- On top of that, **Community, Settings, and Chatbot hardcode *light-mode* hex
  values** (`#F3F4F6`, `#111827`, `#10B981`…), so they render as light screens
  *inside* a dark-token app.

Practical result: flip the theme toggle and **only the Home screen responds.**
The dashboard redesign is currently an island. **No amount of screen-by-screen
visual polish will fix this — the system has to be unified first** (Phase 1/2).

Second finding: **a large fraction of the UI is non-functional.** Profile has ~15
menu rows; ~12 fire a "Coming Soon" alert. Settings' notification toggles are
local-only React state (nothing persists, nothing hits the API). "Language
Settings" shows "Coming Soon" even though a complete i18n system and a working
language picker already exist on the launch screen. This is *demo scaffolding
shipped as product.*

Everything else (navigation, IA, visual rhythm) is real but secondary to those two.

---

# Phase 1 — Product Discovery (Audit)

## 1.1 Feature inventory

| Domain | Capability | Status | Backend |
|---|---|---|---|
| **Auth** | Phone + Firebase OTP, token exchange (`/customer/firebase-verify`) | Working | Firebase + REST |
| **Onboarding** | Language pick, location → society-detected → tower; pre-registered residents skip it | Working | REST |
| **Home help (the actual core)** | Today's scheduled providers, mark present/absent/late + selfie proof, attendance history | Working | `/customer/providers/*` |
| **Visitors (resident)** | Approve/reject (push + modal), history, QR invites, OTP invites, revoke | Working | `/customer/visitors/*` |
| **Visitors (guard)** | New entry w/ photo, QR scan, OTP verify, exit marking, list (today/all) | Working | `/guard/visitors/*` |
| **Society** | Finance ledger (read-only income/expense), support tickets (create/view) | Working | `/customer/society/finance`, `/customer/tickets` |
| **Community** | Announcements (+ search, read state, reactions), forum (posts/replies/images/report), polls (single+multi) | Working | `/customer/announcements`, `/forum/*`, `/polls` |
| **Subscriptions** | View active, browse plans, subscribe, request cancellation | Working | `/customer/subscriptions*` |
| **Notifications** | Unread count, list, mark read, real-time via WebSocket | Working | `/customer/notifications` + WS |
| **Chatbot** | Session-based assistant, option-button replies, history, reset | Working | `/chatbot/sessions` |
| **Real-time** | 5 socket hooks: notification, announcement, forum, post, guard-visitor | Working | WebSocket |
| **Profile menu** | Subscription/Payments/Support/Preferences rows | **~80% fake** ("Coming Soon") | none |
| **Settings** | Notification toggles, account, language | **Mostly fake / local-only** | partial |
| **Explore tab** | "Coming Soon" placeholder | **Dead** | none |
| **i18n** | English/Hindi, full string tables | Built, **underused** | local |

**Hidden / under-surfaced features:** Chatbot (only reachable via the Home FAB),
Subscriptions (tab is `href:null`; entry points are a conditional Home summary
line + dead Profile rows), Settings (only via Profile), OTP-vs-QR invites (buried
two layers into the Visitors tab), attendance history (only a Home quick-action).

## 1.2 Navigation architecture

- **Resident** — 5 visible tabs: `Home · Society · Community · Visitors · Profile`.
  Hidden (`href:null`): `chatbot, subscriptions, settings, explore`.
- **Guard** — separate 5-tab navigator: `Visitors · New Entry · Scan QR · OTP
  Entry · Profile` (still on the old un-themed `colors`).
- **Root stack** — ~30 detail routes (visitor/*, community/*, society/*) with a
  global header. The global header (`app/_layout.tsx`) hardcodes `#2E3A46` icons
  and a red badge — un-themed; `headerBackTitleVisible` is a deprecated option TS
  already flags.

## 1.3 State, permissions, data

- **State:** local `useState` per screen + AsyncStorage; two React contexts
  (Theme, Notification) + Language. No data cache/query layer — every screen
  refetches on mount and re-reads `user`/`token` from storage repeatedly.
- **Permissions/roles:** role string in AsyncStorage (`guard` vs resident)
  decided at login and on cold-start in `index.tsx`. **No central auth guard** and
  **no 401/expiry handling** — an expired token silently yields empty screens.
- **Data models:** backend contract is unstable/unversioned — screens defensively
  probe 5–8 possible response shapes
  (`json.data.items ?? json.items ?? json.results ?? …`). Real maintenance +
  reliability tax.
- **Security:** API is plain `http://31.97.239.190:9001` (not HTTPS); auth flow
  `console.log`s the access token and full profile JSON.

## 1.4 States coverage

| | Loading | Empty | Error | Offline |
|---|---|---|---|---|
| Home | none (silent) | "all caught up" ✓ | swallowed (`catch {}`) | ✗ |
| Society | Skeleton ✓ | EmptyState ✓ | console only, no UI | ✗ |
| Community | Skeleton ✓ | EmptyState ✓ | console only | ✗ |
| Visitors sublists | spinner | varies | varies | ✗ |
| Subscriptions | full-screen spinner | inline ✓ | `Alert` ✓ | ✗ |

Pattern: **errors are logged, not shown.** A failed fetch looks identical to "no
data." No retry affordance anywhere.

## 1.5 Component inventory

Reusable: `PrimaryButton`, `SegmentedControl`, `EmptyState`, `Skeleton`,
`CategoryBadge/PriorityBadge/AuthorTag/EmojiReactionBar/ImageGallery`,
`TicketCard/TransactionCard/CommentItem`, `VisitorApprovalModal`, `TodaysHelp`.
**Three theme files** (`theme.ts`, `themes.ts`, `tokens.ts`) — the first is the
Expo default, still imported by `themed-text/themed-view/use-theme-color` which
nothing real uses. Expo scaffold leftovers: `hello-wave`,
`parallax-scroll-view`, `collapsible`, `external-link`, `explore.tsx`,
`modal.tsx`.

## 1.6 Technical constraints & concerns

- **Critical:** dual design system; theme toggle is cosmetic on 90% of screens.
- **Perf:** `console.warn` on **every poll render** in `community.tsx`; FlatLists
  without `getItemLayout`/memoized rows; repeated AsyncStorage reads.
- **A11y:** 10.5pt tab labels / 11.5pt quick labels (below comfortable min),
  status conveyed by color only, sub-44pt targets, almost no `accessibilityLabel`.
- **TS:** pre-existing type errors in `_layout.tsx`, `manual-location.tsx`,
  `Skeleton.tsx`, `location.styles.ts`, `visitor.styles.ts`.

---

# Phase 2 — Product Critique (ranked)

### 🔴 Critical
1. **Dual design system; theme toggle non-functional on 9 of 10 screens.**
2. **Pervasive fake UI.** Profile (~12 "Coming Soon" rows), Settings toggles
   (local-only), Language (dead despite working i18n), Explore tab (placeholder).
3. **Errors are invisible.** Network failure == empty state. No retry. Silent
   `catch {}` on Home.
4. **No auth/expiry handling.** Expired session = silent blank app.

### 🟠 High
5. **Insecure transport + token logging.** `http://`, `console.log(access_token)`.
6. **IA mismatches.** "Society" bundles **Finance + Tickets** (money + complaints —
   unrelated mental models). Subscriptions orphaned. Chatbot hidden behind a FAB.
7. **Home help — the product's actual core differentiator — is buried** as one
   mid-page card titled "Today's Help," visually subordinate to a decorative
   greeting and a gradient box.
8. **Visitor invite creation is over-split.** QR vs OTP as two separate tabs + two
   separate generate screens for one intent: "invite someone."
9. **Brand incoherence.** Token file documents a "Raunak/Bougainvillea/Dhoop"
   Hindi palette and "Plus Jakarta Sans," but ships generic Inter + purple;
   Jakarta installed-but-unused; Newsreader loaded-but-unused (until the dashboard
   edit).

### 🟡 Medium
10. Debug `console.warn`/`console.log` in render & auth paths.
11. Three theme files; dead Expo scaffold components.
12. Tiny type scale, color-only status, weak a11y.
13. Defensive response-shape probing everywhere (backend contract unversioned).
14. No pull-to-refresh on Home/Profile; no skeletons on Home.

### 🟢 Low
15. `renderTabBar` dead code in `community.tsx`.
16. Inconsistent header treatments (each screen rolls its own 26pt title).
17. `modal.tsx`/`explore.tsx` routes linger.

---

# Phase 3 — The Ideal Experience (first principles)

**Who this is really for:** a resident of a managed society whose recurring jobs
are, in frequency order: (1) *is my maid/cook here today, and log it*; (2)
*approve the person at the gate*; (3) *invite a guest ahead of time*; (4) *what's
happening in my society (notices/dues)*. Subscriptions, support, and chat are
infrequent. The current app weights all of these roughly equally — the core
mistake.

1. **See first:** today's **home-help roster with one-tap attendance**, and any
   **pending gate approval** — the two time-sensitive daily actions. These *are*
   the home screen.
2. **Actions that matter most:** Mark attendance · Approve/Reject visitor · Invite
   a guest. Everything else is a tap away, not on the surface.
3. **Surface:** unresolved, time-bound items (pending approvals, today's roster,
   unread urgent notices, dues due soon).
4. **Hide:** anything not actionable today — payment history, T&C, billing
   details, plan browsing → behind Profile/Account.
5. **Automate:** session refresh; attendance reminders; auto-mark-read notices on
   open; remember invite defaults.
6. **Simplify:** one **"Invite a guest"** flow (QR *or* OTP chosen inside it, not
   as tabs); merge Settings into Profile.
7. **Remove:** Explore tab, fake Profile/Settings rows, `modal.tsx`, duplicate
   theme files, Expo scaffold.

---

# Phase 4 — Rebuilt flow (screen specs)

**Recommended tab bar (resident):
`Home · Visitors · Society · Community · Account`** (Subscriptions/Settings fold
into Account; Chatbot becomes a persistent header/Home entry, not a hidden tab).

### Home
- **Purpose:** answer "what needs me today?" in <2s.
- **Primary action:** mark home-help attendance.
- **Secondary:** approve pending visitor, invite guest, view dues-due.
- **Entry:** post-login default. **Exits:** any tab, attendance history, visitor detail.
- **States:** skeleton → roster / "no help scheduled" / pending-approval banner / error+retry.
- **Why:** collapses the two daily jobs into one glance.
- **Metric:** % of attendance marked from Home; time-to-first-action.

### Visitors
- **Purpose:** manage who comes to your home.
- **Primary:** Invite a guest (unified). **Secondary:** approve pending, view history, manage active invites.
- **States:** segmented Active invites / History; empty; error+retry.
- **Why:** one mental model ("my guests"), QR/OTP an implementation detail.
- **Metric:** invites created; approval latency.

### Society
- **Purpose:** money + issues with **management**.
- **Primary:** raise a ticket / pay-or-view dues. **Secondary:** finance ledger, ticket status.
- **Recommendation:** rename mental model to **"Building"** and split Finance
  (Dues) from Tickets visually, or promote Tickets to top-level "Help/Support."
- **Metric:** ticket resolution visibility; dues-viewed.

### Community
- **Purpose:** society social layer.
- **Primary:** read notices / post. Keep Notices·Forum·Polls — most coherent tab already.
- **Metric:** notice read-rate, poll participation.

### Account (merged Profile + Settings + Subscriptions)
- **Purpose:** identity, plan, real preferences.
- **Remove every "Coming Soon" row** — show only what works (plan, language,
  notifications, logout, support contact).
- **Metric:** support deflection; settings actually used.

## Journey maps (major flows)

**Daily attendance**
`Goal: log my maid → Home (roster card) → tap Present → camera (optional proof) → ✓ inline "Arrived 9:04" → stay on Home`

**Gate approval**
`Goal: approve visitor → push/WS → in-app modal (photo, name, purpose) → Approve → ✓ toast → guard notified (WS) → modal dismisses`

**Invite a guest (rebuilt)**
`Goal: pre-clear a guest → Visitors → "Invite a guest" → enter name/phone/when → choose QR or OTP → share sheet → invite appears under "Active" → revoke anytime`

---

# Phase 5 — Feature prioritization

**KEEP** (working, valued): Home-help attendance + proof, visitor approval
(push+WS), QR/OTP invites, community trio, finance ledger, tickets, subscriptions,
OTP auth, real-time sockets, i18n engine.

**IMPROVE:** Home (re-center on attendance+approvals) · Visitors (unify invite) ·
Society (split money vs issues) · Account (strip fakes) · global
error/empty/retry · auth-expiry guard.

**MERGE:** Settings → Account · QR-invites + OTP-invites → one "Invite" flow ·
three theme files → one · Profile's 3 subscription rows → one "Manage plan."

**REMOVE:** Explore tab, all "Coming Soon" rows, `modal.tsx`, Expo scaffold
components, dead `renderTabBar`, in-render `console.warn`, token `console.log`.

**ADD:** error+retry component · auth/session guard (401→re-login) · attendance
reminder push · functional notification preferences (persisted to API) · HTTPS ·
response-type layer for the API · onboarding profile-completion/welcome.

*Why, in one line each:* every "remove" is trust-eroding or dead weight; every
"add" closes a reliability or retention gap the current build silently ignores.

---

# Phase 6 — Visual design direction

The brief ("solid colors, avoid gradients, Linear/Stripe/Notion calm")
**partially revises the earlier dashboard work** (terracotta gradient hero +
decorative circles). Recommendation: **keep the warm "Terracotta & Ink" identity
and the Newsreader serif — distinctive and on-context — but convert the gradient
hero to a solid accent surface** so the system is gradient-free and consistent.
One identity, executed in solids.

### Color (solid, themed — the contract both modes must implement)

| Role | Light | Dark |
|---|---|---|
| `bg` | `#F7F2EA` warm paper | `#14110D` espresso |
| `surface` | `#FFFFFF` | `#1E1913` |
| `card` | `#FFFFFF` | `#241E17` |
| `border` | `#EAE1D3` | `#332A20` |
| `text` | `#241C16` | `#F4ECE0` |
| `textSecondary` | `#7A6E61` | `#B6A795` |
| `accent` (terracotta) | `#C2522E` | `#E8763F` |
| `success` (sage) | `#3E7A52` | `#6BBE85` |
| `warning` (brass) | `#9A6A1B` | `#E8B24A` |
| `danger` | `#C2413B` | `#E8736B` |

(These already exist in `constants/themes.ts` — the move is to make *every screen
consume them* and drop `accentGradient`.)

### Typography
- **Display/headings:** Newsreader (serif) — greetings, screen titles, section headers.
- **UI/body:** Inter. *(Delete the unused Jakarta dependency and the false "Plus Jakarta Sans" comment.)*
- **Scale (single source):** Display 30 / H1 24 / H2 20 / Title 16 / Body 14 /
  Label 12 / Caption 12. **Raise tab labels to 12 and quick-action labels to ≥13.**
- **Weights:** Inter 400/500/600/700; Newsreader 400/600.

### Spacing & grid
- 4/8 base (already in `tokens.spacing`). Screen gutter **20**; card padding
  **16–18**; section gap **24–32**; list-row min height **64**; touch target min **44**.

### Components (standardize)
- **Card:** `card` bg, radius 20–24, 1px `border` in light / borderless+lift in dark. One definition, theme-driven.
- **Button:** keep `PrimaryButton`, make it theme-aware (currently hardcoded
  `colors.accent`); variants primary/secondary/ghost; height 52, radius `full`.
- **Status:** pill **with icon + label** (never color-only) using success/warning/danger tints.
- **Nav:** floating rounded tab bar — make it theme-aware everywhere; labels 12pt.
- **Forms/inputs, modals (bottom-sheet), tables (finance rows):** one themed
  primitive each, replacing the per-screen hardcoded variants.
- **Empty/Error/Loading:** one `EmptyState`, one new `ErrorState` (with Retry),
  `Skeleton` — all theme-driven (today `EmptyState` borrows `societyStyles` and a
  hardcoded `#CBD5E1` icon).

---

# Phase 7 — Implementation roadmap

| Phase | Work | Impact | Eng complexity | UX impact | Depends on |
|---|---|---|---|---|---|
| **1. Quick wins** | Remove `console.warn`/token logs; delete Explore + dead scaffold + `renderTabBar`; strip all "Coming Soon" rows; add `ErrorState`+retry; raise tiny font sizes | High | Low | High | — |
| **2. Structural** | **Unify the design system**: migrate every screen + `styles/*` + Guard app + shared components off `tokens.colors` onto `useTheme()`; delete `theme.ts`; add auth/401 guard; central API/token helper + response typing | **Highest** | Medium–High | Highest | P1 |
| **3. Major UX** | Re-center Home on attendance+approvals; unify Visitor invite; resolve Society IA (money vs issues); merge Settings→Account; make notif prefs + language real | High | Medium | High | P2 |
| **4. Visual polish** | Apply solid Terracotta/Ink system (convert gradient hero→solid); Newsreader/Inter scale everywhere; standardize cards/buttons/status/empty; tasteful reanimated entrances | Medium | Medium | High | P2 |
| **5. Future** | Attendance reminders (push); HTTPS; onboarding/welcome; offline cache (React Query); skeletons everywhere; full a11y pass | Medium | Med–High | Medium | P3/P4 |

**Sequencing rule:** *Phase 2 is the gate.* Visual polish (Phase 4) applied
before unification just creates more islands. Phase 1 is safe to do today in
parallel.

---

## Wireframe descriptions (key screens)

**Home (rebuilt)** — Compact top bar (avatar · notifications · theme). One-line
serif greeting. **If a visitor is pending: a sticky accent banner at top** ("1
person at the gate — Review"). Then the hero = **Today's Help roster** (each
provider: avatar, name, role, big Present/Absent, inline proof state) — *this is
the screen, not a mid-page card.* Below: a slim "dues due in N days" chip only if
relevant. 2×2 quick actions last. Solid surfaces; no gradient.

**Visitors (rebuilt)** — Big "Invite a guest" primary button up top. Segmented
**Active · History**. Active = live invites (QR/OTP shown as a small type tag)
with Revoke. History = chronological with status pills. Invite flow is a single
sheet ending in a QR/OTP choice + share.

**Account (merged)** — Identity card (avatar, name, flat) → **Plan** (real status
+ manage) → **Preferences** (language ✓, notification toggles ✓ persisted) →
**Support** (real contact) → Logout. Nothing that alerts "Coming Soon."

---

## Rationale for the biggest calls
- **Unify before polish** — the toggle visibly breaks today and every new screen
  otherwise multiplies the inconsistency.
- **Delete fake UI** — twelve "Coming Soon" rows read as "unfinished," not
  "roadmap." Honest, smaller surface > padded, broken surface.
- **Re-center Home on attendance** — it's the daily, differentiated job; the gate
  approval is the urgent one. Decorative greeting + gradient box currently outrank
  both.
- **Solids over gradients** — matches the Linear/Stripe bar; removes the one
  inconsistency in the work already shipped.
- **Keep terracotta + serif** — the one genuinely distinctive, context-fitting
  choice in the app; make it *the* system, not replace it again.

---

## Progress tracker

- [x] **Phase 1 — Quick wins** (debug logs, dead code, fake rows, ErrorState, font sizes) — done 2026-06-23
  - Stripped PII/token `console.log`s from `otp.tsx`, `index.tsx`, `phone.tsx`; removed in-render `console.warn` from `community.tsx`.
  - Deleted dead Expo scaffold: `explore.tsx`, `modal.tsx`, `themed-text/themed-view`, `parallax-scroll-view`, `hello-wave`, `external-link`, `collapsible`, `icon-symbol(.ios)`, `use-theme-color.ts`, `constants/theme.ts`; removed dead `renderTabBar` in `community.tsx`; removed `explore` tab registration.
  - Stripped ~12 "Coming Soon" rows from `profile.tsx` → collapsed to Manage Subscription / Settings / Logout.
  - Added `components/ui/ErrorState.tsx` (with retry); wired into `society.tsx` + `community.tsx` (errors now show a retry UI instead of looking empty).
  - Raised tab-label font 10.5→12.
  - Verified: no new TypeScript errors (same pre-existing baseline).
- [~] **Phase 2 — Design-system unification** (migrate all screens to `useTheme()`, auth guard, API layer) — in progress
  - **Pattern established:** each `styles/*.ts` becomes `export const makeStyles = (t: Theme) => StyleSheet.create({...})`; each screen/component does `const { theme } = useTheme(); const styles = useMemo(() => makeStyles(theme), [theme]);` and uses `theme.*` for inline colors. Token map: `background→bg`, `surface→card`, `textPrimary→text`, `accentLight→accentTint`, `secondary*→success*`, `highlight*→danger*`, `*Light→*Tint`, `textInverse→onAccent`, `divider→divider`, `surfaceAlt→surfaceAlt`.
  - **Theme tokens added:** `surfaceAlt`, `divider` (both palettes).
  - **Wave 1 done (2026-06-23, tsc-verified, no new errors):** shared components `SegmentedControl`, `PrimaryButton`, `EmptyState`, `ErrorState`; tabs **Subscriptions, Settings, Profile** (+ their style files). Settings' hardcoded light hex fully replaced. Home was already themed.
  - **Wave 2 done (2026-06-23, tsc-verified, no new errors):**
    - Society cluster: `society.styles.ts`→factory, `society.tsx`, `TransactionCard`, `TicketCard`, `CommentItem`, `create-ticket`, `ticket-details`.
    - Community cluster: `community.styles.ts`→factory, `community.tsx`, `AuthorTag` (was invisible-on-dark), `announcement-detail`, `create-post`, `forum-thread`. (`CategoryBadge`/`PriorityBadge`/`EmojiReactionBar`/`ImageGallery` left as semantic pastel pills — fine in both themes.)
    - Visitors: `visitors.tsx` tab + `visitor-history` + `qr-invite-list` + `otp-invite-list` (each had a local StyleSheet). Deleted dead `styles/visitor.styles.ts` (unused; also cleared its baseline TS error).
    - **All 5 resident tabs (Home, Society, Community, Visitors, Profile) + Subscriptions/Settings now respond to the toggle.**
  - **Wave 2 remaining (secondary surfaces):** 7 visitor detail/generate screens (`exit-entry`, `generate-otp`, `generate-qr`, `otp-invite-detail`, `pending-approval`, `qr-invite-detail`, `resident-detail`), `chatbot` tab (uses `dashboardStyles` + hardcoded hex), `notifications`, `attendance-history`, `assignment-details`, Guard app (5 screens), pre-login auth/onboarding, root header in `app/_layout.tsx`.
  - **Wave 3 (separate sub-item):** auth/401 guard + central API/token helper + response typing.
  - **Token map note:** when sed-converting, also rename `background→bg`, `textPrimary→text`, `surface→card` (a blanket `colors.→t.` alone leaves invalid `t.background`/`t.textPrimary`/over-dark `t.surface`).
- [ ] **Phase 3 — Major UX** (Home re-center, unified invite, Society IA, Account merge)
- [ ] **Phase 4 — Visual polish** (solid Terracotta/Ink, type scale, components)
- [ ] **Phase 5 — Future** (reminders, HTTPS, onboarding, offline cache, a11y)

Dashboard redesign (`app/(tabs)/dashboard.tsx`, `constants/themes.ts`,
`constants/tokens.ts` serif fonts) already landed — to be reconciled with the
solid-color direction in Phase 4.
