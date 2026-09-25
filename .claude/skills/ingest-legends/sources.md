# Deck sources

Last verified 2026-09-25 (Piltover Archive's newest tournament decks: Singapore RQ, 2026-09-10; nothing posted since the 2026-09-18 ban; the Los Angeles RQ, 2026-09-25 to 27, brings the first post-ban lists). Measurements behind this file: `docs/research/2026-09-25-piltover-archive-census.md`, `docs/research/2026-09-25-deck-styles-and-quality.md`. When a run finds a line here wrong, fix the line and the date.

## Piltover Archive API

- Base `https://piltoverarchive.com/api/external/v1`, plain JSON, no auth. About 3 requests a second; it sent a 429 at 4.
- `GET /decks?legendId=<id>` is the exact Legend filter. The id is the Legend **card** id from `GET /cards?q=<name>` (the row whose `card.type` is `Legend`), not a deck's `legend.id`. It covers every printing and spelling ("Leblanc"). `q` is a loose name search.
- Working list params: `editedAfter`, `createdAfter`, `createdBefore`, `authorId`, `isLegal`, `hasGuide`, `hasVideo`, `hasMatchups`, `sort` (`trending`, `likes`, `views`, `createdAt`, `editedAt`) with `order`, `limit` up to 100, `page`.
- List entries carry `likes`, `views`, `editedAt`, `contentFlags` (`hasGuide`, `hasVideo`, `hasMatchups`), `teamOwners`, and the only legality data: `isLegal` and `bannedCardNames`. Deck detail (`/decks/<uuid>?expand=cards`) has the cards (`expandedCards.champions`, `.maindeck`, `.runes`, `.battlefields`) and no legality.
- More per deck: `/guide` (the written guide, Tiptap JSON), `/matchups`, `/versions` (edit history). `/sets` gives release dates.
- Tournament decks come from the system account, authorId `08c7c126-8ec7-4594-9f37-b313a201e2e3`. The name carries event and placement: "【Regional Qualifier】Hartford - #6", "Singapore - Best of Vex", "【City Challenge】Shanghai Station - #12", "Season 1 National Open - #1889". "Best of" goes to each Legend's highest finisher at any placement (it can be 37th of 1,719), so it ranks below an RQ top 8. Chinese mass events dominate the raw counts. The system account also posts precons ("Vendetta Pre-Rift kit").
- Nothing marks a content creator: `/users` and `/authors` are 403 and there is no verified flag. Team ownership is the only hint.
- Likes are rare: median and p90 are 0 for every Legend. Guides, matchup notes, video and placements carry most of the signal.
- No archetype labels anywhere.
- `https://piltoverarchive.com/decks/view/<uuid>` renders server-side and is the stable per-deck link. The site's `/decks?...` filter URLs are client-side and ignore query params.

## The pool (`tools.ts candidates`)

The script does the mechanical half. Its thresholds are constants at the top of `candidates.ts`; the reasons are here.

- **Window**: decks edited since the newest main set's release; tournament lists since the set before, halved, because they often still show how the Legend is played. `--since=<date>` widens the community window without changing anyone's points.
- **Evidence points** per deck: RQ #1-8: 5. RQ #9+, Best of, City Challenge #1-8, Open #1-32: 3. City Challenge #9-32, Open #33-499, unread placement: 1.5. Lower: 0.5. Plus log2(1 + likes) capped at 4, guide +1, video +0.5, matchups +0.5, team +1, 1,000+ views +0.5. Legal lists edited before the latest ban ×0.75; before the latest set ×0.5. **Strong** is 3+ (10 likes, a Best of, a guide with 7 likes), **fair** 1.5+.
- **Authors**: a tournament deck's author is the player named in its title, not the system account. A list within 0.05 of a stronger one is the same list posted twice: it folds into that deck's `copies` and counts once.
- **Dropped**: precon, starter and budget names; decks with no evidence at all, except the most-viewed legal ones when the Legend has fewer than 10 legal decks with evidence.
- **Styles**: each deck is its 40 main-deck cards with copy counts (banned cards left out). Distance is weighted Jaccard: one swapped playset is 0.14, two 0.26. Average-linkage grouping stops at 0.5. Pairs of styles 0.5 to 0.65 apart are listed as the grey zone.
- **Bar**, per style, from the decks that vouch for it: legal decks, and illegal ones whose banned card is outside the style's signature (a banned battlefield or utility spell players swap out). Only legal decks are ever shown or scored. **Strict** is a strong deck plus a fair deck from another author; **loosened** is two fair decks from different authors, or one fair deck among 4+ authors (a style many players run before likes catch up); **lone strong deck** and **lone fair deck** are one brewer's idea; then **weak**. Groups of one author and single decks are kept only at a lone bar. A Legend with no live style above weak gets its five best legal loners as **fallback**.
- **Per style**: signature cards (in 80% of the style, 25% or less of the Legend's other decks), core, Champions, banned cards, whether it is dead (a banned signature card, or no legal deck among its decks and fillers), a proposed display deck and scored decks. **Fillers** are legal decks with no evidence that sit inside the style (under 0.5 on average): they help measure a small style and never count toward its bar; `scored` tops up to 3 with them, marked `filler`.

## Picking styles

The curate agent's procedure, with `.scratch/ingest/<id>/candidates.json` open. The picks feed discovery: every real way to play the Legend, each with a good, viable list.

1. **Widen a thin pool first.** When the best live style is below loosened, or fewer than 10 decks were grouped, rerun `tools.ts candidates <id> --since=<window.tournamentSince>` and work from the new file. Say so in `notes`.
2. **Vet the decks.** Reject joke and meme brews, budget and precon lists the name filter missed, and near-empty "test" decks. Treat a repost the script missed as a copy. A community title claiming a result ("Best of Vancouver", "3rd Sydney") counts as fair when the event and date check out, never strong. Every rejection goes in `rejected` with its reason.
3. **Settle the grey zone.** For each pair, read both signatures and cores. Merge when they differ in flex slots; keep them apart when the engine or the plan differs (Baited Hook against Stacked Deck Kennen). A different Champion keeps them apart only when it changes the plan. A merged style's bar is re-read from its decks.
4. **Name each style** by its plan or key cards, as a player would ("Detonator Jinx", "Baited Hook Kennen").
5. **Pick styles**, at most 4, in this order:
   - The **main style** is always picked: the live style with the highest bar, most evidence breaking ties. Below loosened its bar is "best available", confidence low; when several styles tie below loosened, prefer the one with the most decks and authors, since it is the likeliest to be how the Legend is played.
   - **Extra styles** at strict, best first.
   - **Loosening follows the grouping.** When the main style is the only pick so far, the best loosened style joins it. That's the Legend with plenty of decks but one clear style, where discovery needs a second way to play it.
   - **Discovery decks** fill any slot left: a live lone strong or lone fair style, at bar "lone deck". One brewer's list can't be a Build, but it shows a player another way to play the Legend; `tools.ts picks` adds it to the nearest Build's decks. Prefer authors not yet picked; a prolific author takes a second slot only when nobody else is competing for it.
   - A dead style is out. Legality of every picked deck, 40 cards, and a real difference in cards are never loosened. Whether a strict or loosened style is its own Build is decided later from its scores (`tools.ts picks`).
6. **Pick decks per style.** Display: the strongest legal deck typical of the style (`distToMedoid` 0.35 or less); a list edited since the latest set wins when its points are within 1 of the strongest, because players meet the current version. Scored: the display deck plus up to two more legal decks, one per author, the most typical first. Scored decks measure the style, so any legal deck of it serves, fillers included. The script's proposal is a start; swap out anything you rejected.
7. **Confidence**: high for strict with 4+ decks and 2+ strong; medium for strict; low for everything else.
8. **Decision.** Name in `decision` what only the Maintainer can settle: a second style that could be its own Build, a grey-zone merge you weren't sure of, a result claim you couldn't check. Leave it empty when the Legend has one clear style; that Legend is drafted without a pause.

## Cross-checks

For naming styles and sanity checks, never for scores:

- `https://riftbound.zone/en/meta/`: tier list with one archetype label per Legend (Team Eclipse); `/en/meta/<legend>/<archetype>/` shows the list.
- `https://hextechanalytics.com/meta`: redirects to the latest dated snapshot with tiers, wins, Top 8 counts and regional play rates. `/legends/<short-slug>` (`/legends/kennen`): prose guide with a featured list.
- `https://riftbound.gg/<full-legend-slug>-guide/` (`/kennen-heart-of-the-tempest-guide/`): guides naming builds.
- Blocked (Cloudflare 403 to WebFetch and curl): mobalytics.gg, riftdecks.com (its robots.txt also bars AI crawlers and competing sites), riftmana.com. riftools.app renders client-side.

## Bans

Most recent first; `candidates.ts` reads the top date as the latest ban and warns about any card Piltover Archive marks banned that isn't listed here.

- 2026-09-18: Ekko, Recurrent; Stacked Deck.
- 2026-07-24: Stealthy Pursuer; The Arena's Greatest; Aspirant's Climb. (Master Yi, Wuju Bladesman is banned in 2v2 only; legal in 1v1.)
- 2026-03-31: Scrapheap; Called Shot; Fight or Flight; Draven, Vanquisher; The Dreaming Tree; Reaver's Row; Obelisk of Power.

Official source: playriftbound.com announcements.
