# UX review — 24 October 2026

Implemented locally:
- Practice figures grouped by unit with native accessible expand/collapse, figure counts and completion bars. Existing unit selection, completed-only filtering and Premium access checks remain.
- Practice copy explicitly includes personal goals alongside class and tutoring.
- Practice leaderboard redesigned around position, earned XP and distance to the next place. Simulated-player disclosure remains prominent; no fake real-user claims.
- About page draft at preview/about.html, linked from website navigation/footer and profile. First-person founder copy uses the owner's stated tutoring experience and goal of building learning confidence. No invented milestones, student counts, testimonials or personal anecdotes. Founder should review before publication.

Historical avatar idea retained for design exploration, not yet implemented:
- Three possible collections: inventors, artists, mathematicians.
- Choose between stylized portraits and original symbolic badges before creating assets.
- Avoid implying historical figures are actual leaderboard participants. Avatar selection is separate from simulated opponent identity.
- Verify image rights and biographical captions if real portraits or facts are included.

Scope interpretation: unit grouping applies to Practice. The Learn path remains sequential. An expanded library layout elsewhere can be considered after reviewing this version.

Validation: practice behavior tests (including unit disclosure), progress/league tests, mobile build/sync and mobile asset/navigation checks. No visual device test completed. Owner explicitly authorized publishing these changes and the earlier iOS foundation to VerticM1/ReckoningFigures on 24 October 2026.


## Character avatars — October 24, 2026
- Approved cartoon direction applied as six nameless character choices in onboarding.
- Choice appears in Profile navigation, profile settings, final welcome step and the learner’s simulated-league row. All six are available; no unlock requirement introduced.
- Settings work for guests and signed-in learners. Choice is stored per account on this device; cross-device character sync is still pending. Existing learners can choose from Profile without repeating onboarding.
- Sprite atlas generated from approved concept, encoded as WebP (~131 KB); image is decorative, picker buttons have descriptive accessible labels.
- Verified onboarding, selection/change, reload, account isolation, storage-unavailable fallback, profile billing regression, practice, progress sync and mobile asset build. Device visual review remains to do.
