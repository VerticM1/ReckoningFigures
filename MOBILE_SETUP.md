# Accounts, practice league, and iOS setup

## What is ready

The preview has optional email/password accounts, explicit guest-progress import, account-separated device storage, and a Firebase sync client. Lesson completion, XP, visit dates, and practice dates merge across devices. Per-device XP counters avoid double counting repeated uploads and retain XP earned independently offline. Existing website progress in `reckonProgress` and its Firebase user fields are not overwritten or automatically imported.

The Practice League is explicitly labeled as simulated. Seven opponents update every six hours; a round lasts three days. The player's round XP comes from completed preview lessons. League XP remains local and is not cloud synced.

Capacitor 8.5.2 and the generated Swift Package Manager iOS project are included. App ID is currently `com.reckoningfigures.app`. The web assets are packaged locally, including the Firebase SDK and fonts. The original opaque logo is the iOS app icon; the transparent version remains inside the app. Native signing and compilation have not been performed.

## Firebase activation needed

The client points to the existing project `reckoningfigures-bbdae`. I have not accessed its console, deployed rules, created a real account, or validated live synchronization.

1. In the project's Authentication settings, verify Email/Password sign-in is enabled.
2. Retrieve the currently deployed Firestore rules. Merge `firebase/progress.rules.fragment` into the existing document scope after reviewing all broader wildcard rules; do not replace the existing rules file with this fragment. A broader allow rule can override the intended privacy of this match.
3. Validate with the Firestore emulator or Rules Playground that user A can read/write their own `users/A/appProgress/v2`, cannot access user B's document, and signed-out clients are denied. Preserve existing app behavior elsewhere.
4. After deploying reviewed rules, test with two real devices: sign in to the same account, complete distinct lessons, sync both, and verify XP and completion. Test offline/reconnect and switching between accounts. Use the Profile screen's Sync now button to inspect errors.
5. To carry local guest progress into an account, use the explicit import button in Profile. Guest and account saves otherwise stay separate.

The account/league interface can be previewed now; cross-device syncing should not be advertised as live until these checks pass. No Firebase rules were deployed by this change.

## Build and run on a Mac

Use the Node version required by the installed Capacitor CLI and a compatible Xcode version (check `node_modules/@capacitor/cli/package.json` and the Capacitor 8 environment requirements).

From the repository root:

```bash
npm ci
npm run ios:sync
npm run ios:open
```

In Xcode, open the App target, select the signing Team for your Apple Developer account, confirm the bundle identifier, choose a simulator or connected iPhone, and Run. `npm run ios:sync` regenerates the ignored native web assets after each web change. No Apple credentials or signing certificates are included.

## Before TestFlight / App Store

### Required: native haptics (requested October 1, 2026)

- [ ] Integrate native Capacitor haptics before considering the app finished.
- [ ] Add a light correct-answer tap and gentle wrong-answer double pulse.
- [ ] Escalate feedback at 3, 5 and 7 consecutive correct answers, synchronized with celebration motion and the seven-answer lightning strike.
- [ ] Add perfect-lesson feedback and a daily-streak pulse when the new day number lands.
- [ ] Provide a separate haptics on/off setting and gracefully skip unsupported devices/web browsers.
- [ ] Test intensity, timing, cancellation and the toggle on a physical iPhone in the native build. The Safari preview is not sufficient verification.


Native device QA, account deletion and data-removal flow, a published privacy/support page, App Store privacy declarations, and final signing/assets are still required. The existing client-side Premium flag is retained for compatibility; paid entitlements need a production design before selling access in the iOS app. Cloud progress is private user-owned learning state, not a tamper-proof competitive score service.

## Verification performed

- Course data validation: 53 available lessons / 581 source steps.
- Merge tests: independent offline XP, repeated uploads, completion union.
- Practice league: deterministic opponents, three-day reset, user round XP.
- Browser checks in the prior session: mocked authentication for account isolation/import/signout; guest lesson startup with real Firebase endpoints blocked. No real sign-in or Firestore write was performed.
- `npm run ios:sync`: bundled web assets and synchronized the generated native project successfully. This does not compile an IPA or validate Apple signing.
