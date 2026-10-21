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
