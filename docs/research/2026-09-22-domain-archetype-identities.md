# Domain and Archetype identities: are the Tempo and Combo Personas leaning the wrong way?

Compiled by a Sonnet 5 research agent, 2026-09-22/23. Investigates whether the Tempo and Combo Persona fixtures in `src/lib/personas.test.ts` lean the correct Domains, using Riot's own domain descriptions, a quantitative pass over the Riftcodex card API, the project's own 49 rated Legends in `src/data/legends/`, and community deck guides. Claims are cited inline; anything inferred rather than sourced carries a dagger (†). Only pages actually fetched and read are cited as read; pages seen only as a WebSearch snippet are marked "(search snippet, unread)" and weighted lower.

## Summary

1. **Domains mechanically**: Fury = fast damage/conquest ([riftbound.gg/domain-101](https://riftbound.gg/domain-101-understanding-the-five-domains-of-riftbound/), [wiki.leagueoflegends.com](https://wiki.leagueoflegends.com/en-us/Riftbound:Domain)); Calm = defensive tricks/holding; Mind = card draw and outsmarting; Body = ramp into big units; Chaos = unpredictable, discard-based; Order = go-wide, Deathknell/sacrifice value. In the rated Legend pool, Calm and Mind skew hardest toward Control/Midrange (Calm holds 0 Aggro and 0 Combo Legends of 16), Fury splits almost evenly between Aggro and Tempo, and Order actually pairs with Midrange more than Control.
2. **Tempo vs Combo, community-wise**: the community (and riftbound.gg's own three-archetype framework) treats Tempo as a variant of "efficient board pressure that reads the board," distinct from Aggro's "race before it matters," while Combo is consistently tied to Mind and Chaos domains for "assemble, then detonate" turns ([riftcompare.com](https://riftcompare.com/guides/riftbound-deck-archetypes-guide)). The maintainer's Jinx example is actually uniformly labeled Aggro, not Tempo, everywhere it's discussed. So "Jinx is Fury" supports Fury to Aggro at least as much as Fury to Tempo.
3. **Jinx (required)**: confirm Aggro, high confidence. **Mel (required)**: confirm Control, confidence raised to medium-high. Of the 16 further contested Legends budget allowed reaching, 2 are recommended for reconsideration (Master Yi Wuju Bladesman to Midrange, Irelia to Tempo, both medium confidence) and 2 more are flagged as newly contested without a confident recommendation (Draven and Kai'Sa, see §3).
4. **Persona recommendation**: the maintainer's belief about the current state was half right. Tempo genuinely leans the wrong way (Calm/Mind/Chaos) and should flip toward Fury and go neutral on the other two axes. Combo, however, already computes to neutral/neutral/strong-Mind once you do the arithmetic in `scoring.ts`. It only looks like it leans Calm/Chaos if you eyeball the answer text without summing the moves. Only the Tempo persona needs answer changes.
5. **Applied Tempo edits** (`src/lib/personas.test.ts`, `tricky tempo player`): `battle-cry: 'breathe' → 'burn'`, `fired-up: 'neutral' → 'agree'`, `table-mood: 'composed' → 'relentless'`. This swaps the Calm lean for Fury and keeps the Mind and Chaos leans. The fully neutral version first proposed in §4 failed the suite (see the correction there). No changes for Aggro, Midrange, Control or Combo Personas (Midrange has an optional single-answer tweak, §4).

---

## 1. Domain identities

### 1.1 What Riot and near-primary sources say

Two pages were fetched and read directly. [riftbound.gg/domain-101](https://riftbound.gg/domain-101-understanding-the-five-domains-of-riftbound/) is a fan site but is the most detailed mechanical breakdown found (keyword-level); [wiki.leagueoflegends.com/en-us/Riftbound:Domain](https://wiki.leagueoflegends.com/en-us/Riftbound:Domain) is a Riot-hosted wiki (community-editable, so not treated as fully official, but precise). Riot's actual rules site, [playriftbound.com](https://playriftbound.com/en-us/news/rules-and-releases/deckbuilding-primer/) (fetched), confirms the mechanical pairing (Fury-Calm, Mind-Body, Chaos-Order, one Legend fixes exactly two Domains) but its Deckbuilding Primer does not carry Domain flavor text. No dedicated Riot marketing or flavor page for the six Domains individually turned up despite searching.

| Domain | riftbound.gg domain-101 | wiki.leagueoflegends.com |
|---|---|---|
| Fury | "Aggression, Conquer, Recklessness, Damage." Accelerate/Assault keywords, heavy discard, "classic red aggro strategy." | Red. Damage-based removal, rewards conquering Battlefields. Weak card draw/non-combat removal. |
| Calm | "Defense, Hold, Moving, Negotiation, Reaction, Tricks." Defensive board control via tricks, not hard removal; "tempo-based gameplay." | Green. Defensive options and repositioning enemy units. Struggles with aggressive play. |
| Mind | "Plan ahead, Go big, Gear, Hidden, Tricks, Draw." Hidden mechanic rewards advance planning; supports "a control strategy." | Blue. Long-term planning, card draw, stat-shrinking. Weak unit repositioning/weak fielded units. |
| Body | "Ramp, Buffs, Win Fights, Ready." Ramps into expensive threats; "Ready theme adds aggression." | Orange. High-impact units and ramping. Weak card draw/non-combat spells. |
| Chaos | "Discard, Hidden, Interact with Trash, Selection." Breaks conventional rules, discard synergies. | Purple. Unit repositioning and hidden tricks. Weak permanent removal/self-buff. |
| Order | "Tokens, Kill, Deathknell, Sacrifice, Symmetrical Effects." The "go-wide" archetype; "organized aggressive approach." | Yellow. Benefits from unit deaths, generates many small units. Weak vs. swarms/repositioning. |

Both sources independently agree on the flavor: Fury=fast/aggressive, Calm=defensive/reactive, Mind=card advantage/plan-ahead, Body=ramp/units, Chaos=unpredictable/disruptive, Order=go-wide/sacrifice. Community explainer sites (riftmana.com, riftboundguide.com, gamertagmythras.com) found via WebSearch repeat the same framing but were not independently fetched, so are treated as corroborating rather than primary (†).

### 1.2 Quantitative pass over the Riftcodex API

Fetched all cards for OGN, OGS, SFD, UNL, VEN (1,302 cards; 49 unique Legend identities plus 9 name-format duplicates from alternate-art VEN cards, matching the count in `docs/research/2026-09-20-legend-table.md`). Script and raw dump kept outside the repo at `/c/Users/Adastraa/AppData/Local/Temp/riftsign/` (`fetch.mjs`, `analyze.mjs`, `cards.json`). Non-Legend cards only (Unit/Spell/Gear/Rune/Battlefield); dual-domain cards counted under both Domains they list.

**Card counts by type per Domain** (near-identical across Domains; only card text differs by Domain, not card type):

| Domain | Total | Unit | Spell | Gear | Rune |
|---|---|---|---|---|---|
| Fury | 193 | 121 | 49 | 19 | 4 |
| Calm | 190 | 118 | 47 | 21 | 4 |
| Mind | 196 | 112 | 54 | 26 | 4 |
| Body | 190 | 113 | 51 | 22 | 4 |
| Chaos | 189 | 116 | 51 | 18 | 4 |
| Order | 193 | 121 | 48 | 20 | 4 |

**Selected plain-text term frequency** (percent of a Domain's non-Legend cards whose text mentions the term):

| Domain | damage | kill | ready | exhaust | discard | stun |
|---|---|---|---|---|---|---|
| Fury | 9.8 | 4.7 | 22.3 | 7.3 | 11.4 | — |
| Calm | 16.8 | 5.8 | 17.4 | 12.1 | — | 8.4 |
| Mind | 2.0 | 10.2 | 13.8 | 21.9 | 2.0 | — |
| Body | 16.8 | 4.7 | 25.3 | 11.1 | — | 2.6 |
| Chaos | 5.8 | 5.3 | 8.5 | 8.5 | 12.7 | 3.7 |
| Order | 15.0 | **22.8** | 10.9 | 12.4 | — | 7.8 |

Order's "kill" rate (22.8%, more than double any other Domain) plus its 7.3% Deathknell-keyword rate is the strongest single mechanical signal in the whole pass, and it reads as a classic removal-and-sacrifice control shape†. But §1.3 shows that in the rated Legend pool, Order actually skews Midrange more than Control. That's a real tension between what the cards do and what decks the community actually builds and plays, noted here rather than resolved; the played-deck evidence is weighted higher for the Persona recommendation in §4 because it reflects real deckbuilding choices rather than raw card text alone.

Keyword presence (bracketed reminder text) by Domain, most distinctive only: Fury: Assault 19.7%, Accelerate 11.9%. Calm: Reaction 14.2%, Deflect 11.1%, Tank 6.3%, Shield 6.8%. Mind: Reaction 14.3%, Hidden 8.2%, Predict 3.6% (Predict appears almost nowhere else). Body: Empowered 9.5%, Weaponmaster 5.8%, Hunt 5.3%. Chaos: Hidden 7.9%, Action 11.6%. Order: Deathknell 7.3%, Legion 3.6%, Assault 6.2%. This matches the flavor text in §1.1 card for card.

### 1.3 Which Archetypes each Domain actually holds, in the rated pool

Cross-tabulated `src/data/legends/*.json` (49 Legends, each with 2 Domains and 1 Archetype, both fields written during the just-finished rating pass). Script: `/c/Users/Adastraa/AppData/Local/Temp/riftsign/analyze.mjs` output against `legends-summary.json`.

| Domain | Aggro | Tempo | Midrange | Control | Combo | Total |
|---|---|---|---|---|---|---|
| Fury | 4 | 5 | 4 | 2 | 1 | 16 |
| Calm | 0 | 1 | 9 | 6 | 0 | 16 |
| Mind | 0 | 2 | 5 | 6 | 3 | 16 |
| Body | 3 | 2 | 6 | 4 | 2 | 17 |
| Chaos | 2 | 5 | 2 | 6 | 1 | 16 |
| Order | 1 | 5 | 6 | 4 | 1 | 17 |

(Archetype totals: Aggro 5, Tempo 10, Midrange 16, Control 14, Combo 4.)

Two things jump out relative to the current Persona leans:

- **Calm holds zero Aggro and zero Combo Legends, and only one Tempo Legend** (Yasuo, Calm/Chaos) out of 10 Tempo Legends. Calm is overwhelmingly Midrange/Control territory (15 of 16). This directly undercuts the Tempo Persona's current Calm lean.
- **Mind is proportionally concentrated in Combo**: 3 of Combo's 4 Legends (Jayce, Jhin, Renata Glasc) hold Mind, 75% of a small pool, versus Mind showing up in 43% of Control Legends (6 of 14) and 31% of Midrange (5 of 16). Mind is Control's single most common Domain in raw count, but it's most concentrated, proportionally, in Combo. That's exactly the maintainer's intuition about Mel.
- Fury splits almost evenly across Aggro (4), Tempo (5) and Midrange (4). It does not belong to Aggro alone, and among Fury/Tempo Legends specifically, Order (3 of 5: Darius, Rek'Sai, Vi) is a more common partner Domain than Chaos (1 of 5: Annie).

## 2. How the community uses "Tempo" and "Combo"

Riot's own three-way framing, quoted from [riftbound.gg's archetypes page](https://riftbound.gg/riftbound-tcg-deck-archetypes-how-to-find-your-playstyle/) (fetched): "Aggressive decks aim to conquer Battlefields quickly and overwhelm opponents before they can stabilize... Control decks take the opposite road, grinding out points by holding Battlefields over time... Combo decks set up powerful turns that can swing multiple points at once, trading consistency for explosive potential." That page explicitly ties Aggro to Fury and Jinx, Control to Order and Viktor, and Combo to Mind and Chaos, and it does not recognize Tempo or Midrange as top-level archetypes at all; it frames them as informal community labels layered on the same three pillars.

[riftcompare.com's archetype guide](https://riftcompare.com/guides/riftbound-deck-archetypes-guide) (fetched) gives the cleanest Aggro/Tempo split found anywhere: "Aggro: cheap units, a low curve, and a race to end the game before the opponent's expensive cards matter... Tempo: spend every turn more efficiently than the opponent can answer, staying ahead on board rather than racing flat out." It states outright that "a domain's own cards tend to reward a particular way of playing... Fury's cheap, aggressive cards pull toward Aggro; Mind's card-advantage tools pull toward Midrange and Value." Note this source pulls Fury toward Aggro, not Tempo, and Mind toward Midrange/Value, not Combo specifically, though it separately calls "Combo-oriented Mind and Chaos pairings... worth exploring."

For Combo specifically, riftcompare names a "Miracle Draven" build (Ezreal Prodigy, Rhasa the Sunderer, Battering Ram) as a combo-flavored sub-archetype layered on top of Draven's standard Midrange shell, matching what this project's own `draven-glorious-executioner.json` ratingNotes already found and set aside in favor of "the more common standard build."

Net: the community's Tempo is a real, distinct idea (board efficiency over a fixed script) but it is not consistently tied to Fury; if anything, Fury's flagship deck (Jinx) is uniformly called Aggro. Combo is consistently tied to Mind (and often Chaos as a partner), which supports the maintainer's Mel intuition even though Mel herself tests as Control, not Combo (§3).

## 3. Re-verifying contested Archetype labels

Confidence and "new source" status noted per the brief's rules: primary (Riot/API) > secondary; recent > old; tournament placements > opinion pieces; a source already listed in the Legend's own `guideUrls` does not count as "additional." Pages seen only via WebSearch synthesis, not fetched, are marked unread (†) and weighted below anything actually read.

| Legend | Current | Recommendation | Confidence | New evidence |
|---|---|---|---|---|
| **Jinx, Loose Cannon** (required) | Aggro | **Confirm Aggro** | High | [riftboundtcg.wiki](https://riftboundtcg.wiki/decks/riftbound-tcg-jinx-deck) (fetched, new): "Aggro / Burn," "Fast (Turns 1-5)." Agrees with all 3 sources already in the file. |
| **Mel, Soul's Reflection** (required) | Control | **Confirm Control** | Medium-high (up from medium) | [hextechanalytics.com/legends/mel](https://hextechanalytics.com/legends/mel) (fetched, new): explicit "Control archetype... Mel wants the opponent to commit a meaningful threat, then make it lose to a much smaller investment." 3 of 4 sources now say pure Control; only skillshotzgaming.com's "Tempo/Control" hedge disagrees. |
| Pyke, Bloodharbor Ripper | Control | **Contested, lean Control** | Medium | [riftbound.cardsrealm.com deck-tech-competitive-pyke](https://riftbound.cardsrealm.com/en-us/articles/riftbound-deck-tech-competitive-pyke) (fetched, new) explicitly calls it "a classic tempo archetype pattern... stay ahead in tempo." A different cardsrealm article on the same Legend (found only via search snippet, unread†) calls it "Disrupt Control" with a Top-4 finish at a Tianjin regional. Sources are genuinely split; kept Control since 2 of 3 read sources (riftbound.gg, hextechanalytics, both already cited) describe slow, value-first, grinding lines. |
| Ahri, Nine-Tailed Fox | Control | **Confirm Control** | High | [riftstorm.gg/blog/ahri-counter](https://riftstorm.gg/blog/ahri-counter-riftbound-nine-tailed-fox) (fetched, new): "Ahri is almost purely reactive... a slow game is her game." cardsrealm's "main control deck in the early days of Riftbound" corroborates (search snippet, unread†). Unanimous. |
| Ezreal, Prodigal Explorer | Control | **Confirm Control** | Medium-high | [hextechanalytics.com/legends/ezreal](https://hextechanalytics.com/legends/ezreal) (fetched, new): "Ezreal uses targeted spells to develop his Legend while controlling the opposing board," resource-depletion win condition. Agrees with riftmana.com/magicalmeta.ink already cited. |
| Volibear, Relentless Storm | Control | **Confirm Control, flag disagreement** | Medium | [hextechanalytics.com/legends/volibear](https://hextechanalytics.com/legends/volibear) (fetched, new) explicitly says "Ramp/Midrange," not Control. But its own supporting quotes ("the ramp needs time," building toward "threats that change the whole turn") read as slow/grindy, matching the 3 already-cited sources' "purest ramp legend... slow, grindy game" framing that produced the Control call. Treated the word choice as a house-style quirk rather than overriding evidence. |
| Miss Fortune, Bounty Hunter | Control | **Confirm Control** | Medium | [hextechanalytics.com/legends/miss-fortune](https://hextechanalytics.com/legends/miss-fortune) (fetched, new): hedges "Tempo and Control," but its own quotes ("tactical movement... rather than rapid deployment") lean Control. No clean disagreement. |
| Master Yi, Wuju Bladesman | Control | **Reconsider: Midrange** | Medium | [hextechanalytics.com/legends/master-yi](https://hextechanalytics.com/legends/master-yi) (fetched, new): explicit "Midrange players who like cheap card flow, patient reactions, and keeping their threats spread across the board." This is the first source found that uses an explicit archetype word for this Legend at all. The two sources already cited (riftbound.gg, riftboundguide.com) only describe a "trap" playstyle without naming an archetype; Control was inferred from low pace/stance numbers during rating, not read from a source. |
| Sett, The Boss | Tempo | **Confirm Tempo** | Medium-high | [hextechanalytics.com/legends/sett](https://hextechanalytics.com/legends/sett) (fetched, new) reads more Midrange-ish ("establishing a board with affordable early units before deploying expensive threats") but does not use an explicit archetype word; that reading is the fetching model's inference. The two already-cited sources give directly-quoted pace 7.5/stance 8 ("constantly be in a rush, score every turn," "won't let your opponent fight for the board"), which sits squarely in Tempo/Aggro territory and is weighted higher as an explicit number over an inferred label. |
| Poppy, Keeper of the Hammer | Control | **Confirm Control** | High (up from medium) | [hextechanalytics.com/legends/poppy](https://hextechanalytics.com/legends/poppy) (fetched, new): explicit "Control... surviving a difficult opening and taking over with removal and expensive threats." Agrees with both already-cited sources. |
| Irelia, Blade Dancer | Control | **Reconsider: Tempo** | Medium | [hextechanalytics.com/legends/irelia](https://hextechanalytics.com/legends/irelia) (fetched, new): "characteristic of Tempo strategies... pressuring battlefields with efficient, reusable threats" via the ready-and-reattack Legend ability. A general community tier-list summary (search snippet, unread†) separately called Irelia the field's one Tier-1 Tempo deck. Two independent hints toward Tempo against the file's own Control call, which leaned on animealley.ca's "heavily reactive" read of its 11 reaction spells. |
| Ambessa, Matriarch of War | Aggro | **Confirm Aggro, flag disagreement** | Medium-high | [hextechanalytics.com/legends/ambessa](https://hextechanalytics.com/legends/ambessa) (fetched, new) reads "Midrange... rewards you for planning the turn before the fight starts," but again without an explicit archetype word. The two already-cited sources give directly-quoted pace 7.5/stance 8 and "Ambessa does not retreat. She presses forward," which is explicit Aggro-coded language; weighted higher. |
| Draven, Glorious Executioner | Midrange | **Contested, not resolved** | Medium | Re-read of the already-cited [hextechanalytics.com/legends/draven](https://hextechanalytics.com/legends/draven) (fetched) now returns an explicit "**Tempo** archetype focused on combat-driven card advantage," contradicting the file's Midrange call. No independently new source was reachable in budget (mobalytics.gg returned HTTP 403). Flagging for reviewer rather than recommending a flip, since it doesn't satisfy "an additional source." |
| Kai'Sa, Daughter of the Void | Midrange | **Contested, not resolved** | Medium | Re-read of the already-cited [hextechanalytics.com/legends/kaisa](https://hextechanalytics.com/legends/kaisa) (fetched) now returns an explicit "**Control** deck... operates on a control plan," contradicting the file's Midrange call. No new independent source found in budget. Flagging only. |
| Lee Sin, Blind Monk | Midrange | **Confirm Midrange** | Medium | Re-read of the already-cited [hextechanalytics.com/legends/lee-sin](https://hextechanalytics.com/legends/lee-sin) (fetched): "Combat-focused midrange players." Agrees; no new independent source found in budget. |
| Renata Glasc, Chem-Baroness | Combo | **Confirm Combo, add nuance** | Medium | Re-read of the already-cited [riftbound.cardsrealm.com deck-tech-renata-combo](https://riftbound.cardsrealm.com/en-us/articles/riftbound-deck-tech-renata-combo) (fetched): explicit "Control/Combo" hybrid, notes the deck is "struggling to adapt to the current competitive meta" and wins "out of nowhere" once set up. No new independent source found in budget. |
| Lillia, Bashful Bloom | Midrange | **Confirm Midrange** | Medium | Re-read of the already-cited hextechanalytics.com/legends/lillia (fetched) leans Tempo-flavored in its language ("generating immediate board pressure") without an explicit archetype word. Not enough to override the existing Midrange call; no new independent source found in budget. |
| LeBlanc, Deceiver | Midrange | **Not resolved** | Medium (unchanged) | Tried one new source, magicstark.cz. It turned out to cover the League of Legends champion, not the TCG card, and was unusable. No qualifying new source found. The Legend's own `ratingNotes` already self-flag this call ("Midrange with combo leanings... reviewer should double check"); that flag stands unaddressed. |

**Did not reach**: none of the 16 priority Legends were skipped outright, but 6 of them (Draven, Kai'Sa, Lee Sin, Lillia, Renata Glasc, LeBlanc) only got a closer re-read of an already-cited source rather than a genuinely independent new one, because the obvious next sources were blocked (mobalytics.gg returned HTTP 403 on every attempt) or off-topic. Those 6 rows are flagged accordingly above rather than treated as fully re-verified.

## 4. Recommended Domain leans for the five Archetype Personas

`computeProfile` in `src/lib/scoring.ts` sums each Question's `moves` by raw weight, then scales by the axis's reach; sign is preserved throughout, so summing raw weights by hand (verified against a small script reproducing `computeProfile`, kept at `/c/Users/Adastraa/AppData/Local/Temp/riftsign/profile.mjs`) is enough to know direction and relative strength. Domain-axis sign convention from `src/lib/axes.ts`: negative `fury-calm` = Fury, positive = Calm; negative `mind-body` = Mind, positive = Body; negative `chaos-order` = Chaos, positive = Order.

Current Persona raw Domain-axis sums, current `src/lib/personas.test.ts` (re-read after commit 2f79e3c, which already matches what this doc's arithmetic below uses):

| Persona | fury-calm | mind-body | chaos-order |
|---|---|---|---|
| impatient aggro player | −6 (Fury, strong) | +5 (Body, strong) | −5 (Chaos, strong) |
| tricky tempo player | +4 (Calm, mild-strong) | −5 (Mind, strong) | −4 (Chaos, moderate) |
| steady midrange player | 0 (neutral) | +6 (Body, strong) | +5 (Order, strong) |
| patient control player | +6 (Calm, strong) | −5 (Mind, strong) | +5 (Order, strong) |
| puzzle-loving combo player | 0 (neutral) | −6 (Mind, strong) | 0 (neutral) |

Pool check, applying the two "reconsider" recommendations from §3 (Master Yi Wuju Bladesman Control→Midrange, Irelia Control→Tempo; both Calm-domain Legends, so this changes Calm/Body/Chaos counts but not Fury/Mind/Order):

| Archetype | Domains held by its Legends (adjusted pool) |
|---|---|
| Aggro (5 Legends) | Fury 4, Body 3, Chaos 2, Order 1. Calm 0, Mind 0. |
| Tempo (11 Legends) | Fury 5, Chaos 6, Order 5, Calm 2, Mind 2, Body 2. |
| Midrange (17 Legends) | Calm 10, Order 6, Body 7, Mind 5, Fury 4, Chaos 2. |
| Control (12 Legends) | Mind 6, Chaos 5, Calm 4, Order 4, Body 3, Fury 2. |
| Combo (4 Legends) | Mind 3, Fury 1, Body 2, Chaos 1, Order 1, Calm 0. |

Per-Persona recommendation:

- **Aggro: no change.** Pool is Fury 4/5, Body 3/5, Chaos 2/5, with zero Calm or Mind. The Persona's Fury/Body/Chaos triple is exactly what the pool holds. Well supported, leave as is.
- **Tempo: flip Calm to Fury** (superseded in part: the Mind and Chaos neutralising below failed the suite; see the correction under "Recommended edits"). Pool shows Calm in only 2 of 11 Tempo Legends versus Fury in 5, so the current +4 (Calm) lean points the wrong way; it should be a mild Fury lean instead. `mind-body` is a dead heat (Mind 2, Body 2) in the pool, so the current −5 (Mind) lean has no support and should go to neutral. `chaos-order` is close to a dead heat too (Chaos 6, Order 5, barely tilted Chaos), so the current −4 (Chaos) lean is stronger than the pool supports and should also come down toward neutral. This is the one Persona that needs editing (see below).
- **Midrange: optional, minor.** Pool shows Calm 10 versus Fury 4 (2.5 to 1), a real Calm tilt that the Persona's current neutral `fury-calm` doesn't capture. `mind-body` (Body 7 vs. Mind 5) and `chaos-order` (Order 6 vs. Chaos 2) both already point the right way and are reasonably close to the pool's ratios. Optional single-answer fix below; not something the maintainer flagged, so treat as a bonus finding rather than a required change.
- **Control: no persona-answer change, but flag a tension.** `fury-calm` (Calm 4 vs. Fury 2) and `mind-body` (Mind 6 vs. Body 3) both support the current leans directionally. `chaos-order` is the interesting one: the pool actually has slightly more Chaos-Control Legends than Order-Control ones (Chaos 5, Order 4; before applying §3's two reconsiderations, the gap was wider, Chaos 6 to Order 4). The current Persona leans hard toward Order (+5) via two scenario-question answers ("structured," "framework") that are also the most thematically load-bearing for a "patient, rules-following control player" flavor. Flipping them would blur the Persona's own point, so this is recorded for reviewer awareness rather than as a recommended edit. The mismatch may mean Control's Chaos representation (Vex, Mel, Ezreal, Miss Fortune, Pyke) is a different flavor of Control (reactive/disruptive) than "structured" implies, which is itself useful ingestion context.
- **Combo: no change.** The Calm and Chaos leans this research was asked about were real before commit 2f79e3c; that commit neutralised them. `table-mood: composed` (+2 Calm) and `battle-cry: burn` (−2 Fury) cancel exactly to 0. `game-plan: chaos` (−2 Chaos) and `rules-are: framework` (+2 Order) also cancel exactly to 0. Only `mind-body` survives, at a strong −6 (Mind), from `win-because: outsmart`, `spells-over-creatures: strongly-agree`, and `ideal-crew: scholars` all agreeing. That is precisely what the Combo pool supports (Mind is the only Domain with more than 1 of 4 Combo Legends). No edit needed. The fixture already tests what it should.

### Recommended `personas.test.ts` edits

**Correction after running the suite (2026-09-23).** The first proposal here (Fury mild, Mind and Chaos neutral: `battle-cry: burn`, `fired-up: agree`, `ideal-crew: warriors`, `spells-over-creatures: neutral`, `rules-are: framework`) was applied and **failed**. The Profile came out at fury-calm −0.8, mind-body 0, chaos-order 0. Its nearest Legends were Akali (Midrange), Kennen (Tempo) and Jayce (Combo), the opposite-pair Legends that sit at 0 on a Domain Axis, so `deriveArchetype` returned Midrange. The pool counts in the table above miss a second factor. This Persona is "tricky" (complexity 9), and the complex Tempo Legends are the Mind/Chaos ones (Diana 8, Teemo 7.5, Yasuo 8). The Fury Tempo Legends are simpler (Darius 4.5, Annie 6, Vi, Lucian and Rek'Sai 6.5).

Tested variants (fury-calm / mind-body / chaos-order → result, top three):

| Variant | Profile Domains | Result | Top three |
|---|---|---|---|
| Before (commit 2f79e3c) | +3.3 / −4.2 / −3.3 | Tempo | Diana, Teemo, Yasuo |
| **Fury strong, Mind + Chaos kept (applied)** | −4.2 / −4.2 / −3.3 | Tempo | Diana, Teemo, Annie |
| Fury strong, Chaos kept, Mind neutral | −4.2 / 0 / −3.3 | Tempo | Annie, Zed (Aggro), Draven (Midrange) |
| Fury strong, both others neutral | −4.2 / 0 / 0 | Midrange | Kennen, Akali, Vi |

Applied: `battle-cry: 'breathe' → 'burn'`, `fired-up: 'neutral' → 'agree'`, `table-mood: 'composed' → 'relentless'` (the last also adds pace +1, which suits Tempo). All 53 tests pass.

Optional, lower-priority `steady midrange player` edit: `fired-up: 'neutral' → 'disagree'` moves `fury-calm` from 0 to +1 (mild Calm), matching the pool's 10:4 Calm:Fury ratio for Midrange, at the cost of a small stance −0.5 nudge. Not tested.

## Notes

- hextechanalytics.com is not paywalled to a plain fetch as of this session (all `/legends/*` pages returned HTTP 200 and readable content), contradicting the "paywalled, HTTP 402" note in `docs/research/2026-09-20-legend-table.md`. Either the paywall was removed or it only applies to some pages/routes; treat as accessible until proven otherwise.
- mobalytics.gg blocked every fetch attempt in this session with HTTP 403; its tournament decklists were not readable and are not cited as read anywhere in this doc.
- riftbound.gg's own `/meta/` archetype-per-Legend page is client-side rendered (React) and returned no usable content to a plain fetch; only the static `/tier-list/` and per-Legend guide pages were readable.
- The Riftcodex API returns 58 Legend "card objects" grouped by name prefix across the 5 sets fetched, more than the 49 unique identities, because several Vendetta alternate-art cards use a bare subtitle as their `name` field (e.g. `"Rogue Assassin"` alongside `"Akali - Rogue Assassin"`) instead of following the `Champion - Subtitle` pattern the earlier legend-table doc assumed. Grouping by the `tags` field (which holds the champion name) would be more robust for any future pass; this doc worked around it by using the project's own already-deduplicated `src/data/legends/*.json` (49 files) instead of re-deriving identities from the API.
