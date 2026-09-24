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

## Experiment: independent Domain statements (2026-11b)

This tests gap 1 directly. The 12 zero-sum Domain scenarios were replaced with 18 single-Domain statements, 3 per Domain (2 forward, 1 reverse-keyed). Each rates one contract face on the 5-point agree scale and moves only its own Domain. The 15 playstyle items are unchanged. The set has 33 items and is kept in `docs/eval/experiments/2026-11b-independent-domains.json`.

A first draft required every face to lead all other Domains 2:1 in the card pool. That dropped stun, Tank, draw, ramp, big units and conquer and swapped in XP and bounce, which no longer measure the Domains the truth was rated on. It was rewritten to use the contract's faces, keeping weak-evidence faces with a flag. The same 16 Players took it twice, with fresh role-players each time.

| | v3 take / retest | 2026-11b take / retest |
| --- | --- | --- |
| Six-Domain MAE | 1.71 / 1.60 | 1.36 / 1.33 |
| Top-2 Domains shared with truth | 19 / 22 of 32 | 23 / 22 of 32 |
| Regret (fit points) | 4.6 / 5.4 | 3.5 / 4.9 |
| Regret from the Domain half alone | 3.6 / 2.9 | 2.2 / 2.4 |
| Top-3 overlap with the oracle | 16 / 18 of 48 | 23 / 21 of 48 |
| #1 matches oracle #1 | 6 / 5 of 16 | 5 / 5 of 16 |
| Test-retest: same #1, Profile RMS gap | 9/16, 1.01 | 9/16, 0.94 |

| Domain rho, take / retest | Fury | Calm | Mind | Body | Chaos | Order |
| --- | --- | --- | --- | --- | --- | --- |
| v3 | 0.88 / 0.83 | 0.49 / 0.46 | 0.62 / 0.72 | 0.64 / 0.68 | 0.70 / 0.57 | 0.44 / 0.44 |
| 2026-11b | 0.76 / 0.78 | 0.71 / 0.76 | 0.79 / 0.72 | 0.74 / 0.74 | 0.54 / 0.61 | 0.49 / 0.71 |

`pnpm simulate` on 2026-11b:
- Build recovery with 25% neighbour slips is 77% / 99%, against 61% / 89% for v3.
- "Your Domains" names a strong fan's pair 96–99% of the time, against 0–56%.
- Domain-neutral Players stay quiet 100% of the time.

**Reading.** Domain error falls by about a fifth in both runs. Calm, Body and Order rank Players noticeably better, and the Domain share of regret falls by a third. Fury gets worse, because v3's four Fury items were its strongest, and Chaos stays weak. Exact #1 agreement doesn't move. Top fits sit about a point apart, so the #1 is a noisy target, and top-3 overlap and regret are the better guides. The role-players showed no agree-with-everything drift: item means ran from −0.34 to +0.25.

**Item validity** is the Spearman rho of each item's signed answer against true Domain, pooled over both runs:

| Domain | Keying | Statement | rho |
| --- | --- | --- | --- |
| Fury | forward | I love units that hit harder when they're the one attacking. | 0.76 |
| Fury | forward | I love units that give me a bonus each time they conquer a battlefield. | 0.70 |
| Fury | reverse | Decks built around dealing damage to enemy units feel dull to me. | 0.10 |
| Calm | forward | I love stunning enemy units so they deal no combat damage this turn. | 0.89 |
| Calm | forward | I love units that give me a bonus each time they hold a battlefield at the start of my turn. | 0.50 |
| Calm | reverse | Decks built around tough units that take the hits first for my other units feel dull to me. | 0.51 |
| Mind | forward | I love cards that draw me extra cards. | 0.92 |
| Mind | forward | I love making enemy units smaller. | 0.35 |
| Mind | reverse | Decks built around gear that gives me something every turn feel dull to me. | 0.40 |
| Body | reverse | Decks built around a few huge, expensive units feel dull to me. | 0.88 |
| Body | forward | I love giving each of my units a lasting +1 might buff. | 0.41 |
| Body | forward | I love cards that give me an extra rune for the rest of the game. | 0.21 |
| Chaos | reverse | Decks full of tricks and surprise plays feel unfair to me. | 0.63 |
| Chaos | forward | I love discarding cards I don't need so I can draw new ones. | 0.53 |
| Chaos | forward | I love bringing cards back from my trash to play them again. | 0.35 |
| Order | forward | I love filling the board with lots of small 1-might soldier units. | 0.76 |
| Order | forward | I love units that leave something behind when they die. | 0.40 |
| Order | reverse | Decks that kill their own units to power up other cards feel wrong to me. | 0.28 |

**Costs and open questions.**
- **Length.** The quiz grows from 27 to 33 items, and 22 of them are agree/disagree statements (v3 had 4). That moves away from concrete scenarios, which the 2026-09-23 question-design research favoured.
- **Weak items.** Replace or reword five items before any adoption:
  - Fury damage (0.10)
  - Body ramp (0.21): control players like ramp too
  - Order sacrifice (0.28)
  - Mind shrink (0.35)
  - Chaos trash (0.35)
- **Hybrid option.** Keep v3's strongest Fury scenarios and use statements only where forced choice failed (Calm, Order, Mind). That would also cut the length.
- **Real people.** Role-players showed no acquiescence. Real people usually do, so a small human pilot should check it.
