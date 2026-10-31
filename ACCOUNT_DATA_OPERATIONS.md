# Account-data and retention operations

Owner: Emmanuel Olagunju. Request entry: support@reckoningfigures.com and `/preview/data-requests.html`.
Weekday monitoring; target initial response within two business days. This is not a completion SLA.

## Intake and identity

1. Keep each request in restricted storage with a request ID, received date, requester, verified Firebase UID, requested scope, operator and status. Do not store this register, exports or customer screenshots in this repository.
2. Verify ownership through the account's established email or authenticated support process. Never request a password, full card number or verification token. An email containing a UID is not sufficient proof.
3. For a school/parent request about another person, verify authority and scope separately. A linked parent is not automatically authorized to delete a student's account.
4. Statuses: received → identity verified → inventoried → shared/provider review → execution → verification → closed. Track export and deletion separately. Record blocked steps and next review dates.

## Inventory before disconnecting anything

Use the existing authorized Firebase operator environment and private output paths outside the checkout:

```bash
node functions/scripts/privacy-request.mjs inspect PROJECT_ID ACCOUNT_UID /PRIVATE_DIRECTORY/request-inventory.json
node functions/scripts/privacy-request.mjs export PROJECT_ID ACCOUNT_UID /PRIVATE_DIRECTORY/request-export.json
```

These commands read production; they do not delete production data. Inventory scans the pilot database with a 10,000-document limit and includes missing parents with existing subcollections. A limit failure is an incomplete inventory, not an empty account.

The export is an explicitly partial identity/progress export. Do not represent it as a complete access response. Review family, school, support, billing, legacy/social and provider records separately; redact other people's information, auth internals, invitation secrets and operational tokens. Confirm the requested scope, deliver securely to the verified requester, and agree when to remove temporary export files.

Inventory first, before unlinking family accounts: familyWork and familyActivity use link hashes rather than UIDs. The inventory follows familyLinks, familyStudents, relevant household slots and notification link hashes, including revoked links. Preserve that mapping until dependent records have been reviewed. Old orphaned hashes without a surviving mapping still require a separate database reconciliation; this tool cannot prove their ownership.

## Deletion execution and billing

1. Offer export before irreversible deletion. Record the user's confirmed scope.
2. Check all billing records and Stripe subscriptions, pending sessions and unresolved payments. Obtain the requested cancellation timing; verify cancellation in Stripe. Never delete a purchase mapping while a delayed payment or webhook can still need it. A refund and cancellation are separate actions.
3. Review shared school records with the authorized school contact, and decide record-by-record deletion, redaction or retention with a documented reason and review date. Update memberships/seat counts consistently. Removing membership is not deletion.
4. Review family links, hash-keyed assignments/activity, notifications, social relationships, pilot applications, support messages and audit records. Remove only approved data; preserve other accounts and school integrity. Disable queued notifications before execution.
5. Establish an effective write freeze across client writes, backend functions and queued jobs. Disabling Firebase Auth/revoking refresh tokens alone does not instantly invalidate every existing ID token. Verify the freeze before deletion.
6. The CLI's `delete` mode remains emulator-only. Production execution is deliberately unavailable until the write-freeze, shared-record and provider/backup procedure is rehearsed. Do not remove that guard just to make a production command succeed. An authorized operator must execute a reviewed production plan with explicit scope and recovery handling.
7. Rerun inventory and verify unrelated-account preservation, no remaining access, canceled billing as requested, provider cleanup and no recreation by delayed jobs. Keep the case open if anything remains unresolved. Explain retained records/reasons and limits to the requester.

## Retention review

The existing pilot plan is review at pilot end, with removal within 90 days unless the learner continues service or an agreed school requirement applies. No pilot end date or school-specific exception is inferred.

For each cohort, the restricted register must contain: pilot end date, 90-day due date, owner, account scope, continued-service decision, school requirement/other retention reason, related provider records, backup expiry, next review date and completion evidence. Review the register weekly. Missing dates, overdue items and unexplained exceptions are blockers; they are never treated as completed cleanup.

At pilot end: inventory before unlinking, classify continuing accounts, review shared records, then use the deletion process above. Verify Resend/email logs, support correspondence and Stripe financial records separately; record actual applicable retention and provider controls rather than promising immediate deletion. Do not delete financial records needed for an applicable obligation.

Record backup locations and actual expiry. Restrict retained backups and ensure a restore cannot silently reintroduce deleted data: keep a restricted deletion ledger and reapply approved removals before reopening a restored database. Test that process in isolation. Local browser storage on each device needs separate user handling; it is not erased by deleting Firebase records.

No automatic retention sweep is deployed. This is the operating procedure and acceptance gate, not evidence that a production request or backup cleanup has completed.
