<div align="center">

# GetMyHelp

**A gated-community app for residents and security guards: home-help attendance, visitor approvals at the gate, society notices, and support tickets.**

[![Expo](https://img.shields.io/badge/Expo-54-000020?style=flat-square&logo=expo)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61dafb?style=flat-square&logo=react)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Auth_%7C_FCM-ffca28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com)
[![CI](https://img.shields.io/github/actions/workflow/status/shak5hi/getmyhelp/ci.yml?branch=main&style=flat-square&label=CI)](.github/workflows/ci.yml)

</div>

---

## Overview

In a gated society, a lot runs on paper registers and WhatsApp groups: who let the
plumber in, whether the maid came today, which guest is expected at 7 pm. GetMyHelp
replaces that with one mobile app that has **two role-based experiences**:

| Resident | Guard |
|---|---|
| Track daily attendance of home help (maids, cooks, drivers) | Log walk-in visitors with a photo |
| Approve or deny visitors at the gate in real time | Scan QR invites and verify OTP invites |
| Pre-invite guests with a QR code or OTP | Mark visitor exits |
| Society notices, forum, polls and finances | Today's visitor list |
| Raise and track support tickets with attachments | |
| Ask-AI assistant, subscriptions, English / हिन्दी | |

Both apps talk to a shared **FastAPI + WebSocket** backend that also serves the admin
web console. Those live in separate repositories.

## Highlights

- **Real-time gate approvals.** Five WebSocket hooks (visitors, notifications,
  announcements, forum, posts) update screens as events happen. An incoming visitor
  triggers a doorbell sound and an approval modal on the resident's phone.
- **Phone OTP sign-in** with Firebase Auth. The Firebase token is exchanged for a
  backend JWT, which is stored in `expo-secure-store`. Android OTP auto-verify is
  handled.
- **Location-based onboarding.** GPS detects which society the user is in, with a
  manual society → tower → flat picker as a fallback.
- **Per-society feature switches.** One declarative registry (`src/featureRegistry.ts`)
  maps backend modules to tabs, routes and quick actions. A society that turns off
  `visitors` loses those screens and their deep links, with no `if` checks scattered
  through the code.
- **Push notifications** through FCM and Notifee, including background handling and
  Android notification channels set up by Expo config plugins.
- **Production setup.** Sentry crash reporting, an error boundary, an offline banner,
  a force-update gate, OTA updates via `expo-updates`, and EAS build profiles with
  auto-incremented version codes.
- **CI on every push.** GitHub Actions runs `tsc --noEmit`, ESLint and Jest on every
  branch. A second workflow handles EAS builds.
- **English and Hindi (हिन्दी)** throughout, with light and dark themes.

## Tech stack

| Area | Tools |
|---|---|
| App | React Native 0.81, React 19, Expo SDK 54, Expo Router 6 (file-based routing), TypeScript |
| UI | Reanimated 4, Gesture Handler, custom design tokens, light/dark theming, Inter & Plus Jakarta Sans |
| Auth & push | Firebase Auth (phone OTP), Firebase Cloud Messaging, Notifee, Expo SecureStore |
| Realtime | WebSockets (5 domain-specific hooks) |
| Device | expo-camera (QR + photos), expo-location, image-picker, view-shot, sharing, haptics, audio |
| Quality | Jest + React Native Testing Library, ESLint, `tsc` in CI, Sentry |
| Delivery | EAS Build, EAS Update (OTA), GitHub Actions |

## Project structure

```
app/                    Expo Router screens
├── (tabs)/             Resident tabs: dashboard, visitors, society, community, chatbot, profile
├── (guard-tabs)/       Guard tabs: visitor list, new visitor, QR scanner, OTP verify
├── visitor/            Invites (QR / OTP), approvals, history
├── society/            Tickets and finance
├── community/          Announcements, forum threads, posts
└── phone / otp / location / tower …   Onboarding flow
components/             Shared UI (ui/, community/, society/, visitor/)
hooks/                  WebSocket + push notification hooks
src/
├── api/                Typed API client per domain + secure token store
├── featureRegistry.ts  Module → tab / route / quick-action mapping
├── i18n.ts             English / Hindi strings
└── sentry.ts, push.ts, config.ts …
plugins/                Expo config plugins (Notifee repo, default notification channel)
docs/                   Product spec, production-readiness audit and plan, data-safety notes
__tests__/              Jest tests
```

## Getting started

**Prerequisites:** Node 20+, an Android device or emulator, and a Firebase project
with Phone Auth turned on.

```bash
git clone https://github.com/shak5hi/getmyhelp.git
cd getmyhelp
npm install --legacy-peer-deps

# Put your Firebase google-services.json in the project root (it is not committed).
npx expo run:android        # builds a dev client; Expo Go doesn't support native Firebase
```

The API endpoints are set in `src/config.ts`: `dev` points at a local FastAPI server,
while `staging` and `prod` point at the deployed API.

```bash
npm test          # Jest
npm run lint      # ESLint
npx tsc --noEmit  # Typecheck
```

## My contributions

I started the app and built the resident flow end to end:

- Project setup and the base Expo Router architecture
- Onboarding: the phone number and OTP screens (including resend), GPS-based society
  detection and the manual society / tower / flat picker
- Multilingual support (English + Hindi) in onboarding and the main screens
- The resident dashboard, the subscriptions flow, and the profile and settings pages

Later work (the community and finance modules, push notifications, the redesign and
the production hardening) was built together with
[Priya Sharma](https://github.com/saltypriya).

## Docs

- [`docs/PROJECT_AND_MVP.md`](docs/PROJECT_AND_MVP.md): the full product and system overview
- [`docs/PRODUCTION_READINESS_AUDIT.md`](docs/PRODUCTION_READINESS_AUDIT.md) and [`PLAN`](docs/PRODUCTION_READINESS_PLAN.md)
- [`docs/DATA_SAFETY.md`](docs/DATA_SAFETY.md): Play Store data-safety declarations
