# Piltover Archive API and per-Legend deck census

2026-09-25. Every number here came from live calls to `https://piltoverarchive.com/api/external/v1` today (curl and Node `fetch`, about 3 requests a second).

- Raw decks: `.scratch/census/<legend-slug>.json`
- Per-Legend tally: `.scratch/census/summary.json`
- Completeness sample: `.scratch/census/completeness.json`
- Scripts: `.scratch/census.mjs`, `.scratch/analyze.mjs`, `.scratch/complete.mjs`

## 1. API map

### Endpoints

| Endpoint | Status | Notes |
|---|---|---|
| `GET /decks` | 200 | Deck list. Carries no card lists. |
| `GET /decks/<uuid>` | 200 | Deck detail. Card IDs and quantities come back even without `expand`. |
| `GET /decks/<uuid>?expand=cards` | 200 | Adds `expandedCards` with names, types, costs and colours. |
| `GET /decks/<uuid>/guide` | 200 | **New.** The written guide as a Tiptap JSON doc: `{id, deckId, type:"tiptap", content}`. The body is empty when there is no guide. |
| `GET /decks/<uuid>/matchups` | 200 | **New.** `[{title, difficulty, legends[{legendName}], strategies[{position: going_first/going_second, notes, sideboardChanges[]}]}]`. |
| `GET /decks/<uuid>/versions` | 200 | **New.** Edit history: `{versionNumber, deckCode, metadataSnapshot{name, description, legendId}, changeSummary ("Main: +11, -11 / Sideboard: +6, -6"), createdAt, createdBy}`. |
| `GET /decks/<uuid>/likes` | 200 | **New.** The users who liked the deck. |
| `GET /decks/featured` | 200 | A bare array of curated decks (right now the Singapore RQ "Best of" lists). |
| `GET /cards` | 200 | `q`, `page`, `limit`. Each row is a variant with a nested `card` (`card.id`, `name`, `type`, `banEffectiveDate`), plus `meta.filters`. |
| `GET /sets` | 200 | `{prefix, name, releaseDate}` for each set. |
| `/legends`, `/authors`, `/users/<id>`, `/archetypes`, `/meta`, `/swagger`, `/openapi.json`, `/docs`, `/health` | 403 `{"error":"Forbidden"}` | No such route, or not public. |
| `/tournaments`, `/teams`, `/stats`, `/decks/<id>/comments` | 404 | |
| Site `/api-docs`, `/developers`, `/docs`, `/api` | 404 | No public docs page found. |

### `/decks` query params

I tested each param by whether it changed `pagination.total`.

| Param | Works | Evidence |
|---|---|---|
| `legendId=<card.id>` | **Yes: the exact Legend filter** | Kennen `74c4fe45-…` returned 2226 decks, all Kennen. It wants the **card** id (`/cards` → `data[].card.id`). The deck's `legend.id` is a variant id and returns 0. The filter covers every printing and spelling: LeBlanc returned 116 decks whose `legend.name` is "Leblanc", and Kennen 23 spelled "Heart of the tempest". Exact-name matching would have dropped those. |
| `authorId` | Yes | System account: 7642 decks |
| `q` | Loose | `q=kennen` 5514 against 2226 by `legendId` |
| `isLegal=true/false` | Yes | Kennen `q`: 3126 legal + 2389 illegal = 5515 |
| `hasGuide`, `hasVideo`, `hasMatchups` | Yes | Kennen: 27 / 34 / 14 |
| `createdAfter`, `createdBefore`, `editedAfter` (date or ISO) | Yes | Kennen `createdAfter=2026-09-18`: 140; `editedAfter=2026-09-18`: 288 |
| `sort` | `trending` (default), `likes`, `views`, `createdAt`, `editedAt` | Other values return 422, e.g. `updatedAt`, `name`, `popular` |
| `order` | `asc` / `desc` | |
| `limit` | 1–100 (default 20) | 101 returns 422 "Items per page (max 100)" |
| `page` | Yes | |
| Ignored | `legend_id`, `legendSlug`, `legend`, `legendName`, `champion`, `cardId`, `legendCardId`, `format`, `legal`, `updatedAfter`, `updatedSince`, `since`, `colors`, `set(s)`, `minLikes`, `likes`, `status`, `tournament`, `isTournament`, `verified`, `featured`, `teamId`, `handle` | Total unchanged |

Without a filter, `pagination.total` is capped at 10000. Filtered totals are exact: every Legend's download matched its total.

### List entry fields

`id, name, description, authorId, authorName, authorAvatar, authorSubscriptionTier, teamOwners[], userOwners[{type,id,name,avatarUrl,handle}], status, views, likes, videoUrl, editedAt, createdAt, legend{id (variant id), name, variantNumber, imageUrl, colors[]}, sets[], contentFlags{hasVideo, hasGuide, hasMatchups}, isLegal, bannedCardNames[], upcomingBanCards[]`

- `isLegal` tracks the current ban list. Every illegal deck names its banned cards in `bannedCardNames` (0 exceptions across 86070 decks). The most common is Stacked Deck, in 22706 decks. `upcomingBanCards` is empty everywhere today. `status` is "public" on every deck.
- There are no card lists, card counts or archetype labels.

### Detail fields (not in the list)

`owners[]`, `featured`, `featuredAt`, `champions[]`, `battlefields[]`, `runes[]`, `maindeck[]`, `sideboard[]`, `bench[]`, `additionalLegends[]`, `hasGuide`, `hasMatchups`, `updatedAt`, `legend.tcgplayerId`, `legend.tags`. Each card entry is `{cardId, variantId, quantity}`. **Detail has no `isLegal` and no `bannedCardNames`**, so take legality from the list.

A complete deck is `sum(maindeck) + sum(champions) = 40`, `sum(runes) = 12` and `battlefields.length = 3`. I checked this on the Koko Kennen list: 39 + 1, 12 runes, 3 battlefields.

### Authors

No verified flag, follower count or deck count, and `/users` and `/authors` are 403. What the data does have:
- `authorSubscriptionTier`: a paid site-supporter tier (`enforcer` 264 decks, `topsider` 125, `academian` 13, `artificer` 4, `councilor` 3, null for the other 85661). This measures whether the author pays, not their skill.
- `teamOwners`: set on only 20 decks (RiftAtlas, The Gaming Gents, ANZ Cabal).
- Team tags sometimes appear in `authorName` or deck names ("Krashy // TopCutGear", "CTCG Koko Lopez").
- An author's deck count comes from `authorId=<id>` and reading `pagination.total`.

In short, the API cannot reliably tell a content creator from a random user.

### Rate limit

No rate-limit headers (only `cache-control: public, max-age=60`). One `429 Too Many Requests` came back during rapid probing, at about 4 requests a second. The census (about 920 list pages at `limit=100`, 300 ms apart, about 1.4 s per page, about 25 minutes) hit no 429s.

## 2. Census

I pulled every deck with `legendId=<card.id>&sort=createdAt&order=desc&limit=100` for all 49 Legends: **86070 decks, all unique ids**.
- 7641 are from the system account: 7629 event decks plus 12 "Vendetta Pre-Rift kit" precons, which I dropped from the tournament counts.
- The other 78429 are community decks.

Dates:
- **Latest ban: 2026-09-18.** `/cards` gives `banEffectiveDate: 2026-09-18` for Stacked Deck and for Ekko, Recurrent.
- **Latest set: Vendetta, released 2026-07-31** (`/sets`). Radiance is listed for 2026-10-23.
- "Since X" means `createdAt` or `editedAt` on or after X.

Findings:
- **No system tournament deck is newer than the ban.** The newest is "【Regional Qualifier】Singapore - Best of Lucian (Motionless)", created 2026-09-10.
- **Since Vendetta the system account has posted 61 event decks** (the Barcelona RQ, 24–27 Aug, and the Singapore RQ, 9–10 Sep: `#1`–`#8` plus a "Best of <Legend>" list for many Legends). **39 of them are still legal.** Kai'Sa's 2066 system decks, Viktor's 810 and Master Yi, Wuju Bladesman's 1461 all predate Vendetta, mostly from mass events.
- Community decks that are legal and current since the ban: **4418**, of which 2017 were created after the ban. Legal and current since Vendetta: 18083.
- **Likes are rare. The median and p90 likes are 0 for every Legend**, both overall and since the ban. Among community decks current since the ban, p99 is 7 likes.
- Signals among the 4418 current legal community decks:
  - likes ≥10: 36; ≥5: 61; ≥3: 85
  - any content flag: 181 (guide 428, video 211 and matchups 198 counted across the wider since-Vendetta pool)
  - views ≥500: 150; views ≥200: 325
  - placement in the name: 89 (loose regex)
- **The placement-in-name match is noisy.** The loose regex catches "Ahri 1st Deck", a deck named "#1" and "Virtuoso Deck Volume #7". The strict version still keeps real user-posted results such as "Convergence #3 Top 16 | 2nd - chipznguac", "4th @ SCG Dallas 5k" and "CCS 25k Houston Winner - Gyatarina - Best of Leblanc". It also keeps copies like "best of singapore ambessa copy".
- **Completeness:** 245 decks sampled by detail (the 5 most-liked legal decks current since the ban for each Legend) are **all 40/12/3**. Incomplete decks are not a problem among the candidates.

## 3. Picking bar outcome

Every count below is of **decks**, not distinct styles. Near-copies are not removed, so the real number of styles is lower.

| Rule | 0 decks | 1 | 2 | 3+ |
|---|---|---|---|---|
| **Current bar** (legal, since ban, and likes ≥10 or content flag or placement name; legal system tournament decks since the ban also count, but there are none) | 2 | 4 | 8 | 35 |
| Current bar, strict placement regex | 2 | 8 | 5 | 34 |
| Since ban, likes ≥5 | 2 | 4 | 4 | 39 |
| Since ban, likes ≥3 | 1 | 2 | 7 | 39 |
| Since ban, add views ≥500 as a signal | 1 | 1 | 6 | 41 |
| Since Vendetta, likes ≥10 (the ≥5 and ≥3 variants give the same buckets) | 0 | 0 | 0 | 49 |
| Only legal system tournament decks since Vendetta | 25 | 11 | 12 | 1 |
| Only likes ≥10, since ban | 28 | 11 | 8 | 2 |

Thin Legends under the current bar:
- **0 decks:** Garen, Sett
- **1 deck:** Lee Sin, Lux, Poppy, Volibear
- **2 decks:** Annie, Jax, Leona, Master Yi (Wuju Master), Miss Fortune, Renata Glasc, Renekton, Sivir
- With the strict placement regex, Annie, Ezreal, Leona and Master Yi (Wuju Master) fall to 1.

What moves the numbers:
- **Widening the window to Vendetta's release** is the biggest lever: every Legend reaches 3+ (Garen 3, Lux 3, Lee Sin 4, Sett 6). Most of those pre-ban-but-legal decks still carry no likes.
- Within the ban window, likes ≥3 or views ≥500 each lift only one or two Legends. Garen stays at 0 under both. Sett reaches 1 either way.
- The bar works through **content flags and placement names**, not likes. Likes ≥10 alone leaves 28 Legends at 0.
- The legal post-Vendetta RQ lists cover 24 Legends (1 to 3 each). The other 25 Legends have no legal system tournament list since Vendetta. 16 of them had no post-Vendetta RQ list at all. The other 9 (Diana, Draven, Irelia, Kennen, Kha'Zix, Mel, Pyke, Sivir, Zed) had lists that are now illegal. All 22 now-illegal post-Vendetta system lists (these 9 Legends plus one Vex list) fail on Stacked Deck.

## 4. Los Angeles RQ

The LA Regional Qualifier runs **25–27 Sep 2026** at the Los Angeles Convention Center ([Eventbrite](https://www.eventbrite.com/e/riftbound-regional-qualifier-los-angeles-tickets-1992778924407), [playriftbound.com](https://playriftbound.com/en-us/news/organizedplay/all-eyes-on-los-angeles/)). It is the last RQ of 2026. It is not on the system account yet, which makes sense since it started today. Players have posted their own pre-event lists, such as "Vex Kharox LA RQ" (2026-09-24), "Rengar RQ LA Kevin Nunez" and "NovaRiftbound Jayce LA RQ" (2026-09-25), all with 0 likes.

## 5. Per-Legend table

Columns:
- **All**: every deck for the Legend.
- **Tourn.**: system event decks, all-time (since Vendetta / of those, still legal). Pre-Rift kits are excluded.
- **Comm. legal**: legal community decks, any date.
- **Since ban**: legal community decks created or edited since 2026-09-18. The next four columns count within this set.
- **L≥10/5/3**: decks with at least that many likes.
- **Guide/Video/Match**: decks with each content flag.
- **Place**: decks with a placement in the name, loose / strict regex.
- **Likes max**: the most-liked community deck, any date.
- **Bar**: decks passing the current bar. **Bar strict**: the same with the strict placement regex.
- **Ban+L3**: the since-ban bar with likes ≥3.
- **Set+L10**: the bar with the since-Vendetta window.
- **Sample**: complete / sampled of the top 5 by likes.

The median and p90 likes are 0 for every Legend, so the table leaves them out (they are in `summary.json`).

| Legend | All | Tourn. (since Vendetta / legal) | Comm. legal | Since ban | L>=10 / 5 / 3 | Guide / Video / Match | Place (loose/strict) | Views>=500 | Likes max | Bar | Bar strict | Ban+L3 | Set+L10 | Sample 40/12/3 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Ahri, Nine-Tailed Fox | 2833 | 252 (0 / 0) | 1122 | 58 | 1 / 3 / 3 | 2 / 0 / 0 | 1 / 0 | 4 | 30 | 4 | 3 | 6 | 10 | 5/5 |
| Akali, Rogue Assassin | 1833 | 2 (2 / 2) | 1789 | 161 | 1 / 2 / 2 | 3 / 0 / 0 | 3 / 1 | 4 | 80 | 7 | 5 | 7 | 88 | 5/5 |
| Ambessa, Matriarch of War | 1033 | 2 (2 / 2) | 1026 | 79 | 0 / 1 / 1 | 3 / 1 / 1 | 3 / 3 | 2 | 39 | 7 | 7 | 8 | 61 | 5/5 |
| Annie, Dark Child | 2078 | 226 (0 / 0) | 141 | 26 | 1 / 1 / 1 | 1 / 0 / 0 | 1 / 0 | 1 | 79 | 2 | 1 | 2 | 6 | 5/5 |
| Azir, Emperor of the Sands | 1847 | 41 (2 / 2) | 1596 | 120 | 0 / 0 / 1 | 2 / 1 / 1 | 5 / 2 | 4 | 131 | 8 | 5 | 9 | 45 | 5/5 |
| Darius, Hand of Noxus | 1287 | 129 (0 / 0) | 424 | 26 | 0 / 0 / 0 | 3 / 0 / 1 | 1 / 1 | 0 | 20 | 4 | 4 | 4 | 8 | 5/5 |
| Diana, Scorn of the Moon | 1923 | 6 (2 / 0) | 324 | 184 | 2 / 4 / 4 | 3 / 4 / 7 | 1 / 0 | 6 | 93 | 16 | 15 | 18 | 21 | 5/5 |
| Draven, Glorious Executioner | 2203 | 260 (1 / 0) | 137 | 71 | 0 / 0 / 1 | 3 / 0 / 1 | 0 / 0 | 2 | 27 | 3 | 3 | 4 | 7 | 5/5 |
| Ezreal, Prodigal Explorer | 1918 | 35 (0 / 0) | 179 | 91 | 0 / 0 / 2 | 0 / 1 / 0 | 3 / 0 | 1 | 80 | 4 | 1 | 5 | 5 | 5/5 |
| Fiora, Grand Duelist | 1966 | 63 (2 / 2) | 1551 | 135 | 0 / 0 / 0 | 2 / 0 / 2 | 3 / 2 | 3 | 93 | 6 | 5 | 6 | 42 | 5/5 |
| Garen, Might of Demacia | 478 | 36 (0 / 0) | 282 | 12 | 0 / 0 / 0 | 0 / 0 / 0 | 0 / 0 | 0 | 6 | 0 | 0 | 0 | 3 | 5/5 |
| Irelia, Blade Dancer | 3079 | 128 (2 / 0) | 1072 | 201 | 1 / 2 / 3 | 1 / 0 / 4 | 4 / 0 | 9 | 187 | 9 | 5 | 11 | 33 | 5/5 |
| Ivern, Green Father | 992 | 3 (1 / 1) | 860 | 71 | 2 / 2 / 2 | 2 / 1 / 2 | 0 / 0 | 3 | 219 | 5 | 5 | 5 | 28 | 5/5 |
| Jax, Grandmaster At Arms | 993 | 31 (1 / 1) | 662 | 39 | 0 / 0 / 0 | 2 / 0 / 1 | 0 / 0 | 0 | 33 | 2 | 2 | 2 | 20 | 5/5 |
| Jayce, Defender of Tomorrow | 1321 | 2 (2 / 2) | 1252 | 156 | 0 / 0 / 0 | 2 / 3 / 3 | 5 / 0 | 6 | 45 | 10 | 7 | 10 | 49 | 5/5 |
| Jhin, Virtuoso | 732 | 4 (2 / 2) | 428 | 60 | 2 / 3 / 4 | 5 / 0 / 4 | 2 / 0 | 4 | 85 | 8 | 6 | 8 | 30 | 5/5 |
| Jinx, Loose Cannon | 2478 | 170 (0 / 0) | 340 | 55 | 2 / 2 / 2 | 4 / 2 / 1 | 0 / 0 | 4 | 271 | 6 | 6 | 6 | 17 | 5/5 |
| Kai'Sa, Daughter of the Void | 5208 | 2066 (0 / 0) | 1169 | 91 | 1 / 2 / 3 | 1 / 0 / 0 | 1 / 1 | 4 | 39 | 3 | 3 | 4 | 25 | 5/5 |
| Kennen, Heart of the Tempest | 2226 | 7 (7 / 0) | 496 | 285 | 5 / 6 / 7 | 1 / 5 / 9 | 2 / 0 | 10 | 53 | 20 | 18 | 22 | 25 | 5/5 |
| Kha'Zix, Voidreaver | 1424 | 4 (2 / 0) | 399 | 163 | 1 / 1 / 1 | 2 / 1 / 2 | 0 / 0 | 4 | 168 | 5 | 5 | 5 | 15 | 5/5 |
| LeBlanc, Deceiver | 1938 | 3 (1 / 1) | 1477 | 246 | 2 / 4 / 5 | 6 / 3 / 4 | 5 / 3 | 10 | 116 | 20 | 18 | 22 | 61 | 5/5 |
| Lee Sin, Blind Monk | 1452 | 134 (0 / 0) | 694 | 15 | 0 / 0 / 1 | 1 / 0 / 0 | 0 / 0 | 1 | 14 | 1 | 1 | 2 | 4 | 5/5 |
| Leona, Radiant Dawn | 2081 | 96 (0 / 0) | 1212 | 54 | 0 / 1 / 2 | 1 / 0 / 0 | 1 / 0 | 3 | 38 | 2 | 1 | 4 | 13 | 5/5 |
| Lillia, Bashful Bloom | 1281 | 3 (1 / 1) | 992 | 139 | 4 / 6 / 7 | 6 / 4 / 4 | 2 / 1 | 7 | 157 | 13 | 12 | 16 | 45 | 5/5 |
| Lucian, Purifier | 993 | 30 (2 / 2) | 682 | 52 | 0 / 0 / 0 | 0 / 2 / 1 | 2 / 2 | 1 | 13 | 5 | 5 | 5 | 24 | 5/5 |
| Lux, Lady of Luminosity | 1312 | 86 (0 / 0) | 275 | 27 | 0 / 0 / 1 | 1 / 0 / 0 | 0 / 0 | 2 | 16 | 1 | 1 | 2 | 3 | 5/5 |
| Master Yi, Wuju Bladesman | 4381 | 1461 (4 / 4) | 1542 | 139 | 0 / 1 / 1 | 3 / 1 / 4 | 10 / 4 | 3 | 28 | 16 | 11 | 16 | 55 | 5/5 |
| Master Yi, Wuju Master | 624 | 3 (1 / 1) | 462 | 35 | 0 / 0 / 0 | 1 / 0 / 1 | 1 / 0 | 0 | 17 | 2 | 1 | 2 | 14 | 5/5 |
| Mel, Soul's Reflection | 1126 | 2 (2 / 0) | 207 | 91 | 0 / 1 / 1 | 4 / 1 / 1 | 2 / 1 | 2 | 94 | 6 | 6 | 6 | 14 | 5/5 |
| Miss Fortune, Bounty Hunter | 2362 | 359 (0 / 0) | 151 | 52 | 2 / 3 / 3 | 1 / 0 / 0 | 0 / 0 | 4 | 72 | 2 | 2 | 3 | 5 | 5/5 |
| Nasus, Curator of the Sands | 1083 | 2 (2 / 2) | 989 | 79 | 1 / 1 / 1 | 1 / 1 / 0 | 2 / 2 | 3 | 37 | 4 | 4 | 4 | 43 | 5/5 |
| Ornn, Fire Below the Mountain | 2020 | 37 (2 / 2) | 1215 | 92 | 0 / 0 / 0 | 2 / 1 / 3 | 2 / 0 | 3 | 58 | 7 | 5 | 7 | 71 | 5/5 |
| Poppy, Keeper of the Hammer | 531 | 4 (1 / 1) | 411 | 25 | 0 / 0 / 0 | 0 / 0 / 0 | 1 / 1 | 1 | 67 | 1 | 1 | 1 | 19 | 5/5 |
| Pyke, Bloodharbor Ripper | 1363 | 3 (1 / 0) | 189 | 69 | 0 / 0 / 1 | 4 / 1 / 2 | 1 / 0 | 3 | 151 | 6 | 5 | 7 | 14 | 5/5 |
| Rek'Sai, Void Burrower | 1976 | 43 (1 / 1) | 1101 | 140 | 1 / 1 / 2 | 2 / 1 / 1 | 4 / 1 | 2 | 29 | 7 | 4 | 8 | 49 | 5/5 |
| Renata Glasc, Chem-Baroness | 1065 | 28 (1 / 1) | 612 | 38 | 0 / 0 / 0 | 1 / 0 / 0 | 1 / 1 | 2 | 36 | 2 | 2 | 2 | 18 | 5/5 |
| Renekton, Butcher of the Sands | 590 | 2 (2 / 2) | 531 | 39 | 0 / 1 / 1 | 0 / 0 / 1 | 1 / 1 | 2 | 18 | 2 | 2 | 3 | 29 | 5/5 |
| Rengar, Pridestalker | 1306 | 4 (2 / 2) | 938 | 129 | 0 / 0 / 1 | 1 / 1 / 1 | 4 / 1 | 3 | 63 | 7 | 4 | 8 | 43 | 5/5 |
| Rumble, Mechanized Menace | 952 | 29 (1 / 1) | 759 | 55 | 0 / 0 / 0 | 1 / 0 / 1 | 3 / 3 | 2 | 78 | 4 | 4 | 4 | 23 | 5/5 |
| Sett, The Boss | 2099 | 366 (0 / 0) | 1178 | 32 | 0 / 0 / 1 | 0 / 0 / 0 | 0 / 0 | 1 | 23 | 0 | 0 | 1 | 6 | 5/5 |
| Shen, Eye of Twilight | 800 | 2 (2 / 2) | 796 | 65 | 1 / 1 / 2 | 0 / 1 / 0 | 1 / 1 | 2 | 52 | 3 | 3 | 4 | 33 | 5/5 |
| Sivir, Battle Mistress | 1148 | 35 (2 / 0) | 160 | 59 | 0 / 1 / 1 | 1 / 0 / 0 | 1 / 1 | 2 | 36 | 2 | 2 | 3 | 5 | 5/5 |
| Teemo, Swift Scout | 2747 | 379 (0 / 0) | 375 | 62 | 0 / 0 / 0 | 2 / 1 / 0 | 1 / 0 | 0 | 54 | 4 | 3 | 4 | 11 | 5/5 |
| Vex, Gloomist | 2174 | 5 (2 / 1) | 1290 | 209 | 0 / 2 / 4 | 5 / 2 / 3 | 5 / 2 | 3 | 313 | 13 | 10 | 15 | 40 | 5/5 |
| Vi, Piltover Enforcer | 772 | 4 (1 / 1) | 621 | 43 | 2 / 2 / 2 | 2 / 0 / 0 | 2 / 1 | 2 | 51 | 5 | 4 | 5 | 33 | 5/5 |
| Viktor, Herald of the Arcane | 4829 | 810 (0 / 0) | 2142 | 123 | 2 / 4 / 4 | 2 / 2 / 3 | 1 / 1 | 5 | 57 | 9 | 9 | 9 | 46 | 5/5 |
| Volibear, Relentless Storm | 1815 | 82 (0 / 0) | 354 | 37 | 0 / 0 / 1 | 1 / 0 / 0 | 0 / 0 | 1 | 36 | 1 | 1 | 2 | 6 | 5/5 |
| Yasuo, Unforgiven | 2240 | 148 (0 / 0) | 278 | 58 | 1 / 2 / 2 | 1 / 0 / 0 | 1 / 1 | 3 | 64 | 3 | 3 | 3 | 8 | 5/5 |
| Zed, Master of Shadows | 1158 | 2 (2 / 0) | 329 | 130 | 1 / 1 / 4 | 7 / 1 / 2 | 0 / 0 | 6 | 59 | 9 | 9 | 10 | 18 | 5/5 |
