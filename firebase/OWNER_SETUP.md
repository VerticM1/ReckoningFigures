# Owner workspace activation

Status: built and locally tested, not activated in production. Public page `/preview/owner/` has a sign-in gate. Security comes from Firestore rules, not its URL or the page's JavaScript.

The user designated Firebase Authentication UID `AqjkpegU4te08cEXR8d6WZAYGjC3` as the owner. This is an identifier, not a credential. It is not embedded as an automatic grant in application code.

## Activate with the project administrator
1. In Firebase console for `reckoningfigures-bbdae`, Firestore → Data, create collection `platformOwners`.
2. Use document ID `AqjkpegU4te08cEXR8d6WZAYGjC3` exactly. Add field `active`, type **boolean**, value **true**. Do not store passwords or private keys.
3. Preserve a copy of the currently published rules. Add the contents of `owner.rules.fragment` **inside** `match /databases/{database}/documents`, alongside the existing collection matches. It is a fragment, not a complete replacement. Review the merged text before publishing. The user-supplied existing rules have no wildcard that overlaps these owner/school paths.
4. The fragment does not change legacy users/friendships rules or enable teacher/student access. Existing public profile reads and broad social writes remain launch blockers, to be migrated before real student data. Do not add blanket recursive allow rules.
5. Visit `/preview/owner/`, sign in using the designated app account. If Google sign-in reports an unauthorized domain, review Firebase Authentication's authorized domains for `verticm1.github.io` before testing again.
6. Create a fictional pilot school, refresh, and confirm the record and history remain. Change the seat limit and confirm another revision is added. A different app account must see access denied.
7. To revoke owner access, set that registry document's `active` to false through the trusted console. Browser clients cannot create or edit owner grants, including an existing owner.

No production rule publication, owner grant, school creation, payments, invitation or support reply has been performed by this implementation.

## What is connected after activation
Owner sign-in (email/password and Google), school directory (first 200 ordered by name), school/recorded license edits and latest 30 administrative events use Firebase directly. Dates are UTC with an exclusive end date. Stale edits are rejected using revisions. Record and history changes commit together; audit entries cannot be changed by browser clients. Archive keeps records rather than deleting them. Project administrators can still change data using privileged console/server access.

License records contain plan, capacity, start/end, and Algebra 1 course identifier. They do not yet enforce learner entitlement, track occupied seats, bill schools, send invitations, or deliver assignments. Support and curriculum management remain future integrations. No real learner records should be entered here.

## Test and build
- `npm run test:owner` runs an isolated demo-project Firestore emulator, never production. Firebase CLI 13.35.1 is pinned for this workspace's Java 17 emulator compatibility; test tooling is development-only.
- Tests cover anonymous, student, school-admin and revoked-owner denial; profile role spoofing; forbidden self-promotion; schools A/B; invalid seats, dates and courses; immutable atomic history; stale revision checks; and revocation.
- `npm run build` builds/version-tags the owner Firebase bundle and owner page assets.
- Before a real pilot: migrate legacy social/profile rules; add school-specific memberships and server-enforced license/seat workflows; establish stronger owner authentication and operational review.
