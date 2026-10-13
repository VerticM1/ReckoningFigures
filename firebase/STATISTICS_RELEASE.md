# Statistics and data analysis — 2026-10-13

Figures 061–063 form Unit 8, with nine scored questions each. They cover distributions and summaries, scatterplots and fitted lines, and association/statistical claims. Individual Premium access is preserved. School assignments now include all 63 figures following owner-reported rules publication.

## Original activation procedure (completed)
1. Open `/preview/owner/activate.html`. Publish its complete tested rules in Firebase, reconciling any custom changes first.
2. Confirm publication. Remove `&&l.id<=60` from `schoolLessonCatalog` in `preview/school/course-access.js`. Update classroom catalog tests, licensed figure counts, owner and curriculum copy to 63; rebuild and publish.
3. In a licensed class, assign the new unit. Complete one new figure as an enrolled student and check the teacher report.

Existing lesson IDs, question counts, assignments and saved results are unchanged. There is no school, student or license migration. Production rules publication requires the owner's authenticated Firebase session.

## Verification
- `test:statistics`: computed summary/residual/proportion checks; conceptual answer regression assertions; scatterplot/data-table coordinate parity; feedback and closing-question structure. This does not certify every explanation or replace educator review.
- Course/source parity: 63 lessons, 692 imported steps, plus one runtime challenge (686 scored).
- Full Firebase emulator suite passes with all 63 IDs, including authorization and exact scoring counts. Unknown ID 64 and invalid/unauthorized access remain rejected.
- All three new lessons completed in the actual DOM renderer with mocked Firebase transport and simulated catalog activation. Milestones, completion, save retry and existing access denial behavior pass.
- Existing 60-figure classroom selector remains tested independently.

Next priorities: educator review, coordinate-plane inequalities and instructional ordering. Statistics extensions include richer distribution plots and deeper model comparison. Full-course certification is not claimed.

## Statistics classroom activation — 2026-10-13

The owner reported publishing the complete updated rules. The classroom catalog now includes all 63 figures. This is user-reported Firebase activation, not independent inspection of production rules. Live student completion and teacher-report verification remains pending.
