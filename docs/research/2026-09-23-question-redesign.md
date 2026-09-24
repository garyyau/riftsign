# Question redesign from first principles (2026-09-23)

Draft set: `docs/research/drafts/questions-v2.json` (version `2026-10`, 26 Questions, 22 of them strength-scale scenarios, 4 statements). Not yet integrated: the scoring code is being changed in parallel and `src/data/questions.json` is untouched.

Inputs: the two audits summarised in the brief, `docs/research/2026-09-23-quiz-question-design.md`, `docs/research/2026-09-22-domain-archetype-identities.md`, and the 52 rated Builds in `src/data/legends/`. Pool medians: pace 4.5, stance 6, complexity 6.5, variance 5.5.

## 1. Sources of signal considered

| Source | Verdict | Why |
|---|---|---|
| In-game moments | Keep as backbone (8 items) | Closest to revealed preference; concrete framing predicts concrete choices. Pace, stance and Domain items all have one. |
| Invented-card choices | Keep (6 items) | The only way to measure what Domain cards *do* without naming cards. Two cards at the same cost is a clean forced trade-off with no "correct" answer. |
| Deck-building slots ("add one" / "cut one") | Keep (6 items) | "Cut one" is the best keying device found: cutting the swingy card is a *steady* signal, so the natural direction of the item flips and acquiescence has nothing to grab. |
| Forced trade-offs | Keep, as the default shape | Nearly every item is a two-pole trade-off on one Axis, shown on the 4-point strength scale. No neutral point, so "leaning" is the mildest answer. |
| What frustrates them / how they'd like to lose | Keep (1 item, `painful-loss`) | Which loss stings more reveals the plan they were on without asking them to rate themselves. Only pace got a clean mapping; a variance version ("losing to a bad draw") reads as a correct answer, so it was dropped. |
| How they'd like to win | Keep (2 items) | `which-win` survives; `finisher-or-spread` targets the single-finisher pattern that separates Builds of one Legend (Fiora Combo, Garen Control, Sivir). |
| League of Legends roles and playstyles | Cut | Most Players come from LoL, but not all, and the spec says not knowing LoL must not affect the result. The mapping is also loose (is a top-lane bruiser Body or Fury?). Better as an optional flavour item later. |
| Other card games or board games | Cut | Beginners often have neither; when they do, "engine builder vs area control" maps to complexity at best, weakly. |
| Why they play (win / express / tinker / socialise) | Cut | Flavour. None of the four motives sits on any of the seven Axes. "Tinker" leans complexity, but `engine-or-pieces` measures that directly. |
| Past decks they have enjoyed | Cut | Most Players have no Riftbound deck history; the champion picker already captures "I like this character". |

## 2. The current 25: keep, rewrite or cut

| Current id | Decision | Reason |
|---|---|---|
| `opening-hand` | Rewrite → `first-turn` | Ramp vs pressure is the real turn-one choice. The third "flexible" answer cross-loaded stance. |
| `long-games` | Cut | Self-description with a complexity cross-load. Pace statement re-keyed the other way as `quick-games`. |
| `stabilising` | Cut | Three answers with variance and complexity cross-loads; "go all in" reads reckless. |
| `which-win` | Keep (now scale) | Same idea, same answer ids. |
| `scary-play` | Cut | Ignoring a scary play reads as wrong. Replaced by `hold-or-spend`, where both lines are skilled. |
| `hand-full-of` | Rewrite → `units-or-answers` | Same idea as a deck-building slot; pace cross-load dropped. |
| `shutting-down` | Keep, reworded | Same idea as a concrete moment ("commits to a play and I have the exact answer"). |
| `racing` | Cut | "Wait for them to overcommit" sounds smarter; complexity cross-load. |
| `reading-cards` | Cut | 45 of 52 Builds pick "three ways to use it". Replaced by `engine-or-pieces`, which makes the simple deck attractive. |
| `punishing-deck` | Cut | "Exhausting" is self-deprecating; the −0.5 third answer is a hedge, not a pole. |
| `straightforward` | Rewrite → `one-clear-job` | Drops the "perfectly vs 80 percent" framing that made one side correct. |
| `favourite-turn` | Cut | Chain vs biggest cross-loaded variance and stance. `card-order` measures sequencing alone. |
| `coin-flip-card` | Rewrite → `cut-one-card` | Same card, but the cut framing reverse-keys it. |
| `consistency` | Cut | 55% vs 50% is a maths question. |
| `game-night-story` | Cut | Flavour with a pace cross-load. |
| `behind-on-board` | Cut | "Claw it back" reads as the disciplined answer; pace cross-load. |
| `table-mood` | Cut | Temperament, not Fury or Calm cards; pace cross-load. |
| `fired-up` | Cut | Temperament; stance cross-load. |
| `battle-cry` | Cut | Pure flavour. Fury/Calm now has four mechanical items. |
| `win-because` | Cut | "Outsmarted" is the flattering answer; complexity cross-loads both ways. |
| `spells-over-creatures` | Rewrite → `cut-unit-or-draw`, `biggest-card` | Same preference, measured as deck choices with balanced keying. |
| `ideal-crew` | Cut | Flavour. |
| `game-plan` | Cut | Measures variance, not what Chaos or Order cards do. |
| `break-the-rules` | Cut | Self-image; variance cross-load. |
| `rules-are` | Cut | No link to any card. |

Kept ids: `which-win`, `shutting-down`. Everything else is new, so stored answers from `2026-09` will not carry over; the version bump makes that explicit.

## 3. Composition of the new set

Principles applied:

- **Every two-pole item contrasts the two poles of one Axis.** Most Answers move one Axis by ±2. Cross-loads (±1 on `mind-body`) appear only where the pool supports them: ramp is Body (Volibear, Garen Control, Fiora Combo, Sivir), a spell-heavy deck is Mind (Lux, Kai'Sa Control, Ezreal), face-down cards are Mind as well as Chaos. No Domain item touches pace, stance or variance, which removes the Fury↔pace and Order↔variance correlations the old set manufactured.
- **Domain items measure card behaviour.** Fury: damage, attacking, conquering. Calm: stun, hold, move, protect. Mind: draw, gear, face-down cards, hand size. Body: ramp, huge units, buffs. Chaos: discard as a cost, trash recursion, face-down surprises. Order: tokens, sacrifice, deaths that pay off. One flavour-adjacent item (`formation-or-tricks`) on Chaos/Order, still anchored to mechanics.
- **Stance is measured without speed cues** (hold runes vs spend, units vs answers, having the exact answer waiting), so the 0.92 pace/stance correlation in the pool is at least not amplified by the Questions.
- **Complexity items make the simple side attractive** ("spend your attention on your opponent", "cards strong enough that the order takes care of itself", "one clear job") so the split sits nearer the 6.5 median instead of 45/52.
- **Variance is about deck shape**, not gambling appetite: cut the bomb or the steady card, all-in or measured attack, one finisher or many threats, best-days statement.
- **Keying.** Reverse means the first-listed Answer (or agreeing) moves the Axis low. First-listed pole: 10 high, 12 low across the 22 scenarios. Statements: 2 agree→high, 2 agree→low. No two adjacent Questions load the same Axis. Eyebrows name the situation ("Cut one", "Two spells", "The wall"), never the Axis.

| Axis | Primary loads | Reverse-keyed | Items | Secondary ±1 |
|---|---|---|---|---|
| pace | 4 | 2 | first-turn, which-win, painful-loss, quick-games (stmt) | 0 |
| stance | 3 | 2 | units-or-answers, hold-or-spend, shutting-down (stmt) | 0 |
| complexity | 3 | 2 | engine-or-pieces, card-order, one-clear-job (stmt) | 0 |
| variance | 4 | 2 | cut-one-card, all-in-or-measured, best-days (stmt), finisher-or-spread | 0 |
| fury-calm | 4 | 2 | damage-or-stun, hold-or-press, protector-or-striker, big-enemy-unit | 0 |
| mind-body | 4 | 2 | draw-or-ramp, biggest-card, cut-unit-or-draw, edge-hand-or-board | 4 (2 toward each pole) |
| chaos-order | 4 | 2 | tokens-or-trash, discard-or-sacrifice, token-or-face-down, formation-or-tricks | 0 |

Stance and complexity sit at the 3-item floor because pace already carries most of what stance would add in this pool, and complexity has the narrowest usable range (2.5 to 9, most Builds 6 to 7.5). If the integrated scoring shows either Axis is noisy, the next candidates are a stance item on "threats they must answer vs answers to their threats, late game" and a complexity item on hidden information.

## 4. Walkthroughs

Run with a local reproduction of `computeProfile` (scale answers apply full or half moves) against all 52 Builds. Script not kept in the repo.

**Fast unit-swarming beginner.** Pressure on turn one, damage over stun, units over answers, leaning tokens, engine deck, turn-four win, press on, all-in attack, spend every rune, order barely matters, "they stabilised" stings, striker unit, two bodies, cut the draw spell, disagrees with waiting for the exact answer, strongly wants quick games, attacks into the wall, one clear job, edge on the board, spread threats. Profile: pace 10, stance 9.2, complexity 0.8, variance 6.3, Fury −5, Body +3, Order +1.9. Top five: Renekton (Fury/Body Aggro) 81, Rengar 76, Darius (Fury/Order Tempo) 75, Lucian 71, Vi 70. Right region, right Domains.

**Patient control player who loves Fury.** Ramps on turn one, but picks damage over stun and attacks into the wall; leans hold and protector because they like holding ground. Answers over units, keeps runes back, strongly agrees with having the exact answer, turn-nine win, "two turns short" stings, huge unit as headline, extra rune over draw, cut the draw spell, measured attack, leans one finisher. Profile: pace 0, stance 0, complexity 6.7, variance 3.8, Fury −2.5, Body +2.5, Order 0. Top five: Volibear (Fury/Body Control) 75, Miss Fortune 73, Poppy 73, Jayce 72, Garen Control 69. The Fury lean survives two Calm-flavoured picks because three of four Fury/Calm items are about damage versus stun, not mood.

**No Domain preference, midrange habits.** Leaning answers on every Domain item, alternating sides so they cancel; moderate pace and stance, steady variance. Profile: pace 6.3, stance 6.7, complexity 5.8, variance 2.5, all Domains within ±0.3. Top five: Akali (Fury/Calm Midrange) 89, Jayce (Mind/Body Combo) 81, Kennen (Order/Chaos Tempo) 79, Lucian 73, Ornn 72. The Questions behave (Domain scores near zero), but the pool rewards a neutral Domain profile with the three opposite-pair Legends, which sit at 0 on one Domain Axis. That is a matching-side issue already noted in the 2026-09-22 research, not something Questions can fix.

## 5. Open risks

- **No neutral point on the scale.** A Player with no preference must pick "leaning" one way, so four items on an Axis can leave a raw ±1 to ±2 that reads as "leaning Fury" rather than "balanced". If early results show many spurious Domain leans, either widen the balanced band or let the scoring treat opposing leanings as cancelling (they already do arithmetically; the risk is a Player who leans the same way four times by habit).
- **Opposite-pair Legends attract neutral Players.** See walkthrough 3. Worth a matching-side rule (for example, only surface Akali, Jayce and Kennen as top Match when the Player's other Domain Axes also fit) rather than a Question change.
- **Mechanics I stated in general terms because the research only partly supports them.** "Move it out of the way" for Calm (repositioning is attributed to Calm on the LoL wiki and to Chaos on riftbound.gg); "returns a card from your trash" for Chaos (riftbound.gg lists "Interact with Trash" for Chaos, and I have not seen a card); "gives you an extra rune for the rest of the game" for Body (ramp is Body's theme, but specific rune-generating cards appear in several Domains). If a reviewer knows a wording is off, swap the mechanic and keep the item shape.
- **`trash` as a word.** The basic rules call the discard pile the trash, so beginners should know it, but `tokens-or-trash` and `formation-or-tricks` use it without a gloss. If testers stumble, "discard pile" is the fallback.
- **Complexity split.** The three items are written to pull the "simple" answer toward the median, but that is a judgement call. Check the distribution of `engine-or-pieces` once real answers exist; if 80%+ still pick "pieces", the simple text needs to promise more.
- **Stance at three items.** With pace and stance correlated at 0.92 across Builds, three stance items are enough to place a Player, but a Player who is fast and reactive (or slow and proactive) has few chances to say so. Live results will show whether that Player exists in numbers.
- **`first-turn` cross-load.** Ramp on turn one moves `mind-body` +1 toward Body. Nasus (Calm/Mind) and Jhin (Fury/Mind) also build toward big turns, so a Mind ramp player loses half a point of Mind here. Accepted because five of the seven ramp Builds are Body.
- **`scale` is not yet in `schemas.ts`.** The draft carries `"scale": true` on 22 items as instructed; validation will reject it until the parallel scoring change lands.
- **Persona fixtures in `src/lib/personas.test.ts` reference old ids** and will need rewriting when this set is integrated. The walkthrough answer sets above are a starting point for three of them.
