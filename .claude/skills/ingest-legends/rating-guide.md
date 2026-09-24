# Rating guide

How to decide a Legend's Builds and draft each one. Research agents, skeptics and the main agent all rate against this file. Vocabulary: `CONTEXT.md`. Why Builds exist: `docs/adr/0003-legends-carry-up-to-three-builds.md`. Axis meanings: `src/lib/axes.ts`. File shape: `legendSchema` in `src/lib/schemas.ts`.

## The bar

A Build exists only when players actually run it. It clears the bar when all three hold:

- **Played.** Relevant decks show it: top-cut or RQ "Best of" lists, low-numbered Open placements, or meta data. Several independent current guides also count. One brewer's list, a theory article, or a pile of `#500+` Open entries does not.
- **Current.** Its lists are legal in today's format. A build whose engine card is banned is dead, however well it once placed (Lux Combo died with the 2026-09-18 Ekko, Recurrent ban). A banned utility card players can swap out leaves the Build standing (most Stacked Deck lists rebuilt around Lunari-style card flow). Weight lists from after the most recent ban list above older ones.
- **Distinct.** Its Archetype differs from the Legend's other Builds, and a player would feel the difference: its playstyle coordinates move clearly. A one-card tech swap or a sideboard plan is the same Build.

Zero extra Builds is the common outcome. In the 2026-09-23 pass, 3 of 49 Legends gained one. Most Legends are one deck.

Every Legend keeps at least one Build, even a fringe Legend with no current results: rate the way it is played (or, failing that, its starter or guide list).

## Changing an existing Build

- **Relabel** when outside labels (riftbound.zone, hextechanalytics, riftbound.gg) agree with each other and with the deck evidence against the current Archetype. A split between sources is not a mislabel; keep the label and say so in `ratingNotes`.
- **Move coordinates** when the deck players run has changed, or when the old rating averaged two different decks that are now separate Builds.
- **Drop** a Build when it fails _Current_: its key card is banned, or it is absent from every top-cut list of this Legend since the last ban and no current guide describes it.
- A change reaches the site only after review, so a changed Build goes back to `reviewed: false`.

## Archetype labels

The five labels are Aggro, Tempo, Midrange, Control, Combo. There is no Ramp. Decks that ramp into Dazzling Aurora are labelled by what surrounds the ramp: **Control** when the rest is removal and answers (Poppy, Miss Fortune, Garen), **Combo** when the plan runs through the one engine with little removal (Jayce, Fiora). Keep label and coordinates consistent: `tools.ts check` flags a Build that sits nearer another Archetype's average position than its own.

## Coordinates

- Playstyle Axes 0 to 10 in half steps, placed relative to two or three existing Builds of the same Archetype, named in the notes.
- A Build stores only the four playstyle Axes. Its Domains come from the Legend's `domains` (ADR 0005), and validation rejects a stored Domain coordinate.
- `ratingNotes`: one line per Axis citing the source that supports it, then the Legend ability, then `Confidence: low | medium | high.`, then anything the reviewer should check. For a change, say what moved and why, dated.

## Copy

A Player who knows the rules but no deck-building slang reads this.

- `howItPlays`: two present-tense sentences naming one or two key cards.
- `whyYou`: one second-person paragraph on who enjoys piloting this Build, matching the voice and length of existing files.
- Plain words for jargon: "spells that give you extra runes" for ramp, "your expensive cards" for curve, "score points" for score. Say what a keyword card does the first time it appears (Mobilize, Sacrifice).
- Card facts must match card text: costs, what a card reveals or plays. The skeptics caught Time Warp (10 cost) described as "the bottom of your curve".
- Apply `~/.claude/skills/unslop/SKILL.md` to both fields.

## Links

- `guideUrls`: pages actually fetched and read that support this Build, deck pages included.
- `deckListUrl`: the Build's most representative top list, `https://piltoverarchive.com/decks/view/<uuid>`; `https://piltoverarchive.com/decks` only when no list exists.
