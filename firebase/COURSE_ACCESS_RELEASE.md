# Full-course school access — 2026-10-10

## Release status
The user reported publishing the complete Firebase rules on 2026-10-11. The prepared classroom frontend is released with this update. This is user-reported rules activation, not an independent inspection of production Firebase. Automated permission/UI checks passed before release; the separate-account live check below remains pending.

The release includes the paths recorded in `firebase/course-access-release.json`, preserving unrelated production files. Existing Algebra 1 licenses are reused. No per-student Premium flag or school-record migration is needed.

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
