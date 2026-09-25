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
