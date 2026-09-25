# Reckoning Figures mobile design preview

A first design milestone at `/preview/`: a responsive course home, Figure 001 lesson, and results screen. Run `python -m http.server 4173` at the repository root, then open http://localhost:4173/preview/.

- Uses the supplied lightning logo unchanged.
- Preserves all nine Figure 001 question objects from `duolingo-math.html`.
- Supports multiple choice, numeric entry, and true/false; wrong answers can be retried without losing lives.
- Uses separate `reckoningPreviewV1` browser storage. Does not mutate existing `reckonProgress`, authentication, or cloud data.
- Existing module, practice, profile, and leaderboard links open the original app.
- Includes keyboard focus, progress and feedback announcements, and reduced-motion support.

This is a web design preview, not an iOS build or App Store submission. Next steps: review design; migrate the remaining lesson content into a shared renderer; integrate existing account/progress behavior with a tested migration; add Capacitor iOS packaging and native-device testing; prepare TestFlight and App Store materials.
