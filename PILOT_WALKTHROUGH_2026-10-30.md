# Web pilot walkthrough — 30 October 2026

## Confirmed by user
- Live checkout, Premium activation, profile plan display and Stripe billing portal: user confirmed complete on 29 October.
- Earlier classroom assignment workflow was user-confirmed; not independently repeated in this walkthrough.

## Independently observed on production
- Homepage learning CTA opens welcome flow and learner path.
- Figure 001 completed through all nine questions, showing 100% accuracy, 140 XP and one-day streak.
- Save & finish returned to path with completed marker and next figure.
- Reload preserved figure completion (browser-local guest progress).
- Student signup displays 13+ birth-month/year screen.
- Guest learning remains accessible without age screening. The registration screen is self-reported eligibility, not identity or server age verification.

## Local automated validation
- test:sync, test:access-logistics and test:course-access passed.
- Functions suite: 46 tests passed, including verification, parent pairing, assignments, notification deduplication, billing and profile behavior.
- test:owner: all eight emulator rule suites passed (owner, membership, classroom, course access, join, staff, privacy and support).
- Six age boundary assertions passed, including birthday today/tomorrow and future birth month.
- Local/emulator results do not establish currently deployed production rules or email delivery.

## Small copy corrections
- Homepage removed obsolete backend-activation warning for pilot applications.
- Student signup footer now addresses the student and explains optional parent linking.

## Remaining live account walkthrough
- Create a fresh eligible student account and receive branded verification email.
- Verify email, return to app, confirm account recognizes verification.
- Complete a figure while signed in; sign out and back in and check saved progress. Check another device/browser for cloud persistence.
- Parent path: link two separate verified accounts, confirm both sides, assign figure, complete it and verify parent report and opted-in completion email.
- School path: follow a real classroom invitation, confirm right classroom, complete assigned figure and verify teacher report.
- No new real account or email recipient was created in this audit. Those checks require user-controlled accounts/inboxes and classroom invitation.
