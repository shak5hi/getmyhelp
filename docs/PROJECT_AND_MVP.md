# GetMyHelp — Project & MVP Overview

> A society-living platform spanning **three surfaces**: a resident mobile app, a gate-guard
> mobile app, and an admin/management web console — all on one FastAPI + WebSocket backend.
> Last updated: 2026-06-26.

---

## 1. What GetMyHelp is

GetMyHelp digitizes daily life in a managed/gated residential society and the operations
that run it:

- **Resident app (mobile)** — track daily home-help attendance, approve people at the gate,
  pre-invite guests, follow society notices/finances, raise support tickets, manage a plan.
- **Guard app (mobile)** — log walk-in visitors with a photo, scan QR / verify OTP invites,
  mark exits, see today's visitor list.
- **Admin console (web)** — society & tower setup, residents/staff/service-providers,
  attendance, finance, tickets, community (announcements/forum/polls), subscriptions,
  visitor oversight, reports, and role-based admin management.

The three share one backend (`http://31.97.239.190:9001`, REST + WebSocket) and a file/media
host (`https://admin.getmyhelp.in`).

---

## 2. System architecture

```
┌─────────────────┐   ┌─────────────────┐   ┌────────────────────────┐
│ Resident app    │   │ Guard app       │   │ Admin console (web)    │
│ Expo / RN       │   │ Expo / RN       │   │ React + Vite + MUI     │
└────────┬────────┘   └────────┬────────┘   └───────────┬────────────┘
         │                     │                         │
         └─────────────────────┴───────────┬─────────────┘
                                            │ REST + WebSocket
                               ┌────────────▼────────────┐
                               │ FastAPI backend (Python) │
                               │ SQLAlchemy + Alembic     │
                               │ JWT auth, RBAC, WS hubs   │
                               └────────────┬────────────┘
                                            │
                               ┌────────────▼────────────┐
                               │ Postgres + uploads/media │
                               └─────────────────────────┘
```

Deployment: Docker Compose + nginx on a VPS (see `getmyhelp-admin/DEPLOYMENT_GUIDE.md`).

---

## 3. Tech stack

| | Resident & Guard apps | Admin console | Backend |
|---|---|---|---|
| Core | React Native 0.81 / React 19 / Expo ~54 / Expo Router ~6 | React 19 / Vite 5 / React Router 7 | FastAPI (Python) |
| UI | Reanimated, vector-icons, Newsreader + Inter, full light/dark theming | MUI 7 + React-Bootstrap, lucide-react, Recharts charts, TipTap rich-text | — |
| Auth | Phone + Firebase OTP → token exchange | Email + password → JWT | JWT, RBAC, OTP storage |
| Data | Context + AsyncStorage (no query cache) | Axios + context | SQLAlchemy ORM, Alembic migrations |
| Realtime | 5 WebSocket hooks | Notification WS | WS hubs: notification, announcement, forum, visitor |
| Media | expo-camera, image-picker, view-shot, sharing | file uploads | `/uploads` + media host |

---

## 4. Roles & access model

**App roles (mobile):** `resident` and `guard` — decided at login, stored in AsyncStorage.

**Admin roles (web, RBAC enforced front + back):**

| Role | Default landing | Scope |
|---|---|---|
| **Super Admin** | `/dashboard` | Everything except society-local community/visitors (dashboard, providers, customers, residents, staff, societies, subscriptions, finance, tickets, admins, reports, settings) |
| **Society Admin** | `/residents` | Residents, tickets, staff + attendance, announcements, forum, polls, visitors, settings |
| **Society Accountant** | `/finance` | Finance (full CRUD), settings |
| **Board of Members (BOM)** | `/finance` | Finance (view-only), announcements, forum, polls, reports, settings |

Permissions are page-level **and** action-level (`view/create/edit/delete/manage`), merged
from DB-stored grants + role defaults (`AuthContext.jsx` / backend RBAC).

---

## 5. Feature sets

### 5.1 Resident app (mobile)

| Domain | Capability | Backend |
|---|---|---|
| Auth | Phone + Firebase OTP, token exchange | `/customer/firebase-verify` |
| Onboarding | Language pick → location → society-detected → tower; manual fallback; pre-registered residents skip | REST |
| **Home help (core)** | Today's scheduled providers; mark present/absent/late + selfie proof; monthly attendance history | `/customer/providers/*` |
| Visitors | Approve/reject (push + in-app modal); history; **unified QR/OTP invite** flow; active-invite list + revoke | `/customer/visitors/*` |
| Society — Finances | Read-only income/expense ledger | `/customer/society/finance` |
| Society — Support | Create/view/comment on tickets | `/customer/tickets` |
| Community | Announcements (search, read state, emoji reactions); forum (posts/replies/images/edit/report/reactions); polls (single + multi) | `/customer/announcements`, `/customer/forum/*`, `/customer/polls` |
| Subscriptions | View active, browse plans, subscribe, request cancellation | `/customer/subscriptions*` |
| Notifications | Unread count, list, mark read / read-all, realtime | `/customer/notifications` + WS |
| Chatbot | Session-based assistant, option-button replies, history, reset | `/chatbot/sessions` |
| Account | Identity, plan, real prefs (theme, persisted push toggle, language), Help & Support, logout | partial |
| i18n | English / Hindi, full string tables, in-app picker | local |

**Core flows:** *daily attendance* (Home roster → Present/Absent/Late → optional selfie →
inline confirm), *gate approval* (guard logs visitor → push + WS → approval modal → result
back to guard over WS), *invite a guest* (one flow, QR-vs-OTP chosen inside; active list w/
revoke), *guard entry* covered below.

### 5.2 Guard app (mobile)

| Capability | Backend |
|---|---|
| New visitor entry with photo | `/guard/visitors` (multipart) |
| Scan resident QR invite | `/guard/visitors/scan-qr` |
| Verify OTP invite | `/guard/visitors/verify-otp` |
| Mark visitor exit | `/guard/visitors/{id}/exit` |
| Today / all visitor list + pending; live updates | `/guard/visitors*` + visitor WS |
| Profile / logout | — |

### 5.3 Admin console (web)

| Module | What it does |
|---|---|
| **Dashboard** | KPIs + charts (Recharts), super-admin overview |
| **Service Providers** | Maid/cook/etc. profiles, documents, skills, working hours, time-off, service areas, availability; **Maid Attendance** view |
| **Customers** | Customer list + profile, subscription detail per customer |
| **Residents** | List, create/edit, detail, **bulk upload** (+ upload history), family members / vehicles / pets |
| **Staff & Attendance** | Society staff CRUD; **Attendance Dashboard** + **Attendance Kiosk** (Face / QR / PIN clock-in via `StaffFaceData`/`StaffQRCode`/`StaffPIN`) |
| **Societies** | Society CRUD, configuration, **tower profiles**, flat types, localities/cities, base & service pricing |
| **Subscriptions** | Plans, service mappings, pricing; customer subscriptions; **invoices, payments, renewals, plan changes, audit logs**; analytics |
| **Finance** | Income/expense transactions with categories/subcategories, attachments, audit trail; society documents; transaction detail |
| **Tickets** | Ticket queue with categories, comments, activity timeline, attachments; status management |
| **Community** | Announcements (rich-text via TipTap, images, reactions, read tracking, edit history), Community Forum (posts/replies, reports/moderation), Polls (single/multi, options, votes) |
| **Reports** | Income/Expense, Staff Attendance, Residents — exportable views |
| **Entry (Visitors)** | Admin visitor oversight: logs, approvals, pre-approved list, blacklist, config |
| **Admins** | Create/manage admin accounts, assign roles & page/action permissions |
| **Settings / Admin Profile** | Account + society-level settings |
| **Notifications** | Realtime dropdown + toast (WebSocket) |

---

## 6. Backend (FastAPI)

**Router groups** (`main.py`): admin, customer, chatbot, expense, ticket, society-document,
staff, attendance, announcement (admin + customer + WS), forum (admin + customer + WS), poll
(admin + customer), notification (admin + customer + WS), visitor (guard + resident + admin +
WS), subscription, provider-attendance (customer + admin).

**Domain model (≈70 tables, `models.py`)** — selected entities:

- **People:** `Admin`, `Customer`, `Resident` (+ `FamilyMember`, `Vehicle`, `Pet`), `Staff`,
  `ServiceProvider` (+ documents, skills, working hours, time-off, availability, service areas).
- **Org/geo:** `Society`, `SocietyConfiguration`, `Tower`, `FlatType`, `Cities`, `Locality`,
  `BasePricing`, `Service`, `ServicePricing`.
- **Assignments/attendance:** `CustomerProviderMapping`, `CustomerProviderAssignment`,
  `Booking`, `ProviderAttendance`, `StaffAttendance` (+ `StaffFaceData`/`StaffQRCode`/`StaffPIN`).
- **Subscriptions:** `SubscriptionPlan` (+ service/pricing mappings), `CustomerSubscription`,
  `SubscriptionInvoice`, `SubscriptionPayment`, `SubscriptionRenewal`, `SubscriptionPlanChange`,
  `SubscriptionAuditLog`.
- **Finance:** `Transaction` (+ categories/subcategories, attachments, audit logs),
  `SocietyDocument`.
- **Support:** `Ticket` (+ categories, comments, activity, attachments).
- **Community:** `Announcement` (+ images, reactions, reads, edit history), `ForumPost`
  (+ images, replies, reactions, reports, notifications), `Poll` (+ options, votes).
- **Visitors:** `Visitor`, `VisitorApproval`, `VisitorLog`, `VisitorOTP`, `PreapprovedVisitor`,
  `VisitorBlacklist`, `VisitorConfig`.
- **Chat/audit:** `ChatSession`, `ChatMessage`, `Notification`, `AuditLog`.

**Realtime:** WebSocket hubs for notifications, announcements, forum, and visitor approval —
mobile apps subscribe via role-gated socket hooks; admin console gets a notification socket.

---

## 7. MVP scope

Everything in §5 is **built and working** end-to-end. The MVP spine is:

1. **Home-help attendance** (the differentiated daily job) — resident marks, admin/society sees.
2. **Gate security** — guard logs/scans/verifies; resident approves in realtime; admin oversees.
3. **Guest invites** — resident pre-clears (QR/OTP); guard redeems at the gate.
4. **Society operations** — finance ledger, tickets, announcements/forum/polls, residents/staff,
   subscriptions — all administered from the web console with RBAC.

---

## 8. Status & roadmap (mobile app)

**Shipped (Phases 1–4, on `main`):** dead-code/debug cleanup; full design-system unification
+ light/dark; central API client + 401 auth guard; UX re-centering (Home on attendance + gate
approvals, unified invite, Society money-vs-issues split, Settings→Account with real prefs);
visual polish (gh-logo violet/magenta recolor, button variants, `StatusPill` everywhere).
See `docs/PRODUCT_REDESIGN_REVIEW.md`.

**Phase 5 — Future (not started):** attendance reminder push · HTTPS for the API · onboarding
polish · offline/query cache (React Query) · skeletons everywhere + full a11y pass.

**Non-blocking follow-ups:** migrate ~18 inline-`fetch` screens onto the central client;
per-endpoint response typing; delete orphan `visitor/qr-invite-list` & `otp-invite-list` routes.

---

## 9. Known constraints

- API transport is `http://` (HTTPS pending — Phase 5).
- Backend contract is unversioned; some mobile screens defensively probe multiple response shapes.
- Mobile apps have no data cache — screens refetch on mount.
