# Deck rubric: scoring one deck list on the playstyle Axes

Date: 2026-09-25
Related:
- .claude/skills/ingest-legends/deck-rubric.md (the rubric itself)
- .claude/skills/ingest-legends/tools.ts (`deck`, `card`, `score`)
- docs/adr/0005-six-independent-domain-scores.md (Variance means luck and bets, not assembled payoffs)

## Question

Legend Builds were placed on the four playstyle Axes relative to other Builds, and those Builds traced back to Archetype templates nudged by one-line notes. Nothing tied a coordinate to the cards in a deck, and the quiz's Axis definitions had moved since (ADR 0005, ADR 0006). Can a deck link be turned into Pace, Stance, Complexity, Variance and an Archetype in a way that is repeatable, matches how the community describes the deck, and works for cards the rater has never seen (Radiance, 2026-10-23)?

## Answer

Yes, with a hybrid. The rater tags every card with one role and some flags, writes a holistic judgment of the deck, and `tools.ts score` averages a formula over the tags with that judgment.

- **Repeatable.** Two independent raters' final scores differ by 0.1 to 0.4 points per Axis on average, in every round, including Legends the rubric had never seen.
- **Valid about as far as the evidence can show.** Final scores rank decks against outside descriptions about as well as, or better than, careful blind judgment alone: Pace 0.72 to 0.79, Stance 0.59 to 0.73, Complexity 0.58 to 0.66 in the two large rounds. Variance is the weak Axis (0.37 to 0.47), limited as much by the evidence as by the rubric: outside sources rarely say anything about luck.
- **New cards.** Raters never relied on memory: every card's text came from the deck sheet or `tools.ts card`, and most Vendetta cards postdate the models' training anyway.

## Sources

- **Deck lists:** Piltover Archive's public API (`sources.md`). The deck endpoint carries every card's text, cost and Might, but leaves out Equipment's attached Might and effect; the card-search endpoint has them (`mightBonus`, `effect`), and `tools.ts deck` merges them in.
- **Card text:** Riftcodex (`/cards/name?fuzzy=`), falling back to Piltover Archive.
- **Outside evidence, per deck:** archetype labels (riftbound.zone, hextechanalytics, riftbound.gg, riftboundguide.com, riftstorm.gg), hextechanalytics' difficulty tags (Beginner, Intermediate, Advanced), and short quotes on speed, interaction and luck, gathered by Sonnet agents for 30 Legends. Each deck got an ordinal target per Axis (speed 1 to 3, proactive 1 to 3, difficulty 1 to 3, swingy 1 to 3) read from those quotes, plus the set of labels sources gave.
- **Game facts:** rules and archetype writing from playriftbound.com, riftbound.zone guides and riftcompare.com; a keyword glossary built from all 954 Riftcodex cards.

Findings from the sources that shaped the rubric:

- Riftbound has no randomness in combat and no "search your deck" effects, and no card uses the word "random". Luck comes only from draws and effects on unseen cards (reveal-the-top conditions, Burn). Predict and Vision are chosen smoothing, not luck. So Variance has to come mostly from deck structure.
- Riftbound writers describe archetypes by curve and card mix: Aggro is "bottom-heavy", "rarely above four"; Tempo carries "more reactive spells than an Aggro list"; Combo "trades consistency for explosive potential".
- Community advice treats full playsets as consistency ("the more cards you run at 3x, the more consistently your deck will execute its plan").

## Method

Three rounds of blind rating by Opus agents. Raters saw the rubric and the deck, never the outside evidence or the Legend files. Each deck was rated by two raters independently. Raters wrote their holistic judgment before running the scorer and did not change tags afterwards.

| Round | Decks | Ratings | Rubric | Purpose |
| --- | --- | --- | --- | --- |
| 1 | 27 | 54 | v1 | calibration |
| 2 | 24 new | 48 | v2, formulas frozen before rating | out-of-sample test |
| 3 | 8, from 8 Legends not rated before | 16 | final | end-to-end check |

Rounds 1 and 2 cover several Legends with two clearly different styles (Fiora Aurora and Baited Hook, Lux combo and control, Rek'Sai low-curve and Void Rush, Viktor spell and unit). The rubric should, and does, separate them.

## Results

### Round 1: v1 formulas

Tags were reliable from the start (90% of cards got the same role from both raters), but the first formulas were not:

| | Pace | Stance | Complexity | Variance |
| --- | --- | --- | --- | --- |
| Formula vs rater's own judgment, mean gap | 1.34 | 1.02 | 1.76 | 2.93 |
| Rank agreement with outside evidence, formula | 0.58 | 0.58 | 0.42 | 0.18 |
| Rank agreement with outside evidence, holistic | 0.66 | 0.64 | 0.55 | 0.30 |

All eight raters named the same causes: Pace linear in average cost (ramp decks went below 0), a Variance baseline that only went up, Complexity blind to reaction-speed play, and Stance counting every trick as pressure. Which features track the outside evidence: unit count (speed and stance, 0.71 each); spell- and engine-heavy decks (difficulty, 0.56); ramp (+0.52), toolbox 1-ofs (+0.51) and removal (−0.50) for luck.

### Round 2: v2 formulas, frozen, on new decks

| | Pace | Stance | Complexity | Variance |
| --- | --- | --- | --- | --- |
| Rank agreement, formula | 0.75 | 0.58 | 0.37 | 0.42 |
| Rank agreement, holistic | 0.75 | 0.69 | 0.67 | 0.42 |
| Rank agreement, mean of the two | 0.78 | 0.62 | 0.56 | 0.51 |

Pace and Variance held up out of sample. Stance saturated at 0 and 10 when a deck had almost no answers or no pressure, and Complexity's setup flag had grown so broad that it no longer separated decks. The blend beat both halves where the formula was sound.

### Final protocol, cross-round validated

Stance and Complexity were refit, each round's weights coming only from the other round's ratings; Pace and Variance stayed as frozen before round 2. Archetype thresholds tuned on round 1 alone gave the same round-2 result as thresholds tuned on both.

| | Pace | Stance | Complexity | Variance | Rater gap (P/S/C/V) | Archetype in outside labels |
| --- | --- | --- | --- | --- | --- | --- |
| Round 2, holistic | 0.75 | 0.69 | 0.67 | 0.42 | 0.17/0.33/0.23/0.27 | 42/48 |
| Round 2, final | 0.77 | 0.65 | 0.66 | 0.47 | 0.10/0.19/0.21/0.23 | 38/48 |
| Round 1, holistic | 0.66 | 0.64 | 0.55 | 0.30 | 0.22/0.37/0.48/0.30 | 45/54 |
| Round 1, final | 0.72 | 0.59 | 0.58 | 0.37 | 0.22/0.26/0.33/0.31 | 46/54 |

Round 1 was tagged under v1 definitions, so its final numbers understate the current rubric.

### Round 3: new Legends

Akali, Ambessa, Ivern, Lucian, Ornn, Rumble, Shen and Vex, one Singapore RQ list each.

| | Pace | Stance | Complexity | Variance | Rater gap (P/S/C/V) |
| --- | --- | --- | --- | --- | --- |
| holistic | 0.52 | 0.73 | 0.22 | 0.06 | 0.38/0.31/0.19/0.38 |
| final | 0.32 | 0.73 | 0.31 | 0.13 | 0.38/0.19/0.13/0.13 |

Eight decks is too few for these correlations to mean much, and the outside evidence was thin: riftbound.zone labels six of the eight "Midrange", and luck quotes existed for five. Archetype matched outside labels for 6 of 16 ratings (8 of 16 for the raters' own calls). Most of the misses are that "Midrange" label against guide prose saying otherwise ("reactive rather than proactive" for Shen, which raters called Tempo; "primarily reactive/defensive" for Ivern, which they called Control). Ornn is a real miss: guides call it "super fast-paced" and "tempo-oriented", raters scored it Midrange at Pace 6. What round 3 does show is that reliability carries to unseen Legends: no Axis had formula and judgment 2+ apart on any of the 16 ratings.

## What changed along the way

- **Pace** counts cheap attackers, units and expensive cards instead of average cost, so ramp and cost-cheating decks no longer fall off the scale.
- **Stance** is a bounded pressure-against-answers balance plus bodies; reaction-speed tricks count as defence as much as attack, and token makers count as bodies.
- **Complexity** weighs reaction-speed cards and own-plan cards (engines, flow, ramp, value) more than printed setup keywords.
- **Variance** starts at 4 and moves both ways: luck, bets and ramp-into-payoff up; removal, card flow and full playsets down.
- **Tag rules** settle every ambiguity two or more raters hit: cantrips, attackers with removal effects, defensive tricks and gear, Gold, token makers, when a reveal counts as luck, when a sacrifice counts as a bet.
- **Tool fixes:** Equipment's attached text, the Champion zone's copies, Unit Gear counted as units, mana abilities not counted as reactions, exact-name card lookup with a Piltover Archive fallback.

## Limits

- **Outside evidence is coarse.** Labels disagree between sites, difficulty tags describe a Legend rather than a list, and luck is rarely discussed. Higher agreement numbers would need better evidence, not more rating rounds.
- **Variance** is the least validated Axis. Its terms follow the community's own account of consistency, and it separates the cases the quiz cares about (Aurora ramp decks score 5.5 to 7; Viktor's removal-heavy control lists, run almost entirely as playsets, 3 to 3.5), but its ranking against outside quotes is only moderate.
- **Archetype** agreement is about 80% on the large rounds; single borderline tags can flip Combo and Control in ramp decks, and Aggro and Tempo near the cutoffs. The rater's call is the answer; the scorer's suggestion is a check.
- **Scope.** Calibrated on Origins through Vendetta. Recheck with a small round after Radiance changes the card pool.

## Using it

- Score one or more decks: `/ingest-legends <piltoverarchive link> ...`, or follow `deck-rubric.md` by hand.
- Re-rating a Legend now scores two to four of its relevant decks and takes each Axis's median (`rating-guide.md`, Coordinates).
- Rater sheets, outside-evidence files and the evaluation scripts from this study are in `.scratch/` (gitignored): `rate/`, `rate2/`, `rate3/`, `gt*.json`, `final.ts` (cross-round validation), `r3.ts`.
