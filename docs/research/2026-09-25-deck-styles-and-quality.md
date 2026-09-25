# Deck styles and deck quality: grouping a Legend's decks and picking good ones

Date: 2026-09-25
Related:
- .claude/skills/ingest-legends/sources.md (the current picking bar)
- .claude/skills/ingest-legends/rubric.md, "Scoring a deck"
- .claude/skills/ingest-legends/rubric.md, "Builds" (the bar: Played, Current, Distinct)
- docs/research/2026-09-25-deck-rubric.md

## Question

For each Legend, Riftward pulls tournament and community decks from Piltover Archive. There can be 3 decks or several hundred. We want every distinct way to play the Legend (up to 3 Builds) and good decks for each one, not only the top meta list. The maintainer wants to group decks into styles first, then decide per style whether to loosen the quality bar. How do established TCG analytics sites (1) group decks into archetypes, (2) pick a representative list, and (3) judge deck quality when signals are sparse? What concrete method should Riftward use?

## Answer

### What the field does, in one paragraph

Production sites use rules, not clustering. HSReplay labels each deck from an archetype's "core" and "popular" cards (Eger 2020). MTGOArchetypeParser, the open engine behind a lot of MTGO metagame data, uses hand-written card conditions ("contains X", "two or more of these"), variants nested under a parent archetype, and a fallback that sends leftover "goodstuff" decks to the "pile" they share the most cards with, with a 10% minimum overlap. Clustering shows up in research and in tooling that discovers the archetypes a human then names. On HSReplay data, hierarchical agglomerative clustering with Jaccard distance on card-count multisets matched expert archetype labels best (v-measure 0.945 to 0.949). The authors preferred Jaccard over Euclidean because its fixed 0 to 1 range makes a stopping threshold easy to set. The LoR analysis in LLoRR Stats used cosine distance over the cards that aren't Champions to test whether two Champion-pair labels are really the same archetype. Sites keep a style out of the breakdown until it has enough mass. MTGGoldfish's early metagame posts counted a deck only if it made up 5% or more of a sample of about 200 lists; everything else went into "Other". Vicious Syndicate's Radar leaves out cards seen in under 5% of games. HSReplay (per a forum report) lists a deck only after 10 pilots and 200 games. For a representative list, Frank Karsten's aggregate deck ranks every *n*th copy of every card by how many input lists run it and keeps the top 60. Otherwise sites show the best-placing or most-played real list. For popularity signals, the standard fix for small samples is a lower confidence bound (Wilson) or a Bayesian prior with a pessimism parameter (Evan Miller). None of the sites I could read publish a numeric scale for placement against popularity. Tournament organisers do weight placement by field size, though: Pokémon's Championship Points "kicker" pays lower placements only above an attendance threshold.

### Where Riftbound's data differs (measured 2026-09-25)

I ran a scratch probe against the Piltover Archive API: weighted Jaccard over main deck plus Champion, average-linkage clustering. It isn't committed; the numbers below are its output.

- **Post-ban tournament data is thin.** Since the 2026-07-24 ban list, the system account has posted 69 decks across 33 Legends: 1 to 8 per Legend, mostly one "Best of" per RQ (Singapore, Barcelona). The 2026-09-18 ban made many of them illegal again (Kennen: 1 legal of 8). Some system decks are precons ("Vendetta Pre-Rift kit - Shen"), not results. For most Legends, community decks will be the bulk of the pool.
- **"Best of" is weaker than top 8.** Riot awards the Best-Of Legend to "the highest-placing competitor piloting each eligible Legend … regardless of overall tournament placement" (playriftbound.com). A "Best of" can finish 37th of 1,719, as one community title records. `sources.md` currently ranks it with RQ top 8.
- **Community decks are mostly singletons.** For Jinx (80 complete decks since 2026-06-01), median pairwise distance is 0.86 and the median distance to a deck's *nearest* neighbour is 0.60. At a cut of 0.5, 9 decks formed the one real cluster and nearly everything else stood alone. After a quality prefilter (tournament, 5+ likes or an attached guide/video), 16 decks were left: one cluster of 4 (the Demolitionist / Blighted Battleaxe build, including both legal RQ Best-ofs), and every other deck alone. That includes a 271-like guide-and-video list. One creator had five differently named Jinx builds in the pool.
- **Solved Legends are tight; distinct styles are far apart.** Master Yi, Wuju Bladesman (13 good decks since 2026-07-24): pairwise p90 is 0.33, and every cut from 0.4 to 0.6 gives one style. Kennen (39 good decks): at cut 0.5 you get the Stacked Deck main style (16 decks), a Traveling Merchant / Switcheroo variant (3), Baited Hook / Illaoi Kennen (3) and Control Kennen (2). At 0.6 the Merchant variant merges into the main style and the other two stay separate. Those match the styles players name.
- **Arithmetic of a swap.** Two otherwise identical 40-card lists that swap one 3-of for another sit at weighted-Jaccard distance 0.14 (37 shared copies over 43). Two such swaps give 0.26, three give 0.36. So "a one- or two-card swap is the same style" means distance 0.3 or less.
- **The Legend fixes 2 of 6 domains, so colour tells you nothing.** MTG names piles by colour ("Azorius Control"). Here every deck of a Legend shares its domains and its runes are only a split of those two. Style has to come from cards. The Champion can differ between versions (Jinx, Rebel against Jinx, Demolitionist), and in the Jinx data that split lined up with separate clusters.
- **Small pool, 3-copy cap, 40 cards.** Within a Legend, decks share domain staples. So the distances between real styles (0.6 or more) are smaller than MTG's would be, and a single dropped playset moves a deck 0.14.

### The algorithm

A script does steps 1 to 6 and 9; an agent does 7, 8 and 10. Sized for 3 to 300 decks per Legend. Average linkage on 300 decks is about 27 million distance lookups in naive Python, which takes seconds, so no library is needed.

**1. Pool (script).** Gather every system deck and the community decks for the Legend (list endpoint, `legend.name` match, `sort=likes` and `sort=createdAt`, up to 300). Keep a deck when:
- it is complete: 40 main-deck cards counting the Champion, 12 runes, 3 battlefields;
- it was created or edited since the latest set release (for now, Vendetta);
- it is not a precon or budget list: drop names matching `/pre-?rift kit|precon|starter|budget|champion deck/i`, and drop system decks whose name has no event;
- it is not an unexplained zero: a community deck with 0 likes and no content flag goes, unless the Legend has fewer than 10 decks.

Keep illegal decks for grouping, with banned cards dropped from the vector. They still show how people play the Legend, and the kept list decides whether a style survived the ban (step 6).

**2. Evidence points per deck (script).** One number, so tournament and community decks sit on the same scale.

| Evidence | Points |
| --- | --- |
| RQ #1 to #8 (or a stated placement in the top 1% of the field) | 5 |
| RQ "Best of", City Challenge #1 to #8, Open #1 to #32 | 3 |
| City Challenge #9 to #32, Open #33 to #499, a community title claiming a result that can't be checked | 1.5 |
| Open #500 or lower | 0.5 |
| Community likes | log2(1 + likes), capped at 4 (10 likes gives 3.5) |
| Attached guide / video / matchup notes | +1 / +0.5 / +0.5 |
| Author reputation: 50+ total likes across their decks | +1 |

A deck's points are its best tournament line plus its community lines. Multiply by 0.5 if it was last edited before the most recent ban list. A deck is **strong** at 3 points or more, the same bar as today: 10 likes, any Best-of, or a guide plus 3 likes. It is **fair** at 1.5 or more.

**3. Vector and distance (script).** Represent each deck as the multiset of its 40 main-deck cards including the Champion, by card name, with copy counts. Leave out runes, battlefields and sideboard. Distance is weighted Jaccard (Ruzicka): `1 − Σ min(a,b) / Σ max(a,b)`. Don't use IDF weighting. Within one Legend the shared staples are real similarity, and the IDF trick in MTG classifiers exists to stop basic lands making different decks look alike.

**4. Group (script).** Hierarchical agglomerative clustering, average linkage, stop merging at 0.5. Average linkage rather than single, because single linkage chains a stream of one-off brews into one blob. The HSReplay paper's single-linkage win was on 956 ladder decks with little brewing. For each cluster record:
- **core**: cards in 80% or more of its decks. HSReplay's "core" is presence near 1; 80% allows for one tech-heavy list in a group of five;
- **signature**: core cards that appear in 25% or fewer of the Legend's other decks;
- **medoid**: the deck with the least total distance to the rest of its cluster;
- **evidence**: the sum of its three best decks' points, the number of distinct authors, and the number of distinct events.

**5. Singletons (script).** A deck alone in its cluster is a style candidate only if it is strong (3 points or more). A lone 271-like guide is a real style; a lone 0-like brew is noise. Ignore every other singleton.

**6. Ban check (script).** When a banned card is in a style's signature, the style is dead (Lux Combo). When it is core but not signature (Stacked Deck in Kennen), the style lives if at least one legal deck remains in the cluster. Otherwise mark it "needs a rebuilt list" and treat it as absent from the Current pool.

**7. Grey zone (agent).** For any two style candidates with average distance between 0.5 and 0.65, the agent reads both cores and judges: is the difference an engine or plan (Baited Hook against Stacked Deck), or flex slots? Is the Champion version different? Merge when it's flex. Pairs further apart than 0.65 are separate; pairs under 0.5 are already merged. Kennen's Traveling Merchant variant (it merges at 0.6) is the case this step exists for.

**8. Rank styles and loosen per style (agent, guided by script output).** Rank the candidates by evidence and walk down, stopping at 3.
- **Main style**: the candidate with the most evidence. Every Legend has one. If nothing is strong, take the best-evidence cluster or deck at any level, at confidence low (rating guide: "Every Legend keeps at least one Build").
- **Extra style, strict**: at least one strong, legal, current deck, and a second fair deck from a different author or event. Confidence medium, or high with 4 or more decks and 2 or more strong ones.
- **Extra style, loosened**: tried only when the Legend has one style and its pool held 10 or more decks. That's the maintainer's case of plenty of decks but one style. The bar drops one level for that style only: a fair deck (1.5 points or more) plus a second fair deck from another author, or edited before the last ban if still legal. Confidence low; `ratingNotes` says it was loosened and why.
- **Never loosened**: legality of the displayed list, completeness, and the Distinct test.
- **After scoring (deck rubric)**: if an extra style's Axis medians sit within 1.5 of the main style's on every Axis and it gets the same Archetype, drop it. The player wouldn't feel the difference (rating guide, Distinct).

**9. Pick decks per style (script proposes, agent confirms).**
- **Displayed deck** (`deckListUrl`): the legal deck with the most evidence points among those within 0.35 of the style's medoid; break ties by lower distance. This is the best-placing real list that is still typical of the style. An aggregate list isn't a real deck and has no author or result, so don't display one.
- **Scored decks** (the Axis median): the medoid plus the next strongest legal decks, 2 to 4 in all, at most one per author. Two or three decks give a steadier median (current rule). With one deck, the Build is confidence low.
- **Core list for copy**: build a Karsten-style aggregate of the style's decks (rank each *n*th copy by how many decks run it, keep the top 40). Use it to name the one or two key cards in `howItPlays`, not as the linked list.
- **Community ranking inside a style**: rank by points. Break ties with the Wilson lower bound of likes/views (z = 1.96), counting only decks with 500 or more views. Below that floor the ratio is noise: 2 likes on 52 views scores a lower bound of 1.06%, above 271 likes on 39,281 views at 0.61%. The bound does demote old decks with huge view counts (a budget Jinx list: 25 likes on 50,187 views, 0.03%).

**10. Agent-only judgments.** A script can't judge these:
- whether a strong-looking deck is a joke or meme brew (name, description);
- whether a community title's claimed result ("Best of Vancouver", "3rd Best Jinx Sydney") is plausible, which earns 1.5 points and never 3 without the system record;
- grey-zone merges (step 7);
- naming each style from its signature;
- whether a banned core card was a utility slot or the engine (step 6), when it isn't obvious.

### Changes this implies for `sources.md` (not made here)

- Move "Best of" out of the top tier. RQ #1 to #8 is the top tier; Best-of ranks with City Challenge top 8.
- Drop system-account precons ("Pre-Rift kit").
- Put "one deck per author per style" beside the near-copy rule.
- Replace "Skip near-copies" with the 0.3 distance rule, and "not a one- or two-card swap" with steps 3, 4 and 7.

## Sources

Read for this note:

- García-Sánchez, Fernández-Ares, Tonda, Mora, "Data Mining of Deck Archetypes in Hearthstone" (CEUR-WS Vol-2719). K-means and AHC on more than 500,000 decks, 10 clusters per class, clusters checked by an expert player. https://ceur-ws.org/Vol-2719/paper14.pdf
- "Predicting Cards Using a Fuzzy Multiset Clustering of Decks" (IJCIS). 956 HSReplay decks as multisets; Jaccard `1 − Σmin/Σmax`; single-linkage HAC v-measure 0.949, complete 0.945, k-means 0.919, DBSCAN 0.923; Jaccard preferred because its fixed 0 to 1 range makes a cutoff easy; stable over 70 to 130 clusters. https://www.atlantis-press.com/journals/ijcis/125943384/view
- Eger, "Deck Archetype Prediction in Hearthstone" (FDG 2020). HSReplay lists "core" and "popular" cards per archetype; core cards have probability of 1 or close to it; labels are "assigned automatically based on the core- and popular cards based on the entire deck contents". https://slothlab.info/assets/pdf/eger2020fdg.pdf
- Badaro, MTGOArchetypeParser README. A rules-based engine. https://github.com/Badaro/MTGOArchetypeParser
- Badaro, MTGOFormatData README. Condition types (InMainboard, OneOrMore…, TwoOrMore…, DoesNotContain), variants nested under a parent archetype, fallbacks for "goodstuff" piles with a 10% minimum card match. https://github.com/Badaro/MTGOFormatData
- zmj, mtg-aggregatedeck, `internal/logic/aggregator.go`. Implements Karsten's aggregate: every *n*th copy is a separate entry ranked by the number of lists containing it, then by total copies, then the top 60 are kept. https://github.com/zmj/mtg-aggregatedeck
- Disney Lorcana, "Six Top Decks for Post-Rotation Core Constructed" (2026-09). Karsten's aggregate "distills the card choices of dozens of successful decklists into a single build", balancing curve constraints. https://www.disneylorcana.com/en-US/news/2026/09/6-top-decks
- Vicious Syndicate, "The vS Data Reaper's Radar". Card co-play graph; core cards sit central, archetype cards cluster at the edge; cards under 5% of games and links under 1% are left out. https://www.vicioussyndicate.com/vs-data-reapers-radar/
- Vicious Syndicate, Data Reaper FAQ and About. Decks are identified from cards played, with over 95% success; no public rules. https://www.vicioussyndicate.com/drr/faq-data-reaper-report/ , https://www.vicioussyndicate.com/drr/
- LLoRR Stats, "Defining Archetypes #1". Cosine distance over non-Champion cards; ANOVA to decide whether Champion-pair labels are one archetype. https://llorr-stats.netlify.app/analysis/defining-archetypes-01/
- MTGGoldfish, "The Metagame #1". A deck counts toward the metagame at 5% or more of about 200 lists; the rest goes to "Other". https://www.mtggoldfish.com/articles/the-metagame-1
- Limitless decks page. Archetypes are named by their main Pokémon, with an option to "combine related deck variants into one archetype". https://play.limitlesstcg.com/decks?format=standard
- Limitless organiser docs. Archetype names are player-declared; lists are checked for legality. https://docs.limitlesstcg.com/organizer/reference
- Pedrogush/MTGO_Tools PR #1039. Hobby code, low trust: archetype profiles merged at cosine 0.85 or more with IDF weighting, naive Bayes assignment, "Unknown" below 0.8 posterior. https://github.com/Pedrogush/MTGO_Tools/pull/1039
- Evan Miller, "How Not To Sort By Average Rating". The Wilson lower bound, z = 1.96. https://www.evanmiller.org/how-not-to-sort-by-average-rating.html
- Evan Miller, "Bayesian Average Ratings". A beta prior plus a loss multiple for pessimism; the prior can be primed from author or reputation; decay by half-life. https://www.evanmiller.org/bayesian-average-ratings.html
- Evan Miller, "Ranking News Items With Upvotes". Model exposure over time instead of dividing by raw views. https://www.evanmiller.org/ranking-news-items-with-upvotes.html
- playriftbound.com, "All Eyes on Los Angeles". What a Best-Of Legend is. https://playriftbound.com/en-us/news/organizedplay/all-eyes-on-los-angeles/
- Play! Pokémon glossary. Kicker and Best Finish Limit: lower placements earn points only above attendance thresholds. https://www.pokemon.com/us/play-pokemon/about/tournaments-glossary
- Piltover Archive API (`/decks`, `/decks/<id>?expand=cards`), queried 2026-09-25 for the probe numbers above. https://piltoverarchive.com/api/external/v1

Read, but they publish no methodology: 17lands blog "Using Win Rate Data" (https://blog.17lands.com/posts/using-win-rate-data/), Untapped Snap archetype and deck pages (https://snap.untapped.gg/en/meta/archetypes/184/move, https://snap.untapped.gg/en/meta/decks), runeterra.ar meta (https://runeterra.ar/lor/meta), FaBrary stats (https://fabrary.net/stats?tab=meta), HearthSim help centre (https://help.hearthsim.net/en/collections/1921599-hsreplay-net), HSReplay "Introducing HSReplay.net Statistics" (https://articles.hsreplay.net/2017/04/04/introducing-hsreplay-net-statistics/).

## Notes

- **Not found.** HSReplay, Untapped (Snap, MTGA), Mobalytics, snap.fan, MTGTop8, 17lands and FaBrary publish no archetype-classification or deck-quality methodology I could reach. HearthSim's public GitHub has no archetype repository. What we know of HSReplay comes from Eger 2020 and the IJCIS paper. The "10 pilots and 200 games" deck threshold comes only from a search-result snippet of a forum post; I didn't read the post.
- **No published placement-vs-popularity weights.** The points table in step 2 is my calibration, not an industry standard. It keeps today's "10 likes or a result" bar at 3 points, so strict picks shouldn't change much.
- **Thresholds come from three Legends.** 0.3 (same style), 0.5 (cut) and 0.65 (surely different) come from the swap arithmetic and the Jinx, Kennen and Master Yi probes. Check them on a few more Legends, especially control and combo ones, before hard-coding.
- **Views are a biased denominator.** They pile up with age and include the author's own visits, so like rate falls as a deck spreads. Hence the 500-view floor and the use of Wilson only as a tiebreak. The fuller fix is Miller's exposure model; the API offers no view history, so skip it.
- **Re-runs.** Once styles are named, the signature cards can act as MTGOArchetypeParser-style rules ("contains 2 or more of the signature"), so new decks get assigned without re-clustering. Re-cluster each new set or ban list.
