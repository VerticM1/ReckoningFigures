# Algebra 1 curriculum audit — 2026-10-09

Status: technical content review completed; educator approval and full-course coverage remain open. This is a limited practice library, not a certified complete Algebra 1 course.

## Inventory and access

| Unit | Planned | Existing | School assignable | Coverage finding |
| --- | ---: | ---: | ---: | --- |
| Linear equations | 12 | 12 | 12 | Add distributive-property/like-term multi-step problems; lesson 7 largely repeats two-step work. |
| Linear inequalities | 6 | 6 | 6 | One-variable practice; coordinate-plane inequality graphing needs expansion. |
| Systems of equations | 8 | 8 | 0 | Figures 020–024 added and technically checked; educator review remains open. All eight are premium. |
| Quadratic equations | 8 | 8 | 0 | Existing premium practice; prerequisite order and depth need review. |
| Polynomials | 8 | 8 | 0 | Existing premium practice; teach operations before factoring applications. |
| Exponents and radicals | 8 | 8 | 0 | Existing premium practice; domain assumptions clarified. |
| Functions | 8 | 8 | 0 | Existing premium practice; add exponential models and sequences. |
| Total | 58 | 58 | 18 | 40 existing lessons are premium; all planned source files are present. |

The importer contains 641 steps: 594 multiple choice, 24 fill blanks, 13 true/false, seven tutorials and three interactive number-line graphs. Lesson 2 adds one runtime challenge: 642 delivered steps, 635 scored. Step counts are not evidence of mastery or sufficient instructional depth. Access restrictions and assignment counts were not changed by this audit.

## Verified corrections

The versioned ledger `preview/curriculum-corrections.json` records 38 edits across 23 lessons, with before/after values and reasons. These include two wrong systems keys (26.9, 26.10), an equivalent second correct inverse choice (56.12), ambiguous ticket/tip/truck wording, missing domain restrictions, and inaccurate generalizations about quadratic roots, radicals and functions. The importer now preserves the inequality for lesson 16 multiple-choice questions. A blank graph endpoint no longer matches zero; typed Unicode minus signs are normalized on both sides.

## Verification and limits

- Source/import parity checks cover all 58 existing lessons and 641 imported steps. This verifies transfer, not mathematical truth.
- Independent symbolic checks verify 192 answer keys: first-unit equation solutions, polynomial operations/factorizations, selected quadratic roots, exponent/radical identities, corrected systems intersections and inverse-choice uniqueness. Expressions are checked under the stated domain assumptions. This is not an exhaustive proof of all distractors or all prompts.
- Regression checks cover missing inequality context, single-choice duplicate text, the changed answer controls and corrected wording/keys.
- Reviewed question/key summaries and teaching explanations for gaps and obvious inaccuracies. An educator must still review every item, distractor, prerequisite, readability, accessibility and learning objective before a full-course claim.
- Saved historical completions are not regraded. Reports do not yet record a curriculum version. Review any affected prior practice manually; add versioned assessments before high-stakes use.

Run `npm run test:course`, `npm run test:curriculum`, and `npm run test:classroom-ui`. For symbolic checks, install `preview/scripts/requirements-audit.txt` and run `python3 preview/scripts/audit-math.py` and `python3 preview/scripts/test-systems.py`.

## Next priorities

1. Educator-review the newly added figures 020 Rate of Change, 021 Modeling Linear Systems, 022 Graphing Linear Systems, 023 Substitution, and 024 Elimination. These now include worked examples, fresh practice, two closing questions each, and feedback explaining every distractor. Closing questions have no worked example displayed, but permit retries and assistance; they are practice, not a validated independent assessment.
2. Strengthen foundations: distributive property, combining like terms, fractional/negative coefficients, no/infinitely-many solutions, and coordinate-plane graph interpretation/construction. Teach quadratic methods before linear–quadratic systems; polynomial operations before factoring.
3. Fill full-course gaps: exponential models and linear/exponential comparisons, arithmetic/geometric sequences, and statistics/data analysis (distributions, scatterplots, line of fit, association versus causation). Review absolute-value/piecewise work and other local requirements.
4. Decide school entitlements for premium content before claiming schools can assign the whole course. Do not merely remove client locks; enforce the same entitlement in assignment creation and learner delivery.
5. Obtain an educator’s course/standards mapping and approval, then run a supervised pilot with fresh independent checks. Record curriculum versions with future results.

## Comparison framework

Common Core high-school domains were used only to identify broad gaps; the user's jurisdiction and adopted course sequence were not specified. These are not a state-specific Algebra 1 checklist or certification:

- [Reasoning with Equations and Inequalities](https://www.thecorestandards.org/Math/Content/HSA/REI/): solving equations, systems and graphing.
- [Linear, Quadratic, and Exponential Models](https://www.thecorestandards.org/Math/Content/HSF/LE/): growth patterns, models and sequences.
- [Interpreting Categorical and Quantitative Data](https://www.thecorestandards.org/Math/Content/HSS/ID/): distributions, scatterplots and fitting/interpreting models.

## Systems gap filled — 2026-10-09

Figures 020–024 now contain 60 scored multiple-choice questions: 20 guided questions, 30 practice questions, and 10 fresh closing questions. There are eight plotted coordinate graphs with distinct line patterns, labeled axes, consistent scales, equation legends and equivalent values in text. Correct and incorrect responses receive question-specific explanations. Original links and the modern learner renderer both deliver the content.

Independent checks cover all 60 new keys and unique valid options, derive solutions and model constraints from separate fixtures, and verify every plotted line against its equation. The earlier 192 symbolic checks still pass. This brings the tested-key total to 252, without claiming every existing item is certified. Conceptual wording, scope and learning quality still need educator review.

The five new lessons inherit the systems unit’s premium status. There are still 18 school-assignable lessons. The Firebase assignment catalog and rules are unchanged. New content does not by itself make a full course available to schools.

| Figure | Learning objectives | Closing practice |
| --- | --- | --- |
| 020 Rate of Change | Slope from points and tables; units; zero/undefined slopes; constant versus changing rates | Negative-coordinate slope and contextual speed |
| 021 Modeling Linear Systems | Define variables; distinguish count/money/geometry relationships; use consistent units; check both equations | Drink revenue and rectangle perimeter models |
| 022 Graphing Linear Systems | Read and verify intersections; parallel/coincident lines; vertical/horizontal lines | A new intersection and coincident-line classification |
| 023 Substitution Method | Replace equal expressions; distribute; solve and back-substitute; identify contradictions/identities | Two fresh systems |
| 024 Elimination Method | Add/subtract equations; scale every term; check ordered pairs; distinguish no/infinite solutions | Opposite coefficients and a system requiring scaling |
