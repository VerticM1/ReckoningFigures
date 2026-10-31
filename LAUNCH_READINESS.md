# Reckoning Figures launch readiness

## Current reconciliation — 30 October 2026

This section supersedes historical checklist statuses below. It is a technical readiness record, not legal certification or App Store approval.

### Completed functional acceptance
- [x] Live checkout, Premium activation, profile plan and Stripe billing portal — confirmed by Emmanuel on 29 October.
- [x] Signup, email verification and saved progress after returning — confirmed by Emmanuel on 30 October.
- [x] Parent linking and school assignment flow — Emmanuel reported both passed on 30 October.
- [x] Independent live guest lesson: Figure 001 completed; 140 XP, completion marker and streak persisted across reload.
- [x] Local validation: 46 backend tests, eight Firestore emulator permission suites, progress-sync/access-logistics/course-access suites and six age-boundary assertions passed.
Do not ask for new email accounts or repeat these tests without a regression. User confirmation is distinguished from independent production inspection.

### Safeguards follow-up — prepared 30 October 2026

- Refund decision: Emmanuel selected individual review, with no fixed refund window. Prepared purchase/cancellation/refund copy, checkout policy links and a profile-linked manual data-request page. Frontend files are prepared for a matching main-branch publication; verify deployment separately. A mailto link does not submit a request automatically.
- Backend fixes: refund PaymentIntent metadata is resolved before customer fallback; invoice subscription metadata is recognized; subscription pause and dispute closure events are handled. Dispute closure preserves the existing manual-review hold.
- Privacy inventory now includes hash-keyed family assignment/activity records through surviving links. Unknown/orphaned records still require manual reconciliation. Production deletion remains disabled; exports remain explicitly partial.
- Operating procedure: `ACCOUNT_DATA_OPERATIONS.md` covers intake, ownership verification, billing cancellation, shared-record review, write freeze, provider/backup handling and the existing pilot-end +90-day retention plan. A documented process is not a completed production rehearsal.
- Validation: 54 backend tests passed; isolated Auth/Firestore export/deletion rehearsal passed, including billing blockers and unrelated-account preservation; eight Firestore permission suites passed; sync/access-logistics/course-access and account-page/action tests passed. Stripe calls in unit tests are mocks except local SDK signature verification. Browser checks passed policy/data-request layouts at 320/390/1440 pixels, keyboard focus, privacy flows, student/staff invitation and verification flows, failed-acceptance retry, support drafts and retry handling. Updated stale staff-test selectors and included the current age screen; browser backends are mocked, not production.
- Live read-only inspection: one enabled Stripe webhook points to familyBillingWebhook, uses API 2026-09-30.endive and includes all handled event types. Recent matching event and unsuccessful-delivery queries returned no records. That is configuration evidence only, not successful delivery evidence.
- No customer was charged, refunded, canceled or deleted. No production Firebase credentials are available in this workspace; deployment, production retention/deletion rehearsal and live state verification remain open.

### Actual remaining decisions and evidence
- Purchase information: publish the prepared purchase/refund copy and verify it on the public checkout route. Individual refund review was selected by Emmanuel. Live billing success alone does not verify policy publication.
- School enrollment: preview/privacy.html still says school data-handling and retention arrangements are to be finalized. Confirm these arrangements for the specific pilot school and record the manual request-handling procedure. Local export/deletion tests are not a completed production operational rehearsal.
- Pilot operations: record cohort/teacher, selected educator-approved figures, devices, and recovery/rollback readiness. Existing support ownership is Emmanuel, weekday monitoring, target initial response within two business days. Do not ask him to reconfirm that decision.
- Existing evidence does not independently verify deployed rules, backup restoration or full device/accessibility acceptance. Keep these as unverified operational items, not failed functionality or new feature work.

### Can wait
iOS/TestFlight/App Store release, new courses, avatar cross-device improvements, extra themes and expanded marketing/design work are outside the first web pilot.

### Decision
Functional web walkthrough: complete. Unconditional paid/school launch sign-off: not established by the available records. Resolve purchase-policy consistency and school-specific operational arrangements; no additional functional test accounts are requested.


## Historical implementation checklist

Current logistics and go/no-go checklist: `PILOT_LOGISTICS.md` (2026-10-13). Email delivery, school entry/recovery and live operational checks are launch gates; do not interpret lesson availability as pilot approval.

This is an implementation checklist, not a claim of school or App Store readiness.
The learner preview and connected school/class assignment path are implemented. The older educator demo and its support drafts remain browser-local; connected school support is implemented separately. The user confirmed student class-link enrollment works. Staff invitations are implemented and tested locally; production rules activation and a full separate-account assignment test were subsequently confirmed by the user on 2026-10-09.

## Current priority order
1. Activate connected support rules and test a teacher request → owner reply → teacher follow-up. Define who checks the inbox and response expectations.
2. Review curriculum coverage and answer accuracy with an educator, including the newly written figures 020–024.
3. Complete accessibility, privacy/retention, and operational checks for a small supervised pilot.

## Before a real school pilot
- [ ] Review existing deployed Firebase rules and authentication configuration before extending access.
- [ ] Add trusted school membership and separate platform owner, school administrator, teacher and learner roles. Test school/class isolation and role revocation.
- [ ] Connect real rosters, assignment delivery, resumable learner sessions, and cross-device reports. Use assignment IDs, unique session IDs and server timestamps; verify retries do not duplicate completions.
- [ ] Add in-class practice and short independent checks with reviewed fresh questions. Separate assistance shown by the app from teacher-observed independent performance; do not label unexplained activity as cheating.
- [ ] Validate all curriculum content, answers, prerequisite order and lesson coverage with an educator. Review and approve the new figures 020–024 before full-course use. Verify standards claims before publishing them.
- [ ] Define school licensing and course access: school ID, plan, licensed courses, student seat limit, assigned seats, term start/end, trial/active/expired status, renewal contact and billing reference. Decide how archived students and staff count. Enforce access on the server; never delete learning records merely because a license expires.
- [ ] Build a separate owner console for the app owner: school directory, authorized school/license management, seat usage, account troubleshooting, support inbox and ticket replies/status, and course draft/review/publish controls with rollback. Use strong owner authentication and audited privileged operations. Do not rely on a hidden URL or expose all student records by default.
- [ ] Activate and production-test connected school support. Authenticated tickets, saved receipts, reply history, school association, and status are implemented. Define the owner inbox monitoring routine and response expectations before pilot use.
- [ ] Set up operational monitoring, backups, restore testing and incident handling. Keep personal/student information out of routine logs.
- [ ] Review privacy notices, school agreements, consent requirements, retention/deletion and export procedures with appropriate review for the intended learners and schools.
- [ ] Test keyboard/screen-reader access, contrast, reduced motion, sound controls and phone layouts. Keep help-seeking non-punitive.
- [ ] Run one small supervised pilot through assignment → student work → teacher result → support request. Fix blocking issues before accepting wider school use.

## Before paid school launch
- [ ] Finalize seat/term pricing, school purchase and renewal workflow, invoicing/payment handling, cancellation terms and who can change licenses.
- [ ] Provide teacher onboarding, curriculum documentation and a support process you can actually staff.
- [ ] Add a simple, replayable how-to widget with role-specific instructions: teachers create classes, assign units/figures and review results; school administrators manage members and seats and find support. Use short steps, contextual help, and the established custom icons/animation style without emojis. Clearly distinguish demo workflows from connected features.
- [ ] Automate Firebase rules releases after permission tests pass, using a securely authenticated deployment pipeline. One-time Firebase/Google Cloud authorization is required; automation is not connected yet. Keep versioned rules and a rollback procedure.
- [ ] Review pilot feedback and learning evidence separately from XP and engagement. Avoid unsupported efficacy claims.
- [ ] Verify premium course access uses school entitlements consistently in teacher assignment selection and learner delivery. Existing premium restrictions remain in the demo.

## Before iOS App Store release
- [ ] Add the promised haptics: correct/incorrect, 3/5/7 milestones, perfect lesson and daily streak, with a preference toggle; test on a physical iPhone.
- [ ] Build/sign the native app, test safe areas, audio, persistence, login, network failure and accessibility on devices; complete TestFlight testing.
- [ ] Prepare store assets, privacy disclosures, support information, reviewer access and any applicable account-deletion/purchase flows. Re-check current Apple requirements at submission time.
- [ ] Confirm native app and website receive the intended content/configuration updates without stale asset combinations.

## Implemented for review
- [x] Original Algebra 1 questions retained; branded learner UI, sounds, 3/5/7 celebrations, perfect lessons and electric-blue daily streak.
- [x] Educator demo: classes, curriculum previews, homework, reports and support drafts.
- [x] Homework demo uses actual learner renderer and returns assignment-specific completion/first-try/support data in the same browser.
- [x] Unit dropdown, select/clear available figures per unit, persistent selections across units, and Assign unit from Curriculum. Missing/premium content is excluded; exact lesson IDs are saved so future unit changes do not silently alter assignments.

## Later expansion
Pre-algebra as its own course/path; broader course library; optional integrations requested by pilot schools. These do not block the first Algebra 1 pilot.

## Recommended next implementation
- [x] Student registration label and placeholder simplified to “Name”.
Establish the secure school/account and licensing foundation, then connect one end-to-end real assignment flow. Build the owner's school/license controls against that same foundation. An additional local-only dashboard would not replace these services.

Owner foundation update: `/preview/owner/` now has Firebase-backed school/license record management and atomic administrative history, with locally tested owner registry rules. The user verified production owner activation and Spark Pilot School creation on 2026-10-07. School membership roles, atomic seat allocation and audit history are implemented and emulator-tested. On 2026-10-08 the user reported activating the updated membership rules; production multi-account verification is still pending. See `firebase/OWNER_SETUP.md`. Connected class assignments and first-completion reports are implemented under `/preview/school/classroom.html`, with generated available-lesson restrictions and permission tests. Additional classroom-rule publication and separate-device production verification remain pending. Billing, support delivery, premium entitlements and legacy profile/security migration remain incomplete.


Connected class update (2026-10-08): added a short replayable how-to panel for class managers and students. Broader administrator onboarding and the full role-specific help widget remain on the checklist. Existing lesson renderer, sounds, animations and milestone logic are reused. Interrupted figures restart; completed results save across devices after activation. Firebase deployment automation still requires authenticated setup and has not been enabled.


Student join and staff UX update (2026-10-08): student account registration and class-link admission are implemented with optional teacher approval, link expiry/revocation, automatic atomic seat allocation, and reuse of existing student seats. Teacher class creation no longer exposes UIDs; managers select a teacher by name. Staff screens now have a shared midnight/ivory design, compact class tabs, task dialogs, a direct owner-to-class shortcut, and inline setup guides. Staff invitation/registration, production enrollment verification, legacy security migration, and operational launch requirements remain pending. New join rules require console publication; this is a pilot feature, not a school launch.

Staff invitation update (2026-10-09): private, email-bound, seven-day teacher/administrator invitations; email verification, atomic membership/audit acceptance, issuer revalidation, revocation, and no student seat consumption. School managers generate and copy links; email delivery is not automatic. Only platform owners invite administrators. Production activation and a separate-account smoke test remain required. Next launch priority: migrate public legacy profiles and unrestricted social writes before real students.

Privacy migration (2026-10-09): personal profiles are owner-only; progress rules are included in the complete rules; legacy social records are quarantined without deletion. Social discovery is explicitly opt-in, shares only a username, disallows directory listing, and requires exact username lookup. New friendships require atomic recipient acceptance and participant-only reads/removal. The legacy Friends page redirects to the new flow. Production activation, separate-device checks, and social abuse controls remain pending. See `firebase/PRIVACY_MIGRATION.md`.

Production validation reported by user (2026-10-09): user confirmed completing the requested combined-rules activation and separate-account classroom test (teacher invitation, class/student enrollment, assignment completion, teacher result, one-seat check). This is user-reported confirmation, not an independent live inspection. Next implementation: connected school support requests and owner replies.

Connected support update (2026-10-09): school tickets, saved submission confirmation, owner inbox, immutable replies/status history, and resolve/reopen behavior implemented. Teachers see their own requests; administrators see their school; owners see all. Access is checked independently of license dates, but revoked staff lose access. Emulator and browser verification precede publication. Support production activation/test and a defined inbox monitoring routine remain pending; no email notifications are sent.


Curriculum audit (2026-10-09): technical review and verified corrections completed; see `CURRICULUM_AUDIT.md` and `/preview/curriculum.html`. 53 of 58 planned figures exist, only 18 are school-assignable, and 35 are premium. Figures 020–024, broader Algebra 1 coverage, school entitlements and educator approval remain open. Independent symbolic checks cover 192 keys; this is not exhaustive content certification. No assignment catalog or Firebase rules change was required.


Systems content update (2026-10-09): added figures 020–024 with 60 questions and eight coordinate graphs, specific correct/incorrect feedback, and 10 closing practice questions. All 58 planned figures now have source content; 40 remain premium and only 18 school-assignable. All 60 new keys and plotted lines passed independent checks. Educator review, broader coverage gaps and premium school entitlement work remain open. No Firebase activation is required for this content release.


Full-course school access prepared (2026-10-10): existing active/pilot Algebra 1 licenses cover all 58 figures. Teacher assignment selection, server-authorized student starts and exact-count result rules are implemented and tested, including offline denial, expiry, suspension, missing entitlement and enrollment revocation. Saved history remains readable to authorized members. Source is ready; production keeps the existing classroom UI until the updated rules are published. See `firebase/COURSE_ACCESS_RELEASE.md`. No per-student Premium flag or school-record migration is needed.


School access release (2026-10-11): the user reported publishing the complete full-course rules. Released the prepared classroom update for all 58 figures under existing active Algebra 1 licenses. Rules activation is user-reported; separate-account production verification is still pending.


Multi-step revision (2026-10-12): replaced figure 007’s repeated two-step items with nine reviewed practice items covering distribution, combining like terms, negative and fractional coefficients, variables on both sides, contradictions and identities. Worked examples, choice-specific explanations and two fresh closing questions are included. The scored count remains nine, so assignment scoring rules are unchanged. Existing saved completions are not regraded; assign figure 007 in a new assignment to collect fresh results. Educator approval and broader course gaps remain open. Run `npm run test:multistep` for independently derived key and distractor checks.

Live course-access validation (2026-10-12): the user confirmed assigning figure 020, completing it as a student, and seeing the teacher result. This is user-reported confirmation, not an independent inspection.

## Figures 059–060 — 2026-10-12

24 exponential-model and sequence questions are ready. Individual practice ships with existing Premium access; classroom assignments remain at 58 figures until the prepared Firebase rules are published and the classroom catalog gate is removed. See `firebase/MODELS_RELEASE.md` for verification and activation.

## Classroom activation — 2026-10-13

The owner reported publishing the updated Firebase rules. Figures 059–060 are now enabled in the classroom catalog; all 60 figures are selectable under an active Algebra 1 license. This records user-reported rules activation, not independent production Firebase inspection. The live student completion → teacher result check remains pending.

## Statistics unit — 2026-10-13

Figures 061–063 are available for individual Premium practice. The complete rules are prepared and emulator-tested for 63 figures; school assignment UI remains limited to 60 pending publication. See `firebase/STATISTICS_RELEASE.md`.

## Statistics classroom activation — 2026-10-13

The owner reported publishing the complete updated rules. The classroom catalog now includes all 63 figures. This is user-reported Firebase activation, not independent inspection of production rules. Live student completion and teacher-report verification remains pending.


## 22 October: homepage themes and assignment completion
- Added device-saved Original, Pink Fire, Spring, Summer, Autumn, Winter and automatic Northern Hemisphere seasonal homepage palettes.
- Parent assignments now show progress and a green Completed state; completed tasks remain visible only while the student has an active parent connection. Deploy updated school-mail functions to enable completed-task retention.
- Controlled pilot: confirm one live parent assignment through completion after deployment.
- Full paid family launch remains gated on billing and server-enforced entitlements, agreed pricing, child onboarding, and parent completion notifications. Educator review and privacy/accessibility/operations checks must be signed off before broad launch.
- Completion indicators apply to all learners: independent course paths show explicit green Completed labels and unit progress; school homework shows assignment progress and saved figure checks. Parent linkage is required only for parent-assigned tasks.

### Family billing/onboarding/update preparation
- Prepared 13+ student signup and optional completion emails/private activity feed; user must deploy new notification exports and test real receipt. Under-13 consent remains a gate.
- Staged Stripe checkout/webhook/portal and backend access source, disabled and unexported pending Stripe sandbox setup, approved prices and acceptance tests. Do not describe billing as live.
- See FAMILY_BILLING_SETUP.md for setup, cost assumptions and outstanding paid-launch gates including legacy/static-content access, resubscription and seat changes.
