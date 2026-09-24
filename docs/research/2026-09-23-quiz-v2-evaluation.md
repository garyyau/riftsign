# Quiz v2 evaluation: simulation and test-player panel

Date: 2026-09-23
Related: docs/specs/0002-quiz-v2.md, docs/adr/0004-playstyle-led-matching.md, docs/eval/test-players.md, docs/eval/ground-truth.md

## Method

Quiz v2 is two changes measured together:
- **Matching:** Domain-affinity matching at weight 0.5, a favourite bonus of 1, the share fix, the Domain-lean threshold and the close-call line.
- **Question set:** the 2026-10 set, 26 Questions, 22 of them on the strength scale.

Baseline is `main` at 18718aa: the 2026-09 set of 25 Questions with the original matching.

1. **Simulation.** `pnpm simulate` gives numbers for plausible, noisy and random answerers.
2. **Test-player panel.** docs/eval/test-players.md describes 8 fictional Players, written without seeing the quiz, its Axes or any Legend data.
   - An Opus expert who had seen neither quiz picked each Player's best 3, good 6 and bad 3 Legends from a Legend catalogue with the coordinates removed (docs/eval/ground-truth.md).
   - Sonnet role-players took each quiz as each Player. Fresh agents took v2, so nobody saw a result before answering.
   - Answers were scored with the real `computeProfile` and `rankLegends` from each version.
   - Each role-player then read their top 3 and rated them in character.

## Simulation

| Metric | Baseline | v2 |
|---|---|---|
| Build recovery top-1 / top-3, noise-free | 71% / 98% | 85% / 96% |
| Build recovery top-1 / top-3, noise σ=0.25 | 69% / 97% | 81% / 97% |
| Build recovery top-1 / top-3, 25% neighbour slips | 35% / 63% | 70% / 94% |
| Playstyle-first Players: own Archetype share of top-3 slots | 47% | 60% |
| Strong-Domain Players: #1 holds their exact Domain pair | 85% | 67% |
| Random clicks: #1 is Akali, Jayce or Kennen (pool share 6%) | 40% | 2% |

- **The trade-off is intentional.** Players who pick mainly by Domain lose some precision at #1, and the Domain-lean section now serves them.
- **Weight 0.6 is the alternative.** It gives 72% strong-Domain and 58% playstyle-first (ADR 0004).

## Test-player panel

| Measure | Baseline | v2 |
|---|---|---|
| Expert "best" Legends in the quiz's top 3 | 7 / 24 | 8 / 24 |
| Expert "best" or "good" Legends in the top 5 | 22 / 40 | 25 / 40 |
| Expert "bad" Legends in the top 5 | 0 | 0 |
| Median rank of the expert's best picks | 12 | 5 |
| Role-player rating of their #1 (1–5) | 3.50 | 4.25 |
| Would try their #1 | 6 / 8 | 8 / 8 |
| Mean rating across the top 3 | 3.54 | 3.46 |
| Overall rating | 3.75 | 3.63 |

Per player, v2 compared with baseline:

- **Marcus** (claims combo, actually plays midrange): Darius Tempo → Garen Midrange, the expert's #1. Rating of #1 went from 3 to 5. Concrete choices got past the flattering self-image: he picked "outsmarted them" in v1 but "reliable card" in v2.
- **Tomasz** (fence-sitter): Master Yi → Garen, the expert's #1.
- **Sofía** (tempo trickster): Teemo, Diana, then Draven in baseline and Kennen in v2. Near-perfect both times.
- **Wen** (control): Shen → Vex, the expert's #3. Ahri, the expert's #1, is #2 in both runs.
- **Dani** (aggro): moved from 1 to 2 of the expert's best in the top 3.
- **Kai** (Fury-flavour fan who plays control): Shen → Ahri. Their playstyle rating rose from 4 to 5, but they missed the Fury look ("not one Jinx bone in this whole list"). The expert's picks, Kai'Sa Control and Viktor, have that look. Playstyle-led matching can't see flavour.
- **Hannah** (competitive midrange): Shen, rated 2 → Azir, rated 4. Still none of the expert's best in the top 3.
- **Priya** (combo tinkerer who hates luck): still missed in both runs. None of the expert's good picks is in her top 5.

## What worked

- **The Domain-affinity model.** It removed the pull of Akali, Jayce and Kennen, and Shen no longer tops three different Players. Players with no strong Domain are now matched on playstyle.
- **The strength scale and concrete choices.** Role-players used "Leaning" where they were unsure, and the simulation's noise tolerance roughly doubled. Several role-players said a concrete card choice made them answer how they actually play, not how they see themselves (Kai, Marcus).
- **The fact-check pass.** It caught three rules errors (scoring on turn one, stun clearing a battlefield, units moving between battlefields) that beginners would have noticed.

## Remaining gaps, in order of value

1. **Profiles still hit the ends of an Axis.** Consistent answers reach 0 or 10, while Builds span only about 1–9 (complexity 2.5–9). Whichever Axis the Player is extreme on then dominates the distance.
   - Clamping playstyle scores to the Build range when matching, or shrinking them by ×0.8, raised the panel's expert-best-in-top-3 from 8 to 10–11, with no other metric worse.
   - It's a small change in `rankLegends`, and the shown Profile stays untouched. Confirm it with `pnpm simulate` before shipping.
2. **Variance mixes up "big turns" and "luck".** Combo Builds are rated variance 6–8, and the variance Questions ask about luck and all-in gambles. So a combo player who hates luck (Priya) scores steady and misses every Combo Build.
   - Either rate combo variance as about self-made payoff rather than luck (an Ingestion rating-guide change), or add a combo item that isn't about luck ("you assemble a two-card combo over several turns").
   - An earlier review cut `engine-or-pieces` for jargon, and the combo signal went with it. It needs a plain-language replacement.
3. **The #3 slot is weaker.** v2's #3 Matches averaged a lower rating (Dani, Marcus and Sofía all rated theirs 2). Once playstyle leads, the tail of the top 3 is often a different-Archetype neighbour. Showing the top 2 with the close-call line, then a "same playstyle, other Domains" row, may read better than a fixed top 3.
4. **Flavour.** Kai shows the cost of playstyle-led matching. A cheap fix: let a favourite-champion or Domain pick fill a clearly labelled "has the look you like" slot, rather than add fit points.
5. **Complexity barely separates Builds.** 44 of 52 Builds sit on the complex side of the v2 complexity items. That's a limit of the Legend ratings, not the wording.
6. **The strength-scale UI hasn't been checked in a browser.** Component tests and static markup pass, but the phone and desktop layouts still need a look.

## Limitations

- 8 Players with one take each is a small sample. Treat changes of 1–3 counts as noise, and weigh the simulation more.
- The role-players and the expert are all Claude models. The role-players rate generously, which is why the expert overlap comes first.
- All 8 Players share one panel file, and at least one role-player mentioned another Player. This applies equally to both runs.
- Wen skipped one v2 Question (`shrink-or-buff`), which is scored as unanswered.

Raw runs, the harness (`eval.mts`, `compare.mts`, `clamp-test.mts`) and the ratings are in `%TEMP%\riftsign-eval\`, which is not committed.
