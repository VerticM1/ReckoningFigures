# Pilot application release

Public form: /preview/pilot.html. Owner inbox: /preview/owner/pilot-inbox.html.

## Activate
1. Back up current production Firestore rules. Reconcile any console-only changes against preview/owner/access-rules.txt.
2. Publish the complete updated rules using /preview/owner/activate.html. The new pilotApplications block permits one application per verified account, applicant-only reads and platform-owner review. It does not grant school membership.
3. Use a fictional verified Google account to submit once, reload, and check persisted status. Verify with the platform owner in Pilot applications. Confirm another account cannot read the application.
4. After the live check, replace the homepage's backend-activation notice with “School access is invitation-only. Apply to express interest.”

Google sign-in is used for this first application flow. If popup/domain authorization fails, check Firebase Authentication authorized domains. No automatic acknowledgement email is sent; the saved application page is the confirmation. Contact details remain in Firestore until the owner removes them through trusted console access. Application deletion is not exposed to clients. Public privacy documentation and an operational contact channel still require finalization before promotion.

## Website analytics
Create a GA4 website data stream and put its G- measurement ID in analytics-config.js. Disable Enhanced Measurement in that stream to avoid automatically collecting form and URL details. Mark pilot_application_submitted as a key event. Leave Google Signals and advertising features off for this pilot.

Tracking is dormant until the ID is configured and a visitor explicitly allows it. The adapter only runs on the public homepage and pilot application page. It sends sanitized page paths, learning-app clicks, pilot-application clicks and successful submissions; no names, emails, school names, answers, account IDs, query strings or application text are passed. It is not installed in student or school workspaces. Declining disables future events. Analytics preferences allow changing the choice; declining does not retroactively delete previously sent data or cookies.

The owner inbox counts at most the most recent 200 saved applications by current review status. These counts are not all-time visitor, account-registration, class-enrollment, or retention statistics. Invited is a manual review label; it does not send an invitation or create access.

Remaining external setup: Firebase rule publication and live smoke test; GA4 account/data stream ID; domain and email provider; automatic transactional email delivery; public privacy/contact review.
