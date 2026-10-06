# Organization workspace

Preview: `/preview/organization/` alongside the learner app. This is an interactive, browser-local demo for buyer discovery and workflow review, not a live school system.

## Implemented
- Overview with class/date filters, weighted first-try accuracy, activity counts and practice rhythm.
- Class creation, sample roster additions and learner practice details.
- Assignments for existing available non-premium figures, due dates, recipient snapshots and completion details.
- CSV learner reports with explicit demo labeling and formula-safe escaping.
- Support guide, local support drafts and draft download. No support messages or student invitations are sent.
- Separate `rfOrganizationDemoV1` storage; resetting the demo never touches guest/account learner progress.
- Responsive layout, keyboard-accessible dialogs, visible empty states, unsupported storage feedback and versioned assets.

Reports are computed from fictional completed-session records. Repeats count as sessions. First-try accuracy is weighted by question count, not averaged percentages. “Check in” means accuracy below 70% for this reporting period; “No practice yet” means no completed sessions in the period. Neither is a mastery diagnosis. Assignment completion requires every assigned figure on or after the assigned date. Reporting periods use local calendar dates. Demo support drafts contain no delivery status beyond Draft.

## Connecting a real pilot
The existing Firebase client stores each user's private progress. It does not provide staff roles, tenant isolation, classroom membership, assignment delivery or detailed attempt events. Do not enable real roster entry by merely removing the demo banner.

1. Review the deployed Firestore rules and enabled authentication methods in `reckoningfigures-bbdae` before merging new access scopes. Existing broad rules must be checked.
2. Establish organization owners, teachers and learners with trusted membership provisioning. Clients must not grant themselves staff membership. Proposed scopes: `organizations/{orgId}/members/{uid}`, `classes/{classId}`, `assignments/{assignmentId}`, and pseudonymous completed-session records. Define who can read each class, not just the organization.
3. Capture per-question first-attempt results, hint use, lesson completion and active practice time using unique session IDs; prevent duplicate uploads. Existing aggregate XP/completions cannot reconstruct this history.
4. Implement and test server-enforced tenant/class access, invitation acceptance, revocation, assignment delivery and role changes. Test unauthorized reads/writes with at least two organizations and every role before live data.
5. Add roster lifecycle, retention/deletion, export authorization, staff audit events and privacy/accessibility review for the chosen pilot. Determine the required consent and school agreements before collection.
6. Choose a support destination and service expectations, then add authenticated request submission and staff triage. Draft downloads are not a support inbox.
7. Validate a complete pilot journey: teacher assigns → learner sees assignment → learner completes → teacher report updates. Measure learning separately with fresh questions, not XP.

No Firebase rules, invitations, billing, or live support service were deployed as part of this demo.

## Validation
`node preview/scripts/test-organization.mjs` covers aggregation, filters, empty states, class/assignment validation and CSV output. `npm run build` versions workspace styles, entry JS and its data-model import. Publish the preview directory to main to update the same URL; the redesign branch retains the native project and setup notes.

## Curriculum planning workspace
The Curriculum tab groups all existing figures into seven units, with suggested unit objectives and prerequisites. Teachers can search titles/question prompts, filter units, inspect original steps and reveal answer keys. Number-line teaching illustrations have text descriptions in the teacher preview. Optional learner coaching and animations are not reproduced. Figure 2's extra learner challenge is explicitly noted. Standards alignment is unverified; planning notes need educator review before a pilot. Missing figures have no preview or assignment action. Premium figures allow content review but cannot be assigned in this demo. Assigning a non-premium figure opens the existing assignment form with that figure selected and preserves class selection. No student delivery has been enabled.

Future course idea: pre-algebra as a separate course/path within the same branded app. Deferred until the Algebra 1 educator workflow is ready; no pre-algebra content or availability is promised by this release.
