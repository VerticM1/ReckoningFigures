# Marketing email setup — 3 November 2026

## Reused, not replaced

- Firebase project reckoningfigures-bbdae, us-central1, functions codebase school-mail.
- Existing RESEND_API_KEY and verified reckoningfigures.com sender domain.
- Sender and replies: Reckoning Figures <support@reckoningfigures.com>.
- Verification, password resets, staff invitations, pilot acknowledgements and parent-completion emails are unchanged.

## Deployment and activation order

1. Publish the static pages through GitHub Pages (main). Backend source lives on redesign/mobile-preview.
2. In the existing Cloud Shell checkout:

   ```sh
   cd "$HOME/reckoning-mail-20261020"
   git switch redesign/mobile-preview
   git pull --ff-only
   npm ci --prefix functions
   firebase deploy --only functions:school-mail:marketingHub,functions:school-mail:marketingUnsubscribe --project reckoningfigures-bbdae
   ```

3. Sign into the owner workspace and open `/preview/owner/marketing.html`.
4. Enter a valid business postal address (registered PO box or commercial mailbox is acceptable). User chose to add this later. Marketing remains disabled by default until this is entered and explicitly enabled. This does not block the learning app or service emails.
5. Enable marketing signup. This creates four named Resend segments: RF opt-in all, parent, educator, student. If the current Resend key is sending-only, Contacts/Segments/Broadcasts access is needed; verify its permissions before replacing any key. Never paste it in chat or frontend files. Replacing the shared secret requires redeploying all functions that use it, so coordinate rather than rotating casually.
6. Subscribe with an owner-controlled address, confirm, verify one welcome email, then unsubscribe and retry the old confirmation. Check the status in Resend. Gmail plus addressing can avoid another mailbox. Until this live check, delivery/API permissions are not verified.
7. Use the owner editor to send a preview to the verified owner account and create a Resend draft. Review recipients, footer, unsubscribe and content in Resend → Broadcasts, then send/schedule there. No subscriber campaign has been sent by this implementation.

## User experience

Homepage → free-pack/signup page → explicit consent + 13+ affirmation → email confirmation → dedicated Resend segment → welcome with pack. Account/profile links offer the same optional signup independently of authentication. The six-problem starter pack remains freely accessible and printable without signup.

No account, school roster, Stripe customer, or parent-link addresses are imported automatically. Audience is self-selected, not a verified account role. No learning results or child names are included. Existing unsubscribed Resend contacts remain suppressed, including replayed links; rejoining needs support review, not a silent reset.

Resend manages campaign unsubscribe links via {{{RESEND_UNSUBSCRIBE_URL}}}. Welcome emails have a separate app unsubscribe page and RFC-style one-click POST endpoint. Either path suppresses future Broadcasts through the shared Resend contact status. The owner list reads live Resend status, not stale local consent state. The list includes all Resend contacts; drafts target RF-only segments.

## Private records and operations

Admin SDK-only collections: marketingSettings, marketingSubscribers, marketingLimits, marketingDrafts. Existing rules deny unmatched collections; do not add client write permissions. Owner operations check the current platformOwners record plus verified, enabled Auth account on every request.

marketingSubscribers uses a SHA256 normalized-email ID. Contains consent version/text, source, timestamps, audience, provider contact ID, confirmation hash/expiry and opaque unsubscribe token. Never export bearer tokens. Rate limits bound public confirmation emails by recipient/IP/global per hour. No raw IP is stored. An expiring transaction lease serializes confirmation/unsubscribe operations.

If welcome delivery fails, the subscriber may retry the confirmation link within seven days. Retries reuse the provider idempotency key for at most 20 hours. Beyond that, ambiguous welcome delivery requires operator review; do not resend blindly. Broadcast draft creation is idempotent by editor request ID. Transient failures are displayed; no background queue or abandoned-signup drip campaign is claimed.

Privacy inventory finds these records by email and flags manual review. For a verified export request, include consent/audience/status/timestamps and separately review provider delivery records; omit confirmation hashes and unsubscribe/lease tokens. For deletion: unsubscribe in Resend first, confirm suppression, then review deleting the provider contact and minimizing the Firestore record. Preserve only the minimal opt-out evidence needed to prevent accidental re-import, documenting any retained record. Pending signups and rate-limit documents need periodic owner cleanup; no automatic retention job is claimed.

## Verification

Backend suite covers consent and age flags, confirmation, duplicate welcome suppression, opt-out replay resistance, existing provider suppression, owner authorization, sender/recipient binding, disabled setup and draft-only campaign creation. Existing transactional tests also run. Live deployment, key permissions, actual inbox delivery and mobile rendering remain to be verified after deployment.

Provider references:
- https://resend.com/docs/api-reference/contacts/create-contact
- https://resend.com/docs/api-reference/contacts/add-contact-to-segment
- https://resend.com/docs/api-reference/broadcasts/create-broadcast
- https://www.ftc.gov/business-guidance/resources/can-spam-act-compliance-guide-business
