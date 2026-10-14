# Pilot logistics — 2026-10-13

Status: NOT cleared for real-student launch. School access is implemented; automated email delivery and operational approvals remain incomplete. This file supersedes older percentage estimates. No new production Firebase verification has been performed by the agent.

## Current access routes
- Owner: `/preview/owner/` for schools, licenses, administrator invitations and support inbox.
- Teacher/administrator: school-specific `/preview/school/?school=…`, then Open classes. Membership and role determine access; an account or URL alone grants none.
- New staff: `/preview/school/staff-join.html?invite=…`, matching email, verification, Join school, then school workspace.
- Student: teacher-generated `/preview/school/join.html?invite=…`, registration/sign-in and automatic or teacher-approved admission. No manual UID exchange.
- Getting-started guide: `/preview/get-started.html`.
- Public root currently routes into learner onboarding. It is not a school-pilot acquisition page.

## Email audit (source-verified, delivery not verified)
| Event | Implemented | Remaining |
| --- | --- | --- |
| Staff verification | Firebase sendEmailVerification; user clicks Send verification email | Verify delivery, sender template, authorized domain, return flow and spam behavior using a real invited test account |
| Staff invitation | Email-bound invitation, seven-day expiry; copy/share link | Server-side transactional sender, idempotent sends, delivery failure status and safe resend |
| Student signup | Account creation and in-app admission | No welcome/confirmation email; do not claim one was sent |
| School pilot request | Not connected | Landing form, secure storage, owner notification and acknowledgement |
| Support reply | Saved thread and owner inbox | No email notification; define inbox checking routine |
| School-login password recovery | Not exposed in the connected school login | Add a recovery route and test successful return; do not confuse it with other app account screens |

## Target onboarding flow
School landing page → request pilot → acknowledgement → owner approval → school/license creation → staff invitation email → verified account → school workspace → class → student join link → assignment → saved result.

Public requests must not automatically grant administrator/teacher roles. Senders and keys belong in a trusted backend, never browser code or a public Git repository. Avoid including student results or sensitive information in email. The invite email must clearly state the school, role, expiry and next step.

## Required owner decisions before email implementation
1. Owned website/email domain and chosen sender (for example, a verified address at that domain, not an invented address).
2. Monitored reply-to/support mailbox and who checks it.
3. Transactional email provider/account and access to domain verification. No provider or paid plan is provisioned yet.
4. Pilot school, teacher, age range, student count, devices and dates. Suggested scope for approval: one teacher, 5–10 students, two weeks, Figures 001/002/007 after educator review.

## Live acceptance checklist
Use fictional test identities first; keep evidence private, never put credentials or student data here.
- Owner invites a test teacher; intended email arrives (when sending is connected), correct matching-email requirement, expiry and revoked-link behavior.
- Teacher requests verification; message arrives; verify, return, join; sign out and re-enter through bookmarked school link.
- Teacher creates class; student uses link; correct class admission; no duplicate seat on retry or second class in same school.
- Assign 007 and one new statistics figure. Complete in a separate student browser, verify saved confirmation and teacher report. Repeat a failed save and confirm one result.
- Teacher submits support request → owner reads/replies → teacher reads/follows up. Confirm no automatic email claim unless actually connected.
- Complete the same route at phone width, with keyboard only, reduced motion and sound off; manually test screen reader labels and focus. These new checks are pending.
- Check teacher cannot open another school's data and student cannot manage a class; automated rules tests are evidence, not a substitute for the production configuration check.

## Educator sign-off
Approve only the selected pilot lessons: solve every question without the answer key, inspect distractors and explanations, confirm prerequisites, then observe one independent fresh problem after practice. Record reviewer/date privately. XP and app completion do not prove independent mastery.

## Operations proposal (not activated or promised)
- Owner checks support before and after each pilot session; agree a response target with the teacher before launch. Support currently has no notification email.
- Pause sessions for lost/duplicated results, wrong-class access, exposed private information or a materially incorrect lesson. Record time, affected feature and reproduction steps without student data. Use the school pause control to stop new practice when appropriate; it does not delete history.
- Keep a known-good website commit and rules snapshot. Test rollback on a test school/project before using it in an incident.
- Configure restricted Firestore backups and perform a restore into a separate test database. Compare records and access rules before relying on recovery. Backups, billing and restore have NOT been configured here. Firestore backup does not replace an Authentication recovery plan.
- Confirm the school's privacy/consent requirements, approved data fields, retention/deletion/export process and support contact. No retention period or legal approval is invented. Removing membership frees a seat; it is not account/data deletion.

Official implementation references:
- https://firebase.google.com/docs/firestore/backups
- https://firebase.google.com/docs/firestore/manage-data/export-import
- https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions

## Go/no-go
Go only when the selected lessons have educator approval, the actual teacher/student/support loop passes, the pilot's devices/accessibility needs are tested, school/privacy arrangements are confirmed, and backup/recovery and support responsibility are established. The initial local test environment disconnected during this audit; no new browser or production-delivery pass is claimed.
