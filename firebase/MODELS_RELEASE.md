# Exponential models and sequences — 2026-10-12

Figures 059 and 060 add 24 scored questions. Both are in the Functions unit and retain individual Premium access. They include growth/decay factors, model interpretation, equal-interval comparisons, model limitations, arithmetic/geometric explicit and recursive rules, and discrete sequence domains.

## Activation

The frontend currently keeps classroom assignments limited to IDs 1–58. The prepared complete rules add IDs 59 and 60, each with 12 scored questions. Existing IDs and counts are unchanged.

1. Open `/preview/owner/activate.html`, copy the complete tested rules and publish in Firebase. Reconcile any custom production changes first.
2. Confirm publication. Then remove `&&l.id<=58` from `schoolLessonCatalog` in `preview/school/course-access.js`; update the licensed count and teacher/curriculum copy to 60. Rebuild cache versions and publish.
3. Assign 059 and 060 in a licensed test class. Complete them as an enrolled student and check teacher results.

No school, membership or license migration is needed. Existing assignments retain their saved results. Firebase deployment is not available through an authenticated CLI in this workspace; rules activation remains an owner action.

## Verification

- `npm run test:models`: 24 keys and formula/recursive fixtures; numerical candidate uniqueness, categorical key assertions, feedback shape and four fresh closing questions. These checks are not symbolic certification or educator approval.
- Course parity: 60 lessons, 665 imported steps (666 with the runtime challenge; 659 scored).
- Full Firebase emulator suite: all 60 IDs assignable, authorized and saveable with the prepared rules; cross-school, enrollment, license, unknown-ID and other permission regressions pass.
- DOM walkthrough of both new lessons under simulated activation: 3/5/7 celebrations, completion and retry after save failure pass. The deployed 58-figure classroom selector remains tested separately.

Next curriculum gap: statistics/data analysis. Educator review and jurisdiction-specific alignment remain open.
