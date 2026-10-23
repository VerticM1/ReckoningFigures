# Independent learning and Family Premium

Confirmed by owner, 21 October 2026:
- Independent learning alongside the existing school/admin offering; mobile first.
- Lifetime: one payment for permanent access to Pre-Algebra, Algebra 1, and every future course released. Future courses unlock when released, with no extra course purchase.
- Monthly: same course scope while subscription remains active.
- Ask “How many students will be learning?” Offer 1, 2, 3, or 4.
- One student is base price. Two have a family discount, three have a larger per-student discount, four have the lowest per-student price. Total prices, percentages and currency are not approved yet.
- Each student has separate progress. Parents can link accounts, track progress, assign figures/units, and choose completion updates by notification/email.
- School access continues independently; students should not need an individual purchase to access licensed school assignments.

First implementation: /preview/family/ is a clearly labeled plan preview. Accessible student-count and billing radio groups update a summary. Save selection stores only student count and billing preference on this device. No children’s data, payment, enrollment, entitlement, parent linking or notifications are created.

Next implementation stages:
1. Secure family membership and parent–student linking, with verified authorization. Membership cannot be established merely by entering a child’s email/UID. Determine age-appropriate onboarding and guardian consent before collecting child information.
2. Mobile parent dashboard backed by real scoped child progress and assignments. Keep school/private family assignments separate, with source labels. Define who can link/unlink and whether multiple guardians are supported.
3. Server-authoritative purchases and student seats, monthly expiry and lifetime access. Never rely on localStorage premium flags. Define student-seat reassignment, upgrading family size and subscription transitions before payment launch. Choose prices, payment processor and mobile store purchase integration separately.
4. Idempotent figure-completion notifications, user-controlled frequency and channels, secure notification preferences. No student details in lock-screen/email previews by default.
5. Real family acceptance test covering two children, authorization isolation, assignments, accurate progress and subscription access. Payment test environment before accepting money.

Pending decisions: actual prices and discounts; individual learner versus parent purchaser onboarding; seat reassignment rules; age/consent flow; notification defaults; mobile release channel. Do not infer these from the approved course coverage and seat-count model.

## Family linking release — 21 October 2026

Prepared `familyHub` callable and `/preview/family/dashboard.html` / `link.html`.
- Existing verified parent/student accounts, separate sign-ins. Parent account registration is available; this release does not create child accounts.
- Parent chooses a nickname and confirms guardian status, then receives a private 24-hour invitation. This attestation is not identity/guardianship verification or a replacement for age-appropriate consent.
- Student signs in and explicitly agrees to share existing and future synced independent-learning progress. Parent sees the requesting student's email and confirms before any progress is returned.
- One household per student in this first release; maximum four linked/pending slots per parent. A student disconnects before switching households. No premium entitlement or paid seat is created.
- Only sanitized completed Algebra 1 figure IDs (1–63), practice-day count, and last practice day are returned. No school reports, raw progress objects, passwords, email notification preferences, or fabricated accuracy.
- Both sides can disconnect. Removal preserves the student account and progress but stops future dashboard reads. Previously viewed information cannot be recalled.
- Hashed 256-bit invitation tokens; one-time atomic claim; concurrent claim rejection; expiration; parent confirmation; slot constraints. Student sees parent email before consent. Raw invitation exists only in the generated link and browser state, not stored in the database. Lost links must be removed and regenerated. Invitation creation is limited to one per parent per 10 seconds.
- Private server-only collections: familyHomes, familyStudents, familyLinks. Current client rules grant no access; no new broad Firestore rule is required. familyHub reads only the authenticated parent's home and students with matching active family membership. All calls require a live enabled, verified account.

Activation: deploy school-mail codebase (now also containing familyHub), then set `ENABLED=true` in `preview/family/dashboard.js` and publish it. The owner client bundle includes the callable wrapper but linking stays disabled until activation. The new family routes are also added to the account-email return-path allowlist.

Validation: 20 backend tests passed (7 family cases), plus family DOM flow and account action tests. Real authenticated parent/student linking and disconnection remain deployment acceptance tests. No real invitation was sent or account created during development. Assignments and notification delivery are separate next milestones. School pilot progress is independent of this family release.

### Activation — 21 October 2026
Owner confirmed familyHub deployment. Non-sending endpoint check returned the expected UNAUTHENTICATED response. Dashboard flag is enabled and both family entry pages use a fresh script version. Actual two-account linking, progress display and disconnection remain live acceptance checks; no student or family records were created by this activation.

## Parent assignments — prepared 21 October 2026

New `familyPractice` callable handles parent list/create/cancel and student list/start/complete. All operations require a live verified enabled account, active matching parent/student membership and the same family-link hash. Assignment data lives in private `familyWork/{linkHash}` documents; reconnecting creates a new scope and never reveals old assignments. No Firestore client access is granted.

Parents select a figure or complete unit and optional date. Status is Not started, In progress, Completed or Cancelled. Creation uses an idempotent request ID. Up to 20 unfinished assignments per link; when creating, retain the most recent 20 completed/cancelled records plus unfinished work. This is a recent-history view, not a permanent report archive. Current catalog is Algebra 1 only; Pre-Algebra is not built yet.

Student home includes no visible parent-assignment section unless the server confirms an active pairing AND at least one unfinished, uncancelled task. Guests, pending links, empty task lists and disconnected users see nothing. Section refreshes on focus and every 30 seconds while visible; network errors hide stale content. Starting and saving independently recheck linkage/cancellation/access. School homework takes its existing separate route and is unchanged.

Each assigned figure requires a new server-issued practice session and a fresh completion from the lesson flow. Historic completedLessons never satisfy a new task. Completion retries are idempotent. These are app-reported completions, not proof of unaided work or proctored scores. Failed completion saves show a retry message and do not claim assignment success. New practice still contributes to normal personal progress, which syncs through the existing account mechanism.

Premium is checked server-side using private `familyEntitlements/{studentUid}`: status active, courses containing algebra1, plus plan lifetime or monthly with a numeric future expiresAt in epoch milliseconds. No payment integration currently writes these documents. Do not trust the original localStorage Premium flag or manually grant access through the client. Until paid access is connected, the first two free units (figures 1–18) can be assigned; Premium selections are disabled. Entitlement loss also blocks in-flight completion. Parents cannot unlock Premium by assigning it.

Deploy using the existing school-mail command, which includes the new familyPractice export. Then set `FAMILY_ASSIGNMENTS_ENABLED=true` in `preview/family/assignment-config.js` and publish; no bundle rebuild is needed for that flag. Dashboard/home assets and both SDK bundles are prepared. Parent linking remains active during this staged rollout. No new secrets or rules needed.

Tests: 27 backend tests passed, including fresh reassignment, active-link isolation, unit progress, cancellation, disconnect/reconnect isolation, Premium checks, retries and stale sessions. Parent/student DOM tests cover conditional rendering, consent-preserving existing linking UI, unit selection, optional date, locked selections, errors/retry, cancellation, and account-bound saving. Real two-account assignment completion remains the post-deploy acceptance check. Completion emails/notifications are still not connected.

### Assignment activation — 22 October 2026
Owner confirmed deployment. familyPractice returned the expected UNAUTHENTICATED response to a non-mutating unauthenticated availability check. Assignment flag enabled and entry/module URLs refreshed to avoid stale disabled settings. No family records or assignments were created by activation. Live two-account assignment completion remains the acceptance check.

## Family release preparation — 22 October 2026
New 13+ student signup route, email verification return route, completion feed and optional branded emails are prepared. Under-13 signup is closed pending an appropriate consent process. Parent confirmation still precedes progress sharing. Notifications derive from synced completed figures and are deduplicated per confirmed family link, with no student details in email. Billing is staged and disabled pending Stripe setup and approved prices. See FAMILY_BILLING_SETUP.md for the proposed $10k monthly-profit model, deployment and remaining acceptance gates. Proposed prices are not approved or published.
