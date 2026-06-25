# GetMyHelp — Senior Design Director Review (Phase 5 audit)

> Companion to `PRODUCT_REDESIGN_REVIEW.md`. Audits the app *as shipped* after
> Phases 1–4. Scope: resident app, guard app, shared primitives. No code in this
> doc — it is the audit + roadmap. Implementation tracked separately.

## Verdict

The **architecture** of the redesign is genuinely strong — the theme system, the
dashboard hierarchy, the attendance interaction, the consolidated invite flow are
all well-considered. But the app still reads as "a well-made React Native app"
rather than "Apple made a society app" for one structural reason: **the design
system was designed but never enforced.** Primitives exist (`PrimaryButton`,
`EmptyState`, `SegmentedControl`, tokens for spacing/radii/type) and then almost
every screen ignores them and hand-rolls its own version. That inconsistency —
not any single ugly screen — is the fingerprint.

---

## Phase 1 — Audit (ranked)

### CRITICAL

**C1 — Canonical components exist but aren't adopted (the #1 template tell).**
`PrimaryButton` (height 54, `radii.full`, accent shadow) is the official button.
Almost nothing uses it. Instead: `visitors.tsx` `inviteBtn` (r14/p14), `invite.tsx`
`submitBtn` (r10/p15) + `methodCard`, `TodaysHelp` `actionBtn` (h46/r14),
`community` `pollSubmitBtn`, `EmptyState` own `button` (h44/full). Five button
heights, four radii, three weights for the same semantic action. Same for cards:
`TodaysHelp`, `quick`, `methodCard`, `announcementCard`, `forumCard`, guard `card`,
society `summaryCard` each redefine bg+radius+border+padding (radii 12→24). The
"shared Card primitive" noted as deferred is the missing keystone.

**C2 — `fontWeight` mixed with named-weight font families = brand typeface silently
doesn't render.** Inter is loaded as discrete families (`Inter_700Bold`). Many styles
set `fontWeight:"700"`/"600" with **no `fontFamily`** → fall back to system font, not
Inter (e.g. `visitors` `inviteBtnText`, `invite` `title`/`label`/`methodLabel`/
`submitBtnText`, guard `visitor-list` `title`/`name`/`toggleText`, `PrimaryButton`
`text`, community "Open thread"). On Android `fontWeight` on `Inter_400Regular` is
also ignored. Net: a meaningful fraction of text is not in the brand typeface and
not at the intended weight. Invisible in code, glaring on device.

**C3 — Two dead design-token systems still ship in `constants/tokens.ts`.** Alongside
live `themes.ts`: `colors` (hardcoded dark purple `#6E56F7`/`#0D0D0D`, theme-blind),
`palette` (abandoned Raunak/Bougainvillea identity), `typography` (comment claims
"Plus Jakarta Sans"; app uses Inter; hardwires dark `colors.textPrimary`). Any screen
reaching for `colors`/`typography` renders the old palette and breaks theming.

**C4 — Silent failures in a security product (worst trust issue).** Empty catches on
dashboard pending-approvals (`dashboard.tsx:58`), subscriptions, and `TodaysHelp`
(`:54`). Failed pending-approvals → "0 people at the gate." Failed attendance → "No
help scheduled today" (indistinguishable from a real empty day). A network error
disguised as "all clear" is the worst failure mode for a trust/security product; the
dashboard has no error surface at all.

### HIGH

**H1 — Hardcoded leftover-identity colors that bypass the theme.** Society transaction
modal: Tailwind grays (`#9CA3AF`, `#D1D5DB`, `#94A3B8`, `toolbarColor:"#111827"`) —
won't recolor in dark. Community `AVATAR_BG`: six hardcoded light-mode pastels with
dark text → bright pills with dark text in dark mode. Dashboard `ON_HERO_DIM =
rgba(255,247,240,0.75)` + "warm glow" comment are terracotta-era leftovers on a
magenta accent. Society FAB `#fff`.

**H2 — Five different screen headers.** Dashboard (avatar bar, no title) · Visitors/
Society/Community (26px extrabold, pt26) · Guard (22px/700 + border on card) ·
Profile (gradient header + kicker) · Invite (22px/700 inline). No `ScreenHeader`
primitive.

**H3 — Touch targets below 44pt.** Invite chips (pv6 ≈ 28pt), guard Today/All toggle
(pv6), dashboard icon buttons (42pt). Seniors are a named user group.

**H4 — Token scales exist but are ignored.** `spacing`/`radii` defined then bypassed
with raw literals; font sizes ad-hoc with half-pixel values (15.5/14.5/13.5/12.5/
11.5); no shared type scale. Root cause of cross-screen inconsistency.

### MEDIUM

- **M1** Visitor approval routes to `/notifications`, not the Visitors tab — the
  headline flow is buried; resident never approves from Visitors.
- **M2** Three primary-action paradigms across sibling tabs (FAB / full-width button
  / labelled pill FAB).
- **M3** Empty states not unified — guard list & `TodaysHelp` hand-roll instead of
  `EmptyState`.
- **M4** Fabricated data shown as real — `extractFinanceRows` defaults missing
  category to "Society Dues"; 6–8-way key-guessing signals unstable contract.

### LOW
- "Ask AI" `sparkles` FAB = generic-AI motif; fixed offset can overlap content.
- Invite date pickers render raw `toLocaleString()` (unstyled).
- Greeting date via `.replace(",", " ·")` string-hacking (locale-fragile).
- `today()`/date params use local-ISO splitting (timezone edge cases).

---

## Already excellent (do NOT touch)
- `themes.ts` — dual-designed light/dark, semantic roles, gradient identity. The
  foundation everything else should conform to.
- Dashboard information hierarchy (greeting → pending → hero → quick actions).
- Attendance (`TodaysHelp`) — two-action, optimistic, tap-to-amend. The reference for
  how everything should feel.
- Invite consolidation; reanimated entrances; the segmented control.

---

## Phase 2 — Product opportunities
1. **Adopt, don't add.** Make existing primitives mandatory (one Button, Card,
   ScreenHeader, type scale). ~80% of the premium gap closes by deleting variation.
2. **Make the gate the spine of the resident app** — approval belongs in Visitors, one
   tap, live status.
3. **Trust signals at failure moments** — be honest about uncertainty, never render a
   confident "0" on error.
4. **One primary-action language** across tabs.
5. **One editorial voice** (serif display + Inter body, fixed sizes).
6. **Delight, sparingly** — one crafted success moment on gate-approval, after
   consistency is fixed.

---

## Phase 3 — Roadmap

| # | Work | Impact | Eng | Design | Priority |
|---|------|--------|-----|--------|----------|
| 1 | Typography fix (C2): purge `fontWeight`-without-family; fixed type scale | High | Med | Low | **P0** |
| 2 | Shared `Button`/`Card`/`ScreenHeader`; migrate screens (C1, H2) | High | Med–High | Med | **P0** |
| 3 | Honest error/empty states: dashboard, TodaysHelp, subs (C4) | High | Low–Med | Low | **P0** |
| 4 | Delete dead token systems; fix hardcoded hex (C3, H1) | Med | Med | Low | **P1** |
| 5 | Tokenize spacing/radii (H4) | Med | Med | Low | **P1** |
| 6 | Move approval into Visitors tab; unify FAB (M1, M2) | High | Med | Med | **P1** |
| 7 | 44pt touch-target pass (H3) | Med | Low | Low | **P2** |
| 8 | Theme the transaction modal (H1) | Low–Med | Low | Low | **P2** |

**Sequence:** P0 #1→#3 first (cheap, app-wide, low-risk), then #2 (systemizing),
then P1 IA/correctness. #6 is the only nav change — confirm UX benefit before doing it.

All P0 items preserve architecture, theme, branding, and navigation — they are
enforcement, not redesign.

---

## Implementation log

**P0 #1 — Typography weight fix (C2): DONE.** Purged every `fontWeight` from the
codebase (214 sites / 46 files). Weight is now expressed solely through the named
Inter families (`fonts.regular/medium/semibold/bold/extrabold`), so the brand
typeface actually renders at the intended weight on both platforms. Where a
`fontFamily` already coexisted (e.g. Newsreader titles), the redundant `fontWeight`
was dropped instead. `fonts` import added wherever needed. `tsc` clean (0 errors).
Remaining typography work (a single fixed type scale to replace ad-hoc half-pixel
sizes — H4) folds into P0 #2 (shared primitives).

**H1 — Broken/off-theme colors, pass 1: DONE.** Fixed the light-mode-only color
systems that broke in dark mode (the visible bugs): `Skeleton` (`#E2E8F0` → theme
`surfaceAlt`, affects every loading state), Community forum avatars (rainbow pastels
→ uniform branded `accentTint`), `CategoryBadge` (pastels → branded chip),
`PriorityBadge` + `TicketCard` dot (pastels → semantic `danger`/`warning`/`success`
tones), the society transaction modal (gray icons + `#111827` toolbar → theme
tokens), dashboard banner/FAB warm-cream secondary text (→ neutral white), TodaysHelp
"Mark Present" (`#FFFFFF` → `onAccent`). `tsc` clean. **Deferred (bigger, theme-blind
whole components):** `forum-thread` reply composer, `EmojiReactionBar`, `ImageGallery`,
and `VisitorApprovalModal` (the last may be an intentional dark "alarm" surface —
confirm before reskinning).
</content>
</invoke>
