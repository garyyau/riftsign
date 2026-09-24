# Quiz v3 Question set (2026-11): rationale and review

Committed as `src/data/questions.json` (version `2026-11`, 27 Questions: 23 strength-scale scenarios, 4 statements). v2 had 26 Questions and 791 words; v3 has 888 words (33 per Question against v2's 30), so it stays inside v2's under-5-minute timing. Follows `v3-contract.md`: Domain items are zero-sum forced choices (+2 chosen Domain, −2 the other; Leaning gives half), each Domain has reach 8 (4 items × 2), score = 5 + raw/8 × 5.

Card-pool evidence below is from the Riftcodex dump (`%TEMP%\riftsign\cards.json`): Legends, Runes, Battlefields and alternate-art duplicates removed, dual-Domain cards counted under both Domains, about 145 cards per Domain. Rows for items changed after review use the reviewer's re-count (`review.md`, about 142 per Domain); the two counts differ by at most 2. Numbers read "Domain A count vs Domain B count".

## 1. Domain items

All 12 pairs are distinct, so no pair repeats. Every Domain appears in exactly 4 items and is listed first in exactly 2 of them.

| id | Domains | First answer | Second answer | Evidence |
|---|---|---|---|---|
| `damage-or-stun` | Fury / Calm | Deals 2 damage to an enemy unit | Stuns an enemy unit (no combat damage this turn) | "Deal N" spells and gear Fury 21 vs Calm 2; stun Calm 14 vs Fury 0 |
| `shrink-or-buff` | Mind / Body | Shrinks their unit this turn | Makes your unit bigger this turn | −N might Mind 18 vs Body 0; +N might this turn Body 16 vs Mind 8, permanent buff 12 vs 0 |
| `discard-or-sacrifice` | Chaos / Order | Discard a card (draw a fresh one) | Give up one of your units | discard Chaos 17 vs Order 0; kill your own unit Order 11 vs Chaos 3 |
| `ready-or-look` | Fury / Mind | Can enter ready for extra, attacks the turn it lands | Looks at the top three cards when it lands, you draw one | Accelerate Fury 11 vs Mind 4, "enters ready" 18 vs 4; look-at-top Mind 9 vs Fury 1 (reviewer's count) |
| `hold-or-deathknell` | Order / Calm | Leaves two 1-might soldiers when it dies | Draws a card each time it holds a battlefield | Deathknell Order 12 vs Calm 3, Recruit tokens 10 vs 0; "when I hold" Calm 11 vs Order 2, draw Calm 25 vs Order 12 |
| `rune-or-assault` | Body / Fury | Extra rune for the rest of the game when it lands | Hits harder whenever it's the one attacking | channel a rune Body 5 vs Fury 0 (plus the Volibear and Fiora Legend abilities); Assault Fury 24 vs Body 4 |
| `dig-or-huge` | Chaos / Body | Discard your hand, then draw four | A huge unit, bigger than almost anything they can play | discard-then-draw Chaos 11 vs Body 0; units with 6+ might Body 21 vs Chaos 14, 6+ cost 23 vs 17 (weakest Body claim, see risks) |
| `tank-or-hidden` | Calm / Chaos | Takes the hits first for units fighting alongside it | Hidden face down at a battlefield, sprung later | Tank Calm 10 vs Chaos 1; Hidden units Chaos 7 vs Calm 0 |
| `gear-or-trash` | Mind / Chaos | Gear that draws a card every turn | Spell that plays your best unit from the trash free | non-Equipment gear Mind 15 vs Chaos 11, draw without discard 27 vs 10; play from trash Chaos 15 vs Mind 4 |
| `grower-or-soldiers` | Body / Order | Each conquer gives one of your units +1 might for the game | Brings two 1-might soldiers when it arrives | "when I conquer" Body 11 vs Order 3, buff counters Body 12 vs Order 6; Recruit tokens Order 10 vs Body 0, any unit token 16 vs 1 |
| `kill-or-conquer` | Order / Fury | Kills an enemy unit with 2 might or less when it lands | Deals 2 damage to an enemy unit each time it conquers | kill an enemy unit Order 19 vs Fury 5; conquer triggers Fury 11 vs Order 3, damage Fury 30 vs Order 2 (reviewer's count) |
| `move-or-shrink` | Calm / Mind | Sends an enemy unit back to its base when it lands | Shrinks an enemy unit by 2 whenever it fights | move an enemy unit Calm 8 vs Mind 1; −N might Mind 18 vs Calm 2 |

Dropped pairs. Twelve distinct pairs with every Domain appearing four times means leaving out one perfect matching of the six Domains. The pool picks it: **Fury/Chaos** share discard (14 vs 17) and trash recursion (9 vs 15); **Calm/Body** share permanent buffs (10 vs 12), ramp (6 vs 5) and Deflect; and once those two go, **Mind/Order** is forced out with them. Mind/Order is writable (shrink 18 vs 1 against Deathknell 12 vs 5) and is the first candidate if a 13th item is ever wanted.

Faces per Domain (so one liked mechanic doesn't carry a whole score): Fury = damage spell, Accelerate, Assault, conquer trigger. Calm = stun, hold, Tank, move-away. Mind = shrink ×2, card selection, gear engine. Body = buff, ramp, huge unit, conquer buff. Chaos = discard as cost, dig, Hidden, trash. Order = sacrifice, Deathknell, tokens, kill. Hidden (Mind 12 / Chaos 13) appears only as Chaos's face, in `tank-or-hidden`, and stun only as Calm's, so neither shared mechanic can manufacture a lean in a Domain the Player didn't choose.

Per-Domain appearances: Fury 4, Calm 4, Mind 4, Body 4, Chaos 4, Order 4. Pair-coverage matrix (1 = one item):

|       | Fury | Calm | Mind | Body | Chaos | Order |
|-------|------|------|------|------|-------|-------|
| Fury  |  –   |  1   |  1   |  1   |   0   |   1   |
| Calm  |  1   |  –   |  1   |  0   |   1   |   1   |
| Mind  |  1   |  1   |  –   |  1   |   1   |   0   |
| Body  |  1   |  0   |  1   |  –   |   1   |   1   |
| Chaos |  0   |  1   |  1   |  1   |   –   |   1   |
| Order |  1   |  1   |  0   |  1   |   1   |   –   |

Kept from v2 unchanged in meaning: `damage-or-stun` (now says "combat damage"), `shrink-or-buff`, `discard-or-sacrifice`. Removed: `tokens-or-trash`, `draw-or-ramp`, `hold-or-press`, `biggest-card`, `protector-or-striker`, `token-or-face-down`, `move-or-attack`, `formation-or-tricks`, `edge-hand-or-board`. Their mechanics survive in the new items. `first-turn` loses its +1 mind-body cross-load: Domain scores now come only from Domain items, so a Domain the Player never chooses stays at exactly 5.

## 2. Variance and combo changes

Variance now means luck, gambles and all-or-nothing swings.

- `finisher-or-spread` → `swingy-or-spread`. "One big finisher the whole deck is built to find" was a planned payoff, which the contract calls complexity. Now: "A few explosive cards, so the game turns on whether you draw them in time" vs "Many solid threats spread across the deck, so no single draw decides the game."
- `best-days`: "unbeatable on its best days" → "unbeatable when the draws line up and falls apart when they don't", so the swing is explicitly luck.
- `cut-one-card` (good draw / bad draw) and `all-in-or-measured` (all-or-nothing on whether they hold an answer) already fit and are unchanged.

Combo signal: new `strongest-or-setup`, "The turn you enjoy most is..." — "One where every card you play does its job without needing the others" (complexity −2) vs "One where cards you set up over several turns finally click together" (complexity +2). No variance, no jargon. Complexity now has 4 items keyed 2 forward / 2 reverse. The brief asked for a slight pace-low load on the setup answer; it was dropped after review because the pool doesn't support it (Combo Builds have median pace 4 against 4.5 for all Builds, Control 2, Midrange 4.5), so it would have tied "standalone cards" to speed on no evidence. Pace reach stays 8.

Ordering: playstyle and Domain items alternate; no two adjacent Questions touch the same score (checked programmatically). Scenario first-listed poles: pace 1 high / 2 low, stance 1/1, complexity 2/1, variance 1/2; statements 2 agree→high, 2 agree→low.

## 3. Walkthroughs

Scored with a local reproduction of the contract's scoring (strong = full move, leaning = half). Reach 8 per Domain.

**Loves Fury and Calm cards.** Strong Fury in the three Fury cross items, strong Calm in the three Calm cross items, leans Fury in `damage-or-stun`. Leans on the five items touching neither (Mind, Order, Body, Chaos, Order in turn). Result: **Fury 9.4, Calm 8.1**, Mind 2.5, Body 3.1, Chaos 3.1, Order 3.8. Both lead clearly; a Fury/Calm Legend pays almost nothing on the Domain term. Under v2's bipolar Axis this Player would have scored about 0 on fury-calm and read as "no preference".

**Likes Mind, dislikes Chaos, neutral otherwise.** Strong Mind in all four Mind items, strong against Chaos in the three non-Mind Chaos items, leans alternately elsewhere. Result: **Mind 10.0, Chaos 0.0**, Fury 4.4, Calm 5.0, Body 5.0, Order 5.6. The Chaos dislike hands +2 to whichever Domain shares each Chaos item (Order, Body, Calm once each), so it spreads thin instead of manufacturing an Order lean as v2's chaos-order Axis did.

**No Domain feelings at all.** Leans the first-listed answer on every Domain item. Because each Domain is listed first exactly twice, every score is **exactly 5.0**. With random leaning answers instead, each Domain has a 12.5% chance of reaching |score − 5| ≥ 2.5 (all four of its ±1 moves agreeing) and a 0% chance of reaching 3.0. See risks.

**No Domain feelings, always picks the card that sounds stronger.** My reading of "stronger" per item, Strong unless the pair is close: stun (lean), buff (lean), discard over losing a unit, look at three (lean), draw on hold over two soldiers, extra rune over Assault, huge unit over the dig, Hidden (lean), gear engine over trash play, two soldiers over a conquer buff, guaranteed kill (lean), shrink-in-fights over send-to-base. Result: **Fury 1.9**, Calm 5.0, Mind 7.5, Body 6.9, Chaos 4.4, Order 4.4. Before the review this Player scored Fury 1.2 and Calm 5.6; rebalancing `damage-or-stun` (2 damage against one stun) fixed that item, but the pull is structural: every Fury answer is a tempo effect, and against a rune, a card pick, a kill or an engine a value-minded Player rates tempo lower. See risks.

## 4. Open risks

- **Spurious leads from leaning-only answers.** Reach 8 means four Leanings the same way already give |score − 5| = 2.5. Retune the highlight threshold with `pnpm simulate`; 3.0 or higher would need at least one Strong answer. The forced choice has no neutral point, so this is the main way a genuinely neutral Player gets a highlighted Domain.
- **Dislike spillover.** Zero-sum moves mean strongly disliking one Domain adds +2 to each of its four partners (+1.25 on each partner's score if otherwise neutral). Spread across four Domains this is mild, but a Player who dislikes two Domains that share a partner pushes that partner up by 2.5.
- **Fury reads as the weaker card to indifferent Players.** The power-picker walkthrough lands Fury at 1.9 with no Fury feeling at all. Simulate an "indifferent, picks the stronger card" persona, and if the pull shows up there too, the fix is to give one Fury answer lasting value (for example a conquer trigger that also draws) rather than to weaken the partner answers further.
- **Body's markers are diffuse.** Ramp in card text is Calm 6 vs Body 5; Body's ramp identity rests on the Volibear and Fiora Legend abilities and the sources. Big units are only weakly Body (6+ might 21 vs Chaos 14). Body is never paired with Calm here, and its buff and conquer faces lead their partners 2 to 1 or better.
- **Order's kill face and Fury's conquer face go beyond the contract's lists.** Kill is Order 19 vs Fury 5 and is on riftbound.gg's Order list; conquer triggers are Fury 11 vs Order 3 but Body 11 too, so `kill-or-conquer` relies on the Fury answer also dealing damage (Fury 30 vs Order 2).
- **Repeated faces.** Mind has two shrink effects (spell, then unit) and Chaos two discard effects (as a cost, then as a dig). A Player who likes exactly one of those mechanics gets a stronger lean than a Player who likes any other single face.
- **Lesser-evil item.** `discard-or-sacrifice` is the only item that asks the Player to choose a cost, so a Player who dislikes both still produces a lean. "Smallest units" narrows the gap; rewriting it as two rewards would duplicate Deathknell.
- **Rules wording.** The reviewer's rules pass found no contradictions after the `dig-or-huge` fix: Accelerate ("enter ready for a little extra"), send-to-base, hold timing ("at the start of your turn"), stun (combat damage only) and Tank ("assigned combat damage first") all match printed reminder text.
- **Time.** 27 Questions and 888 words, 12% more text than v2. Confirm on a phone once the strength-scale UI has been looked at, which the v2 evaluation noted is still outstanding.
- **Engine assumptions.** Domain items carry two `loads` entries (`reverse: false` on the Domain the first answer raises, `true` on the other). Three-card items were allowed by the contract but none are used, so the scale applies to every Domain item and the engine needs no new move shape. Persona fixtures referencing the nine removed ids will need rewriting.

## 5. Post-review changes

Applied from `review.md` (independent fact-check, 2026-09-23). Every replacement keeps its item's position, Domain pair and first-listed Domain, so the invariants (each Domain in 4 items and first twice, zero-sum moves, no adjacent shared score, ≥3 loads per score) were re-checked by script and hold.

- **Replaced `damage-or-draw` with `ready-or-look`** (Fury/Mind). Spells dealing 4+ are Fury 8 vs Mind 8, so the Fury side carried no signal. Now Accelerate (Fury 11 vs Mind 4) against look-at-the-top-three (Mind 9 vs Fury 1).
- **Replaced `stun-or-assault` with `kill-or-conquer`** (Order/Fury). Stun is Calm's face in `damage-or-stun`; crediting it to Order would have turned a stun fan's second stun pick into an Order lean. Now kill (Order 19 vs Fury 5) against damage-on-conquer (Fury 11 vs Order 3). "Kills" rather than the reviewer's "Destroys", since kill is the printed term.
- **`rune-or-ready` → `rune-or-assault`.** Accelerate is partly Body (Fury 11 vs Body 5; Body's Accelerate cost is a Body rune), so the Fury side is now Assault (Fury 24 vs Body 4). This also frees Accelerate for `ready-or-look`.
- **`grower-or-soldiers`.** Buff counters cap at one per unit, so no card grows +1 on every conquer. Now each conquer buffs one of your units; conquer is Body 11 vs Order 3.
- **`dig-or-huge`.** "Wins any fight it's in" was false (stun, shrink and damage all beat it) and a power pull. Now "bigger than almost anything they can play".
- **Fairness tweaks.** `damage-or-stun`: 3 damage → 2, and (my version of the same fix) two stuns → one, since "stuns two" out-powered 2 damage for the power picker. `discard-or-sacrifice`: dropped "(you'll draw a fresh one)", sacrifice is "one of your smallest units". `hold-or-deathknell`: both payoffs named. `strongest-or-setup`: neither side sounds more skilled; pace ±1 dropped (see section 2). `swingy-or-spread`: spread gets a downside, swingy gets its upside. `tank-or-hidden`: "fighting alongside it", "at a battlefield".
- **Evidence table** re-based on the reviewer's re-counts for changed rows; the old damage (21 vs 14) and permanent-buff (12 vs 6) rows backed claims the items no longer make.
- **Agreed, for the engine:** set the Domain highlight threshold at 3.0 or higher so four Leaning answers cannot highlight a Domain, and add an indifferent power-picking persona to `pnpm simulate`.

## 6. Fact-check review (summary)

An independent reviewer re-counted the Riftcodex dump on 2026-09-23: 810 cards after removing Legends, Runes, Battlefields and duplicates, about 142 per Domain. They checked rules claims against riftbound.gg's beginner guide and printed reminder text. Section 5 applies every change they asked for.

- **Five confirmed errors in the first draft.** `damage-or-draw`'s Fury side carried no signal (4+ damage spells are Fury 8 vs Mind 8). `stun-or-assault` credited Calm's stun to Order. `grower-or-soldiers` claimed stacking growth, which buff counters don't allow. `dig-or-huge` said "wins any fight", which is false. `rune-or-ready`'s Fury side was partly Body (Accelerate is Fury 11 vs Body 5).
- **Rules.** Apart from `dig-or-huge`, they found no contradictions. Accelerate, send-to-base, hold timing, stun and Tank all match the reminder text.
- **Structure, checked by script.** 27 unique ids. Every score has at least 3 loads, and keying matches the sign of the first answer. Every Domain item is zero-sum, each Domain is listed first twice, and no adjacent Questions share a score.
- **Zero-sum risks they flagged.**
  - A forced choice hides genuine double affinity.
  - Indifferent Players decide on power, so they all drift the same way rather than at random.
  - `discard-or-sacrifice` is a lesser-evil choice.
  - Their fix for the last two: a highlight threshold of 3.0 or more, plus simulating an indifferent power picker. Section 4 and the engine's `pnpm simulate` cover both.
