# Family billing and onboarding — 22 October 2026

## Status
- Student registration screen supports 13+ learners, branded email verification and the existing two-party parent connection. Under-13 registration is not open. This age selection is a UI gate, not age verification or a complete COPPA program. Existing school and legacy signup routes require a separate review before broad child-facing release.
- Completion activity and opt-in email delivery are prepared in school-mail. Deploy to activate. Existing families should save the completion-update preference once to establish the observation start time. No historical backfill. Updates represent newly synced completions, including imported progress; they do not prove a lesson was completed at notification time. Multiple newly synced figures in one write generate one generic email. First completion per figure per parent link is deduplicated; repeat practice does not send another message. Recent feed retains 40 items per link, dashboard 40 total. Disconnects and email opt-out are rechecked immediately before delivery. Delivery cannot retract an already accepted email.
- Added private familyActivity, familyNotifications and familyPurchases collections; client rules must continue denying direct access.
- Paid access in the redesigned learner homepage is now checked against the backend, not a browser Premium flag. Static lesson assets and the legacy original app remain a paid-launch security review item; this is not a complete content-delivery paywall.
- Stripe billing source and disabled client controls are prepared. Not yet exported/deployed, not tested against a real Stripe sandbox, no real charges possible from these controls. Stripe prices remain blank and no public prices are published.

## Proposed prices — NOT approved
| Students | Monthly total | Monthly per student | Lifetime total |
|---|---:|---:|---:|
| 1 | $14.99 | $14.99 | $299 |
| 2 | $24.99 | $12.50 | $499 |
| 3 | $31.99 | $10.66 | $649 |
| 4 | $37.99 | $9.50 | $749 |

Lifetime permanently includes Pre-Algebra, Algebra 1 and all future released courses for the chosen number of learners. Only Algebra 1 exists today. Lifetime sales create future support/hosting obligations; do not count them as recurring monthly revenue.

Owner goal: at least $10,000 monthly profit. Illustrative calculation, not forecast: 60% one-student, 25% two-student, 10% three-student and 5% four-student subscribers yields $20.34 average monthly revenue per paying household. At US domestic card fees of 2.9% + $0.30 and Stripe Billing pay-as-you-go 0.7%, contribution before other costs is $19.30776/account/month. With an ASSUMED $3,000/month for all remaining operating costs, 674 active paying households generate about $10,013 pre-income-tax operating profit. Actual hosting, customer support, acquisition costs, refunds, tax tooling and churn may change this substantially. Owner salary must be included in expenses if profit is intended after salary. Sources checked 22 October: https://stripe.com/pricing and https://stripe.com/billing/pricing .

## Activate notifications first
Use the existing Cloud Shell checkout:
```bash
cd ~/reckoning-mail-20261020
git pull --ff-only
npm ci --prefix functions
npx firebase-tools@latest deploy --project reckoningfigures-bbdae --only functions:school-mail
```
New exports: familyProgressUpdates and familyCompletionEmail. Existing RESEND_API_KEY is reused. No Stripe secret is required for this deployment.
After deployment: use an existing linked parent account, enable completion emails, complete a previously uncompleted figure on the student account and confirm cloud sync. Check the parent feed and receipt, retry sync (no duplicate), then turn emails off and test another figure. No actual emails or customer records were created by development tests.

## Stripe setup after prices are agreed
1. Create the business Stripe account at https://dashboard.stripe.com/register . Complete Stripe's own business verification privately. Start in sandbox/test mode.
2. Create eight USD Prices: four recurring monthly and four one-time lifetime, one bundle price for each student count. Set quantity 1 (bundle), not per-seat quantity. Share only Price IDs if needed; never paste secret keys into chat.
3. Store test API key using Firebase Secret Manager (`npx firebase-tools@latest functions:secrets:set STRIPE_SECRET_KEY --project reckoningfigures-bbdae`). The CLI privately prompts for the value.
4. Create a test webhook pointing to https://us-central1-reckoningfigures-bbdae.cloudfunctions.net/familyBillingWebhook . Select checkout.session.completed, checkout.session.async_payment_succeeded, customer.subscription.updated, customer.subscription.deleted, invoice.paid, invoice.payment_failed, charge.refunded, charge.dispute.created and charge.dispute.updated. Store its signing secret with functions:secrets:set STRIPE_WEBHOOK_SECRET.
5. Configure billing-config.js with approved test Price IDs, live:false and enabled:true. Export familyBilling and familyBillingWebhook from billing-entry.js in index.js. Deploy, then enable BILLING_ENABLED in preview/family/billing-client.js for test review only. Add conspicuous test-mode labels before public test access. Do not enable real payments yet.
6. Configure Stripe Customer Portal for card updates, invoices and cancellation at period end. Disable price/quantity switching until family seat upgrades/downgrades are implemented. Purchases cover self (one seat) or first N parent dashboard slots. School licenses remain independent. Seat switching/upgrades are not automated yet.
7. Test real sandbox checkout, declined card, webhook before/after redirect, duplicate retries, renewal, cancellation, expired access, lifetime purchase, refund and dispute, unpaired seat, changed family link, and invalid webhook signature. Refund/dispute events put access on a persistent manual-review hold; customer support must review before restoring. Existing subscriptions cannot open another checkout, including after cancellation; resubscription/reactivation is still a launch gate.
8. Before live release: approve taxes/refund/terms policy, enable receipts, review webhook reconciliation/recovery, finalize seat reassignment/resubscription, prevent legacy Premium bypass, finish privacy/consent review, then separately configure live keys/prices/webhook and reverify live readiness.

This document records remaining setup and acceptance checks, not a claim of paid-launch readiness.
