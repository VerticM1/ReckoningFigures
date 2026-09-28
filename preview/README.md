# Reckoning Figures redesigned course preview

Run `python -m http.server 4173` from the repository root, then open `/preview/`.

## Current scope

- Seven module paths, 53 available lessons, and 581 source steps.
- Shared lesson renderer for multiple choice, numeric and variable entry, true/false, tutorials, and interactive number lines.
- Original questions, answers, and teaching content retained in `course.js`; the import script normalizes differing schemas. The original HTML files remain unchanged.
- Five referenced files (Figures 020–024) do not exist in the repository. Their nodes show an availability message instead of a broken link.
- The importer repairs an unescaped apostrophe in the source phrase `rectangle's` so the lesson data can parse; wording is unchanged.
- Existing Premium requirements are preserved using the original `userProgress.premium` flag. A server-backed entitlement system is still needed for a production mobile app.
- Each completed lesson updates its own path node, XP, and daily practice streak. Existing single-lesson preview progress migrates to completed Figure 001. Preview data stays in `reckoningPreviewV1`; existing `reckonProgress` and Firebase data are not changed.
- Figure 001 includes custom hints and an optional balance exploration. Other figures retain their original concept explanations where present and provide basic retry/reveal feedback, not bespoke hints.
- Calendar dates use the device's local time. Same-day practice does not increment the daily streak again.
- Fredoka and Nunito are bundled with their licenses. The original lightning logo is retained alongside the transparent version. Lesson/path motion supports reduced-motion preferences.

## Content workflow

Run `node preview/scripts/import-course.cjs` to regenerate the course from existing lesson files. The original source objects are retained beside normalized question data for checking fidelity. Run `node preview/scripts/validate-course.mjs` for schema/content checks.

## Validation

Headless Chromium completed all 53 available lessons and 581 steps with correct answers, including graph interactions, tutorial navigation, variable input, completion persistence and seven-module switching. Additional checks cover missing/premium gates, old preview migration, local day boundaries, wrong-answer feedback, and Figure 001 balance practice. Representative graph/tutorial/function screens were inspected at phone size. This is functional/content-preservation testing, not an independent audit of the original answer keys.

## Remaining work

Restore or author the five missing source lessons; improve lesson-specific coaching throughout the course; verify live cloud progress and production entitlements; test the generated iOS project on native devices and prepare TestFlight/App Store submission. This branch has not been deployed.

## Accounts and native packaging update

Profile now opens optional account controls; Leaderboard opens a clearly labeled simulated Practice League. The SDK is bundled in `vendor/firebase.js` so this preview still runs from a static server without a build step. Cross-device sync requires review/activation of the private Firestore rules and live verification. See `../MOBILE_SETUP.md` for the exact state, tests, and Mac build instructions. The iOS project is generated, not signed or compiled.

## Two-step lesson pilot

Open **Unit 1 → Figure 002: Double Trouble** (the second lesson node). The nine imported questions are preserved. A tenth, new equation checks transfer without automatic hints. This lesson adds animated operations on both sides, two levels of optional help, misconception feedback, replay, and a completion message that distinguishes an independent first attempt from a supported solve. Reduced-motion mode shows the same mathematical steps immediately. This is a teaching prototype; effectiveness still needs student testing.

Run `npm run test:lesson` to check that displayed transformations preserve both sides of each equation. Mobile Chromium smoke testing covers mistake feedback, hints, all ten answers, reduced motion, completion, and guest progress persistence. Native iPhone testing remains outstanding.

## Lightning brand widgets

`brand-art.js` reuses the transparent Reckoning Figures mark and builds a consistent electric-blue, amber, and white-highlight treatment for the Daily Charge battery, checkpoint vault, Spark League trophy, and badges. The same logo replaces generic lightning glyphs in streak, XP, combo, and lesson displays. Decorative objects carry no accessible labels; widget text conveys their state.

Daily Charge is derived from today's local practice date. A unit's First Spark badge is derived from completion of its first three available figures; it grants no additional XP or cash. The league uses the existing three-day simulated scoring and now opens in a full-height view. Browser checks cover 320px, 390px and desktop widths, locked/unlocked widgets, league navigation, and lesson logo updates. Actual iPhone testing remains pending.

## Lesson motion and celebration pass

Reference reviewed: `ScreenRecording_09-25-2026 15-27-20_1.mp4` (2:29). It shows reactive lesson artwork, tile states, progress-bar changes and a large success/XP overlay around 0:53; it ends mid-lesson and contains no end-of-lesson streak flow.

This pass adds distinct flame, crystal and completion-medal silhouettes, foreground answer celebrations, a powered combo bar, visible cancellation in Figure 002, and a full-screen XP → newly earned streak sequence. The streak scene is an original design based on the requested behavior, not a scene observed in the clip. It appears only on the first practice completion for the local day. Skip and reduced-motion modes retain results. XP continues to be awarded once by the existing claim action; animation does not grant additional rewards.

## Completion choreography, September 28 reference

Reviewed `ScreenRecording_09-28-2026 18-54-21_1.mp4` (48.7 seconds), including the completion entrance/results at approximately 0:16–0:21 and streak ignition at 0:41–0:47. The flow now uses an original blue lightning banner entrance, sequential XP/accuracy/time cards, then a dim-to-lit flame with old/new streak counts and delayed calendar activation. Advertising and subscription interstitials are not included.

The intro advances automatically after 1.7 seconds and can be skipped immediately. Reduced motion opens directly on the results. Finishing, skipping, or pressing Escape runs the existing guarded claim once and returns to Learn, without a duplicate results page. The new-day streak scene is omitted for later lessons on the same local date. Browser verification covers a 19→20 day transition, repeated same-day practice, reduced motion, skip timer cleanup and exactly-once saving. Native iPhone playback still needs device testing.

While serving the preview, open `celebration-preview.html` next to `index.html` to replay a first day, a 19→20 day milestone, or same-day completion. This isolated review page uses sample results and never reads or writes progress.
