# Email preparation and connection checklist

Updated 2026-10-20. Owner reports Resend domain verification and RESEND_API_KEY stored in Google Secret Manager. The school email backend is implemented in functions/ but has not been deployed or live-tested from this workspace. See EMAIL_DEPLOYMENT.md for exact deployment and acceptance steps. Firebase verification/reset branding, support notifications and provider webhooks remain separate work.

## Prepared assets
- `preview/owner/email-templates.js`: HTML and plain-text renderer for staff invitation, verification, staff welcome, password reset, support reply and pilot acknowledgement.
- `preview/owner/email-preview.html`: fictional preview selector with HTML/text downloads. No recipient entry or send controls.
- `preview/school/recover.html`: Firebase password-reset request. Firebase's existing configured sender is used; new branded templates are not automatically installed.

## Sender setup after domain purchase
1. Select the transactional provider and a monitored support/reply-to mailbox. Set verified sender identity and DNS records prescribed by that provider; confirm authentication in delivered headers.
2. Configure Firebase Authentication template sender/display name and authorized website domains. Firebase-hosted reset/verification actions remain in use until a custom handler is explicitly implemented and tested. HTML drafts are not a claim that the Firebase console accepts arbitrary custom HTML.
3. Deploy a trusted server-side mail dispatcher. Keep provider keys and action-link generation out of browser code. Allowlist action-link origins and routes in the server; never accept arbitrary action URLs from a public request. Render escaping does not authorize events or recipients.
4. Send invitations only after the invitation write succeeds. Fetch school, recipient email, role and exact expiration from the stored invite. Never trust client-supplied roles or recipients. Generate secure Firebase action links via trusted SDK if using a custom sender for auth mail.
5. Send staff welcome only after membership is confirmed active. No student email template or automated student mail is enabled by this release.
6. Support notifications must check ticket ownership and authorized staff recipients. Include no request body, student names, results or private ticket content.
7. Pilot acknowledgement only after the request is durably stored. The public pilot-request form is connected to Firestore; the backend's creation trigger sends acknowledgement after deployment. This template does not grant school access.
8. Use an outbox event ID and provider idempotency key, track queued/sent/failed states, retry transient failures with bounds, verify webhook signatures, and suppress repeated sends or bounced recipients. Separate “queued” from “delivered” in UI language.

## Delivery acceptance
Test with explicitly authorized test inboxes: correct sender/reply-to, subject, school and role; matching-email verification; valid/expired/revoked links; mobile mail rendering; plain-text fallback; reset and sign-in return; duplicates, bounce and retry handling; spam placement. Never store action tokens or email exports in public logs. Remove example.invalid links before enabling a real sender.

## Required values
Owned domain, verified sender, monitored reply-to, provider configuration, allowed application origins, support ownership and agreed response target. None is invented here.

### October 21 authentication rollout
Branded verification and reset implementation is prepared; see EMAIL_DEPLOYMENT.md for staged activation. Backend deployment and live tests are still required. Pilot verification detection and navigation arrow removal can publish independently. New-domain school invitation, sign-in, and welcome flow was confirmed working by the owner before this change; analytics setup was also reported done.
