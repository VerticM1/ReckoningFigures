# Branded school email deployment

Prepared October 20, 2026. Backend code is ready for deployment; no production deployment or live delivery test has been performed from this workspace.

## Account setup

Owner reports Firebase Blaze/budget setup, Resend domain verification for reckoningfigures.com, and creation of RESEND_API_KEY in project reckoningfigures-bbdae. The key must have Sending access for that domain. Sender and Reply-To are schools@reckoningfigures.com; confirm that mailbox receives replies before pilot launch. Never put the key in source, chat, screenshots or command arguments.

## Deploy from Google Cloud Shell

Open https://console.cloud.google.com/?project=reckoningfigures-bbdae and activate Cloud Shell (terminal icon). Authorize Cloud Shell when Google requests access to your project. Run:

```bash
git clone --branch redesign/mobile-preview --single-branch https://github.com/VerticM1/ReckoningFigures.git reckoning-mail-20261020
cd reckoning-mail-20261020
npm ci --prefix functions
npx firebase-tools@latest deploy --project reckoningfigures-bbdae --only functions:school-mail
```

If the directory already exists from a prior attempt, enter it and run `git pull --ff-only` instead of cloning again. If CLI authentication is required, run `npx firebase-tools@latest login --no-localhost` and follow the browser flow privately; do not send authorization codes in chat. Cloud Shell authorization may already be sufficient.

Deployment enables required Google Cloud APIs and builds three functions in us-central1. Functions use zero minimum instances, one maximum instance per function, concurrency one, 256MiB memory, and a 60-second timeout. These settings reduce idle spending and burst concurrency; they are not a hard billing cap. If Firestore location requirements cause deployment failure, inspect the actual database location before changing the region. Firebase handles granting runtime access to the explicitly bound secret; do not grant public access.

The command deploys only the school-mail codebase. It does not replace Firestore rules, publish website pages, or backfill existing records. Keep the existing private Firestore rules: mailEvents must have no client read/write access. Its temporary payload contains the recipient and invitation URL, so do not add a broad collection permission.

## What becomes automatic

- New pilotApplications record: branded acknowledgement to its verified applicant.
- New staffInvites record: branded invitation to its saved recipient, including invitations created by Approve & invite.
- Staff invitation changes pending to accepted: branded welcome only when matching active membership and verified account still exist.

Email links now use https://reckoningfigures.com/ after HTTPS page checks on October 21, 2026. Redeploy the school-mail functions to activate this change. Existing sent emails retain their original links. Existing invitations are not emailed retroactively. Browser success messages still confirm saved invitations, not email delivery. Verification/reset messages remain Firebase-managed; fully branded auth messages and support notifications are a separate rollout.

## Reliability and operations

mailEvents stores a hashed stable event ID, a processing lease, attempt count, and provider result. Fresh eligibility checks prevent sending revoked/expired invitations or inactive access. A stable payload and Resend idempotency key protect retries. Provider/network failures retry at most eight claims and only within 20 hours of the source timestamp, safely below Resend's 24-hour key retention. Terminal events are retained for deduplication. Temporary payloads are removed on terminal outcomes. A crashed attempt may retain its private payload until the next retry completes.

State `sent` means Resend accepted the message, not proof of inbox delivery. Inspect delivery/bounce/complaint status in Resend's dashboard. This initial backend has no webhook receiver or application suppression database; never manually resend to an address marked bounced or complained. Do not delete mailEvents to force a resend because this bypasses deduplication. Investigate failed events without copying their payloads into public logs. Expired or revoked staff invitations should be replaced with a newly issued invitation after the problem is fixed.

## Acceptance test before pilot launch

1. Confirm all three functions deploy successfully and use RESEND_API_KEY.
2. Using an owner-controlled test address, submit a new pilot application and confirm one acknowledgement.
3. Approve that application; confirm one invitation, correct school/role, branding, Reply-To and working link.
4. Accept using the matching verified address; confirm school access and one welcome email.
5. Check delivered status in Resend plus inbox/spam placement and mobile rendering. Reply to confirm the schools mailbox works.
6. Confirm repeated approval does not duplicate emails; revoked/expired invitations still deny access.

Unit tests run automatically before deployment and cover recipient permissions, escaping, revoked/expired/inactive access, duplicate/concurrent events, bounded retries, stable provider requests, and permanent failures. They use fake transport; no real emails are sent by tests. Production IAM, trigger delivery and inbox placement require the live acceptance test above.

## Domain cutover — October 21, 2026

Owner confirmed live pilot acknowledgement, invitation acceptance, school access and welcome email on October 21. Domain DNS now points to GitHub Pages. The mail base URL has been changed to the custom domain; this update requires function redeployment:

```bash
cd ~/reckoning-mail-20261020
git pull --ff-only
npm ci --prefix functions
npx firebase-tools@latest deploy --project reckoningfigures-bbdae --only functions:school-mail
```

Public HTTPS routes and assets can be checked without signing in. Actual Firebase sign-in and school access on the custom domain still require an owner test. Ensure reckoningfigures.com and www.reckoningfigures.com are in Firebase Authentication authorized domains. Keep the existing Firebase authDomain configuration.

Analytics keeps measurement ID G-B1SGPTYM48 and sends the current origin/path after consent. Update the GA web stream Website URL to https://reckoningfigures.com and confirm a consenting visit in Realtime. New-origin consent must be chosen again. HTTPS enforcement remains a GitHub Pages setting; enable when available. Verification and reset mail still use Firebase's existing sender.
