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

## Branded authentication emails — 21 October 2026

New `accountEmail` callable in `school-mail` sends verification/reset messages using Resend from **Reckoning Figures <support@reckoningfigures.com>**. Firebase Admin generates the one-time codes; `/preview/account-action.html` applies them on our domain. No custom Firebase Hosting domain is needed for this handler. Only approved local return paths are supported. The handler removes the code from the address bar and has no analytics or third-party assets.

Rollout is staged: `preview/auth-mail.js` initially used `BRANDED_EMAIL_ENABLED=false`. This preserves Firebase delivery until the callable is deployed. Deploy from the existing Cloud Shell checkout:

```bash
cd ~/reckoning-mail-20261020
git pull --ff-only
npm ci --prefix functions
npx firebase-tools@latest deploy --project reckoningfigures-bbdae --only functions:school-mail
```

After deployment, switch the flag to true, rebuild BOTH `npm run build:owner` and `npm run build:vendor`, and publish the source and website branches. Test reset using an existing controlled account, plus verification on an unverified controlled account. No extra mailbox is needed for the reset test. Do not disable a real user's verification to manufacture a test. Confirmation of prior school invitation/welcome delivery is not confirmation of this new authentication endpoint.

The callable requires sign-in for verification and derives its recipient from the live account. Reset uses a neutral response for missing, disabled, limited, and provider-failure cases; no account-existence disclosure is intentional. Private Firestore `authMailLimits` counters enforce a 60-second recipient cooldown, 4 requests per recipient per hour, 20 per IP per hour, and 100 aggregate per hour. Limits count attempts, not delivery. No client rules should grant access to this collection. Provider errors log only a generic event/kind; codes and emails are never logged or persisted by this sender. These are pilot limits, to be reviewed before increasing volume. No App Check enforcement is configured yet.

Pilot page now polls verification every 5 seconds while visible and checks on window focus. Clicking Submit with a complete application while unverified records intent only in that page; when Firebase confirms verification, the page submits with the existing explicit consent. Closing/reloading the page clears that pending intent. No automatic verification bypass exists. Resend is available as a secondary action.

Deliverability: keep Resend domain verified; inspect Resend's Insights and receiving mailbox headers for SPF/DKIM/DMARC failures. Disable open/click tracking for authentication mail in Resend settings (dashboard action still required; not changed by this code). DNS and sender reputation affect spam placement; branded templates cannot guarantee inbox placement. Do not alter Microsoft 365 MX or replace existing SPF blindly. The specific spam cause has not been confirmed without message headers. Firebase-native messages outside these app entry points are not rerouted by this change.

Validation: 13 backend unit tests; pilot UI fake-API flow test; action-page DOM tests for verification, redirect restriction, code removal, mismatched passwords and expired reset links. Live delivery of the new callable remains pending deployment and activation.

### Activation confirmed — 21 October 2026
Owner confirmed deployment. A non-sending unauthenticated verification request reached accountEmail and correctly returned UNAUTHENTICATED. Branded email flag is now enabled and both client bundles rebuilt. Live email receipt, reset completion and verification remain user acceptance checks; no test email was sent by this activation check.

## Deploy prepared familyHub callable
The same codebase now includes familyHub. Deploy using the existing commands above; no new secret or Firestore rules are required. Then enable the staged family dashboard flag. The family service sends no emails, charges no payments and grants no Premium entitlement. See FAMILY_PRODUCT_PLAN.md for acceptance checks and current limitations.
