# Reckoning Figures mobile design preview

A first design milestone at `/preview/`: a responsive course home, Figure 001 lesson, and results screen. Run `python -m http.server 4173` at the repository root, then open http://localhost:4173/preview/.

- Uses the supplied lightning logo unchanged.
- Preserves all nine Figure 001 question objects from `duolingo-math.html`.
- Supports multiple choice, numeric entry, and true/false; wrong answers can be retried without losing lives.
- Uses separate `reckoningPreviewV1` browser storage. Does not mutate existing `reckonProgress`, authentication, or cloud data.
- Existing module, practice, profile, and leaderboard links open the original app.
- Includes keyboard focus, progress and feedback announcements, and reduced-motion support.

This is a web design preview, not an iOS build or App Store submission. Next steps: review design; migrate the remaining lesson content into a shared renderer; integrate existing account/progress behavior with a tested migration; add Capacitor iOS packaging and native-device testing; prepare TestFlight and App Store materials.

## Motion pass

The lesson now includes staggered equation/answer entrances, spring tap feedback, rising success/retry panels, per-answer XP bursts, combo milestones, and brief outgoing question transitions. Original question content and XP totals are unchanged. Reduced motion skips decorative movement, including when the preference changes during a lesson.

Verified in headless Chromium at a 390 × 844 phone viewport: no horizontal overflow, answer transitions, combo increases/reset, wrong-answer retry, and reduced-motion behavior. Inspected question and correct-answer screenshots; checked desktop layout at 1440 × 1000. DOM checks cover the complete nine-question lesson, accuracy/XP, and separate preview persistence. Native iOS testing remains pending.

## Brand and daily activity

The supplied lightning artwork now has an alpha-transparent sibling asset (`assets/brand-transparent.png`), produced with the built-in image editing tool. Prompt: remove the mint background and broad haze, retain the golden bolts, blue outlines, orientation, and painted highlights; output true transparency. The original file is retained.

Fredoka headings and Nunito body text are bundled locally with their SIL Open Font Licenses. Daily activity uses local calendar dates, deduplicates same-day visits and practice, and shows current/best practice streaks plus visit days and visit streak. A day is practiced when Figure 001 reaches completion, even before XP is claimed. Activity begins with this preview; no historical data is fabricated and Firebase is not yet integrated. The existing within-lesson answer combo remains separate.

Validated duplicate days, missed-day reset, yesterday grace, month/year and daylight-saving boundaries, weekly dates, alpha transparency, font rendering, and the existing browser lesson checks.

## Learn path redesign

Learn now centers on a winding 12-figure path for the existing Linear Equations module. A raised gold node and start callout identify the next lesson; the transparent lightning mark floats beside the path. The home dashboard cards were removed. Activity calendar opens from the streak counter, and all seven modules remain accessible from the unit menu.

Only the preview's Figure 001 completion is reflected in this path. Later nodes open existing figure pages, explicitly described in their detail dialog. Completing Figure 001 advances the suggested next lesson to Figure 002, and the completed first node supports replay. No original lessons or progress were changed.

Verified in Chromium: desktop and 390px phone layouts, 12 nodes, no phone horizontal overflow, activity/course dialogs, keyboard Escape, figure details, starting a new lesson, and replaying a completed lesson. Visual screenshots inspected at both sizes.

## Scenery along the path

Added five lightweight, code-native SVG landmarks anchored to lessons: fraction tiles, balance scales, a decimal planet, an equation sketch, and a trophy. These supplement the original lightning artwork, with subtle drifting motion, star details, and background color washes. Decorative elements are hidden from assistive technology and cannot intercept taps. Reduced motion disables movement.

Verified in Chromium at 320, 390, and 1440px: no horizontal overflow or intersections between the new art and lesson buttons; all 12 nodes remain, all five landmarks render, reduced motion works, and Figure 001 still starts. Phone and desktop screenshots inspected.
