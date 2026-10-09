# Private profile and social migration

Implemented 2026-10-09. Database enforcement is pending publication of the complete rules from `/preview/owner/activate.html`. Publishing the website alone does not change Firebase rules.

## Changes
- `/users/{uid}` becomes owner-only, including email, XP and legacy progress. No collection listing. Existing self-owned writes remain compatible with legacy sync. Profile fields never authorize a school role.
- `/users/{uid}/appProgress/v2` is included in the complete rules, with private access and the existing progress schema validation.
- Old `/friendRequests` and `/friendships` are quarantined: clients can no longer read or write them. Previously unrestricted writes mean these records cannot prove consent. No records are deleted or automatically trusted.
- New social discovery is off by default. Opting in creates a separate `socialProfiles` record containing only a chosen username, normalized handle and timestamp, plus a `socialHandles` lookup. No email, school information, XP or practice data are shared.
- Signed-in users can look up one exact username; listing the directory is denied. Handles are claimed atomically, case-insensitively. A rename or opt-out releases the old handle atomically.
- New requests and friendships use `socialRequests` and `socialFriendships`. Reads are limited to participants. A recipient atomically consumes the request when creating a friendship; either participant can remove it. A client cannot impersonate a sender, accept for someone else, mutate a relationship, or recreate it using a consumed request.
- Turning discovery off prevents new requests and acceptance, removes the discoverable alias, and preserves existing connections until removed. Existing connections display “Private learner” while discovery is off.

## Release order and verification
1. Publish the updated website, including the legacy `friends.html` redirect, authentication bridge, and the new preview Friends page. Before rule activation it shows an unavailable message instead of falling back to unsafe legacy access.
2. Back up the current Firebase rules and review any console-only changes. Reconcile them with the generated complete rules; publish through Firebase Console. Do not restore the old public rules as a rollback.
3. With separate test accounts, opt both into discovery, search by exact username, send and accept a request, then remove the friendship. Disable discovery and confirm the username can no longer be found.
4. Verify existing private progress sync and the teacher → student assignment → teacher report flow on separate devices. Emulator and mocked-browser tests do not replace this production check.

## Limits
The optional social feature is not required for school assignments. No email invitations are sent, no global leaderboard is derived from these profiles, and aliases are not verified identities. Abuse reporting, blocking, rate limiting, retention/export/deletion workflows, and school policy review remain launch work. A released username may be claimed by another account; relationships bind to account IDs, not usernames. The interface loads up to 100 records in each direction and refreshes on user action. Do not treat this release as overall school-launch approval.
