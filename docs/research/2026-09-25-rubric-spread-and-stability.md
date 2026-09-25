# Deck rubric: score spread, within-style noise and Archetype accuracy

Date: 2026-09-25
Related:
- docs/research/2026-09-25-deck-rubric.md (the validation study this reanalyses)
- .claude/skills/ingest-legends/rubric.md, tools.ts (`scoreSheet`, `archetypeOf`)
- src/lib/scoring.ts (`rankLegends`, `clampToPool`)

## Question

The deck rubric study showed the rubric is repeatable and roughly valid. Four questions it left open:

1. Does averaging the formula with the rater's judgment squeeze scores toward the middle, and would a rescale help?
2. How much do decks of the same Legend and style differ, and how many decks does a Build need for its coordinates to hold to ±0.5? Median or mean?
3. Which `archetypeOf` thresholds misfire, and would a rule change or a tiebreak help?
4. Which protocol changes would make a Build's coordinates and label more accurate?

## Answer

1. **Averaging doesn't compress.** Judgment and formula correlate 0.87 to 0.92 on Pace, Stance and Complexity, so the final score's SD is 0.86 to 1.02 times the judged SD. The rubric is narrower than the current Build coordinates (SD ratio 0.71 to 0.91 on the same 32 Builds), but so is judgment alone. The current coordinates came from Archetype templates, so their wider spread isn't evidence of anything. A rescale leaves the validation correlations unchanged (Spearman is rank-based: identical to two decimals for a z-rescale, within 0.03 for a percentile map) and makes rater gaps 1.2 to 1.5 times wider. There's nothing to gain from it now. If Axis influence needs balancing after re-rating, `PLAYSTYLE_WEIGHTS` and `pnpm simulate` are the tools for that. Rewriting coordinates isn't.
2. **Decks of one style differ by SD 0.4 to 0.5 per Axis, about twice the rater noise (0.22 to 0.30).** Three decks give a Build within ±0.5 of its style's centre about 85 to 90% of the time. Four decks reach about 90% on every Axis. A second rater per deck adds 1 to 3 points of probability; a fourth deck adds 3 to 5. Use the mean. At n=3 and 4 it beats the median by 3 to 6 points under a normal model and ties it on the real residuals. At n=2 the two are the same.
3. **The Combo/Control answers cutoff never misfired.** The Aggro cutoff misfires most: 6 of 13 Aggro suggestions were right, and all 7 misses sat at exactly Pace 6.5 and Stance 6.5. Raising either cutoff to 7 gains 2 of 118 ratings, which is too few to act on. The rater's judged Archetype (95/118 in outside labels) beats the rule (90/118) and every tiebreak hybrid I tried (93/118), so the current protocol, judgment is the answer and the rule is a check, is the best of the options tested. The Combo/Control flips that do happen come from engine tag counts, not the cutoff.
4. **The data supports these changes:** more decks rather than more raters; the mean across decks; every deck of a Build scored under the same rubric version (a Stance shift of +0.44 between rubric versions is the largest systematic effect in the data); blind rating kept; and a fixed anchor set re-scored after rubric or card-pool changes. It does not support per-rater calibration: rater offsets are indistinguishable from chance.

## Method

Scripts in `.scratch/spread/` (gitignored), run with `pnpm tsx`:

| Script | What it does |
| --- | --- |
| `data.ts` | Loads all 118 ratings (59 decks, two raters each, rounds 1 to 3) and re-scores every sheet with the shipped `scoreSheet`. Defines 18 same-Legend, same-style groups (39 decks) from plan sentences and outside labels. |
| `spread.ts` | Range, SD and IQR of judged, formula (unrounded, adjustments applied) and final scores; share in the middle band; z-rescale and percentile map against current Build coordinates, and their effect on per-round validation. |
| `paired.ts` | Rubric deck means against the matching Legend's current Build (32 Builds). |
| `noise.ts`, `shift.ts`, `bias.ts` | Within-style spread, rater noise, round shift, per-rater offsets (sign-flip permutation test), and a simulation of Build estimates from n decks. |
| `quiz.ts` | Uses the respondent model from `scripts/simulate-quiz.ts` (σ 0.25 per Question, 25% neighbour slips) and the real `rankLegends`: quiz retake noise, how far apart two sibling Builds must be, #1 Match churn from coordinate jitter, and Axis influence. |
| `arch.ts`, `arch2.ts`, `archbuild.ts` | Archetype hits against outside labels by rule branch, rater-pair flips, one-threshold sweeps per round, tiebreak hybrids, Build-level majority votes. |

With the shipped scorer, the per-round validation numbers come out at 0.72/0.62/0.58/0.37 (round 1), 0.77/0.65/0.66/0.47 (round 2) and 0.32/0.73/0.31/0.13 (round 3) for Pace/Stance/Complexity/Variance. These match the study's cross-fit figures to within 0.03, so the re-scored data is the same data.

## Results

### 1. Spread

All 118 ratings:

| Axis | Judged SD | Formula SD | Final SD | Final range | r(judged, formula) | Final in 3.5 to 6.5 | Current Builds SD (52) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Pace | 1.79 | 1.93 | 1.82 | 0.5 to 8.0 | 0.91 | 70% | 2.12 |
| Stance | 1.62 | 1.43 | 1.49 | 1.0 to 8.0 | 0.92 | 73% | 2.06 |
| Complexity | 1.06 | 0.80 | 0.92 | 4.0 to 8.0 | 0.87 | 57% | 1.27 |
| Variance | 1.05 | 1.26 | 1.06 | 2.0 to 7.0 | 0.68 | 90% | 1.57 |

Rounds 2 and 3 alone (current tag definitions) look the same: final/judged SD ratio 0.84 to 0.99. The formula is the narrower half on Stance and Complexity and the wider half on Pace and Variance. Averaging moves each toward the other, and the result is never more than 14% narrower than judgment.

On the same Legends (32 Builds matched to rubric decks), the rubric is narrower than the current coordinates: SD ratio 0.91 Pace, 0.71 Stance, 0.72 Complexity, 0.71 Variance. It also disagrees with them. The mean absolute difference is 0.96 to 1.25 per Axis, Complexity correlates only 0.35, and the raters' majority label matches the current Build label for 16 of 32. The largest differences are template artefacts: Jinx Complexity 3.5 against the rubric's 6.4, Shen Pace/Stance 1/1 against 5.0/4.3, Sett Variance 6.5 against 3.5. When a Legend is re-rated its coordinates will move by about a point on average. That movement comes from the old placement, not from the rubric compressing anything.

Two consequences are worth planning for:

- **Complexity will have a floor near 4.** No deck scored below 4.0 and the mean is 6.6. After re-rating, every Player below about 4 is clamped (`clampToPool`) onto the same few lowest-Complexity Builds. The current pool's 2.5 to 3.5 Builds (Jinx, Garen Midrange, Master Yi) all score 6 or more on the rubric.
- **Pace and Stance move together** (r = 0.88 across decks, 0.92 across current Builds). The rubric keeps the other four Axis pairs near zero (|r| ≤ 0.16), which is better than the current Builds (Stance-Variance 0.42).

**Rescale.** A z-rescale of final scores to the current Builds' mean and SD would stretch by 1.16 (Pace), 1.38 (Stance), 1.39 (Complexity) and 1.48 (Variance). Validation per round: identical to two decimals. A percentile map to the Build distribution: within ±0.03. Rater gaps grow in proportion, from 0.25 to 0.34 on Variance. The rescale changes only how the quiz uses the Axes, and there it matters little. Shrinking the current pool to the rubric's per-Axis SD changes the #1 Legend for 20% of simulated Players. The share of #1 Matches that depend on each Axis (#1 changes when that Axis is flattened to 5) drops from 0.32/0.28/0.28/0.33 to 0.31/0.25/0.27/0.27. No target spread comes from evidence: the old SDs come from templates, and nothing ties a deck's 7 to a Player's 7. A rescale isn't justified.

**What the quiz can separate.** Player measurement is much coarser than Build noise:

| Axis | Quiz retake SD | P(Player on Build A gets A over a sibling δ away), δ = 0.5 / 1 / 2 / 3 |
| --- | --- | --- |
| Pace | 1.20 | 0.52 / 0.69 / 0.77 / 0.87 |
| Stance | 1.37 | 0.61 / 0.67 / 0.79 / 0.87 |
| Complexity | 1.21 | 0.51 / 0.61 / 0.76 / 0.87 |
| Variance | 1.54 | 0.60 / 0.61 / 0.74 / 0.83 |

Two Builds of one Legend need about 2 points on one Axis before a Player standing on one gets it three times in four. At 0.5 apart they're a coin flip. Across 1,500 simulated Players, retaking the quiz changes the #1 Legend 60% of the time. Jittering every Build coordinate by N(0, 0.5) changes it 30% of the time, and N(0, 0.25) 18%. When jitter of 0.5 does change #1, the new #1 is 1.4 fit points worse on the true coordinates (median 1, 90th percentile 3), and the true #1 stays in the top three 95% of the time. The median fit gap between #1 and #2 is 2 points. ±0.5 per Axis is a sensible precision target. Going tighter buys little against the quiz's own noise.

### 2. Within-style noise and decks per Build

Rater noise per single rating (σ_r = √(mean gap² / 2), 59 pairs): Pace 0.22, Stance 0.26, Complexity 0.25, Variance 0.30 (0.21 to 0.23 in rounds 2 and 3). No pair was a full point apart on Pace, and 7% were on Variance.

Within-style spread of deck means (18 styles, 39 decks):

| Axis | Pooled SD | Corrected for round shift | Also without Yasuo round 1 | Mean range in a style | Max range |
| --- | --- | --- | --- | --- | --- |
| Pace | 0.42 | 0.42 | 0.41 | 0.50 | 1.5 (Ahri, Viktor) |
| Stance | 0.59 | 0.51 | 0.40 | 0.63 | 2.5 (Yasuo) |
| Complexity | 0.49 | 0.48 | 0.47 | 0.54 | 2.0 (Viktor) |
| Variance | 0.46 | 0.45 | 0.44 | 0.57 | 1.5 (Leona) |

Between all 59 decks the SD is 1.82/1.48/0.90/1.04, so within-style noise is a quarter to a half of the full spread, and largest relative to it on Complexity. Every style group pairs a round-1 deck with a round-2 deck. Round-1 decks were tagged under v1 definitions, and Stance runs 0.44 higher on round-2 decks of the same style (the other Axes shift by less than 0.15). The corrected column is the better estimate for a single rubric version. The Yasuo round-1 list (Stance 3.5 against 6.0 and 5.5) is probably a different variant: its plan is "sticky Deflect Champions" rather than "one unit at a time".

Simulated Build estimates: true centre uniform on 3 to 7, deck effect and rater noise as measured, each deck's score rounded to half points, then the estimate rounded to half points. P(|estimate − centre| ≤ 0.5), one rater per deck, normal model, uncorrected σ (a pessimistic case):

| Axis | n=1 | n=2 | n=3 mean / median | n=4 mean / median | n=5 mean | n=6 mean |
| --- | --- | --- | --- | --- | --- | --- |
| Pace | 0.71 | 0.82 | 0.90 / 0.87 | 0.93 / 0.89 | 0.96 | 0.97 |
| Stance | 0.57 | 0.70 | 0.80 / 0.74 | 0.84 / 0.79 | 0.88 | 0.90 |
| Complexity | 0.64 | 0.77 | 0.86 / 0.82 | 0.89 / 0.85 | 0.93 | 0.94 |
| Variance | 0.66 | 0.78 | 0.87 / 0.83 | 0.90 / 0.86 | 0.94 | 0.95 |

- Two raters per deck: n=3 mean 0.92/0.81/0.88/0.90, a gain of 0.01 to 0.03.
- Resampling the real residuals, whose Stance and Complexity tails are heavier (kurtosis 4.4): n=3 mean 0.94/0.85/0.89/0.90 against median 0.92/0.86/0.91/0.86. The mean is never worse by more than 0.02, and it is 0.04 better on Variance.
- With Stance corrected to about 0.45 it behaves like Pace and Variance. On every Axis, 3 decks give about 0.87 to 0.90 and 4 decks 0.90 to 0.93.

So 3 decks is the minimum for ±0.5 at roughly 85 to 90%, and 4 decks gets there reliably. The median's robustness doesn't pay off here, because the only outlier (Yasuo round 1) is better caught as a different style than outvoted.

### 3. Archetype

The shipped rule (`archetypeOf` on final scores) matched outside labels 90/118 times (46/54, 38/48, 6/16 by round). The raters' judged Archetype matched 95/118 (45, 42, 8), and the two agreed 96/118 times.

| Branch | Fired | Right | Misses |
| --- | --- | --- | --- |
| engine + 12 answers → Control | 4 | 4 | none |
| engine → Combo | 9 | 7 | Azir, Fiora Jinan (one rater each tagged 6+ engines) |
| Stance ≤ 3.5 → Control | 27 | 20 | Yasuo r1 ×2, Lux combo ×3, Ivern ×2 |
| Aggro | 13 | 6 | Draven ×3, Kennen ×2, Ambessa ×2, all at exactly 6.5/6.5 |
| Tempo | 23 | 17 | Azir Utrecht ×2, Shen ×2, Vex ×2 |
| Midrange | 42 | 36 | Yasuo Chengdu ×2, Kennen Barcelona ×2, Ornn ×2 |

Seven of 59 rater pairs got different suggestions. Three of those came from engine tag counts: Lux combo 3 against 6, Azir 3 against 19, Fiora Jinan 0 against 6. Two were Stance at the 3.5 edge (Leona Chengdu, Viktor Chengdu), one was Aggro at the edge (Draven Hartford) and one was Tempo at the Pace 5 edge (Akali).

One-threshold sweeps, hits out of 118 (round 1 / 2 / 3):

- Combo answers cutoff, 8 to 99: 90 to 91. It is flat because it never decided a case.
- Engine cutoff, 4 to 8: 90 throughout.
- Aggro Pace or Stance cutoff at 7: 92 (46/39/7 and 45/39/8). The gain is 2, all from the 6.5/6.5 decks.
- Control Stance ≤ 4: 92, with the whole gain in round 3.
- Tempo Pace ≥ 5.5: 95 (46/40/9). Five of the gain come from rounds 2 and 3, mostly Shen and Vex, whose outside label is riftbound.zone's default "Midrange". The study already judged that label unreliable against guide prose ("reactive rather than proactive").
- Checking Tempo before Aggro: 86, worse.

Tiebreaks: using the judged Archetype only near a threshold scored 93/118. Using it always scored 95/118. Rater pairs agree on the judged label 50/59 times and on the rule 52/59. At Build level (38 styles, majority of every rating across the style's decks) the judged and suggested majorities both hit 29/38. Five Builds tie on judged labels (Jinx, Rek'Sai Singapore, Garen Aurora, Ambessa, Vex). The scorer's suggestion breaks 3 of the 5 correctly.

Overfitting risk: every proposed change moves 2 to 5 ratings out of 118, from 2 to 4 decks, scored against outside labels that disagree across sites. None of them clears the noise. The one structural finding is that the 6+ engine gate depends on a single tag, and raters disagree on that tag in 3 of the 8 ramp or engine decks.

### 4. Protocol

- **Rater offsets are chance.** Across 20 raters, the SD of each rater's mean offset from their partner is 0.12 to 0.19 on final scores (permutation p = 0.09 to 0.75). Nothing suggests correcting individual raters.
- **Rubric version is systematic.** Stance shifted +0.44 between v1-tagged and current-tagged decks of the same style. That is the largest bias in the data, bigger than any rater's.
- **The step-7 re-read trigger (formula and judgment 2+ apart) is nearly silent now.** It fired 8 times in round 1 (7 on Variance), once in round 2 and never in round 3.
- **Blind rating.** Every rating in the study was blind to the Legend file. The current coordinates differ from the rubric by about a point per Axis, and their labels match 16 of 32. A rater who saw them would be anchored to template values.

## Limits

- Style groups are my reading of plan sentences and labels. Rek'Sai Singapore, Kai'Sa Utrecht, Lee Sin Hartford, Viktor Chengdu, Garen and both Fiora styles were left out as different styles. Yasuo round 1 and Leona Shenzhen (Baited Hook) were kept in their groups, which may inflate Stance and Variance noise.
- Every style group spans the v1 and current tag definitions, so within-style noise is an upper bound for one rubric version. Only 39 decks in 18 groups of 2 or 3 inform it.
- All raters were Opus agents. Rater noise between different models or humans is untested, and a bias shared by every rater is invisible here. That includes the "true centre" in the simulation.
- The quiz figures rest on the project's own respondent model, and on the current pool (template coordinates), not a re-rated one.
- Archetype accuracy is measured against coarse, multi-label outside evidence. Round 3 has 16 ratings.

## Recommendations

- Score 3 decks per Build as the minimum and 4 when they exist. Take the **mean** per Axis, not the median, and round it to half points. Before averaging, re-check any deck more than 1.5 from the others on an Axis: it may be a different style.
- Spend effort on decks, not second raters, unless a deck is borderline on Archetype.
- Score all of a Build's decks under one rubric version. After any rubric change, re-score the old decks instead of mixing them in.
- Keep rating blind to the Legend's current Build and label.
- Keep an anchor set spanning the Archetypes (for example Jinx Utrecht, Viktor Fuzhou, Jayce Barcelona, Teemo Chengdu, Sett Dongguan). Re-score it after a rubric change and after Radiance (2026-10-23). A shift of 0.4 or more on an Axis means the pool needs re-rating.
- Leave `archetypeOf`'s thresholds alone. When a rater tags 4 to 9 engine cards, have them re-check each engine against "close to blank without the others" before trusting a Combo or Control call. For a Build label, take the majority of judged labels across its decks, and on a tie use the scorer's suggestion from the averaged decks and say so in `ratingNotes`.
- Don't rescale coordinates. After re-rating, run `pnpm simulate`. If an Axis (most likely Complexity, with its floor near 4) carries too little of the matching, adjust `PLAYSTYLE_WEIGHTS`.
- For the rating guide's "Distinct" bar: a second Build less than about 2 points from the first on every Axis is one Players can't tell apart.
