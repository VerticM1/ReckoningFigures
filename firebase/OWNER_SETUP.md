# Owner and school membership setup

The owner foundation is active in production. On 2026-10-07 the user verified owner sign-in and a persisted Spark Pilot School with 25 seats and revision history. Membership code and updated rules are the next activation; do not assume rules are deployed just because the website is updated.

The designated owner UID is `AqjkpegU4te08cEXR8d6WZAYGjC3`, with `platformOwners/{uid}.active` set to boolean true by the user. This identifier is not a credential. Clients cannot grant or revoke platform ownership. Revoke through trusted Firebase console/admin access.

## Activate school membership
1. Preserve a copy of currently deployed Firebase rules.
2. Open `/preview/owner/activate.html`. Its complete `access-rules.txt` combines the known user-supplied legacy rules with **both** owner and membership fragments. If production rules have changed, reconcile those changes before replacement. Do not paste a fragment as a complete rules file.
3. Copy complete rules into Firestore → Rules and Publish. No Firebase production deployment is performed by the website or coding tools.
4. Owner workspace → Spark Pilot School → Manage members. Add existing test-account UIDs copied from Firebase Authentication; use fictional labels. The form does not create Auth accounts, verify their existence, or send invitations. Confirm identifiers carefully.
5. Appoint a school administrator. In separate sessions, test an administrator adding a teacher and student; teacher/student see only their own access page. An unassigned account sees access needed. Removed members lose school access. Never share passwords in chat.
6. Confirm one active student occupies one seat, removal releases it, and the updated count persists after refresh. Audit history is retained.

## Permission model
- Platform owner: school/license directory and edits, all membership roles, administrative audit.
- School administrator: own-school roster, seat usage and membership audit; may manage teachers/students, not administrator roles or their own membership. No school license edits.
- Teacher/student: own membership and their school's license/name; no roster, other memberships, license changes or audit access.
- Anonymous/unassigned: no school access. Profile fields and client claims do not grant roles.
- New active memberships require a pilot/active license within its UTC term (end exclusive). Expired/paused licenses still allow removal and manager access for administration. Course entitlement enforcement is not yet connected.
- Active students count toward seats; teachers/admins do not. Member changes, audit and seat delta commit atomically. Revisions reject stale edits. Seat count cannot exceed licensed capacity. Lowering a license below occupied seats is rejected.
- Memberships and audit entries cannot be deleted by clients; membership state `removed` preserves history. Privileged console/admin access can bypass rules and must be handled carefully.

## Boundaries
The educator workspace is still a separate browser-local demo. Real classes, assignments, reports, invitations, school billing and support ticket delivery are not connected. The membership page explicitly states this. Directory views load at most 200 schools, 500 members, and 30 latest audit events; pagination is needed before larger deployments.

Legacy public user reads and broad friendship writes are deliberately preserved to avoid breaking the existing app. They remain a launch blocker: use fictional test accounts only until migrated. Personal progress rules are not included in this update. No real learner data should be entered yet.

## Verification
`npm run test:owner` builds the exact downloadable rules and runs owner + membership tests on a local demo-project Firestore emulator, never production. Tests cover owner registration, role escalation, school isolation, immutable atomic audits, stale revisions, capacity, seat release/role changes, expired/paused licenses and revoked membership. Browser checks cover sign-in, role-specific UI, add/remove feedback, stale-edit errors and 320px layouts using mocked data. Real-project activation and separate-account checks remain manual.

`npm run build` rebuilds the Firebase bundle and versions all owner/school entry assets. Run tests before publishing the rules text. Do not publish only one of the interdependent rule fragments.
