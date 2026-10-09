# Reckoning Figures launch readiness

This is an implementation checklist, not a claim of school or App Store readiness.
The learner preview and connected school/class assignment path are implemented. The older educator demo and support drafts remain browser-local. The user confirmed student class-link enrollment works. Staff invitations are implemented and tested locally; production rules activation and a full separate-account assignment test remain pending.

## Current priority order
1. Activate the combined privacy/staff invitation rules and verify one teacher invitation with a separate account.
2. Verify private profile/progress access and optional friend requests with separate accounts. Migration is implemented and awaits production activation.
3. Verify teacher assignment → student completion → teacher report on separate devices, then address pilot operations and curriculum review.

## Before a real school pilot
- [ ] Review existing deployed Firebase rules and authentication configuration before extending access.
- [ ] Add trusted school membership and separate platform owner, school administrator, teacher and learner roles. Test school/class isolation and role revocation.
- [ ] Connect real rosters, assignment delivery, resumable learner sessions, and cross-device reports. Use assignment IDs, unique session IDs and server timestamps; verify retries do not duplicate completions.
- [ ] Add in-class practice and short independent checks with reviewed fresh questions. Separate assistance shown by the app from teacher-observed independent performance; do not label unexplained activity as cheating.
- [ ] Validate all curriculum content, answers, prerequisite order and lesson coverage with an educator. Resolve or explicitly exclude missing figures 020–024. Verify standards claims before publishing them.
- [ ] Define school licensing and course access: school ID, plan, licensed courses, student seat limit, assigned seats, term start/end, trial/active/expired status, renewal contact and billing reference. Decide how archived students and staff count. Enforce access on the server; never delete learning records merely because a license expires.
- [ ] Build a separate owner console for the app owner: school directory, authorized school/license management, seat usage, account troubleshooting, support inbox and ticket replies/status, and course draft/review/publish controls with rollback. Use strong owner authentication and audited privileged operations. Do not rely on a hidden URL or expose all student records by default.
- [ ] Replace local support drafts with authenticated tickets, confirmation of receipt, reply history, school association, triage status and a defined support contact. No support replies are currently sent by the app.
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
