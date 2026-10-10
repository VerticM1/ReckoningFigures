# Full-course school access — 2026-10-10

## Release status
Implementation and tests are complete on `redesign/mobile-preview`. Production rules activation is pending: the Firebase CLI has no authorized account in this environment. The activation page and complete rules file are published first. Keep the existing classroom frontend on `main` until the user confirms publishing those rules, then publish the prepared frontend changes. No additional user approval is needed for that release.

Open `/preview/owner/activate.html`, copy the complete rules into the existing Firebase project’s Firestore Rules editor, and Publish. The prepared file is `/preview/owner/access-rules.txt`. Back up current rules first and reconcile any user-added rules. The generated complete file retains privacy, progress, membership, enrollment, invitations, support and owner rules.

After the user reports activation, fetch both branches and compare them. Publish the paths in `firebase/course-access-release.json` from the prepared source branch to `main`, preserving unrelated changes. Update this release status and curriculum review wording when done. Verify deployment and the actual live asset hashes. Then ask the user to verify one premium assignment with separate teacher and student accounts; do not claim independently verified production Firebase behavior.

## Behavior
- Existing `license.courses` containing `algebra1`, school status `pilot` or `active`, and an in-term license grant full school-course eligibility. All 58 shipped lessons are in the generated assignment/scoring catalog. No membership or license migration is necessary.
- The original date semantics remain: start inclusive and end exclusive, stored in UTC. Paused, archived, expired, not-yet-started and missing-course licenses cannot create assignments, authorize new starts or write new results.
- Only a class manager can assign. Only an active student member enrolled in the same class can start an assigned figure or save its result. Memberships still control allocated seats.
- The learner makes a fresh server read of `schools/{s}/classes/{c}/assignments/{a}/practice/{lesson}` before starting. This is a read-only authorization probe, not a stored document; a successful missing-document response means rules allowed the request. It is never read from local cache, and all writes/listing are denied. There is no fallback after a denial.
- Saved assignments and results remain readable under the existing role/enrollment rules when a license pauses. Revoked members lose access. Current lesson content cannot be recalled from a browser, but new starts and writes are checked again.
- Individual Premium flags and the browser-local educator demo retain their previous behavior. School assignment access does not require a personal Premium purchase.
- The static site already bundles the lesson data publicly. These controls authorize the connected school workflow and data, not confidential content delivery or DRM. Private asset delivery would require a different hosting architecture.

## Validation
`npm run test:owner` includes the full permission suite and a new course-access suite: all 58 figures can be assigned, server-authorized and saved with exact scored counts; non-assigned/unknown figures, other classes/schools, anonymous/unenrolled users, revoked members, invalid license states and missing course entitlements are denied. An additional offline test rejects a cached start.

`npm run test:course-access` checks license boundaries and the catalog. `npm run test:classroom-ui` checks all-unit selection, server-denied starts, a premium completion without a personal Premium flag, saved-result retries and existing celebrations. The production build passes.

## Live check after activation and frontend release
1. In a licensed school, assign Systems of Equations, including figure 020.
2. In a separate enrolled student session, complete 020 and review the result as its teacher.
3. In a test school, pause the license; new practice should be blocked but permitted history remains readable. Restore it afterward.
4. Verify an existing first-unit assignment still works.
