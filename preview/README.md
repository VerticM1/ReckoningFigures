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

Restore or author the five missing source lessons; improve lesson-specific coaching throughout the course; integrate real account progress/entitlements; package for iOS; test on native devices and prepare TestFlight/App Store submission. This branch has not been deployed.
