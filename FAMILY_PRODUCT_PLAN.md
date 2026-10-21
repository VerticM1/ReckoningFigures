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
