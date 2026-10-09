# Owner and school membership setup

The owner foundation is active in production. On 2026-10-07 the user verified owner sign-in and a persisted Spark Pilot School with 25 seats and revision history. On 2026-10-08 the user reported activating the updated membership rules. Separate-account production membership checks remain pending; activation is user-reported, not independently verified.

The designated owner UID is `AqjkpegU4te08cEXR8d6WZAYGjC3`, with `platformOwners/{uid}.active` set to boolean true by the user. This identifier is not a credential. Clients cannot grant or revoke platform ownership. Revoke through trusted Firebase console/admin access.

## Activate school membership
1. Preserve a copy of currently deployed Firebase rules.
2. Open `/preview/owner/activate.html`. Its complete `access-rules.txt` combines the known user-supplied legacy rules with owner, membership, classroom and generated curriculum fragments. If production rules have changed, reconcile those changes before replacement. Do not paste a fragment as a complete rules file.
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
The educator workspace is still a separate browser-local demo. Connected pilot classes, assignments and first-completion reports now live under `/preview/school/classroom.html`; their rules require an additional publication. The original educator workspace stays a local demo. Invitations, school billing and support ticket delivery are not connected. Directory views load at most 200 schools, 500 members, and 30 latest audit events; pagination is needed before larger deployments.

Legacy public user reads and broad friendship writes are deliberately preserved to avoid breaking the existing app. They remain a launch blocker: use fictional test accounts only until migrated. Personal progress rules are not included in this update. No real learner data should be entered yet.

## Verification
`npm run test:owner` builds the exact downloadable rules and runs owner + membership tests on a local demo-project Firestore emulator, never production. Tests cover owner registration, role escalation, school isolation, immutable atomic audits, stale revisions, capacity, seat release/role changes, expired/paused licenses and revoked membership. Browser checks cover sign-in, role-specific UI, add/remove feedback, stale-edit errors and 320px layouts using mocked data. Real-project activation and separate-account checks remain manual.

`npm run build` rebuilds the Firebase bundle and versions all owner/school entry assets. Run tests before publishing the rules text. Do not publish only one of the interdependent rule fragments.


## Connected class pilot (2026-10-08)
Publish the complete refreshed activation rules after `npm run test:owner` passes. Membership activation reported earlier does not activate these new classroom paths.
1. Add existing fictional teacher and student accounts to Spark Pilot School using the owner membership page.
2. Open classes. A teacher creates their own class; an administrator/owner supplies an active school teacher's UID.
3. Enroll the student's UID and label in that class. This uses the existing school seat, not an additional seat.
4. Assign one figure using the unit picker, then share the class link.
5. On another device/browser, sign in as the enrolled student and open homework. Finish the figure and wait for its save confirmation/homework screen.
6. As the teacher, refresh and review results. Check first-try answers and support use. Repeat the lesson: its first completion must remain unchanged.
7. Remove enrollment or school membership and confirm the student cannot read or write new class work. Existing teacher reports retain results.

Local emulator tests cover these authorization boundaries and the production client's duplicate-save logic. Live production testing requires separate user-controlled accounts and remains pending. The teacher/student workflow does not create Auth users or send invitations. No production Firebase deployment is performed here.

Pilot limits: immutable classes/assignments, no teacher transfer, no unfinished-figure resume, no roster import or pagination. New class members can see prior assignments; removing and re-enrolling retains first results. Completed results have deterministic IDs and cannot be overwritten; summaries are client-reported practice, not server-graded assessments. Unavailable and premium lessons are excluded by generated server rules. Due dates allow late work. License expiry blocks new writes and leaves authorized history readable. Anonymous access and classmates' result reads are denied.

`npm run test:classroom-ui` exercises controls and a complete actual lesson in a DOM harness with mocked Firebase transport, including 3/5/7 milestone elements, completion celebration, and save failure/retry. This is not a visual browser/phone test. A browser binary was unavailable in this session; real phone layout and live-account checks remain pending.


## Student invitation release (2026-10-08)
The complete activation rules now include `join.rules.fragment`. Students use `/preview/school/join.html?invite=TOKEN` to register/sign in and join without copying UIDs. Teachers create random invitation links inside a class; the link can admit automatically or require approval, expire in 7/30 days or not expire, and be revoked/replaced. Class/school names are visible to link holders; invitation listing and other students' requests are denied.

New membership, immutable membership audit, seat increment, class enrollment and admitted request commit together. Existing active school students reuse their seat. Removed school memberships are never self-reactivated, and staff accounts cannot become students through a join link. The rules authorize enrollment through the validated request transition within the same transaction. Do not simplify that atomic relationship. Replacing a link invalidates pending requests on the old link; students must request again through the new link. Existing class access remains intact. A denied request cannot be replayed to gain access.

Staff invitations are not implemented: an owner/admin still adds existing staff UIDs in school membership management. Classroom creation uses a teacher-name dropdown for managers and the signed-in teacher for teachers. School/admin/educator pages share `workspace.css`; learner styles and celebrations are unchanged. A school setup guide and class quick guide are available inline.

Validation: emulator tests cover auto/approved enrollment, duplicate joins, reused seats, concurrent last-seat allocation, spoofed requests, staff-role escalation, removed memberships, expired/revoked links and existing owner/classroom rules. Real browser checks at desktop and mobile widths use mocked Firebase transport; actual account registration and production rule publication still need user-console verification. Continue using fictional accounts because the legacy public-profile/social rules still need migration before school launch.
