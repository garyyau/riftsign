# Quiz v3 evaluation: six independent Domain scores

Date: 2026-09-24
Related:
- docs/adr/0005-six-independent-domain-scores.md
- docs/research/2026-09-24-question-redesign-v3.md
- docs/research/2026-09-23-quiz-v2-evaluation.md
- docs/eval/test-players.md

The question here is whether the quiz's Questions and scoring recover a Player accurately. Whether each Legend is rated accurately is a separate evaluation, so the Legend data is held fixed and treated as given.

## Method

1. **Panel.** 16 fictional Players, one file each in docs/eval/players/. They were written without seeing the quiz, the Axes or any Legend data. The eight added since v2 cover gaps v2 couldn't test:
   - someone who loves Fury and Calm together
   - a lone dislike
   - a luck-loving aggro player
   - Body plus Mind
   - a two-week beginner
   - a mild generalist
   - patient go-wide Order
   - a slow, reactive bluffer
2. **True Profiles.** Two independent raters, Opus and Fable, read each Player and rated all 10 scores without seeing the quiz. The truth is their average. Inter-rater agreement is high: per-score Spearman rho is 0.95–0.99, except Chaos at 0.82, and mean absolute gaps are 0.16–0.63 points. Truth is therefore not the limiting factor.
3. **Takes.** Fresh Sonnet role-players took the v3 set, 2026-11 with the power-balance pass. Each read only its own Player file and the answer sheet. A second set of fresh role-players took it again as a retest.
4. **Scoring.** Answers go through the real `computeProfile` and `rankLegends`. There are four kinds of measure:
   - **Profile accuracy:** per-score MAE and Spearman against truth.
   - **Oracle agreement:** the quiz Profile and the true Profile ranked with the same Legend data and matching. It reports how often #1 matches, and the regret: the true-Profile fit of the ideal #1 minus that of the quiz's #1.
   - **Test-retest stability.**
   - **Secondary:** role-player self-ratings of the new result page, and expert-pick overlap for the original eight Players (docs/eval/ground-truth.md).
5. **Cross-version check.** v2's answers were converted to six Domain scores the way old share links are (fury = 5 − fury-calm, and so on). They were then scored with v3 matching against the same six-Domain oracle. This compares the two Question sets on equal terms. v2's own oracle compresses the true Domains onto three bipolar Axes, which makes it an easier target, so v2's headline numbers can't be compared directly.

## Profile accuracy

| Score | v2 MAE / rho | v3 MAE / rho | v3 retest MAE / rho |
| --- | --- | --- | --- |
| pace | 1.61 / 0.91 | 1.59 / 0.84 | 1.52 / 0.89 |
| stance | 1.81 / 0.74 | 2.07 / 0.77 | 1.81 / 0.78 |
| complexity | 2.03 / 0.74 | 1.68 / 0.87 | 1.68 / 0.83 |
| variance | 1.28 / 0.77 | 1.47 / 0.70 | 1.20 / 0.74 |
| fury-calm (bipolar view, −5..5) | 1.58 / 0.72 | 1.08 / 0.79 | 1.29 / 0.65 |
| mind-body (bipolar view) | 1.31 / 0.90 | 1.27 / 0.62 | 0.90 / 0.86 |
| chaos-order (bipolar view) | 1.80 / 0.74 | 0.91 / 0.82 | 1.02 / 0.64 |

| Six-Domain score | v3 MAE / rho | v3 retest MAE / rho |
| --- | --- | --- |
| Fury | 1.95 / 0.88 | 1.93 / 0.83 |
| Calm | 1.74 / 0.49 | 1.83 / 0.46 |
| Mind | 2.34 / 0.62 | 1.78 / 0.72 |
| Body | 1.41 / 0.64 | 1.19 / 0.68 |
| Chaos | 1.24 / 0.70 | 1.24 / 0.57 |
| Order | 1.58 / 0.44 | 1.65 / 0.44 |
| Top-2 Domains shared with truth | 19/32 | 22/32 |

- **Playstyle** is about where v2 was. Complexity improved, which fits the tightened definition: combo is complexity, luck is variance.
- **Old opposite pairs**, viewed the bipolar way, improved on fury-calm and chaos-order.
- **Six-Domain ranking** is the weak part. Calm and Order barely rank Players correctly (rho about 0.45).

## Oracle agreement and where the error comes from

| Question set, scored with v3 matching against the six-Domain oracle | Regret (fit points) | #1 matches | Top-3 overlap | Six-Domain MAE | Top-2 Domains |
| --- | --- | --- | --- | --- | --- |
| v2 answers | 4.2 | 7/16 | 19/48 | 1.77 | 18/32 |
| v3 answers | 4.6 | 6/16 | 16/48 | 1.71 | 19/32 |
| v3 retest | 5.4 | 5/16 | 18/48 | 1.60 | 22/32 |

On equal terms, v3's Questions measure Domains about as well as v2's, and the recommendations are level within the noise of 16 Players.

Swapping each half of the quiz Profile for the truth shows where v3's regret comes from:

| | Mean regret |
| --- | --- |
| Quiz Profile | 4.6 |
| True playstyle, quiz Domains | 3.6 |
| Quiz playstyle, true Domains | 0.1 |

The playstyle scores are nearly lossless for matching, so the Domain scores cause almost all of the regret. Shrinking the quiz's Domain scores toward 5 before matching doesn't help: with k = 0, 0.25, 0.5, 0.75 and 1, regret is 6.1, 5.4, 4.8, 4.8 and 4.6. So the Domain answers do carry signal, but too little.

**Why the Domain scores are noisy.** Each Domain rests on four zero-sum forced choices. Every choice moves two Domains by ±2, even when the Player feels nothing about either side. The takes show three failure modes:
- **Indifference.** Nadia, who loves go-wide Order and has no feeling about Mind, took the Mind answer "Definitely" in all four Mind items on card appeal alone. That put Mind at 10 and made Mind the headline Domain on her result.
- **Liking both.** Priya likes both Chaos discard and Order Deathknell and had to pick one ("both feed things I love"). She ended at Order 0.6 against a true 6.75.
- **Lesser evil.** In `discard-or-sacrifice`, most Players picked whichever cost hurt less. That's a dislike signal credited as a like.

This is the pairwise version of the problem six independent scores were meant to remove: preferring one Domain still takes preference from another.

## Stability

Test-retest over 16 Players:
- same #1: 9/16
- top-3 overlap: 33/48
- mean Profile RMS gap: 1.0 point

v2 had no retest, so there's no comparison.

## Result page (secondary)

Role-players read their v3 result page, rendered from the real strings, and rated it in character:

| Measure (1–5) | All 16 | Original 8, v3 | Original 8, v2 |
| --- | --- | --- | --- |
| #1 fits how I play | 3.56 | 3.88 | 4.25 |
| #2 fits | 2.94 | – | – |
| "Your Domains" feels right | 3.50 | – | – |
| "Has the look you like" lands | 3.79 (14 with favourites) | – | – |
| Overall | 3.19 | 3.50 | 3.63 |
| Would try #1 | 8/16 | – | 8/8 |

- **The look slot works.** Players repeatedly trusted its honesty line, for example "calling Teemo out as not matching me, that line I actually trust."
- **Domain complaints track the measurement error above.** Nadia and Priya on Order, Wen on Calm, Ingrid on Mind, and Marcus and Hannah on a Fury lead they don't feel.
- **Some complaints are about Legend ratings, which are out of scope here.** Priya's Kha'Zix labelled Midrange, and Lucian read as a "protect one unit" deck.

Expert-pick overlap for the original eight is level with v2:
- the expert's best picks in the top 3: 9/24 (v2 8/24)
- best or good picks in the top 5: 26/40 (v2 25/40)
- bad picks in the top 5: 0

## Simulation (`pnpm simulate`)

The Questions' structure is unchanged by the power-balance pass, so every population keeps the numbers recorded in ADR 0005. The one exception is the power pickers, which now come from blind judges (question-redesign-v3 §7). Their #1 now lands on a Fury Legend 33% of the time, against 0% before, and no Domain goes below 17%.

## Ranked remaining gaps (quiz side)

1. **Domain measurement.** This is the bottleneck. Zero-sum forced choices can't give six independent scores enough signal, and three of them (Calm, Order, Mind) rank Players barely better than chance. Next step: test independent single-Domain items, with each item rating one Domain's card effect on its own scale, so indifference reads as neutral and liking two Domains shows as two likes. This goes through the same panel and oracle.
2. **The lesser-evil cost item.** `discard-or-sacrifice` rewards the cost a Player dislikes less. Replace it with rewards, or drop it with item 1.
3. **Calm reads weaker on power.** Blind judges rate stun, Tank and send-to-base below their partners, so indifferent Players drift away from Calm.
4. **Stance** has the largest playstyle error (MAE 1.8–2.1). Several Players overstated how proactive they are.

Legend-side items stay for the separate Legend-quality evaluation: Priya's combo match, Kha'Zix's Archetype, and Combo Build variance.
