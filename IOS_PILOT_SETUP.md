# Reckoning Figures iOS pilot foundation

Prepared 23 October 2026. Bundle ID: com.reckoningfigures.app. iOS deployment target: 15.0. Xcode version: 0.3.0, build 2. Capacitor 8.5.2 with the existing UIScene lifecycle and Swift Package Manager.

## Verified here
- npm run ios:sync builds approximately 5.7 MB of local assets and syncs the native project with App 8.1.2, Haptics 8.0.2 and Network 8.0.1.
- npm run test:ios verifies local HTML script/style dependencies, excluded old/admin/purchase pages, navigation routing, offline state, resume events, haptic preference and blocked Stripe actions.
- All 40 backend tests and the offline progress merge tests pass.
- No Xcode build, simulator launch, device signing, IPA or TestFlight upload was performed. This Linux environment cannot validate native compilation or actual WKWebView behavior.

## First run on a Mac
Capacitor 8 requires Node 22+ and Xcode 26+. Install a supported Xcode version, launch it once and finish its setup. Use Node 22 LTS for consistency with Firebase functions.

For a fresh checkout in Mac Terminal:

```bash
git clone --branch redesign/mobile-preview https://github.com/VerticM1/ReckoningFigures.git
cd ReckoningFigures
npm ci
npm run ios:sync
npm run test:ios
npm run ios:open
```

For an existing checkout, verify the branch and pull rather than cloning again. Xcode opens ios/App/App.xcodeproj. Select the App target, Signing & Capabilities, your developer team and an iPhone simulator or connected iPhone. Do not change the bundle ID without coordinating Firebase and App Store Connect. Run the app. A developer program membership and App Store Connect setup are needed before TestFlight distribution. No signing team, credentials or certificates are stored in this repo.

## Backend origin update
Email verification/reset, family linking and family practice callables now allow capacitor://localhost in addition to the existing web origins; authorization is still enforced by Firebase user tokens. Deploy the current functions:school-mail codebase from the existing authorized Cloud Shell checkout before device account testing:

```bash
cd ~/reckoning-mail-20261020
git pull --ff-only
npm ci --prefix functions
npx firebase-tools@latest deploy --project reckoningfigures-bbdae --only functions:school-mail
```

## Scope of this device build
- Current learning/practice screens, existing profile, family and school access.
- Local web assets, no remote server URL. Google font imports are removed from the device bundle; local fonts/system fallbacks remain.
- Safe-area CSS, 16px form inputs, haptic answer feedback with a profile toggle, offline messaging, audio pause and progress-sync retry on resume/reconnection.
- Owner/admin and original legacy app pages are excluded. Shared owner client/CSS remains because the current account and school screens use it.
- Public web files are unchanged by the mobile builder. The shared learner app adds inert custom event hooks consumed only by the native runtime.
- Stripe purchase/portal calls are blocked in the bundled client. Purchase/admin anchor navigation leads to a pilot availability page. This is a pilot UI guard, not a substitute for backend authorization or an App Store payment implementation.
- Email/password is the initial native sign-in path. Google web-popup buttons are hidden pending native OAuth/Sign in with Apple decisions. Google-only accounts need a tested supported native sign-in flow before release.

## Device acceptance checklist
1. Launch while offline: learning assets load; the offline notice appears. Premium checks and account data correctly require connectivity.
2. Complete free practice, background/foreground, reconnect, and verify saved progress merges once. Confirm audio stops in background.
3. Toggle haptics in Profile; verify on a real iPhone (simulators may not produce vibration).
4. Test notch/home-indicator layouts, landscape/iPad, keyboard, text scaling, VoiceOver and reduced motion. CSS is prepared but device results are unverified.
5. Test email sign-in persistence across termination; verification/reset in Safari and reloading verified state in the app. Universal Links are not configured yet.
6. Link a family account and enter a school class; verify server-side membership and assignments. No school or paid entitlement should be fabricated offline.
7. Confirm no old GitHub layout, owner pages or Stripe purchase actions can be reached through the normal native UI.

## Before TestFlight / App Store release
- Compile and sign on Mac; inspect native plugin resolution and application logs.
- Decide storefront distribution and implement the appropriate native purchasing/restore/server entitlement flow. Existing sandbox entitlements must be segregated or removed before live launch.
- Implement and test account deletion within the app, including dependent family/school data handling.
- Audit native authentication providers; add Sign in with Apple if required for the chosen login options.
- Set up Associated Domains and the website association file for verified class/family and email-action links; validate routes and tokens.
- Review privacy manifests, App Privacy disclosures and child/parent consent with actual data practices. No app-level privacy declaration was invented in this pass.
- Finish real leaderboard/content access review, icons/splash QA, accessibility, screenshots, review credentials and pilot feedback channels.
- Native push notifications are not implemented; current notifications remain email/in-app web features.

Official references checked: https://capacitorjs.com/docs/updating/8-0 , https://capacitorjs.com/docs/updating/8-5 , https://capacitorjs.com/docs/apis/app , https://capacitorjs.com/docs/apis/haptics , https://developer.apple.com/app-store/review/guidelines/ , https://developer.apple.com/support/offering-account-deletion-in-your-app/ . Apple's purchase rules vary by storefront; recheck before submission. This foundation is not an App Store approval claim.
