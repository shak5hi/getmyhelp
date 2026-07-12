# Google Play Data Safety Declaration
**App:** GetMyHelp Mobile (`com.getmyhelp.mobile`)
**Last updated:** July 2026

> Fill this in at **Play Console → App content → Data safety** before submitting for review.
> Every row below maps to a question in the Play Console wizard.

---

## 1. Does your app collect or share any of the required user data types?

**Yes.**

---

## 2. Is all of the user data collected by your app encrypted in transit?

**Yes** — all API traffic uses HTTPS.

---

## 3. Do you provide a way for users to request that their data is deleted?

**Yes** — add a "Delete my account" option in the profile screen (or reference the privacy policy email address). This is required by Play policy.

> IMPORTANT: Before submitting, ensure account-deletion is reachable from within the app or via a web form linked from the privacy policy.

---

## 4. Data types collected and their purposes

### Personal info

| Data type | Collected | Shared | Purpose | Required or optional |
|---|---|---|---|---|
| **Name** | Yes | No | App functionality (resident profile) | Required |
| **Phone number** | Yes | No | Authentication (OTP login) | Required |
| **Profile photo** | Yes | No | App functionality (resident & provider avatars) | Optional |

### Location

| Data type | Collected | Shared | Purpose | Required or optional |
|---|---|---|---|---|
| **Approximate location** | Yes | No | App functionality (finding nearby societies during onboarding) | Required for onboarding only |
| **Precise location** | Yes | No | App functionality (same as above; GPS used when coarse location is insufficient) | Required for onboarding only |

> Location is only used once during society selection. It is not tracked continuously or in the background.

### Photos and videos

| Data type | Collected | Shared | Purpose | Required or optional |
|---|---|---|---|---|
| **Photos** | Yes | No | App functionality (ticket attachments, visitor selfie capture by guard) | Optional |

### Files and docs

None collected.

### Audio

None recorded. RECORD_AUDIO permission is blocked in the release manifest.

### Contacts, Calendar, SMS, Call logs

None collected.

### App activity

| Data type | Collected | Shared | Purpose | Required or optional |
|---|---|---|---|---|
| **Crash logs** | Yes | Shared with Sentry | Analytics | Required |

### Device or other IDs

| Data type | Collected | Shared | Purpose | Required or optional |
|---|---|---|---|---|
| **Device or other IDs** (FCM token) | Yes | Shared with Firebase | App functionality (push notifications) | Required |

---

## 5. Data sharing with third parties

| Third party | Data shared | Purpose |
|---|---|---|
| **Firebase / Google** | Phone number (for OTP), FCM token | Authentication + push notifications |
| **Sentry** | Crash logs, device model, OS version | Crash reporting (no PII by default) |
| **Hostinger / your server** | All user-entered data | App backend |

---

## 6. Privacy policy URL

`https://admin.getmyhelp.in/privacy-policy`

CAUTION: This URL **must be live and publicly accessible** before submitting to Play Store.
A 404 or redirect-to-login will cause the app to be rejected.

---

## 7. Pre-submission checklist

- [x] TLS live on `api.getmyhelp.in`
- [ ] Privacy policy page live at `https://admin.getmyhelp.in/privacy-policy`
- [ ] In-app account-deletion flow implemented (or deep-link to web form in profile)
- [ ] Data Safety form filled in Play Console matching this document
- [ ] App reviewed with Play Console Pre-launch report (auto-run on upload)
- [ ] Store listing screenshots taken from a real device (not emulator)
- [ ] Content rating questionnaire completed (IARC)
- [ ] Short description (80 chars) and full description (4000 chars) written for Play listing
