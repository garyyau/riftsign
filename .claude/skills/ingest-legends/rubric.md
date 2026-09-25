# Rubric

Two halves. **Scoring a deck** turns one deck list into a playstyle position (Pace, Stance, Complexity, Variance, 0 to 10) and an Archetype. **Builds** turns scored styles into a Legend's Builds: the bar, the coordinates, the label, the copy. Vocabulary: `CONTEXT.md`. Why Builds exist: `docs/adr/0003-legends-carry-up-to-three-builds.md`. File shape: `legendSchema` in `src/lib/schemas.ts`.

The Axes mean what the quiz asks (`src/data/questions.json`):

- **Pace**: how soon the deck wants the game decided. High: "Over before they've played anything that matters", cheapest unit first so it can attack next turn. Low: "Long and full, every card I saved finally on the table".
- **Stance**: pressure or answers. High: a hand of "cards that put them on the back foot right away". Low: "Answers for whatever they try", watching their turn "ready to respond". A deck busy with its own plan sits in the middle.
- **Complexity**: moving parts. High: cards with several uses, sequencing, timing on the opponent's turn, "cards I set up over several turns finally clicking together". Low: "One good card doing its job on its own".
- **Variance**: luck and all-or-nothing bets. High: "A card that wins on the spot half the time", "I went all in". Low: "cards that always do their job". A payoff the pilot assembles on purpose is Complexity, not Variance.

## Scoring a deck

You tag every card, write your own judgment of the deck, then `tools.ts score` averages a formula over your tags with that judgment. The tags make you read every card and anchor the numbers; the judgment catches what counting misses. The formula is fixed: it was calibrated and validated in `docs/research/2026-09-25-deck-rubric.md`, and the quiz measures Players far more coarsely than it measures decks (`docs/research/2026-09-25-rubric-spread-and-stability.md`), so recalibrate only when labels visibly drift after a new set.

### Steps

1. `pnpm tsx .claude/skills/ingest-legends/tools.ts deck <piltoverarchive url or uuid> [sheet.json]` prints the deck (Legend, Champion zone, battlefields, every card with cost and full text, Equipment's attached Might and effect, counts) and writes a tag sheet, by default to `.scratch/decks/<uuid>.json`, with regex guesses for each card. It warns when the list isn't 40 cards.
2. Read card text, not memory. For an unfamiliar card: `tools.ts card <name>` (Riftcodex, then Piltover Archive). For a card neither has yet, such as a new set's, its Piltover Archive page or a web search. Read the Legend and the Champion zone first: they are in every game.
3. Write the deck's plan in one sentence in `plan`: how it scores its 8 points and what it needs to draw.
4. Set `role` and `flags` on every card (below). The guesses are often wrong; check each one.
5. Add `"judged": { "pace": n, "stance": n, "complexity": n, "variance": n, "archetype": "..." }`: your own reading of the deck from the Axis definitions above, half points, written before you run the scorer.
6. Put what the card list can't show, mostly the Legend and battlefields, in `adjustments`: `{ "complexity": { "by": 1, "why": "Legend's ability needs a target every turn" } }`. Half points, at most ±1.5 per Axis. They shift the formula only; your judgment already includes them. Typical: a Legend that reveals cards (Variance up), draws cards (Variance down), has an ability to time every turn (Complexity up), makes units for you (Pace and Stance up), or battlefields that lengthen the game (Pace down).
7. `tools.ts score <sheet.json>` prints the final scores (the mean of formula and judgment, rounded to half points), both halves, and the Archetype. Don't change tags or judgment after seeing the numbers. Where formula and judgment differ by 2 or more on an Axis, re-read the cards behind it: either a tag is wrong (fix it) or the formula misses something (say what in the notes).

Done when the sheet has a `plan`, a `judged` block, every card checked, and `tools.ts score` runs clean with every 2+ gap re-read.

### Riftbound facts the tags rest on

- First to 8 points. You score by conquering a battlefield (once, when you take it) or holding one (each turn you start in control). The last point must come from holding, or from conquering both battlefields in one turn. Two battlefields in play in 1v1.
- Energy (the number) is paid by exhausting runes and comes back next turn. Power (domain icons) is paid by recycling a rune to the bottom of the rune deck, so it shrinks next turn's resources. Two runes a turn from a 12-rune deck.
- Combat is deterministic: total Might against total Might, damage simultaneous. There is no dice or random targeting anywhere in the game, and no card searches your deck for a named card. Luck comes only from draws and from effects that act on unseen cards.
- [Action] cards can be played on your turn or in any showdown. [Reaction] can be played any time, even in response. [Hidden] cards are set face down for a rune and played later for free, at reaction speed. [Ambush] units can be played as a reaction.

### Roles

Give each card the first role that fits, in this order, judged by what the card is in this deck for.

1. **engine**: one of the pieces the plan must assemble, close to blank without them. In a Dazzling Aurora deck, Aurora and the payoffs it puts into play; the ramp spells are ramp. A good card that merely gets better with friends is not an engine. When you tag 4 to 9 engines, re-check each against "close to blank without the others" before trusting a Combo or Control call: this one tag decides that branch.
2. **finisher**: how the deck closes: a unit costing 7+, or a 5-6 cost unit with 6+ printed Might and no removal on entry, extra turns, a card that wins outright.
3. **flow (cantrips)**: a cheap spell that draws a card and does something minor besides: at most 1 Might or 1 damage (Stupefy). With a real effect (+2 Might, a kill) it takes that effect's role instead (Discipline is a trick).
4. **removal**: deals with enemy units or gear: kill, damage, Stun, -Might, move them away, return them to hand. A unit counts when the deck plays it mainly to answer the opponent's units: its entry effect removes something and it costs 6 or less (Carnivorous Snapvine), or its body is small for its cost. An attacker whose effect clears the way for its own attack (Stun or kill when it attacks, pulling an enemy into its fight) is pressure.
5. **counter**: stops or blunts the opponent's cards, or saves yours from them: counter a spell, hand disruption, a Deflect or "can't be chosen" grant, preventing a death (Zhonya's Hourglass, Guardian Angel), dodging to base, recall, a unit that shuts down what they play (Vex, Apathetic), and defensive combat tricks and gear: Shield, Tank, "+Might while defending" (Block, Cloth Armor).
6. **ramp**: gives you extra resources: channel or ready runes, [Add], cost reductions for other cards, and non-unit cards that make Gold. A unit that leaves Gold is tagged by its body instead.
7. **flow**: other card flow: draw, look at the top and choose (Predict, Vision), return cards from the trash to hand. A unit with Might below its cost whose point is the draw is flow.
8. **trick**: helps your units win the fights you start: +Might, Assault, ready, move your unit into a fight, Equipment that adds Might or an attack keyword.
9. **defender**: units built to hold ground: Shield, Tank, payoffs for defending or holding, big bodies meant to sit on a battlefield.
10. **pressure**: threats that attack and score soon: cheap efficient units, Accelerate, Assault, Ganking, conquer payoffs, units that move your units, and non-unit cards that put attackers on the board (Sprite Fountain, Sprite Burst, Guards!). The scorer counts non-unit pressure cards as bodies.
11. **value**: any other unit or permanent: slow card or board advantage, sacrifice fodder, utility.

### Flags

Any number per card.

- **reactive**: playable on the opponent's turn to respond: [Reaction], [Hidden], [Ambush], [Quick-Draw], including cards given Quick-Draw by another card in the deck. Not [Action], and not a mana ability such as a Seal's "[Reaction] — [Add]". The regex fills it in; check it.
- **setup**: the effect needs a condition, position or timing you arrange: [Legion], [Empower]/[Empowered], [Level]/XP, [Mighty], "if you've … this turn", "for each … you control", moving, swapping, readying or recalling your units at the right moment, resource economies (Gold, XP), a [Deathknell] you plan around. These printed conditions stay setup even when the Legend also cares about them. A card with no condition of its own that merely feeds the Legend's trigger isn't setup; put that in the Complexity adjustment once.
- **modes**: two or more distinct uses you choose between or sequence: "choose one", a triggered plus an activated ability, [Flow] or [Repeat], a unit with several separate abilities. Keywords alone (Ganking, Deflect, Hidden) don't count.
- **luck**: the result depends on cards nobody chose and can realistically miss: reveal or look at the top and play or keep only what meets a condition, where the deck runs enough misses that it whiffs in about one game in four or more; [Burn] unless the deck wants its trash filled; picking among an opponent's cards you can't see. Predict and Vision are not luck (you look, then choose), and neither is hand disruption that reveals the hand first.
- **swing**: a bet with a real cost if it fails: discarding cards as a cost, killing a unit the deck didn't make to be fodder, a board wipe that costs you your own board, gear that punishes you when its condition fails (Blighted Battleaxe), an all-in payoff that leaves you empty if answered. Not swing: tokens you make on purpose, Temporary units, ordinary combat tricks, sacrificing fodder the deck produces, discards the Legend rewards, wipes in a deck with 12 or fewer units.

### The arithmetic

`tools.ts score` implements this; counts are copies scaled to 40 cards. "Answers" are removal, counter and defender; "own-plan" cards are flow, ramp, value, engine and finisher; "bodies" are units plus non-unit pressure cards. Each formula is clamped to 0 to 10 after adjustments; the final score is its mean with your judgment, rounded to half points.

- **Pace** = 3.2 + 0.2 × units costing 2 or less that aren't defenders + 0.1 × units − 0.2 × cards costing 5+
- **Stance** = 5.1 + 2.25 × balance + 0.06 × bodies − 0.025 × reactive − 0.14 × cards costing 5+, where balance = (P − answers) / (P + answers + own-plan) and P = pressure + half the tricks that aren't reactive
- **Complexity** = 3.8 + 0.04 × cards that are engine or flagged setup or modes + 0.1 × reactive + 0.045 × (flow + ramp + value + engine)
- **Variance** = 4 + 0.3 × luck + 0.25 × swing + 0.12 × (ramp + engine) − 4 × (share of cards run as 3-ofs − 0.6) − 0.06 × (removal − 8) − 0.06 × (cards whose text draws, looks or predicts − 5)

What the terms say: cheap attackers and few expensive cards make a deck fast; bodies and pressure against answers decide Stance, and reaction-speed tricks count as defence as much as attack; decks of reactions, spells and engines are harder to pilot than decks of units; luck, ramping into payoffs and toolbox 1-ofs make a deck swingy, while removal, card flow and full playsets make it steady.

### Archetype

The scorer suggests one from the final scores, in this order; your `judged.archetype` is the answer, and when it differs from the suggestion the rating notes say why.

1. **Combo**: 6+ engine cards, unless 12+ are answers (then **Control**: a ramp deck that answers everything).
2. **Control**: Stance 3.5 or less.
3. **Aggro**: Pace 6.5+ and Stance 6.5+.
4. **Tempo**: 14+ reactive cards and Pace 5+: cheap threats backed by cheap interaction on the opponent's turn.
5. **Midrange**: anything else.

The five labels are Aggro, Tempo, Midrange, Control, Combo. There is no Ramp. Decks that ramp into Dazzling Aurora are labelled by what surrounds the ramp: **Control** when the rest is removal and answers (Poppy, Miss Fortune, Garen), **Combo** when the plan runs through the one engine with little removal (Jayce, Fiora).

### Reporting a deck on its own

When asked to score deck links rather than a Legend: give the four final scores, the Archetype, the plan sentence, each adjustment with its reason, the cards that decided each Axis, and any Axis where formula and judgment differed by 2+ and why.

## Builds

A Build exists only when players actually run it. It clears the bar when all three hold:

- **Played.** A picked style shows it (`sources.md`, Picking styles): decks from more than one author with tournament results, guides or likes behind them. One brewer's list, a theory article, or a pile of `#500+` Open entries does not.
- **Current.** Its lists are legal in today's format. A build whose engine card is banned is dead, however well it once placed (Lux Combo died with the 2026-09-18 Ekko, Recurrent ban). A banned utility card players can swap out leaves the Build standing (most Stacked Deck lists rebuilt around Lunari-style card flow). Weight lists from after the most recent ban list above older ones.
- **Distinct.** Its Archetype differs from the Legend's other Builds and it sits 2 or more from each of them on at least one Axis. Closer than that, a Player can't tell the two apart (`docs/research/2026-09-25-rubric-spread-and-stability.md`). A style that fails this adds its decks to the nearest Build instead; `tools.ts picks` applies this rule.

Zero extra Builds is the common outcome: in the 2026-09-23 pass, 3 of 49 Legends gained one. Every Legend keeps at least one Build, even a fringe Legend with no current results: rate the way it is played (or, failing that, its starter or guide list).

### Coordinates and label

- A Build's coordinates are each Axis's mean over its style's scored decks (`tools.ts style <sheets>`), the display deck and up to two more, every deck rated under the current rubric by a rater who hasn't seen the Build on file. The mean is steadier than the median at that size. A Legend with no picked deck is scored from its starter or guide list, at confidence low.
- A Build's label is the one most of its scored decks' raters gave, ties going to the scorer's suggestion (`tools.ts style`). Outside labels (riftbound.zone, hextechanalytics, riftbound.gg) are a cross-check, and `tools.ts check` flags a Build that sits nearer another Archetype's average position than its own.
- A Build stores only the four playstyle Axes. Its Domains come from the Legend's `domains` (ADR 0005), and validation rejects a stored Domain coordinate.

### Changing an existing Build

- **Keep** when its label, its coordinates (all within 1.5) and its `deckListUrl` already match the picks.
- **Relabel** when outside labels agree with each other and with the deck evidence against the current Archetype. A split between sources is not a mislabel; keep the label and say so in `ratingNotes`.
- **Move coordinates** when the mean of the style's scored decks sits 1.5 or more from the stored ones on any Axis.
- **Drop** a Build when it fails _Current_: its key card is banned, or it is absent from every top-cut list of this Legend since the last ban and no current guide describes it. The last Build is never dropped.
- A change reaches the site only after review, so a changed or new Build lands `reviewed: false`.

### Rating notes

`ratingNotes`: each scored deck with its link and four scores, every adjustment with its reason, the cards that decided each Axis, then the Legend ability, then `Also played:` with the links of any style whose decks joined this Build, then `Confidence: low | medium | high.`, then anything the reviewer should check. For a change, say what moved and why, dated.

### Copy

A Player who knows the rules but no deck-building slang reads this.

- `howItPlays`: two present-tense sentences naming one or two key cards.
- `whyYou`: one second-person paragraph on who enjoys piloting this Build, matching the voice and length of existing files.
- Plain words for jargon: "spells that give you extra runes" for ramp, "your expensive cards" for curve, "score points" for score. Say what a keyword card does the first time it appears (Mobilize, Sacrifice).
- Card facts match card text: costs, what a card reveals or plays. Check each named card with `tools.ts card` before returning; a past draft described Time Warp (10 cost) as "the bottom of your curve".
- Apply `~/.claude/skills/unslop/SKILL.md` to both fields.

### Links

- `guideUrls`: pages actually fetched and read that support this Build as it is now, deck pages included. A page about the starter deck or a banned version is out.
- `deckListUrl`: the style's display deck, the first under it in the picks, `https://piltoverarchive.com/decks/view/<uuid>`. Every Build links a real deck; `tools.ts check` flags the bare `/decks` page.
